import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxEchartsDirective} from 'ngx-echarts';
import {EChartsCoreOption} from 'echarts/core';
import {EmptyState} from '../empty-state/empty-state';

@Component({
  selector: 'app-chart-panel',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective, EmptyState],
  templateUrl: './chart-panel.html',
  styleUrls: ['./chart-panel.scss']
})
export class ChartPanel {
  @Input({required: true}) chartOptions: EChartsCoreOption = {};

  @Input() title = '';
  @Input() subtitle = '';
  @Input() height = '315px';
  @Input() emptyMessage = 'No chart data available.';
  @Input() hasData = true;
}
