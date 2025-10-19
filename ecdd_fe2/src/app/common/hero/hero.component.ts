import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgbCalendar, NgbDate, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CustomDatepickerI18n, I18n } from '../component/custom-datepicker-i18n';



@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  providers:
    [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }]  // define custom NgbDatepickerI18n provider

})
export class HeroComponent implements OnInit {
 
  public user: any = null;
  @Output()  startForm = new EventEmitter<number>();

  hoveredDate: NgbDate | null = null;
  public innerWidth: any;
  public dpSize : number = 2;
  fromDate!: NgbDate;
  toDate: NgbDate | null = null;

  constructor(private _router: Router, public calendar: NgbCalendar, private modalService: NgbModal) {
    this.fromDate = this.calendar.getToday();
    this.innerWidth = window.innerWidth;
    if(this.innerWidth <= 500){
      this.dpSize = 1;
    }


    this._router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };

  }
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }
  ngOnInit(): void {

  }
  open(content : any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      console.log('Modal result:', result);
      console.log('fromDate before calculation:', this.fromDate);

      // Kiểm tra người dùng đã chọn ngày sinh chưa
      if (!this.fromDate) {
        Swal.fire({
          title: 'Vui lòng chọn ngày sinh!',
          text: 'Bạn cần chọn ngày sinh của trẻ để tiếp tục sàng lọc.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      // Kiểm tra ngày sinh không được là ngày trong tương lai
      const today = this.calendar.getToday();
      console.log('Today:', today);
      console.log('fromDate:', this.fromDate);

      // So sánh ngày: nếu fromDate > today thì không hợp lệ
      if (this.fromDate.after(today)) {
        Swal.fire({
          title: 'Ngày sinh không hợp lệ!',
          text: 'Ngày sinh không thể là ngày trong tương lai. Vui lòng chọn ngày sinh thực tế của trẻ.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      // XÓA KIỂM TRA fromDate.equals(today) vì trẻ mới sinh (0 tháng) vẫn hợp lệ

      const calculatedMonth = this.monthDiff(this.fromDate, this.calendar.getToday(), false);
      console.log('Calculated month:', calculatedMonth);
      
      // Kiểm tra thêm kết quả tính toán
      if (calculatedMonth < 0) {
        Swal.fire({
          title: 'Lỗi tính toán!',
          text: 'Có lỗi xảy ra khi tính độ tuổi. Vui lòng thử lại.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }

      this.startForm.emit(calculatedMonth);
    }, (reason) => {
      console.log('Modal dismissed with reason:', reason);
      // Người dùng đóng modal mà không bắt đầu
    });
  }


  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  monthDiff(date1 : NgbDate,date2 : NgbDate,roundUpFractionalMonths : boolean)
{
    // Kiểm tra null values trước khi tính toán
    if (!date1 || !date2) {
      console.log('monthDiff: null values detected, returning 0');
      return 0;
    }

    console.log('monthDiff input - date1:', date1, 'date2:', date2, 'roundUpFractionalMonths:', roundUpFractionalMonths);

    //Months will be calculated between start and end dates.
    //Make sure start date is less than end date.
    //But remember if the difference should be negative.
    var startDate=date1;
    var endDate=date2;
    var inverse=false;


    //Calculate the differences between the start and end dates
    var yearsDifference=endDate.year - startDate.year;
    var monthsDifference=endDate.month - startDate.month;
    var daysDifference=endDate.day - startDate.day;

    var monthCorrection=0;
    //If roundUpFractionalMonths is true, check if an extra month needs to be added from rounding up.
    //The difference is done by ceiling (round up), e.g. 3 months and 1 day will be 4 months.
    if(roundUpFractionalMonths===true && daysDifference>0)
    {
        monthCorrection=1;
    }
    //If the day difference between the 2 months is negative, the last month is not a whole month.
    else if(roundUpFractionalMonths!==true && daysDifference<0)
    {
        monthCorrection=-1;
    }

    const result = (inverse?-1:1)*(yearsDifference*12+monthsDifference+monthCorrection);
    console.log('monthDiff calculation:', {
      yearsDifference,
      monthsDifference,
      daysDifference,
      monthCorrection,
      result,
      inverse
    });

    return result;
}

}