import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-render',
  templateUrl: './render.component.html',
  styleUrls: ['./render.component.scss']
})
export class RenderComponent implements OnInit {
  @Input() el: any;
  @Input() disabled: boolean = false;
  @Input() labelcls = 'col-12';
  @Input() inputcls = 'col-12';
  @Output() elChange = new EventEmitter();


  change(newValue : any) {
    this.el.value = newValue;
    this.elChange.emit(newValue);
  }
  constructor() { }

  ngOnInit(): void {

  }

  splitStr(str : string, sep : string) {
    return str.split(sep);
  }

  nowscore(el : any, item : string){
    if(this.splitStr(item, "::") && this.splitStr(item,"::")[2]){
      el.nowscore = this.splitStr(item,"::")[2];
    }
  }


}
