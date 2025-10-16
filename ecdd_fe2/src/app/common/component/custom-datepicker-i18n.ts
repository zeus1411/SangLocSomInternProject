import {   Injectable } from '@angular/core';

import {  NgbDatepickerI18n, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';




const I18N_VALUES = {
    'vi': {
      weekdays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      months: ['Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06'
                , 'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
      weekLabel: 'sem'
    }
  };
  @Injectable()
  export class I18n {
    language = 'vi';
  }
  // Define custom service providing the months and weekdays translations
  @Injectable()
  export class CustomDatepickerI18n extends NgbDatepickerI18n {
    constructor(private _i18n: I18n) { super(); }
  
    getWeekdayLabel(weekday: number): string { return (I18N_VALUES as any)[this._i18n.language].weekdays[weekday - 1]; }
    override getWeekLabel(): string { return (I18N_VALUES as any)[this._i18n.language].weekLabel; }
    getMonthShortName(month: number): string { return (I18N_VALUES as any)[this._i18n.language].months[month - 1]; }
    getMonthFullName(month: number): string { return this.getMonthShortName(month); }
    getDayAriaLabel(date: NgbDateStruct): string { return `${date.day}-${date.month}-${date.year}`; }
  }
