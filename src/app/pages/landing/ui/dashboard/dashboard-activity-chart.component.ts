
import { Component, Input, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { NgxApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexStroke, ApexDataLabels, ApexYAxis, ApexLegend, ApexTooltip, ApexFill, ApexMarkers } from 'ngx-apexcharts';

@Component({
  selector: 'app-dashboard-activity-chart',
  templateUrl: './dashboard-activity-chart.component.html',
  styleUrls: ['./dashboard-activity-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgxApexchartsModule],
})
export class DashboardActivityChartComponent implements OnChanges {
  @Input() data: any[] = [];

  public series: ApexAxisChartSeries = [];
  public chart: ApexChart = { type: 'line', height: 200, toolbar: { show: false } };
  public xaxis: ApexXAxis = { categories: [] };
  public stroke: ApexStroke = { curve: 'smooth', width: 2 };
  public dataLabels: ApexDataLabels = { enabled: false };
  public yaxis: ApexYAxis = { min: 0, labels: { style: { fontSize: '12px' } } };
  public legend: ApexLegend = { show: true, position: 'top', fontSize: '13px' };
  public tooltip: ApexTooltip = { enabled: true };
  public fill: ApexFill = { type: 'solid', opacity: 0.18 };
  public markers: ApexMarkers = { size: 3 };

  ngOnChanges() {
    if (this.data && this.data.length > 0) {
      this.xaxis = { categories: this.data.map((d: any) => d.time) };
      this.series = [
        {
          name: 'Running',
          data: this.data.map((d: any) => d.Running),
          color: '#006DAE',
        },
        {
          name: 'GPU',
          data: this.data.map((d: any) => d.GPU),
          color: '#8B5CF6',
        },
        {
          name: 'MPI',
          data: this.data.map((d: any) => d.MPI),
          color: '#06B6D4',
        },
      ];
    }
  }
}
