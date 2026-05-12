import {Component} from '@angular/core';
import {NgxEchartsDirective} from 'ngx-echarts';
import {EChartsCoreOption} from 'echarts/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  chartOption: EChartsCoreOption = {
    title: {
      text: 'Monthly Leads',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Leads',
        type: 'bar',
        data: [12, 25, 18, 40],
      },
    ],
  };
}
