import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './core/interceptors/auth.interceptor';

import {provideEchartsCore} from 'ngx-echarts';
import * as echarts from 'echarts/core';

import {BarChart, LineChart, PieChart} from 'echarts/charts';
import {DatasetComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent,} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';

// Register chart types and components globally
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  CanvasRenderer,
]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideEchartsCore({echarts}),
  ],
};
