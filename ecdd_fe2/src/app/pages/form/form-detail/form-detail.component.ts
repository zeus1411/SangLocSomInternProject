import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-detail',
  templateUrl: './form-detail.component.html',
  styleUrls: ['./form-detail.component.scss']
})
export class FormDetailComponent implements OnInit {
  @Input() form: any;
  constructor() { }

  ngOnInit(): void {

  }

}
