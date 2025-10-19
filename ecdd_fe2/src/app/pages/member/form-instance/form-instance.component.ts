import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { NgbCalendar, NgbDate, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { ResultComponent } from '../../result/result.component';
import { CustomDatepickerI18n, I18n } from 'src/app/common/component/custom-datepicker-i18n';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-form-instance',
  templateUrl: './form-instance.component.html',
  styleUrls: ['./form-instance.component.scss'],
  providers: [
    I18n,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }
  ]
})
export class FormInstanceComponent implements OnInit {

  @ViewChild('result') result!: ResultComponent;

  public dpSize: number = 2;
  public user: any;
  public person: any = {
    name: "", 
    birthday: this.calendar.getToday(), 
    months: 0, 
    orgunitid: 0, 
    periodid: {},
    address: "", 
    gender: 1, 
    parentname: "", 
    phone: "", 
    surveyby: "", 
    surveyplace: "Trường học",
    tinh: 0,
    huyen: 0
  };
  public form: any;
  public step: number = 1;

  private forms: any = [];
  public values: any = [];

  public periods: any = [];
  public orgunits: any = [[], [], []];

  public isloading: boolean = false;

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private http: HttpClient,
    private apiService: ApiService,
    public calendar: NgbCalendar
  ) {
    this._router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    let innerWidth = window.innerWidth;
    if (innerWidth <= 500) {
      this.dpSize = 1;
    }

    // Get current user from auth service
    this.user = this.authService.getCurrentUser();

    if (this.user) {
      this.person.surveyby = this.user.fullName;
    }

    if (!this.authService.isLoggedIn()) {
      Swal.fire({
        title: 'Vui lòng đăng nhập',
        confirmButtonText: 'OK',
      }).then((result) => {
        this._router.navigate(['/login']);
      });
      return;
    }

    // Get program data
    this.http.get<any>(environment.url + '/api/programs/bycode/ecdd').subscribe({
      next: (d: any) => {
        this.forms = d.data?.forms || [];
        console.log('Loaded forms for instance:', this.forms);
      },
      error: (error) => {
        console.error('Error loading forms:', error);
      }
    });

    // FIX: Load Tỉnh (provinces) ngay từ đầu - KHÔNG truyền tham số
    this.loadProvinces();

    try {
      const id = this.route.snapshot.paramMap.get('id');
      
      if (id && id !== '') {
        // EDIT MODE: Load existing form instance
        console.log('Loading existing form instance:', id);
        this.http.get<any>(environment.url + '/api/forminstances/' + id).subscribe({
          next: (d: any) => {
            this.person = d.data;
            this.person.periodid = this.person.Period;
            this.periods.push(this.person.Period);

            const bod = new Date(this.person.birthday);
            this.person.birthday = new NgbDate(bod.getFullYear(), bod.getMonth() + 1, bod.getDate());

            // Load cascade: Tỉnh -> Huyện -> Xã
            if (this.person.Orgunit?.Parent?.parentid) {
              this.person.tinh = this.person.Orgunit.Parent.parentid;
              this.loadDistricts(this.person.tinh).then(() => {
                if (this.person.Orgunit?.parentid) {
                  this.person.huyen = this.person.Orgunit.parentid;
                  this.loadWards(this.person.huyen);
                }
              });
            }
            
            console.log('Loaded person data:', this.person);
          },
          error: (error) => {
            console.error('Error loading form instance:', error);
            Swal.fire({
              title: 'Lỗi tải dữ liệu!',
              text: 'Không thể tải thông tin phiếu sàng lọc.',
              icon: 'error',
              confirmButtonText: 'OK'
            }).then(() => {
              this._router.navigate(['/member/results']);
            });
          }
        });
      } else {
        // CREATE MODE: Get active period
        console.log('Create mode: Loading active periods');
        
        this.apiService.getActivePeriod().subscribe({
          next: (d: any) => {
            console.log('API Response for active periods:', d);
            
            let periodsData = [];
            
            if (d.data) {
              if (Array.isArray(d.data)) {
                periodsData = d.data;
              } else if (d.data.data && Array.isArray(d.data.data)) {
                periodsData = d.data.data;
              } else if (d.data.rows && Array.isArray(d.data.rows)) {
                periodsData = d.data.rows;
              } else if (d.data.id) {
                periodsData = [d.data];
              }
            } else if (Array.isArray(d)) {
              periodsData = d;
            }

            console.log('Processed periods data:', periodsData);

            const activePeriods = periodsData.filter((p: any) => p.isactive === true);
            console.log('Active periods:', activePeriods);

            if (activePeriods.length > 0) {
              this.periods = activePeriods;
              this.person.periodid = this.periods[0];
              console.log('Selected period:', this.person.periodid);
            } else {
              console.warn('No active periods found');
              Swal.fire({
                title: 'Hiện tại chưa có kỳ khảo sát nào được mở!',
                text: 'Vui lòng liên hệ quản trị viên để kích hoạt kỳ khảo sát.',
                icon: 'warning',
                confirmButtonText: 'OK'
              }).then((result) => {
                this._router.navigate(['/member/results']);
              });
            }
          },
          error: (error) => {
            console.error('Error loading active periods:', error);
            Swal.fire({
              title: 'Lỗi tải dữ liệu!',
              text: 'Không thể tải thông tin kỳ khảo sát. Vui lòng thử lại sau.',
              icon: 'error',
              confirmButtonText: 'OK'
            }).then((result) => {
              this._router.navigate(['/member/results']);
            });
          }
        });
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  // FIX: Load Tỉnh (Level 1) - Gọi API không có tham số, sau đó filter level 1
  loadProvinces() {
    console.log('Loading provinces (level 1)...');
    
    // Gọi API trực tiếp không qua apiService để có nhiều quyền kiểm soát
    this.http.get<any>(environment.url + '/api/orgunits?limit=1000').subscribe({
      next: (d: any) => {
        console.log('Raw API response for provinces:', d);
        
        // Xử lý nhiều format response
        let allData = [];
        if (d.data) {
          if (Array.isArray(d.data)) {
            allData = d.data;
          } else if (d.data.data && Array.isArray(d.data.data)) {
            allData = d.data.data;
          } else if (d.data.rows && Array.isArray(d.data.rows)) {
            allData = d.data.rows;
          }
        } else if (Array.isArray(d)) {
          allData = d;
        }

        console.log('All orgunits data:', allData.length);

        // Filter chỉ lấy level 1 (Tỉnh)
        this.orgunits[0] = allData.filter((item: any) => item.level === 1);
        console.log('Loaded provinces:', this.orgunits[0].length, this.orgunits[0]);
      },
      error: (error: any) => {
        console.error('Error loading provinces:', error);
        this.orgunits[0] = [];
      }
    });
  }

  // FIX: Load Huyện (Level 2) theo Tỉnh
  loadDistricts(provinceId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Loading districts for province:', provinceId);
      
      // Gọi API trực tiếp với parentid
      this.http.get<any>(environment.url + `/api/orgunits?limit=1000&parentid=${provinceId}`).subscribe({
        next: (d: any) => {
          console.log('Raw API response for districts:', d);
          
          // Xử lý nhiều format response
          let allData = [];
          if (d.data) {
            if (Array.isArray(d.data)) {
              allData = d.data;
            } else if (d.data.data && Array.isArray(d.data.data)) {
              allData = d.data.data;
            } else if (d.data.rows && Array.isArray(d.data.rows)) {
              allData = d.data.rows;
            }
          } else if (Array.isArray(d)) {
            allData = d;
          }

          // Filter level 2 (Huyện) và parentid khớp
          this.orgunits[1] = allData.filter((item: any) => 
            item.level === 2 && item.parentid == provinceId
          );
          this.orgunits[2] = []; // Clear Xã
          this.person.huyen = 0;
          this.person.orgunitid = 0;
          
          console.log('Loaded districts:', this.orgunits[1].length, this.orgunits[1]);
          resolve();
        },
        error: (error: any) => {
          console.error('Error loading districts:', error);
          this.orgunits[1] = [];
          this.orgunits[2] = [];
          reject(error);
        }
      });
    });
  }

  // FIX: Load Xã (Level 3) theo Huyện
  loadWards(districtId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Loading wards for district:', districtId);
      
      // Gọi API trực tiếp với parentid
      this.http.get<any>(environment.url + `/api/orgunits?limit=1000&parentid=${districtId}`).subscribe({
        next: (d: any) => {
          console.log('Raw API response for wards:', d);
          
          // Xử lý nhiều format response
          let allData = [];
          if (d.data) {
            if (Array.isArray(d.data)) {
              allData = d.data;
            } else if (d.data.data && Array.isArray(d.data.data)) {
              allData = d.data.data;
            } else if (d.data.rows && Array.isArray(d.data.rows)) {
              allData = d.data.rows;
            }
          } else if (Array.isArray(d)) {
            allData = d;
          }

          // Filter level 3 (Xã) và parentid khớp
          this.orgunits[2] = allData.filter((item: any) => 
            item.level === 3 && item.parentid == districtId
          );
          this.person.orgunitid = 0; // Reset Xã selection
          
          console.log('Loaded wards:', this.orgunits[2].length, this.orgunits[2]);
          resolve();
        },
        error: (error: any) => {
          console.error('Error loading wards:', error);
          this.orgunits[2] = [];
          reject(error);
        }
      });
    });
  }

  // FIX: Event handler khi chọn Tỉnh - parse về number và kiểm tra kỹ
  onProvinceChange(event: Event) {
    const selected = (event.target as HTMLSelectElement).value;
    console.log('Province changed to:', selected, 'type:', typeof selected);
    
    if (selected && selected !== '0') {
      const provinceId = parseInt(selected, 10);
      console.log('Parsed province ID:', provinceId);
      
      if (!isNaN(provinceId) && provinceId > 0) {
        this.person.tinh = provinceId;
        this.loadDistricts(provinceId);
      } else {
        console.error('Invalid province ID:', selected);
        this.orgunits[1] = [];
        this.orgunits[2] = [];
        this.person.huyen = 0;
        this.person.orgunitid = 0;
      }
    } else {
      this.orgunits[1] = [];
      this.orgunits[2] = [];
      this.person.huyen = 0;
      this.person.orgunitid = 0;
    }
  }

  // FIX: Event handler khi chọn Huyện - parse về number và kiểm tra kỹ
  onDistrictChange(event: Event) {
    const selected = (event.target as HTMLSelectElement).value;
    console.log('District changed to:', selected, 'type:', typeof selected);
    
    if (selected && selected !== '0') {
      const districtId = parseInt(selected, 10);
      console.log('Parsed district ID:', districtId);
      
      if (!isNaN(districtId) && districtId > 0) {
        this.person.huyen = districtId;
        this.loadWards(districtId);
      } else {
        console.error('Invalid district ID:', selected);
        this.orgunits[2] = [];
        this.person.orgunitid = 0;
      }
    } else {
      this.orgunits[2] = [];
      this.person.orgunitid = 0;
    }
  }

  // DEPRECATED: Old method - không dùng nữa
  onChangeOrgunit(event: Event) {
    // Giữ lại để tương thích, nhưng không dùng
  }

  // DEPRECATED: Old method - không dùng nữa
  getOrgunits(orgunitid?: number) {
    // Giữ lại để tương thích, nhưng không dùng
  }

  onDateSelection(date: NgbDate) {
    this.person.months = this.monthDiff(date, this.calendar.getToday(), false);
  }

  onBirthdayChange() {
    this.person.months = this.monthDiff(this.person.birthday, this.calendar.getToday(), false);
  }

  monthDiff(date1: NgbDate, date2: NgbDate, roundUpFractionalMonths: boolean) {
    var startDate = date1;
    var endDate = date2;
    var inverse = false;

    var yearsDifference = endDate.year - startDate.year;
    var monthsDifference = endDate.month - startDate.month;
    var daysDifference = endDate.day - startDate.day;

    var monthCorrection = 0;
    if (roundUpFractionalMonths === true && daysDifference > 0) {
      monthCorrection = 1;
    }
    else if (roundUpFractionalMonths !== true && daysDifference < 0) {
      monthCorrection = -1;
    }

    return (inverse ? -1 : 1) * (yearsDifference * 12 + monthsDifference + monthCorrection);
  }

  nextstep(i: number) {
    let success = false;

    if ((this.step + i) == 3) {
      success = true;
      for (let fmember of this.form.Formmembers) {
        for (let dsm of fmember.Dataset.Datasetmembers) {
          if (!dsm.hasOwnProperty("value") || dsm.value === '') {
            Swal.fire('Bạn chưa hoàn tất phiếu, vui lòng hoàn thành tất cả các câu trả lời!');
            success = false;
            return;
          }
        }
      }
      if (success == true) {
        this.person.birthday = this.person.birthday.year
          + '-' + (this.person.birthday.month < 10 ? '0' : '') + (this.person.birthday.month)
          + '-' + (this.person.birthday.day < 10 ? '0' : '') + this.person.birthday.day;
      }
    }

    if ((this.step + i) == 2) {
      success = false;

      // FIX: KIỂM TRA orgunitid - parse về number và validate kỹ
      const orgunitIdStr = this.person.orgunitid;
      const orgunitId = parseInt(orgunitIdStr, 10);
      
      console.log('Validating orgunitid:', orgunitIdStr, 'parsed:', orgunitId, 'type:', typeof orgunitId);
      
      if (!orgunitId || isNaN(orgunitId) || orgunitId === 0) {
        Swal.fire('Bạn chưa chọn đơn vị hành chính (Xã/Phường), vui lòng hoàn tất trước khi chuyển tiếp!');
        return;
      }

      // Sử dụng filterfrom và filterto
      this.forms.forEach((form: { id: number, filterfrom: string; filterto: string; }) => {
        const from = parseInt(form.filterfrom);
        const to = parseInt(form.filterto);
        if (from <= this.person.months && this.person.months < to) {
          success = true;
        }
      });

      if (!success) {
        Swal.fire('Trẻ nằm ngoài độ tuổi sàng lọc!');
        return;
      }

      // Get form data
      if(!this.form){
        this.forms.forEach((form: { id: number, filterfrom: string; filterto: string; }) => {
          const from = parseInt(form.filterfrom);
          const to = parseInt(form.filterto);
          
          if (from <= this.person.months && this.person.months < to) {
            success = true;
            this.http.get<any>(environment.url + '/api/forms/' + form.id).subscribe((d: any) => {
              this.form = d.data;

              if(this.person.id){
                this.http.get<any>(environment.url + '/api/forminstances/' + this.person.id + '/value?pageSize=1000').subscribe((response: any) => {
                  const values = response.data || [];

                  this.form.Formmembers.forEach((_fmember: { Dataset: { Datasetmembers: any[]; }; }) => {
                      _fmember.Dataset.Datasetmembers.forEach((dsmember: any) => {
                        values.forEach((v: any) => {
                          if(v.dataelementid == dsmember.Dataelement.id){
                            dsmember.value = v.value;
                            dsmember.valueid = v.id;
                            dsmember.valuelist.split(';').forEach((item: string) => {
                                if(this.splitStr(item, '::')[0] == v.value){
                                  this.nowscore(dsmember, item);
                                }
                            });
                          }
                        });
                      });
                  });
                });
              }
            });
          }
        });
      }
    }

    this.step = this.step + i;
  }

  splitStr(str: string, sep: string) {
    return str.split(sep);
  }

  nowscore(el: any, item: string){
    if(this.splitStr(item, "::") && this.splitStr(item,"::")[2]){
      el.nowscore = this.splitStr(item,"::")[2];
    }
  }

  cancel(){
    Swal.fire({
      title: "Bạn không muốn lưu kết quả sàng lọc này?",
      text: "Mọi dữ liệu bạn thay đổi sẽ không lưu lại vào hệ thống!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Không xác nhận"
    }).then((result) => {
      if (result.isConfirmed) {
        this._router.navigate(['member/results']);
      }
    });
  }
  
  saveResult() {
    let that = this;
    that.isloading = true;

    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + (localStorage.getItem("token") || ''));
    let values = [];
    
    for (let fmember of this.form.Formmembers) {
      for (let dsmember of fmember.Dataset.Datasetmembers) {
        if(!dsmember.valueid){
          dsmember.valueid = 0;
        }
        let value = {
          datasetmember: dsmember,
          value: dsmember.value,
          id: dsmember.valueid
        };
        values.push(value);
      }
    }

    if(!this.person.id){
      this.person.id = 0;
    }

    let body = {
      instance: {
        id: this.person.id,
        name: this.person.name,
        birthday: this.person.birthday,
        gender: this.person.gender,
        months: this.person.months,
        address: this.person.address,
        parentname: this.person.parentname,
        phone: this.person.phone,
        surveyby: this.person.surveyby,
        surveyplace: this.person.surveyplace,
        ispasses: !this.form.alertyn,
        formid: this.form.id,
        description: this.form.explain,
        orgunitid: this.person.orgunitid,
        periodid: this.person.periodid.id,
        createdby: this.person.createdby
      },
      values: values
    };

    console.log('Saving form instance with data:', body);

    this.http.post<any>(environment.url + '/api/forminstances/', body, { headers: headers }).subscribe({
      next: (d) => {
        if(d.success){
          Swal.fire({
            title: 'Lưu kết quả thành công!',
          }).then((result) => {
            that._router.navigate(['member/results']);
            that.isloading = false;
          });
        } else {
          Swal.fire({
            title: 'Lưu không thành công!',
            text: d.message,
            icon: "error",
          }).then((result) => {
            that.isloading = false;
          });
        }
      },
      error: (error) => {
        console.error('Error saving form instance:', error);
        Swal.fire({
          title: 'Lỗi lưu dữ liệu!',
          text: 'Không thể lưu phiếu sàng lọc. Vui lòng thử lại.',
          icon: "error",
        }).then((result) => {
          that.isloading = false;
        });
      }
    });
  }
}