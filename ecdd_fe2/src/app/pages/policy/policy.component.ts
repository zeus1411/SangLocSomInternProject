import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent implements OnInit {


  constructor(private _router: Router, private route: ActivatedRoute, private http: HttpClient) {

    this._router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  ngOnInit(): void {
  }

  startForm(month: number) {


    this.http.get<any>('https://ecdd-api.dientoan.vn/program/bycode/ecdd').subscribe(d => {

      let forms = d.forms;
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
