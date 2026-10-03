import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChartComponent } from '@swimlane/ngx-charts';
import { ApexNonAxisChartSeries, ApexChart, ApexResponsive, ApexTheme, ApexTitleSubtitle, ApexFill, ApexYAxis, ApexStroke, ApexLegend, ApexPlotOptions, ApexTooltip, ApexAxisChartSeries, ApexDataLabels, ApexXAxis } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  theme: ApexTheme;
  title: ApexTitleSubtitle;
  fill: ApexFill,
  yaxis: ApexYAxis,
  stroke: ApexStroke,
  legend: ApexLegend,
  plotOptions: ApexPlotOptions,
  colors: string[],
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
};
export type ChartOptions2 = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  animations: any;
  animationEnabled: any;
};
@Component({
  selector: 'app-statistic-chart-view',
  templateUrl: './statistic-chart-view.component.html',
  styleUrls: ['./statistic-chart-view.component.scss']
})
export class StatisticChartViewComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() chartName: string;
  @Input() selectedOrganization: any;

  @Input() summaryChartDataSource: any = null;
  @Input() summaryChartDataSource2: any = null;
  @Input() summaryChartDataSource3: any = null;
  @Input() summaryChartDataSource4: any = null;
  @Input() summaryChartDataSource5: any = null;
  @Input() summaryChartDataSource6: any = null;

  @Input() summaryChartDataSource7: any = null;
  @Input() summaryChartDataSource8: any = null;

  @Input() organizationChartDataSource: any = null;
  @Input() organizationChartDataSource2: any = null;
  @Input() organizationChartDataSource3: any = null;
  @Input() organizationChartDataSource4: any = null;
  @Input() organizationChartDataSource5: any = null;
  @Input() organizationChartDataSource6: any = null;
  @Input() organizationChartDataSource7: any = null;

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public chartOptions2: Partial<ChartOptions>;
  public chartOptions3: Partial<ChartOptions>;
  public chartOptions4: Partial<ChartOptions>;

  public summaryChart2: Partial<ChartOptions>;
  public summaryChart3: Partial<ChartOptions>;

  @ViewChild("fileInput", { static: false }) fileInput: ElementRef;

  public greeting: any;

  view: any[] = [700, 400];
  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = false;
  showYAxisLabel: boolean = false;
  xAxisLabel: string = '';
  yAxisLabel: string = '';
  legendTitle: string = '';

  colorScheme = {
    domain: [
      "#F3B415",
      "#F27036",
      "#663F59",
    ]
  };

  colorScheme2 = {
    domain: [
      "#6A6E94",
      "#4E88B4",
      "#00A7C6",
    ]
  };
  colorScheme3 = {
    domain: [
      "#18D8D8",
      "#A9D794",
      "#46AF78",
    ]
  };

  colorScheme4 = {
    domain: [
      "#ddbea9",
      "#dda15e",
      "#606c38",

    ]
  };

  colorScheme5 = {
    domain: [
      "#dda15e",
    ]
  };

  organizationChart2 = {
    domain: [
      // "#4F7CEF",
      // "#FD845B",
      // "#57CFC5", //#74D3C6

      "#0174C7",
      "#FC8B00",
      "#EA0F21",
    ]
  };
  organizationChart3 = {
    domain: [
      // "#4F7CEF",
      // "#FD845B",
      // "#57CFC5", //#74D3C6

      "#0174C7",
      "#FC8B00",
      "#EA0F21",
    ]
  };


  d_chart_color1 = [
    "#214C81",
    "#1691DE",
  ]

  d_chart_color2 = [
    // "#6C49FB",
    // "#3F7EFA",
    "#FB8F66",
    "#67C8FF",
  ]

  d_chart_color3 = [
    // "#3543BE",
    // "#FD7800",
    "#45BFF7",
    "#45D8AC",
  ]

  b_chart2_color1 = [
    "#4db6ac",
    "#673ab7",
  ]

  b_chart2_color2 = [
    "#3543BE",
    "#FD7800",
  ]

  b_chart1_color1 = {
    domain: [
      "#4db6ac",
      "#673ab7",
    ]
  };

  constructor(
    private dialog: MatDialog
  ) {


    this.chartOptions2 = {
      series: [],
      chart: {
        width: '360px',
        type: 'donut',
        // dropShadow: {
        //   enabled: true,
        //   enabledOnSeries: undefined,
        //   top: 0,
        //   left: 0,
        //   blur: 6,
        //   color: '#000',
        //   opacity: 0.1
        // }
      },
      colors: [
        "#e9c46a",
        "#264653",
        "#2a9d8f",
        "#f4a261",
        "#e76f51",
        "#cb997e",
        "#ddbea9",
        "#ffe8d6",
        "#b7b7a4",
        "#a5a58d",
        "#6b705c",
        "#606c38",
        "#283618",
        "#fefae0",
        "#dda15e"

      ],
      labels: [],
      fill: {
        opacity: 1
      },
      stroke: {
        width: 1,
        colors: undefined
      },
      yaxis: {
        show: false
      },
      legend: {
        position: 'bottom'
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "55%",
          // endingShape: "rounded"
        },
        polarArea: {
          rings: {
            strokeWidth: 1
          }
        }
      },
      theme: {
        monochrome: {
          // enabled: true,
          shadeTo: 'light',
          shadeIntensity: 0.6
        }
      },
      tooltip: {
        y: {
          formatter: function (val, index) {
            if (index.seriesIndex === 0) {
              return " " + val + " %";
            } else {
              return " " + val + " នាក់";
            }
          }
        }
      },
      dataLabels: {
        enabled: false,
      }
    };

    this.chartOptions3 = {
      series: [],
      chart: {
        width: '360px',
        type: 'pie',
        // dropShadow: {
        //   enabled: true,
        //   enabledOnSeries: undefined,
        //   top: 0,
        //   left: 0,
        //   blur: 6,
        //   color: '#000',
        //   opacity: 0.1
        // }
      },
      colors: [
        "#e9c46a",
        "#264653",
        "#2a9d8f",
        "#f4a261",
        "#e76f51",
        "#cb997e",
        "#ddbea9",
        "#ffe8d6",
        "#b7b7a4",
        "#a5a58d",
        "#6b705c",
        "#606c38",
        "#283618",
        "#fefae0",
        "#dda15e"

      ],
      labels: [],
      fill: {
        opacity: 1
      },
      stroke: {
        width: 1,
        colors: undefined
      },
      yaxis: {
        show: false
      },
      legend: {
        position: 'bottom'
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "55%",
          // endingShape: "rounded"
        },
        polarArea: {
          rings: {
            strokeWidth: 1
          }
        }
      },
      theme: {
        monochrome: {
          // enabled: true,
          shadeTo: 'light',
          shadeIntensity: 0.6
        }
      },
      tooltip: {
        y: {
          formatter: function (val, index) {
            if (index.seriesIndex === 0) {
              return " " + val + " %";
            } else {
              return " " + val + " នាក់";
            }
          }
        }
      }
    };

    this.chartOptions4 = {
      series: [],
      chart: {
        width: '360px',
        type: 'pie',
        // dropShadow: {
        //   enabled: true,
        //   enabledOnSeries: undefined,
        //   top: 0,
        //   left: 0,
        //   blur: 6,
        //   color: '#000',
        //   opacity: 0.1
        // }
      },
      colors: [
        "#f4a261",
        "#e76f51",
        "#2a9d8f",
        "#264653",
        "#e9c46a",
        "#cb997e",
        "#ddbea9",
        "#ffe8d6",
        "#b7b7a4",
        "#a5a58d",
        "#6b705c",
        "#606c38",
        "#283618",
        "#fefae0",
        "#dda15e"

      ],
      labels: [],
      fill: {
        opacity: 1
      },
      stroke: {
        width: 1,
        colors: undefined
      },
      yaxis: {
        show: false
      },
      legend: {
        position: 'bottom'
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "55%",
          // endingShape: "rounded"
        },
        polarArea: {
          rings: {
            strokeWidth: 1
          }
        }
      },
      theme: {
        monochrome: {
          // enabled: true,
          shadeTo: 'light',
          shadeIntensity: 0.6
        }
      },
      tooltip: {
        y: {
          formatter: function (val, index) {
            if (index.seriesIndex === 0) {
              return " " + val + " %";
            } else {
              return " " + val + " នាក់";
            }
          }
        }
      }
    };


    this.chartOptions = {

      series: [],
      chart: {
        width: 450,
        type: 'polarArea',
        dropShadow: {
          enabled: true,
          enabledOnSeries: undefined,
          top: 0,
          left: 0,
          blur: 6,
          color: '#000',
          opacity: 0.1
        }
      },
      colors: [
        "#F3B415",
        "#F27036",
        "#663F59",
        "#6A6E94",
        "#4E88B4",
        "#00A7C6",
        "#18D8D8",
        "#A9D794",
        "#46AF78",
        "#A93F55",
        "#8C5E58",
        "#2176FF",
        "#33A1FD",
        "#7A918D",
        "#BAFF29"
      ],
      labels: [],
      fill: {
        opacity: 1
      },
      stroke: {
        width: 1,
        colors: undefined
      },
      yaxis: {
        show: false
      },
      legend: {
        position: 'bottom'
      },
      plotOptions: {
        polarArea: {
          rings: {
            strokeWidth: 1
          }
        }
      },
      theme: {
        monochrome: {
          //    enabled: true,
          shadeTo: 'light',
          shadeIntensity: 0.6
        }
      },
      tooltip: {
        y: {
          formatter: function (val, index) {
            return " " + val + " នាក់";
          }
        }
      }
    };

    this.summaryChart2 = {
      series: [],
      chart: {
        width: '360px',
        type: 'pie',
        // dropShadow: {
        //   enabled: true,
        //   enabledOnSeries: undefined,
        //   top: 0,
        //   left: 0,
        //   blur: 6,
        //   color: '#000',
        //   opacity: 0.1
        // }
      },
      colors: [
        "#214C81",
        "#1691DE",
      ],
      labels: [],
      fill: {
        opacity: 1
      },
      stroke: {
        width: 1,
        colors: undefined
      },
      yaxis: {
        show: false
      },
      legend: {
        position: 'bottom'
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "55%",
          // endingShape: "rounded"
        },
        polarArea: {
          rings: {
            strokeWidth: 1
          }
        }
      },
      theme: {
        monochrome: {
          // enabled: true,
          shadeTo: 'light',
          shadeIntensity: 0.6
        }
      },
      tooltip: {
        y: {
          formatter: function (val, index) {
            if (index.seriesIndex === 0) {
              return " " + val + " %";
            } else {
              return " " + val + " %";
            }
          }
        }
      },
      dataLabels: {
        enabled: false,
        // formatter: function (val) {
        //   return ''
        // },
      }
    };

    this.summaryChart3 = {
      series: [],
      chart: {
        width: '360px',
        type: 'pie',
        // dropShadow: {
        //   enabled: true,
        //   enabledOnSeries: undefined,
        //   top: 0,
        //   left: 0,
        //   blur: 6,
        //   color: '#000',
        //   opacity: 0.1
        // }
      },
      colors: [
        // "#3543BE",
        // "#FD7800",
        "#77CDD3",
        "#D97C59",
      ],
      labels: [],
      fill: {
        opacity: 1
      },
      stroke: {
        width: 1,
        colors: undefined
      },
      yaxis: {
        show: false
      },
      legend: {
        position: 'bottom'
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "55%",
          // endingShape: "rounded"
        },
        polarArea: {
          rings: {
            strokeWidth: 1
          }
        }
      },
      theme: {
        monochrome: {
          // enabled: true,
          shadeTo: 'light',
          shadeIntensity: 0.6
        }
      },
      tooltip: {
        y: {
          formatter: function (val, index) {
            if (index.seriesIndex === 0) {
              return " " + val + " %";
            } else {
              return " " + val + " %";
            }
          }
        }
      },
      dataLabels: {
        enabled: false,
        // formatter: function (val) {
        //   return ''
        // },
      }
    };

  }

  ngOnInit() { }


  openChatDetail(chartNumber: number) {
    // let dialogRef = this.dialog.open(StatisticChartViewDialogComponent, {
    //   data: {
    //     chartNumber,
    //     chartName: this.chartName,
    //     summaryChartDataSource: this.summaryChartDataSource,
    //     selectedOrganization: this.selectedOrganization,
    //     summaryChartDataSource2: this.summaryChartDataSource2,
    //     summaryChartDataSource3: this.summaryChartDataSource3,
    //     summaryChartDataSource4: this.summaryChartDataSource4,
    //     summaryChartDataSource5: this.summaryChartDataSource5,
    //     summaryChartDataSource6: this.summaryChartDataSource6,
    //     summaryChartDataSource7: this.summaryChartDataSource7,
    //     summaryChartDataSource8: this.summaryChartDataSource8,
    //     organizationChartDataSource: this.organizationChartDataSource,
    //     organizationChartDataSource2: this.organizationChartDataSource2,
    //     organizationChartDataSource3: this.organizationChartDataSource3,
    //     organizationChartDataSource4: this.organizationChartDataSource4,
    //     organizationChartDataSource5: this.organizationChartDataSource5,
    //     organizationChartDataSource6: this.organizationChartDataSource6,
    //     organizationChartDataSource7: this.organizationChartDataSource7,
    //   },
    //   width: '100vw',
    //   height: '100vh',
    //   disableClose: true,
    //   role: 'dialog',
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result === 'yes') {

    //   }
    // });
  }

}
