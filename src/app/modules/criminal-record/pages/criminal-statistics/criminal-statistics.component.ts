import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../dummy/criminal.dummy';
import { CriminalStore } from '../../stores/criminal.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { ApexNonAxisChartSeries, ApexChart, ApexResponsive, ApexTheme, ApexTitleSubtitle, ApexFill, ApexYAxis, ApexStroke, ApexLegend, ApexPlotOptions, ApexTooltip, ApexAxisChartSeries, ApexDataLabels, ApexXAxis } from 'ng-apexcharts';


@Component({
  selector: 'app-criminal-statistics',
  templateUrl: './criminal-statistics.component.html',
  styleUrls: ['./criminal-statistics.component.scss']
})
export class CriminalStatisticsComponent implements OnInit {
  tabs = criminal_tabs.request_latter;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `របាយការណ៍`;
  status: any = null;
  urgent: boolean = false;


  public single = [
    {
      "name": "China",
      "value": 2243772
    },
    {
      "name": "USA",
      "value": 1126000
    },
    {
      "name": "Norway",
      "value": 296215
    },
    {
      "name": "Japan",
      "value": 257363
    },
    {
      "name": "Germany",
      "value": 196750
    },
    {
      "name": "France",
      "value": 204617
    }
  ];
  public multi = [
    {
      "name": "China",
      "series": [
        {
          "name": "2018",
          "value": 2243772
        },
        {
          "name": "2017",
          "value": 1227770
        }
      ]
    },
    {
      "name": "USA",
      "series": [
        {
          "name": "2018",
          "value": 1126000
        },
        {
          "name": "2017",
          "value": 764666
        }
      ]
    },
    {
      "name": "Norway",
      "series": [
        {
          "name": "2018",
          "value": 296215
        },
        {
          "name": "2017",
          "value": 209122
        }
      ]
    },
    {
      "name": "Japan",
      "series": [
        {
          "name": "2018",
          "value": 257363
        },
        {
          "name": "2017",
          "value": 205350
        }
      ]
    },
    {
      "name": "Germany",
      "series": [
        {
          "name": "2018",
          "value": 196750
        },
        {
          "name": "2017",
          "value": 129246
        }
      ]
    },
    {
      "name": "France",
      "series": [
        {
          "name": "2018",
          "value": 204617
        },
        {
          "name": "2017",
          "value": 149797
        }
      ]
    }
  ];

  name = 'Angular';
  width: number = 700;
  height: number = 300;
  fitContainer: boolean = false;

  // options for the chart
  doughnut = true;
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
  // colorScheme = {
  //   domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
  // };

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

  options = {
    chart: {
      type: 'bar'
    },
    series: [
      {
        name: 'sales',
        data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
      }
    ],
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
    }
  };

  //pie
  showLabels = true;

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
  ) { }

  ngOnInit(): void {
    const { module } = this.criminal;
    this.criminal.newButtonName = `បញ្ចូលប្រវត្តិរូប`;
    this.criminal.routerCreate = `/criminal-record/criticizes/profile/form/draft`;

    this.tabs = criminal_tabs.request_latter?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/request-latter/${m?.key}` }))
    this.route.params.subscribe(async params => {
      this.loading = false;
      this.params = params;
      // this.onlineApplication = params?.tabKey === 'online';
      // this.status = status;
      // await this.store.fetchCriminalRecords(status, null,this.urgent, res => {
      //   this.loading = false;
      // })
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    await this.store.unsubscribe()
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    // this.store.fetchMoreCriminalRecords(this.status, null,this.urgent, res => {
    //   this.loadingMore = false;
    // })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    // this.loadingSearch = true;
    // const { currentDepartment } = this.auth
    // this.store.fetchData(this.statusKey, currentDepartment?.key, value, data => {
    //       this.loadingSearch = false;
    // })
  }

  print() { }
  exportExcel() { }
}

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
