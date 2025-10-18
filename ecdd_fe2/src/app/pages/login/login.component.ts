import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string = "";
  public password: string = "";
  public isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/member/results']);
    }
  }

  public login() {
    // Validate input
    if (!this.email || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Thông báo',
        text: 'Vui lòng nhập email và mật khẩu'
      });
      return;
    }

    if (this.password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Thông báo',
        text: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
      return;
    }

    this.isLoading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Đăng nhập thành công!',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/member/results']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Đăng nhập thất bại',
            text: 'Email hoặc mật khẩu không đúng!'
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);

        let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';

        if (error.status === 400) {
          errorMessage = 'Email hoặc mật khẩu không hợp lệ. Mật khẩu phải có ít nhất 6 ký tự.';
        } else if (error.status === 401) {
          errorMessage = 'Email hoặc mật khẩu không đúng!';
        }

        Swal.fire({
          icon: 'error',
          title: 'Lỗi đăng nhập',
          text: errorMessage
        });
      }
    });
  }

  startForm(month: number) {
    // Get program by code to find appropriate form
    this.apiService.getProgramByCode('ecdd').subscribe((d: any) => {
      let forms = d.data?.forms || [];
      let success = false;

      forms.forEach((form: { id: number, from: string; to: string; }) => {
        if (parseInt(form.from) <= month && parseInt(form.to) > month) {
          success = true;
          this.router.navigate(['form', form.id]);
        }
      });

      if (!success) {
        Swal.fire('Trẻ nằm ngoài độ tuổi sàng lọc!');
      }
    });
  }
}
