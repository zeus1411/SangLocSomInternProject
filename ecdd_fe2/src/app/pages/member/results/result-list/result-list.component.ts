import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.scss']
})
export class ResultListComponent implements OnInit {
public pageSize :number = 10;
public page : number = 1;

public qstr : string = '';
  public instances: any = [];
  constructor(private _router: Router, private route: ActivatedRoute, private http: HttpClient) {

    this._router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }


  ngOnInit(): void {
    this.getInstances(this.pageSize, this.page)

  }

  changePage(page :number){
    this.page = page;
    this.getInstances(this.pageSize, this.page)
  }

  getInstances(pageSize :number, page : number){
this.page = page;
this.pageSize = pageSize;

    let headers = new HttpHeaders().set('token', localStorage.getItem("token") || '');
    let queryParams = new HttpParams();
    queryParams = queryParams.append("page",page);
    queryParams = queryParams.append("pageSize",pageSize);
    queryParams = queryParams.append("q",this.qstr);
    this.http.get<any>(environment.url + '/api/forminstances/', { params:queryParams, headers: headers }).subscribe(d => {

      this.instances = d.data?.data || [];
    },
    (error) => {                              //Error callback
      Swal.fire({
        title: 'Vui lòng đăng nhập',
        confirmButtonText: 'OK',
      }).then((result) => {
        localStorage.clear();
        this._router.navigate(['/login']);
      })
    }
    )
    ;
  }


  alert(title : string, str : string, icon : any){
    Swal.fire(
      title,
      str,
      icon
    )
  }

}
