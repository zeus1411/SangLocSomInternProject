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
  constructor(private _router: Router, private route: ActivatedRoute, private http: HttpClient) {

    this._router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  ngOnInit(): void {

    let user = JSON.parse(localStorage.getItem('user') || '{}');

    if(!user.id){
     

      Swal.fire({
        title: 'Vui lòng đăng nhập',
        confirmButtonText: 'OK',
      }).then((result) => {
        
      this._router.navigate(['/login']);
      })
      
    }

  }

}
