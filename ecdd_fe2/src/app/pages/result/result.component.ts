import { formatNumber } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
declare var require: any;
const More = require('highcharts/highcharts-more');
More(Highcharts);

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  @Input() form: any;
  @Input() person: any;

  public isloading : boolean = false;

  constructor(private _router: Router, private route: ActivatedRoute, private http: HttpClient) {

    this._router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }


  ngOnInit(): void {
    //calculate
    this.calculate();


    let datas = [];
    let cats = [];
    for (let fmember of this.form.Formmembers) {
      cats.push(fmember.Dataset.name);
      datas.push((fmember.Dataset.nowscore / fmember.Dataset.totalscore) * 100);

    }


    const chart = Highcharts.chart('container', {

      chart: {
        polar: true,
        type: 'line'
      },

      accessibility: {
        description: ''
      },

      title: {
        text: this.form.name,
        x: -80
      },

      pane: {
        size: '80%'
      },

      xAxis: {
        categories: cats,
        tickmarkPlacement: 'on',
        lineWidth: 0
      },

      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: 100
      },

      tooltip: {
        shared: true,
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f} %</b><br/>'
      },

      legend: {
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical'
      },

      series: [{
        type: "area",
        name: 'Kết quả đánh giá',
        data: datas,
        pointPlacement: 'on'
      }],

      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              align: 'center',
              verticalAlign: 'bottom',
              layout: 'horizontal'
            },
            pane: {
              size: '90%'
            }
          }
        }]
      }

    });

    let i = 0;
    for (let fmember of this.form.Formmembers) {
      if (fmember.Dataset.alertyn === true) {
        chart.series[0].data[i].update({
          marker: {
            radius: 8,
            //symbol: 'diamond',
            fillColor: '#FFC4A4',
            states: {
              hover: {
                fillColor: 'rgb(255, 150, 100)',
                lineColor: 'red'
              }
            }
          }
        });
      }
      i++;
    }

    // if (this.person != null) {
    //   this.saveResult();
    // }


  }

  calculate() {

    //cảnh báo chung cho form
    this.form.alertyn = false;
    this.form.warningyn = false;

    //tính điểm cho từng dataset
    for (let fmember of this.form.Formmembers) {

      //điểm khảo sát
      fmember.Dataset.nowscore = 0.0;

      //tổng điểm
      fmember.Dataset.totalscore = 0.0;

      //cảnh báo dataset
      fmember.Dataset.alertyn = false;

      for (let dsm of fmember.Dataset.Datasetmembers) {

        fmember.Dataset.nowscore += parseFloat(dsm.nowscore);
        fmember.Dataset.totalscore += parseFloat(dsm.score);

        if (dsm.nowscore != dsm.score) {

          this.form.warningyn = true;
          fmember.Dataset.warningyn = true;
        }

      }

      //cảnh báo khi điểm của dataset nằm ngoài khoảng minscore - maxscore
      if (fmember.Dataset.nowscore < parseFloat(fmember.Dataset.minscore) || fmember.Dataset.nowscore > parseFloat(fmember.Dataset.maxscore)) {
        fmember.Dataset.alertyn = true;

        this.form.alertyn = true;

        //nếu dataset có cảnh báo, thiết lập cảnh báo của form (form.explain) là câu cảnh báo của dataset (dataset.explain)
        if (this.form.explain !== fmember.Dataset.explain) {
          this.form.explain = fmember.Dataset.explain;
        }
      }

    }
  }

}
