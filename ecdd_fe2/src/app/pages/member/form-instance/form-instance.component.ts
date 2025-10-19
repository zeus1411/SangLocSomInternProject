import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { NgbCalendar, NgbDate, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { ResultComponent } from '../../result/result.component';
import { computeStyles } from '@popperjs/core';
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
    name: "", birthday: this.calendar.getToday(), months: 0, orgunitid: 0, periodid: {},
    address: "", gender: 1, parentname: "", phone: "", surveyby: "", surveyplace: "Trường học"
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

    // Get program data - SỬ DỤNG filterfrom và filterto
    this.http.get<any>(environment.url + '/api/programs/bycode/ecdd').subscribe({
      next: (d: any) => {
        this.forms = d.data?.forms || [];
        console.log('Loaded forms for instance:', this.forms);
      },
      error: (error) => {
        console.error('Error loading forms:', error);
      }
    });

    this.getOrgunits(1);

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

            this.person.tinh = this.person.Orgunit.Parent?.parentid;
            this.getOrgunits(this.person.tinh);

            this.person.huyen = this.person.Orgunit.parentid;
            this.getOrgunits(this.person.huyen);
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
        
        // SỬ DỤNG ApiService.getActivePeriod() thay vì endpoint cũ
        this.apiService.getActivePeriod().subscribe({
          next: (d: any) => {
            console.log('API Response for active periods:', d);
            
            // Xử lý nhiều format response có thể có
            let periodsData = [];
            
            if (d.data) {
              // Format 1: { data: [...] }
              if (Array.isArray(d.data)) {
                periodsData = d.data;
              }
              // Format 2: { data: { data: [...] } }
              else if (d.data.data && Array.isArray(d.data.data)) {
                periodsData = d.data.data;
              }
              // Format 3: { data: { rows: [...] } }
              else if (d.data.rows && Array.isArray(d.data.rows)) {
                periodsData = d.data.rows;
              }
              // Format 4: Single period object
              else if (d.data.id) {
                periodsData = [d.data];
              }
            }
            // Format 5: Direct array response
            else if (Array.isArray(d)) {
              periodsData = d;
            }

            console.log('Processed periods data:', periodsData);

            // Filter chỉ lấy periods đang active
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

  onChangeOrgunit(event: Event) {
    let selected: any = (event.target as HTMLInputElement).value;
    this.getOrgunits(selected);
  }

  getOrgunits(orgunitid?: number) {
    console.log('Loading orgunits with parentId:', orgunitid);

    this.apiService.getOrgUnits(orgunitid).subscribe({
      next: (d: any) => {
        console.log('API Response for orgunits:', d);
        const allData = d.data?.data || [];
        console.log('All orgunits data received:', allData.length, 'records');

        if (allData.length > 0) {
          if (!orgunitid || orgunitid === 0) {
            const provinces = allData.filter((item: any) => item.level === 1);
            console.log('Filtered provinces (level=1):', provinces.length, 'records');
            this.orgunits[0] = provinces;
            this.orgunits[1] = [];
            this.orgunits[2] = [];
          } else {
            const currentLevel = allData[0]?.level || 2;
            this.orgunits[currentLevel - 1] = [];

            allData.forEach((item: any) => {
              const level = item.level;
              if (level >= 1 && level <= 3) {
                this.orgunits[level - 1].push(item);
              }
            });

            console.log('Filtered by level - Provinces:', this.orgunits[0].length,
                       'Districts:', this.orgunits[1].length,
                       'Wards:', this.orgunits[2].length);

            for (let i = currentLevel; i < 3; i++) {
              if (i > currentLevel - 1) {
                this.orgunits[i] = [];
              }
            }
          }
        }

        console.log('Final orgunits array:', this.orgunits);
      },
      error: (error: any) => {
        console.error('Error loading orgunits:', error);
        this.orgunits[1] = [];
        this.orgunits[2] = [];
        Swal.fire({
          title: 'Lỗi tải dữ liệu',
          text: 'Không thể tải danh sách đơn vị hành chính',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
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

      if(!this.person.orgunitid || this.person.orgunitid == 0){
        Swal.fire('Bạn chưa chọn đơn vị hành chính, vui lòng hoàn tất trước khi chuyển tiếp!');
        return;
      }

      // QUAN TRỌNG: Sử dụng filterfrom và filterto thay vì from và to
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