import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDate, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CustomDatepickerI18n, I18n } from '../component/custom-datepicker-i18n';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [
    I18n,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }
  ]
})
export class HeaderComponent implements OnInit {

  public user: User | null = null;
  @Output() startForm = new EventEmitter<number>();

  hoveredDate: NgbDate | null = null;
  public innerWidth: any;
  public dpSize: number = 2;
  fromDate!: NgbDate;
  toDate: NgbDate | null = null;

  constructor(
    private router: Router,
    public calendar: NgbCalendar,
    private modalService: NgbModal,
    private authService: AuthService
  ) {
    this.fromDate = this.calendar.getToday();
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 500) {
      this.dpSize = 1;
    }

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
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
    return this.fromDate && !this.toDate && this.hoveredDate &&
           date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  ngOnInit(): void {
    // Subscribe to user changes from auth service
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.startForm.emit(this.monthDiff(this.fromDate, this.calendar.getToday(), false));
    }, (reason) => {
      // Handle modal dismiss
    });
  }

  logout() {
    Swal.fire({
      title: 'Đăng xuất?',
      text: "Bạn chắc chắn muốn đăng xuất khỏi hệ thống?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có',
      cancelButtonText: 'Không',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
      }
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

  monthDiff(date1: NgbDate, date2: NgbDate, roundUpFractionalMonths: boolean) {
    // Months will be calculated between start and end dates.
    var startDate = date1;
    var endDate = date2;
    var inverse = false;

    // Calculate the differences between the start and end dates
    var yearsDifference = endDate.year - startDate.year;
    var monthsDifference = endDate.month - startDate.month;
    var daysDifference = endDate.day - startDate.day;

    var monthCorrection = 0;
    // If roundUpFractionalMonths is true, check if an extra month needs to be added from rounding up.
    if (roundUpFractionalMonths === true && daysDifference > 0) {
      monthCorrection = 1;
    }
    // If the day difference between the 2 months is negative, the last month is not a whole month.
    else if (roundUpFractionalMonths !== true && daysDifference < 0) {
      monthCorrection = -1;
    }

    return (inverse ? -1 : 1) * (yearsDifference * 12 + monthsDifference + monthCorrection);
  }
}
