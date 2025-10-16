import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public user: any = null;

  constructor(private _router: Router) {

    
  }

  ngOnInit(): void {
    
    try {
      
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
      } catch (error) {
        
      }
  }

  logout(){

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
        localStorage.clear();
        
        this._router.navigate(['/']);
      }
    })

   
  }

}
