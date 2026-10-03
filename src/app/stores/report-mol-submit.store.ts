import { observable, computed, action, autorun, toJS } from "mobx";
import { Injectable } from "@angular/core";
import { ConvertService, toDayOfMonth, toKhDay, toKhMonth, toKhYear, toMonthKh, toYearOfPeriod, pushToArray, getStartAndEndOfDayFromAndToDate, orderBy, orderByData, sum } from 'src/app/shared/services/convert.service';
import { DataService } from "../shared/services/data.service";
import { AuthStore } from "./auth.store";
import { STATUS_OBJ } from "../dummy/appinfo";

@Injectable({ providedIn: "root" })
export class ReportMolSubmitStore {
    @observable public loading = false;

    @observable public fromDate: any = null;
    @observable public toDate: any = null;
    @observable public fromDateKey: any = null;
    @observable public toDateKey: any = null;
    @observable public periodText: string = null;
    @observable public periodTextDaily: string = null;
    @observable public periodMonthDaily: string = null;

    @observable public periodType: number = 1;

    @observable public fromDateNum = null;
    @observable public toDateNum = null;

    @observable public selectedPost = null;
    @observable public selectedTravel = null;

    @observable public data: any = [];
    @observable public statistic = null;


    constructor(
      private ds: DataService,
      private auth: AuthStore,
    ) { }

    getPeriod(fromDate, toDate) {
        this.fromDate = ConvertService.numberToDate(fromDate);
        this.toDate = ConvertService.numberToDate(toDate);
        this.periodText = `ចាប់ពីថ្ងៃទី${toKhDay(this.fromDate)} ខែ${toKhMonth(this.fromDate)} ឆ្នាំ${toKhYear(this.fromDate)} ដល់ថ្ងៃទី ${toKhDay(this.toDate)} ខែ${toKhMonth(this.toDate)} ឆ្នាំ${toKhYear(this.toDate)}`
        this.periodTextDaily = `ថ្ងៃទី${toKhDay(this.fromDate)} ខែ${toKhMonth(this.fromDate)} ឆ្នាំ${toKhYear(this.fromDate)}`
        this.periodMonthDaily = `ចាប់ពីខែ${toKhMonth(this.fromDate)} ឆ្នាំ${toKhYear(this.fromDate)} ដល់ខែ${toKhMonth(this.toDate)} ឆ្នាំ${toKhYear(this.toDate)}`
    }

    @action
    async fetchData(queryParams) {
        this.loading = true;
        this.selectedPost = null
        const { fromdate, todate } = queryParams;

        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)

        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)
        const items = await  this.ds.criminalRecordRef(ref => ref
            .where('workplace_entry.key', '==', this.auth?.config?.department_labor?.key)
            .where("created_at", ">=", dateFilter?.start)
            .where("created_at", "<=", dateFilter?.end)
            .orderBy("created_at")
        ).get().toPromise()

        const { config } = this.auth;
        const departmentKey = config.department_labor?.key

        const forms = pushToArray(items)

        this.data = orderByData(forms.filter(m=> m?.status?.key >= 1)?.map(m=>({...m,last_name: m?.last_name?.trim()})),'last_name')

        const total = this.data.length
        const totalF = this.data.filter(m=> m?.gender?.key === 0).length

        const totalPaid = this.data.filter(m=> m?.status?.key >= STATUS_OBJ.PAID?.key).length
        const totalPaidF = this.data.filter(m=> (m?.status?.key >= STATUS_OBJ.PAID?.key) && (m?.gender?.key === 0)).length

        
        this.statistic = {
            total,
            totalF,

            totalPaid,
            totalPaidF
        }
    }

}
