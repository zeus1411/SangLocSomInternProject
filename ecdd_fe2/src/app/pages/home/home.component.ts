import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  public forms: any;
  constructor(private http: HttpClient, private _router: Router) { }

  ngOnInit() {
    this.http.get<any>(environment.url + '/api/programs/bycode/ecdd').subscribe(d => {

      this.forms = d.data?.forms || [];
      console.log('Loaded forms:', this.forms);
      console.log('Number of forms:', this.forms.length);

      // Log chi tiết từng form để kiểm tra
      this.forms.forEach((form: any) => {
        console.log(`Form: ${form.name}, filterfrom: ${form.filterfrom}, filterto: ${form.filterto}`);
      });

    }, error => {
      console.error('Error loading forms:', error);
      Swal.fire({
        title: 'Lỗi tải dữ liệu!',
        text: 'Không thể tải danh sách biểu mẫu. Vui lòng thử lại sau.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    });
  }


  startForm(month: number){
    console.log('startForm called with month:', month);
    console.log('Available forms:', this.forms);

    // Validate input
    if (month === null || month === undefined || isNaN(month)) {
      Swal.fire({
        title: 'Lỗi dữ liệu!',
        text: 'Không thể xác định độ tuổi của trẻ. Vui lòng thử lại.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (month < 0) {
      Swal.fire({
        title: 'Ngày sinh không hợp lệ!',
        text: 'Ngày sinh không thể là ngày trong tương lai.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (month > 72) { // 6 tuổi = 72 tháng
      Swal.fire({
        title: 'Độ tuổi vượt quá giới hạn!',
        text: 'Công cụ sàng lọc chỉ dành cho trẻ từ 0 - 6 tuổi (0 - 72 tháng).',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Kiểm tra xem forms đã được load chưa
    if (!this.forms || this.forms.length === 0) {
      Swal.fire({
        title: 'Chưa tải được dữ liệu!',
        text: 'Vui lòng đợi hệ thống tải dữ liệu hoặc tải lại trang.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    let success = false;
    
    // QUAN TRỌNG: Sử dụng filterfrom và filterto thay vì from và to
    this.forms.forEach((form: {id: number, filterfrom: string; filterto: string; name: string; }) => {
      const from = parseInt(form.filterfrom);
      const to = parseInt(form.filterto);
      
      console.log(`Checking form: ${form.name}, filterfrom: ${from}, filterto: ${to}, month: ${month}`);

      // Kiểm tra: from <= month < to
      if(from <= month && month < to){
        success = true;
        console.log(`✓ Found matching form: ${form.name} (ID: ${form.id})`);
        this._router.navigate(['form', form.id]);
      }
    });

    console.log('Final success status:', success);

    if(!success){
      Swal.fire({
        title: 'Không tìm thấy biểu mẫu phù hợp!',
        text: `Không có biểu mẫu sàng lọc cho trẻ ${month} tháng tuổi. Vui lòng kiểm tra lại ngày sinh hoặc liên hệ hỗ trợ.`,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }

  }
}