import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.scss']
})
export class ResultListComponent implements OnInit {
  public pageSize: number = 10;
  public page: number = 1;

  public qstr: string = '';
  public instances: any = [];

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this._router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  ngOnInit(): void {
    this.getInstances(this.pageSize, this.page);
  }

  changePage(page: number) {
    this.page = page;
    this.getInstances(this.pageSize, this.page);
  }

  getInstances(pageSize: number, page: number) {
    this.page = page;
    this.pageSize = pageSize;

    const headers = this.authService.getAuthHeaders(); // Authorization: Bearer <token>

    let queryParams = new HttpParams()
      .set('page', page.toString())
      .set('limit', pageSize.toString()); // backend dùng 'limit'

    if (this.qstr) {
      queryParams = queryParams.set('q', this.qstr);
    }

    this.http
      .get<any>(environment.url + '/api/forminstances/my', {
        params: queryParams,
        headers: headers,
      })
      .subscribe(
        (d) => {
          this.instances = d.data?.data || [];
        },
        (error) => {
          // Nếu token hết hạn / chưa login
          Swal.fire({
            title: 'Vui lòng đăng nhập',
            confirmButtonText: 'OK',
          }).then(() => {
            localStorage.clear();
            this._router.navigate(['/login']);
          });
        },
      );
  }


  alert(title: string, str: string, icon: any) {
    Swal.fire(title, str, icon);
  }
}
