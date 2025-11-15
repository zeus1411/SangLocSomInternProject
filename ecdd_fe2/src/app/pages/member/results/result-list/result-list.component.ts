import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.scss']
})
export class ResultListComponent implements OnInit, OnDestroy {
  public pageSize: number = 10;
  public page: number = 1;

  public qstr: string = '';
  public instances: any = [];
  private destroy$ = new Subject<void>();
  private isNavigating = false;

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
    // Check if user is still logged in
    if (!this.authService.isLoggedIn()) {
      this.handleUnauthorized();
      return;
    }

    this.getInstances(this.pageSize, this.page);
    
    // Listen for form instance updates from the form-instance component
    this.listenForUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Listen for form instance update events
   * When a form instance is updated, refresh the list
   */
  private listenForUpdates(): void {
    // Subscribe to route events to detect navigation back from form-instance
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params['updated'] === 'true') {
          // Refresh the instances list
          this.getInstances(this.pageSize, this.page);
        }
      });
  }

  changePage(page: number) {
    if (this.isNavigating) return;
    
    this.page = page;
    this.getInstances(this.pageSize, this.page);
  }

  private handleUnauthorized() {
    if (this.isNavigating) return;
    
    this.isNavigating = true;
    
    Swal.fire({
      title: 'Vui lòng đăng nhập',
      text: 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.',
      icon: 'warning',
      confirmButtonText: 'Đăng nhập',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      localStorage.clear();
      this.authService.logout();
      this._router.navigate(['/login']).then(() => {
        this.isNavigating = false;
      });
    });
  }

  getInstances(pageSize: number, page: number) {
    if (this.isNavigating) return;

    this.page = page;
    this.pageSize = pageSize;

    const headers = this.authService.getAuthHeaders();

    let queryParams = new HttpParams()
      .set('page', page.toString())
      .set('limit', pageSize.toString());

    if (this.qstr) {
      queryParams = queryParams.set('q', this.qstr);
    }

    this.http
      .get<any>(environment.url + '/api/forminstances/my', {
        params: queryParams,
        headers: headers,
      })
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(
        (d) => {
          this.instances = d.data?.data || [];
        },
        (error) => {
          if (error.status === 401) {
            this.handleUnauthorized();
          } else {
            Swal.fire({
              title: 'Lỗi!',
              text: error.error?.message || 'Không thể tải dữ liệu',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        },
      );
  }

  alert(title: string, str: string, icon: any) {
    Swal.fire(title, str, icon);
  }
}