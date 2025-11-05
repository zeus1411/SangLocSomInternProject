import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  isLoading = false;
  constructor(private _router: Router, private route: ActivatedRoute, private http: HttpClient) {

    this._router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  ngOnInit(): void {
    let user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.id) {
      Swal.fire({
        title: 'Vui lòng đăng nhập',
        confirmButtonText: 'OK',
      }).then((result) => {
        this._router.navigate(['/login']);
      });
    }
  }

  onUploadComplete(response: any) {
    this.isLoading = false;
    Swal.fire({
      icon: 'success',
      title: 'Thành công',
      text: 'Tải lên tệp thành công!',
      confirmButtonText: 'OK'
    });
    // Optionally refresh the results list after successful upload
    // this._router.navigateByUrl('/member/results');
  }

  onUploadError(error: string) {
    this.isLoading = false;
    Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: error || 'Đã xảy ra lỗi khi tải lên tệp. Vui lòng thử lại sau.',
      confirmButtonText: 'Đóng'
    });
  }

}
