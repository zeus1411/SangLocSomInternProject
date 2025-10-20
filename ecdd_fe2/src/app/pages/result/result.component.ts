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

  public isloading: boolean = false;

  constructor(
    private _router: Router, 
    private route: ActivatedRoute, 
    private http: HttpClient
  ) {
    this._router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  ngOnInit(): void {
    // Tính toán điểm và cảnh báo
    this.calculate();

    // Chuẩn bị dữ liệu cho biểu đồ
    let datas = [];
    let cats = [];
    
    // Sử dụng formMembers (lowercase) theo API
    const formMembers = this.form.formMembers || this.form.Formmembers || [];
    
    for (let fmember of formMembers) {
      const dataset = fmember.dataset || fmember.Dataset;
      cats.push(dataset.name);
      // Tính phần trăm điểm đạt được
      const percentage = (dataset.nowscore / dataset.totalscore) * 100;
      datas.push(percentage);
    }

    // Vẽ biểu đồ Radar (Spider Chart)
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

    // Đánh dấu các điểm có cảnh báo bằng màu khác
    let i = 0;
    for (let fmember of formMembers) {
      const dataset = fmember.dataset || fmember.Dataset;
      if (dataset.alertyn === true) {
        chart.series[0].data[i].update({
          marker: {
            radius: 8,
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
  }

  /**
   * Tính toán điểm và xác định cảnh báo cho form
   */
  calculate() {
    // Reset cảnh báo chung cho form
    this.form.alertyn = false;
    this.form.warningyn = false;

    // Sử dụng formMembers (lowercase) theo API
    const formMembers = this.form.formMembers || this.form.Formmembers || [];

    // Tính điểm cho từng dataset (lĩnh vực)
    for (let fmember of formMembers) {
      const dataset = fmember.dataset || fmember.Dataset;
      
      // Reset điểm và cảnh báo của dataset
      dataset.nowscore = 0.0;
      dataset.totalscore = 0.0;
      dataset.alertyn = false;
      dataset.warningyn = false;

      const datasetMembers = dataset.datasetMembers || dataset.Datasetmembers || [];

      // Tính tổng điểm từng câu hỏi trong dataset
      for (let dsm of datasetMembers) {
        dataset.nowscore += parseFloat(dsm.nowscore || 0);
        dataset.totalscore += parseFloat(dsm.score || 0);

        // Nếu điểm thực tế khác điểm chuẩn => có warning
        if (dsm.nowscore != dsm.score) {
          this.form.warningyn = true;
          dataset.warningyn = true;
        }
      }

      // Kiểm tra cảnh báo: điểm nằm ngoài khoảng min-max
      const minScore = parseFloat(dataset.minscore || 0);
      const maxScore = parseFloat(dataset.maxscore || 999);
      
      if (dataset.nowscore < minScore || dataset.nowscore > maxScore) {
        dataset.alertyn = true;
        this.form.alertyn = true;

        // Nếu dataset có cảnh báo, sử dụng explain của dataset đó
        if (this.form.explain !== dataset.explain) {
          this.form.explain = dataset.explain;
        }
      }
    }
  }
}