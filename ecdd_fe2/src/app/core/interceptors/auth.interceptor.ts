import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        
        // CASE 1: Token expired (401 Unauthorized)
        if (error.status === 401) {
          const errorMessage = error.error?.message || error.message;
          
          // Check if it's token expiry
          if (errorMessage.includes('hết hạn') || errorMessage.includes('expired')) {
            Swal.fire({
              title: 'Phiên đăng nhập đã hết hạn!',
              text: 'Token của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục chỉnh sửa.',
              icon: 'warning',
              confirmButtonText: 'Đăng nhập lại',
              allowOutsideClick: false,
              allowEscapeKey: false
            }).then((result) => {
              if (result.isConfirmed) {
                // Clear stored data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Redirect to login
                this.router.navigate(['/login'], {
                  queryParams: { returnUrl: this.router.url }
                });
              }
            });
          } else {
            // Other 401 errors
            Swal.fire({
              title: 'Không có quyền truy cập!',
              text: errorMessage,
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        }
        
        // CASE: Rate limit exceeded (429 Too Many Requests)
        else if (error.status === 429) {
          const retryAfter = error.error?.data?.retryAfter;
          const resetAt = error.error?.data?.resetAt;
          const message = error.error?.message || 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
          
          let detailText = message;
          if (retryAfter) {
            detailText += `\n\nVui lòng thử lại sau ${retryAfter} phút.`;
          }
          if (resetAt) {
            const resetDate = new Date(resetAt);
            detailText += `\n\nThời gian reset: ${resetDate.toLocaleString('vi-VN')}`;
          }
          
          Swal.fire({
            title: 'Quá nhiều yêu cầu!',
            text: detailText,
            icon: 'error',
            confirmButtonText: 'OK',
            timer: 5000
          });
        }
        
        // CASE: Server error (500)
        else if (error.status === 500) {
          Swal.fire({
            title: 'Lỗi máy chủ!',
            text: 'Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
        
        // CASE: Network error
        else if (error.status === 0) {
          Swal.fire({
            title: 'Lỗi kết nối!',
            text: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
        
        return throwError(() => error);
      })
    );
  }
}