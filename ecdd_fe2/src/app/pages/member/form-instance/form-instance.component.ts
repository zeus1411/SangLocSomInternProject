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

    // Load Tỉnh ngay từ đầu
    this.loadProvinces();

    try {
      const id = this.route.snapshot.paramMap.get('id');
      
      if (id && id !== '') {
        // EDIT MODE
        console.log('🔄 EDIT MODE - Loading form instance:', id);
        this.loadFormInstanceForEdit(id);
      } else {
        // CREATE MODE
        console.log('➕ CREATE MODE - Loading active periods');
        this.loadActivePeriod();
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  // FIX: Load form instance với xử lý đúng cấu trúc Orgunit
  async loadFormInstanceForEdit(id: string) {
    try {
      // Load form instance data
    const response = await this.http.get<any>(`${environment.url}/api/forminstances/${id}`).toPromise();
    const data = response.data;
    
    console.log('📦 Raw form instance data:', data);
    
    // Set person data
    this.person = { ...data };
    
    // Load the form data
    const formResponse = await this.http.get<any>(`${environment.url}/api/forms/${data.formid}`).toPromise();
    this.form = formResponse.data;
    console.log('📋 Loaded form:', this.form);

    // Load the form instance values
    const valuesResponse = await this.http.get<any>(`${environment.url}/api/forminstances/${id}/value`).toPromise();
    const values = valuesResponse.data || [];
    console.log('📋 Loaded form instance values:', values);

    // Map the values to the form fields
    if (this.form?.formMembers && values) {
      this.form.formMembers.forEach((fmember: any) => {
        if (fmember.dataset?.datasetMembers) {
          fmember.dataset.datasetMembers.forEach((dsmember: any) => {
            // Find matching value
            const valueObj = values.find((v: any) => 
              v.dataelementid === dsmember.dataelementid || 
              (v.datasetMember && v.datasetMember.dataelementid === dsmember.dataelementid)
            );
            
            if (valueObj) {
              dsmember.value = valueObj.value;
              dsmember.valueid = valueObj.id;
              console.log(`✅ Mapped value for dataelement ${dsmember.dataelementid}:`, valueObj.value);
              
              // Calculate score if needed
              if (dsmember.valuelist) {
                dsmember.valuelist.split(';').forEach((item: string) => {
                  if (this.splitStr(item, '::')[0] === valueObj.value) {
                    this.nowscore(dsmember, item);
                  }
                });
              }
            }
          });
        }
      });
    }

    // FIX: Set Period - Sequelize trả về với capital letter
    if (data.Period) {
      this.person.periodid = data.Period;
      this.periods = [data.Period];
      console.log('📅 Loaded period:', data.Period);
    } else if (data.period) {
      // Fallback lowercase
      this.person.periodid = data.period;
      this.periods = [data.period];
      console.log('📅 Loaded period (lowercase):', data.period);
    } else if (data.periodid) {
      // Fallback: Load period by ID
      console.warn('⚠️ No period object, loading by ID:', data.periodid);
      this.http.get<any>(`${environment.url}/api/periods/${data.periodid}`).toPromise()
        .then((periodResponse: any) => {
          if (periodResponse.data) {
            this.person.periodid = periodResponse.data;
            this.periods = [periodResponse.data];
            console.log('📅 Loaded period from API:', periodResponse.data);
          }
        })
        .catch((err) => console.error('❌ Failed to load period:', err));
    } else {
      console.error('❌ No period data available at all!');
    }

      // Convert birthday
      const bod = new Date(data.birthday);
      this.person.birthday = new NgbDate(bod.getFullYear(), bod.getMonth() + 1, bod.getDate());
      console.log('🎂 Converted birthday:', this.person.birthday);

      // FIX: Xử lý Orgunit với cấu trúc đúng
      if (data.Orgunit) {
        console.log('🏘️ Full Orgunit structure:', JSON.stringify(data.Orgunit, null, 2));
        
        // Xã (Level 3)
        const xaId = data.orgunitid;
        const xa = data.Orgunit;
        console.log('📍 Xã:', { id: xaId, name: xa.name, level: xa.level, parentid: xa.parentid });
        
        // Huyện (Level 2) - từ Xã.Parent
        if (xa.Parent) {
          const huyen = xa.Parent;
          const huyenId = huyen.id;
          console.log('📍 Huyện:', { id: huyenId, name: huyen.name, level: huyen.level, parentid: huyen.parentid });
          
          // Tỉnh (Level 1) - từ Huyện.Parent
          if (huyen.Parent) {
            const tinh = huyen.Parent;
            const tinhId = tinh.id;
            console.log('📍 Tỉnh:', { id: tinhId, name: tinh.name, level: tinh.level });
            
            // Set values và load cascade
            this.person.tinh = tinhId;
            this.person.huyen = huyenId;
            this.person.orgunitid = xaId;
            
            console.log('🔄 Loading cascade: Tỉnh', tinhId, '→ Huyện', huyenId, '→ Xã', xaId);
            
            // Load Districts
            await this.loadDistricts(tinhId);
            console.log('✅ Loaded', this.orgunits[1].length, 'districts');
            
            // Load Wards
            await this.loadWards(huyenId);
            console.log('✅ Loaded', this.orgunits[2].length, 'wards');
            
            // Verify selected values
            console.log('✅ Final selection:', {
              tinh: this.person.tinh,
              huyen: this.person.huyen,
              orgunitid: this.person.orgunitid
            });
          } else {
            console.warn('⚠️ Missing Huyện.Parent (Tỉnh)');
          }
        } else {
          console.warn('⚠️ Missing Xã.Parent (Huyện)');
        }
      } else {
        console.warn('⚠️ No Orgunit data found');
      }
      
      console.log('✅ Final person data:', this.person);
      
    } catch (error) {
    console.error('❌ Error loading form instance:', error);
    Swal.fire({
      title: 'Lỗi tải dữ liệu!',
      text: 'Không thể tải thông tin phiếu sàng lọc.',
      icon: 'error',
      confirmButtonText: 'OK'
    }).then(() => {
      this._router.navigate(['/member/results']);
    });
  }
}

  loadActivePeriod() {
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

        const activePeriods = periodsData.filter((p: any) => p.isactive === true);

        if (activePeriods.length > 0) {
          this.periods = activePeriods;
          this.person.periodid = this.periods[0];
        } else {
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
          text: 'Không thể tải thông tin kỳ khảo sát.',
          icon: 'error',
          confirmButtonText: 'OK'
        }).then((result) => {
          this._router.navigate(['/member/results']);
        });
      }
    });
  }

  loadProvinces() {
    console.log('📍 Loading provinces (level 1)...');
    
    this.http.get<any>(environment.url + '/api/orgunits?limit=1000').subscribe({
      next: (d: any) => {
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

        this.orgunits[0] = allData.filter((item: any) => item.level === 1);
        console.log('✅ Loaded', this.orgunits[0].length, 'provinces:', this.orgunits[0]);
      },
      error: (error: any) => {
        console.error('❌ Error loading provinces:', error);
        this.orgunits[0] = [];
      }
    });
  }

  loadDistricts(provinceId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📍 Loading districts for province:', provinceId);
      
      this.http.get<any>(environment.url + `/api/orgunits?limit=1000&parentid=${provinceId}`).subscribe({
        next: (d: any) => {
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

          this.orgunits[1] = allData.filter((item: any) => 
            item.level === 2 && item.parentid == provinceId
          );
          
          console.log('✅ Loaded', this.orgunits[1].length, 'districts:', this.orgunits[1]);
          resolve();
        },
        error: (error: any) => {
          console.error('❌ Error loading districts:', error);
          this.orgunits[1] = [];
          reject(error);
        }
      });
    });
  }

  loadWards(districtId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📍 Loading wards for district:', districtId);
      
      this.http.get<any>(environment.url + `/api/orgunits?limit=1000&parentid=${districtId}`).subscribe({
        next: (d: any) => {
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

          this.orgunits[2] = allData.filter((item: any) => 
            item.level === 3 && item.parentid == districtId
          );
          
          console.log('✅ Loaded', this.orgunits[2].length, 'wards:', this.orgunits[2]);
          resolve();
        },
        error: (error: any) => {
          console.error('❌ Error loading wards:', error);
          this.orgunits[2] = [];
          reject(error);
        }
      });
    });
  }

  onProvinceChange(event: Event) {
    const selected = (event.target as HTMLSelectElement).value;
    console.log('Province changed to:', selected);
    
    if (selected && selected !== '0') {
      const provinceId = parseInt(selected, 10);
      
      if (!isNaN(provinceId) && provinceId > 0) {
        this.person.tinh = provinceId;
        this.orgunits[2] = [];
        this.person.huyen = 0;
        this.person.orgunitid = 0;
        this.loadDistricts(provinceId);
      }
    } else {
      this.orgunits[1] = [];
      this.orgunits[2] = [];
      this.person.huyen = 0;
      this.person.orgunitid = 0;
    }
  }

  onDistrictChange(event: Event) {
    const selected = (event.target as HTMLSelectElement).value;
    console.log('District changed to:', selected);
    
    if (selected && selected !== '0') {
      const districtId = parseInt(selected, 10);
      
      if (!isNaN(districtId) && districtId > 0) {
        this.person.huyen = districtId;
        this.person.orgunitid = 0;
        this.loadWards(districtId);
      }
    } else {
      this.orgunits[2] = [];
      this.person.orgunitid = 0;
    }
  }

  onChangeOrgunit(event: Event) {}
  getOrgunits(orgunitid?: number) {}

  onDateSelection(date: NgbDate) {
    this.person.months = this.monthDiff(date, this.calendar.getToday(), false);
  }

  onBirthdayChange() {
    this.person.months = this.monthDiff(this.person.birthday, this.calendar.getToday(), false);
  }

  monthDiff(date1: NgbDate, date2: NgbDate, roundUpFractionalMonths: boolean) {
    var yearsDifference = date2.year - date1.year;
    var monthsDifference = date2.month - date1.month;
    var daysDifference = date2.day - date1.day;

    var monthCorrection = 0;
    if (roundUpFractionalMonths === true && daysDifference > 0) {
      monthCorrection = 1;
    }
    else if (roundUpFractionalMonths !== true && daysDifference < 0) {
      monthCorrection = -1;
    }

    return yearsDifference * 12 + monthsDifference + monthCorrection;
  }

  nextstep(i: number) {
    let success = false;

    if ((this.step + i) == 3) {
      success = true;
      for (let fmember of this.form.formMembers) {
        for (let dsm of fmember.dataset.datasetMembers) {
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

      const orgunitId = parseInt(this.person.orgunitid, 10);
      
      if (!orgunitId || isNaN(orgunitId) || orgunitId === 0) {
        Swal.fire('Bạn chưa chọn đơn vị hành chính (Xã/Phường), vui lòng hoàn tất trước khi chuyển tiếp!');
        return;
      }

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

                  this.form.formMembers.forEach((_fmember: { dataset: { datasetMembers: any[]; }; }) => {
                      _fmember.dataset.datasetMembers.forEach((dsmember: any) => {
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

    const headers = this.authService.getAuthHeaders();
    let values = [];
    
    // Collect form values
    for (let fmember of this.form.formMembers) {
      for (let dsmember of fmember.dataset.datasetMembers) {
        // Only include values that have been set
        if (dsmember.value !== undefined && dsmember.value !== null) {
          let value = {
            datasetmember: {
              id: dsmember.id,
              dataelementid: dsmember.dataelementid
            },
            value: dsmember.value,
            id: dsmember.valueid || 0 // Use 0 for new values
          };
          values.push(value);
        }
      }
    }

    let body = {
      instance: {
        id: this.person.id || 0,
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
        periodid: this.person.periodid?.id || this.person.periodid,
        provinceid: this.person.tinh,
        districtid: this.person.huyen
      },
      values: values
    };

    console.log('Saving form instance with data:', body);

    const url = this.person.id 
      ? `${environment.url}/api/forminstances/${this.person.id}`
      : `${environment.url}/api/forminstances`;

    const request = this.person.id
      ? this.http.put(url, body, { headers })
      : this.http.post(url, body, { headers });

    request.subscribe({
      next: (d: any) => {
        console.log('Save successful:', d);
        that.isloading = false;
        Swal.fire({
          title: 'Thành công!',
          text: 'Đã lưu phiếu sàng lọc thành công.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then((result) => {
          that._router.navigate(['/member/results']);
        });
      },
      error: (error) => {
        console.error('Save error:', error);
        that.isloading = false;
        Swal.fire({
          title: 'Lỗi!',
          text: 'Không thể lưu phiếu sàng lọc. Vui lòng thử lại.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}