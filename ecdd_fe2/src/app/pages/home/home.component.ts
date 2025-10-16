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

    });
  }


  startForm(month : number){

    let success = false;
    this.forms.forEach((form: {id: number, from: string; to: string; }) => {

      if(parseInt(form.from) <= month && parseInt(form.to) > month){
        success = true;
        this._router.navigate(['form', form.id]);
      }
    });
    if(!success){
      Swal.fire('Trẻ nằm ngoài độ tuổi sàng lọc!');
    }

  }
}
