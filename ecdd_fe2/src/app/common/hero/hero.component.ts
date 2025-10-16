import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

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

      this.startForm.emit (this.monthDiff(this.fromDate, this.calendar.getToday(), false));
    }, (reason) => {
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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

    return (inverse?-1:1)*(yearsDifference*12+monthsDifference+monthCorrection);
}

}
