import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

import { NgbCalendar, NgbDate, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { ResultComponent } from '../../result/result.component';
import { computeStyles } from '@popperjs/core';
import { CustomDatepickerI18n, I18n } from 'src/app/common/component/custom-datepicker-i18n';
@Component({
  selector: 'app-form-instance',
  templateUrl: './form-instance.component.html',
  styleUrls: ['./form-instance.component.scss'],
  providers:
    [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }]  // define custom NgbDatepickerI18n provider

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

  public isloading : boolean = false;

  constructor(private _router: Router, private route: ActivatedRoute, private http: HttpClient, public calendar: NgbCalendar) {

    this._router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  ngOnInit(): void {
    let innerWidth = window.innerWidth;
    if (innerWidth <= 500) {
      this.dpSize = 1;
    }
    this.user = JSON.parse(localStorage.getItem('user') || '{}');

    this.person.surveyby = this.user.name;
    if (!this.user.id) {


      Swal.fire({
        title: 'Vui lòng đăng nhập',
        confirmButtonText: 'OK',
      }).then((result) => {

        this._router.navigate(['/login']);
      })

    }

        

    this.http.get<any>(environment.url + '/api/programs/bycode/ecdd').subscribe(d => {

      this.forms = d.data?.forms || [];
    });

    this.getOrgunits(1);



    try {

      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== '') {

        this.http.get<any>(environment.url + '/api/forminstances/' + id).subscribe(d => {
          this.person = d.data;
          this.person.periodid = this.person.Period;
          this.periods.push(this.person.Period);

          const bod = new Date(this.person.birthday);

          this.person. birthday = new NgbDate(bod.getFullYear(),bod.getMonth() + 1,bod.getDate());
          
          this.person.tinh = this.person.Orgunit.Parent.parentid;

          this.getOrgunits(this.person.tinh);

          this.person.huyen = this.person.Orgunit.parentid;
          this.getOrgunits(this.person.huyen);
          // this.person.gender = this.person.gender == true ? 1 : 0;
          console.log(this.person);
          
        });

      } else {


        this.http.get<any>(environment.url + '/api/periods/current?pageSize=20&page=1').subscribe(d => {

          if (d.data?.data?.length > 0) {
    
            this.periods = d.data.data;
            this.person.periodid = this.periods[0];
          } else {
            Swal.fire({
              title: 'Hiện tại chưa có kỳ khảo sát nào được mở, vui lòng quay lại sau!',
              confirmButtonText: 'OK',
            }).then((result) => {
    
              this._router.navigate(['/member/results']);
            })
          }
        });
      }

    } catch (error) {

    }





  }

  onChangeOrgunit(event: Event) {
    let selected: any = (event.target as HTMLInputElement).value;
    this.getOrgunits(selected);
  }
  getOrgunits(orgunitid: number) {
    this.http.get<any>(environment.url + '/api/orgunits?parentid=' + orgunitid + '&pageSize=10000&page=1').subscribe(d => {
      const data = d.data?.data || [];
      if (data.length > 0) {
        const lvl = data[0].level;
        this.orgunits[lvl - 1] = data;
        for (var i = lvl; i < 3; i++) {
          this.orgunits[i] = [];
        }

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
    //Months will be calculated between start and end dates.
    //Make sure start date is less than end date.
    //But remember if the difference should be negative.
    var startDate = date1;
    var endDate = date2;
    var inverse = false;


    //Calculate the differences between the start and end dates
    var yearsDifference = endDate.year - startDate.year;
    var monthsDifference = endDate.month - startDate.month;
    var daysDifference = endDate.day - startDate.day;

    var monthCorrection = 0;
    //If roundUpFractionalMonths is true, check if an extra month needs to be added from rounding up.
    //The difference is done by ceiling (round up), e.g. 3 months and 1 day will be 4 months.
    if (roundUpFractionalMonths === true && daysDifference > 0) {
      monthCorrection = 1;
    }
    //If the day difference between the 2 months is negative, the last month is not a whole month.
    else if (roundUpFractionalMonths !== true && daysDifference < 0) {
      monthCorrection = -1;
    }

    return (inverse ? -1 : 1) * (yearsDifference * 12 + monthsDifference + monthCorrection);
  }


  nextstep(i : number) {
    let success = false;



    if ((this.step + i) == 3) {
      success = true;
      //kiem tra data 
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
        
        // const jsDate = new Date(this.person.birthday.year, this.person.birthday.month - 1, this.person.birthday.day);
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
      this.forms.forEach((form: { id: number, from: string; to: string; }) => {
        if (parseInt(form.from) <= this.person.months && parseInt(form.to) > this.person.months) {
          success = true;
        }
      });
      if (!success) {
        Swal.fire('Trẻ nằm ngoài độ tuổi sàng lọc!');
        return;
      }

      //get form data
      if(!this.form){
        this.forms.forEach((form: { id: number, from: string; to: string; }) => {
          if (parseInt(form.from) <= this.person.months && parseInt(form.to) > this.person.months) {
            success = true;
            this.http.get<any>(environment.url + '/api/forms/' + form.id).subscribe(d => {
              this.form = d.data;
                    
              if(this.person.id){
                this.http.get<any>(environment.url + '/api/forminstances/' + this.person.id + '/value?pageSize=1000').subscribe(response => {
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

  splitStr(str : string, sep : string) {
    return str.split(sep);
  }

  
  nowscore(el : any, item : string){
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
        periodid : this.person.periodid.id,
        createdby: this.person.createdby

      },
      values: values
    };


    this.http.post<any>(environment.url + '/api/forminstances/', body, { headers: headers }).subscribe(
      d => {
      if(d.success){
        Swal.fire({
          title: 'Lưu kết quả thành công!',
        }).then((result) => {
          that._router.navigate(['member/results']);
          that.isloading = false;
        })

      }else{
        Swal.fire({
          title: 'Lưu không thành công!',
          text: d.message,
          icon: "error",
        }).then((result) => {
          that._router.navigate(['member/results']);
          that.isloading = false;
        })
      }
    });


 

  }

}
