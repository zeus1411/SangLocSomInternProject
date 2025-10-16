import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-render-value',
  templateUrl: './render-value.component.html',
  styleUrls: ['./render-value.component.scss']
})
export class RenderValueComponent implements OnInit {
  @Input() el: any;
  constructor() { }

  ngOnInit(): void {
  }
  splitStr(str : string, sep : string) {
    return str.split(sep);
  }

}
