import {AfterViewInit, ChangeDetectorRef, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxEchartsDirective} from 'ngx-echarts';
import {finalize, forkJoin} from 'rxjs';
import {DashboardService, LocationPerformance} from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-location-analytics',
  standalone: true,
  imports: [
    CommonModule,
    NgxEchartsDirective
  ],
  templateUrl: './location-analytics.html',
  styleUrl: './location-analytics.scss'
})
export class LocationAnalytics implements AfterViewInit {

  @Input() year = 2026;
  @Input() month = 5;
  @Input() limit = 5;
  @Input() showGenerateButton = false;

  loading = false;
  generating = false;
  loadedOnce = false;

  locationPerformance: LocationPerformance[] = [];
  topLocations: LocationPerformance[] = [];
  bottomLocations: LocationPerformance[] = [];

  topLocationChartOptions: any = {};
  bottomLocationChartOptions: any = {};

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadLocationAnalytics();
    }, 0);
  }

  loadLocationAnalytics(): void {
    this.loading = true;
    this.cdr.detectChanges();

    forkJoin({
      performance: this.dashboardService.getMyTeamLocationPerformance(this.year, this.month),
      top: this.dashboardService.getMyTeamTopLocations(this.year, this.month, this.limit),
      bottom: this.dashboardService.getMyTeamBottomLocations(this.year, this.month, this.limit)
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadedOnce = true;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.locationPerformance = response.performance || [];
          this.topLocations = response.top || [];
          this.bottomLocations = response.bottom || [];

          this.buildTopLocationChart();
          this.buildBottomLocationChart();

          this.cdr.detectChanges();

          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 100);
        },
        error: (error) => {
          console.error('Location analytics load error:', error);

          this.locationPerformance = [];
          this.topLocations = [];
          this.bottomLocations = [];

          this.buildTopLocationChart();
          this.buildBottomLocationChart();

          this.cdr.detectChanges();
        }
      });
  }

  generateLocationPerformance(): void {
    if (this.generating) {
      return;
    }

    this.generating = true;
    this.cdr.detectChanges();

    this.dashboardService.generateLocationPerformance(this.year, this.month)
      .pipe(
        finalize(() => {
          this.generating = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.loadLocationAnalytics();
        },
        error: (error) => {
          console.error('Generate location performance error:', error);
        }
      });
  }

  buildTopLocationChart(): void {
    this.topLocationChartOptions = {
      title: {
        text: 'Top Performing Locations',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 700
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          return `${item.name}<br/>Conversion Rate: ${item.value}%`;
        }
      },
      grid: {
        left: 40,
        right: 20,
        top: 55,
        bottom: 45
      },
      xAxis: {
        type: 'category',
        data: this.topLocations.map(item => this.formatLocationName(item)),
        axisLabel: {
          rotate: 25
        }
      },
      yAxis: {
        type: 'value',
        name: 'Conversion %'
      },
      series: [
        {
          name: 'Conversion Rate',
          type: 'bar',
          data: this.topLocations.map(item => Number(item.conversionRate || 0))
        }
      ]
    };
  }

  buildBottomLocationChart(): void {
    this.bottomLocationChartOptions = {
      title: {
        text: 'Least Performing Locations',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 700
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          return `${item.name}<br/>Conversion Rate: ${item.value}%`;
        }
      },
      grid: {
        left: 40,
        right: 20,
        top: 55,
        bottom: 45
      },
      xAxis: {
        type: 'category',
        data: this.bottomLocations.map(item => this.formatLocationName(item)),
        axisLabel: {
          rotate: 25
        }
      },
      yAxis: {
        type: 'value',
        name: 'Conversion %'
      },
      series: [
        {
          name: 'Conversion Rate',
          type: 'bar',
          data: this.bottomLocations.map(item => Number(item.conversionRate || 0))
        }
      ]
    };
  }

  formatLocationName(item: LocationPerformance): string {
    if (!item) {
      return 'UNKNOWN';
    }

    if (item.district && item.district !== 'UNKNOWN') {
      return item.district;
    }

    return item.province || 'UNKNOWN';
  }

  trackByLocation(index: number, item: LocationPerformance): string {
    return `${item.province}-${item.district}-${index}`;
  }
}
