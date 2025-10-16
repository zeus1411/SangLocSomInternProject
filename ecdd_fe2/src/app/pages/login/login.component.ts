import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public userid: string = "";
  public pass: string = "";

  constructor(private _router: Router, private route: ActivatedRoute, private http: HttpClient) {

    this._router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }


  ngOnInit(): void {
    
    let user = JSON.parse(localStorage.getItem('user') || '{}');

    console.log(user)
    if(user.id){
      
      this._router.navigate(['/member/results']);
    }

  }


  public login() {
    // Validate input
    if (!this.userid || !this.pass) {
      alert('Please fill in username and password');
      return;
    }

    if (this.pass.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    const headers = { Authorization: 'Bearer my-token', 'My-Custom-Header': 'foobar' };
    this.http.post<any>(environment.url + '/api/auth/login', { username: this.userid, password: this.pass }).subscribe({
      next: (data) => {
        if (data.success) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          this._router.navigate(['/member/results']);
        } else {
          localStorage.clear();
          alert('Username or password incorrect!');
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        if (error.status === 400) {
          alert('Invalid username or password format. Password must be at least 6 characters.');
        } else if (error.status === 401) {
          alert('Invalid username or password!');
        } else {
          alert('Login failed. Please try again.');
        }
      }
    });
  }


  startForm(month: number) {


    this.http.get<any>(environment.url + '/api/programs/bycode/ecdd').subscribe(d => {

      let forms = d.data?.forms || [];
      let success = false;
      forms.forEach((form: { id: number, from: string; to: string; }) => {

        if (parseInt(form.from) <= month && parseInt(form.to) > month) {
          success = true;
          this._router.navigate(['form', form.id]);
        }
      });

      if (!success) {
        Swal.fire('Trẻ nằm ngoài độ tuổi sàng lọc!');
      }

    });

  }
}
