import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  constructor(private _router: Router, private route: ActivatedRoute, private http: HttpClient) {

    this._router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  showResultYN: boolean = false;
  form: any;

  ngOnInit(): void {
    let formid = this.route.snapshot.params['formid'];
    this.http.get<any>(environment.url + '/api/forms/' + formid).subscribe(d => {

      this.form = d.data;
    });
  }

  result() {
    this.showResultYN = true;
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
