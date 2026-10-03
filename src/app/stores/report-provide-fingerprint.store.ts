import { observable, computed, action, autorun, toJS } from "mobx";
import { Injectable } from "@angular/core";
import { ConvertService, toDayOfMonth, toKhDay, toKhMonth, toKhYear, toMonthKh, toYearOfPeriod, pushToArray, getStartAndEndOfDayFromAndToDate } from 'src/app/shared/services/convert.service';
import { DataService } from "../shared/services/data.service";
import { AuthStore } from "./auth.store";

@Injectable({ providedIn: "root" })
export class ReportProvideFingerprint {
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
        const { currentDepartment } = this.auth
        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)

        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)
        const items = await  this.ds.criminalRecordRef(ref => ref
            .where('workplace_entry.key', '==' ,currentDepartment?.key)
            .where("review_at", ">=", dateFilter?.start)
            .where("review_at", "<=", dateFilter?.end)
            .orderBy("review_at")
        ).get().toPromise()

        const forms = pushToArray(items)
        this.data = forms.filter(m=> m?.status?.key >= 1)

        const total = this.data.length
        const totalF = this.data.filter(m=> m?.gender?.key === 0).length

        const totalS = this.data.filter(m=> m?.isStudent).length
        const totalSF = this.data.filter(m=> m?.isStudent && m?.gender?.key === 0).length

        const totalFor = this.data.filter(m=> m?.national_application?.key === "foreigner").length
        const totalForF = this.data.filter(m=> m?.national_application?.key === "foreigner" && m?.gender?.key === 0).length

        const total20 = this.data.filter(m=> m?.urgent_obj?.key === 20).length
        const total20T = this.data.filter(m=> (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m=> m?.key === 2 || m?.key === 3))).length

        const total12 = this.data.filter(m=> m?.urgent_obj?.key === 12).length
        const total12T = this.data.filter(m=> (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m=> m?.key === 2 || m?.key === 3))).length

        const totalKhmer = this.data.filter(m=> (m.criminal_language?.find(m=> m?.key === 1 ))).length
        const totalEnglish = this.data.filter(m=> (m.criminal_language?.find(m=> m?.key === 3 ))).length
        const totalFrench = this.data.filter(m=> (m.criminal_language?.find(m=> m?.key === 2 ))).length



        this.statistic = {
            total,
            totalF,

            totalS,
            totalSF,

            totalFor,
            totalForF,

            total20,
            total20T,

            total12,
            total12T,

            totalKhmer,
            totalEnglish,
            totalFrench,
        }

    }

}
