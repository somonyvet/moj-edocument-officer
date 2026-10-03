import { observable, computed, action, autorun, toJS } from "mobx";
import { Injectable } from "@angular/core";
import { ConvertService, toDayOfMonth, toKhDay, toKhMonth, toKhYear, toMonthKh, toYearOfPeriod, pushToArray, getStartAndEndOfDayFromAndToDate, orderBy, orderByData, sum, getStartEndPeroidWithHours, addDay } from 'src/app/shared/services/convert.service';
import { DataService } from "../shared/services/data.service";
import { AuthStore } from "./auth.store";
import { addDays, groupBy } from "../shared/services/mapping.service";
import { CriminalService } from "../modules/criminal-record/services/criminal.service";

@Injectable({ providedIn: "root" })
export class ReportPaidForm {
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
        private criminalService: CriminalService,
    ) { }

    getPeriod(fromDate, toDate) {
        this.fromDate = ConvertService.numberToDate(fromDate);
        this.toDate = ConvertService.numberToDate(toDate);
        this.periodText = `ចាប់ពីថ្ងៃទី${toKhDay(this.fromDate)} ខែ${toKhMonth(this.fromDate)} ឆ្នាំ${toKhYear(this.fromDate)} ដល់ថ្ងៃទី ${toKhDay(this.toDate)} ខែ${toKhMonth(this.toDate)} ឆ្នាំ${toKhYear(this.toDate)}`
        this.periodTextDaily = `ថ្ងៃទី${toKhDay(this.fromDate)} ខែ${toKhMonth(this.fromDate)} ឆ្នាំ${toKhYear(this.fromDate)}`
        this.periodMonthDaily = `ចាប់ពីខែ${toKhMonth(this.fromDate)} ឆ្នាំ${toKhYear(this.fromDate)} ដល់ខែ${toKhMonth(this.toDate)} ឆ្នាំ${toKhYear(this.toDate)}`
    }

    @action
    async fetchData(queryParams, deliveryMethodKey?: string) {
        this.loading = true;
        this.selectedPost = null
        const { fromdate, todate } = queryParams;

        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)

        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)
        const items = await this.ds.criminalRecordRef(ref => {
            let q = ref
                .where("paid_at", ">=", dateFilter?.start)
                .where("paid_at", "<=", dateFilter?.end)
            if (deliveryMethodKey) {
                q = q.where('delivery_method.key', '==', deliveryMethodKey)
            }
            return q.orderBy("paid_at")
        }).get().toPromise()

        const paidOnlineProcessRef = await this.ds.criminalRecordRef(ref => {
            let q = ref
                .where('paid_online', '==', true)
                .where("paid_at", ">=", dateFilter?.start)
                .where("paid_at", "<=", dateFilter?.end)
            if (deliveryMethodKey) {
                q = q.where('delivery_method.key', '==', deliveryMethodKey)
            }
            return q.orderBy("paid_at")
        }).get().toPromise()

        const { config } = this.auth;
        const departmentKey = config.department_labor?.key

        const forms = pushToArray(items)?.filter(f => f?.paid_online !== true)
        this.data = orderBy(forms.filter(m => m?.status?.key >= 1), 'issued_at')
        const molData = this.data.filter(m => m?.workplace_entry?.key === this.auth?.config?.department_labor?.key)
        const notMolData = this.data.filter(m => m?.workplace_entry?.key !== this.auth?.config?.department_labor?.key)
        const paidOnlineProcess = pushToArray(paidOnlineProcessRef)
        this.data = [...notMolData, ...molData, ...paidOnlineProcess]
        // this.data = this.mapData()
        const total = this.data.length
        const totalF = this.data.filter(m => m?.gender?.key === 0).length

        const totalS = this.data.filter(m => m?.isStudent).length
        const totalS20 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 20).length
        const totalS20T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS20TAmount = s20Eng + s20Fr

        const totalS12 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 12).length
        const totalS12T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS12TAmount = s12Eng + s12Fr

        const totalK = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner").length

        const totalK20 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20).length
        const totalK20T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK20TAmount = k20Eng + k20Fr

        const totalK12 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12).length
        const totalK12T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK12TAmount = k12Eng + k12Fr

        const totalFor = this.data.filter(m => m?.national_application?.key === "foreigner").length

        const totalFor20 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20).length
        const totalFor20T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF20TAmount = f20Eng + f20Fr

        const totalFor12 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12).length
        const totalFor12T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF12TAmount = f12Eng + f12Fr

        const totalOnline = this.data.filter(m => m?.apply).length

        const totalOnline20 = this.data.filter(m => m?.apply && m?.urgent_obj?.key === 20).length
        const totalOnline20T = this.data.filter(m => m?.apply && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalO20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const O20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const O20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalO20TAmount = O20Eng + O20Fr

        const totalOnline12 = this.data.filter(m => m?.apply && m?.urgent_obj?.key === 12).length
        const totalOnline12T = this.data.filter(m => m?.apply && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalO12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const O12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const O12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalO12TAmount = O12Eng + O12Fr

        const totalOnlineEpay = this.data.filter(m => m?.paid_online).length

        const totalOnlineEpay20 = this.data.filter(m => m?.paid_online && m?.urgent_obj?.key === 20).length
        const totalOnlineEpay20T = this.data.filter(m => m?.paid_online && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalEpay20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.paid_online && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const Epay20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.paid_online && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const Epay20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.paid_online && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalEpay20TAmount = Epay20Eng + Epay20Fr

        const totalOnlineEpay12 = this.data.filter(m => m?.paid_online && m?.urgent_obj?.key === 12).length
        const totalOnlineEpay12T = this.data.filter(m => m?.paid_online && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalEpay12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.paid_online && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const Epay12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.paid_online && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const Epay12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.paid_online && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalEpay12TAmount = Epay12Eng + Epay12Fr

        const totalDirectApply = this.data.filter(m => !m?.apply && (m?.workplace_entry?.key !== departmentKey)).length

        const totalDirectApply20 = this.data.filter(m => !m?.apply && m?.urgent_obj?.key === 20).length
        const totalDirectApply20T = this.data.filter(m => !m?.apply && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalDirectApply12 = this.data.filter(m => !m?.apply && m?.urgent_obj?.key === 12).length
        const totalDirectApply12T = this.data.filter(m => !m?.apply && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalD20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const D20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const D20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalD20TAmount = D20Eng + D20Fr
        const totalD12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const D12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const D12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalD12TAmount = D12Eng + D12Fr

        const total20 = this.data.filter(m => m?.urgent_obj?.key === 20).length
        const total20T = this.data.filter(m => (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total20TAmount = aa20Eng + aa20Fr

        const total12 = this.data.filter(m => m?.urgent_obj?.key === 12).length
        const total12T = this.data.filter(m => (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total12TAmount = aa12Eng + aa12Fr

        const totalKhmer = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglish = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrench = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        const totalMOL = this.data?.filter(f => f?.workplace_entry?.key === departmentKey).length
        const totalMOL_F = this.data?.filter(f => (f?.workplace_entry?.key === departmentKey && f?.gender?.key === 0)).length

        const totalMOL_20 = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20)).length
        const totalMOL_20T = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalM20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const M20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const M20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalM20TAmount = M20Eng + M20Fr

        const totalMOL_12 = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12)).length
        const totalMOL_12T = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalM12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const M12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const M12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalM12TAmount = M12Eng + M12Fr

        const totalKhmerMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglishMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrenchMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')




        this.statistic = {
            total,
            totalF,

            totalS,
            // totalSF,

            totalS20,
            totalS20T,
            totalS20Amount,
            totalS20TAmount,

            totalS12,
            totalS12T,
            totalS12Amount,
            totalS12TAmount,

            totalK,
            // totalKF,
            totalK20,
            totalK20T,
            totalK12,
            totalK12T,

            totalK20Amount,
            totalK20TAmount,

            totalK12Amount,
            totalK12TAmount,

            totalFor,
            // totalForF,

            totalFor20,
            totalFor20T,
            totalFor12,
            totalFor12T,

            totalF20Amount,
            totalF20TAmount,
            totalF12Amount,
            totalF12TAmount,

            totalOnline,
            // totalOnlineF,

            totalOnline20,
            totalOnline20T,
            totalOnline12,
            totalOnline12T,

            totalO20Amount,
            totalO20TAmount,
            totalO12Amount,
            totalO12TAmount,

            totalOnlineEpay,

            totalOnlineEpay20,
            totalOnlineEpay20T,
            totalOnlineEpay12,
            totalOnlineEpay12T,

            totalEpay20Amount,
            totalEpay20TAmount,
            totalEpay12Amount,
            totalEpay12TAmount,


            totalDirectApply,
            // totalDirectApplyF,

            totalDirectApply20,
            totalDirectApply20T,
            totalDirectApply12,
            totalDirectApply12T,

            totalD20Amount,
            totalD20TAmount,
            totalD12Amount,
            totalD12TAmount,

            total20,
            total20T,
            total20Amount,
            total20TAmount,

            total12,
            total12T,
            total12Amount,
            total12TAmount,

            totalKhmer,
            totalEnglish,
            totalFrench,

            totalMOL,
            totalMOL_F,

            totalKhmerMOL,
            totalEnglishMOL,
            totalFrenchMOL,

            totalMOL_20,
            totalMOL_20T,

            totalMOL_12,
            totalMOL_12T,

            totalM20Amount,
            totalM20TAmount,

            totalM12Amount,
            totalM12TAmount,
        }
    }


    @action
    async fetchPaidOnline(queryParams) {
        this.loading = true;
        this.selectedPost = null;
        const { fromdate, todate, fromHour, toHour } = queryParams;
        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)
        const dateFilter = getStartEndPeroidWithHours(this.fromDate, this.toDate, fromHour || 16, toHour || 16)
        console.log('dateFilter', dateFilter)
        const items = await this.ds.criminalRecordRef(ref => ref
            .where('paid_online', '==', true)
            .where("paid_at", ">=", dateFilter?.start)
            .where("paid_at", "<=", dateFilter?.end)
            .orderBy("paid_at")
        ).get().toPromise()

        const { config } = this.auth;
        const departmentKey = config.department_labor?.key

        const forms = pushToArray(items)
        this.data = forms.filter(m => m?.status?.key >= 1)
        const molData = this.data.filter(m => m?.workplace_entry?.key === this.auth?.config?.department_labor?.key)
        const notMolData = this.data.filter(m => m?.workplace_entry?.key !== this.auth?.config?.department_labor?.key)
        this.data = [...notMolData, ...molData]

        let paid_total = 0;
        this.data.forEach((el) => paid_total += el?.paid_amount);

        const total = this.data.length
        const totalF = this.data.filter(m => m?.gender?.key === 0).length

        const totalS = this.data.filter(m => m?.isStudent).length
        const totalS20 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 20).length
        const totalS20T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS20TAmount = s20Eng + s20Fr

        const totalS12 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 12).length
        const totalS12T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS12TAmount = s12Eng + s12Fr

        const totalK = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner").length

        const totalK20 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20).length
        const totalK20T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK20TAmount = k20Eng + k20Fr

        const totalK12 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12).length
        const totalK12T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK12TAmount = k12Eng + k12Fr

        const totalFor = this.data.filter(m => m?.national_application?.key === "foreigner").length

        const totalFor20 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20).length
        const totalFor20T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF20TAmount = f20Eng + f20Fr

        const totalFor12 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12).length
        const totalFor12T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF12TAmount = f12Eng + f12Fr

        const total20 = this.data.filter(m => m?.urgent_obj?.key === 20).length
        const total20T = this.data.filter(m => (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total20TAmount = aa20Eng + aa20Fr

        const total12 = this.data.filter(m => m?.urgent_obj?.key === 12).length
        const total12T = this.data.filter(m => (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total12TAmount = aa12Eng + aa12Fr

        const totalKhmer = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglish = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrench = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        const totalKhmerMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglishMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrenchMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        this.statistic = {
            total,
            totalF,

            totalS,
            // totalSF,

            totalS20,
            totalS20T,
            totalS20Amount,
            totalS20TAmount,

            totalS12,
            totalS12T,
            totalS12Amount,
            totalS12TAmount,

            totalK,
            // totalKF,
            totalK20,
            totalK20T,
            totalK12,
            totalK12T,

            totalK20Amount,
            totalK20TAmount,

            totalK12Amount,
            totalK12TAmount,

            totalFor,
            // totalForF,

            totalFor20,
            totalFor20T,
            totalFor12,
            totalFor12T,

            totalF20Amount,
            totalF20TAmount,
            totalF12Amount,
            totalF12TAmount,


            total20,
            total20T,
            total20Amount,
            total20TAmount,

            total12,
            total12T,
            total12Amount,
            total12TAmount,

            totalKhmer,
            totalEnglish,
            totalFrench,

            totalKhmerMOL,
            totalEnglishMOL,
            totalFrenchMOL,
            paid_total
        }
    }

    @action
    async fetchPaidOnlineProcess(queryParams) {
        this.loading = true;
        this.selectedPost = null
        const { fromdate, todate } = queryParams;

        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)

        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)
        const items = await this.ds.criminalRecordRef(ref => ref
            .where('paid_online', '==', true)
            .where("start_process_at", ">=", dateFilter?.start)
            .where("start_process_at", "<=", dateFilter?.end)
            .orderBy("start_process_at")
        ).get().toPromise()

        const { config } = this.auth;
        const departmentKey = config.department_labor?.key

        const forms = pushToArray(items)
        this.data = forms.filter(m => m?.status?.key >= 1)
        const molData = this.data.filter(m => m?.workplace_entry?.key === this.auth?.config?.department_labor?.key)
        const notMolData = this.data.filter(m => m?.workplace_entry?.key !== this.auth?.config?.department_labor?.key)
        this.data = [...notMolData, ...molData]

        let paid_total = 0;
        this.data.forEach((el) => paid_total += el?.paid_amount);

        const total = this.data.length
        const totalF = this.data.filter(m => m?.gender?.key === 0).length

        const totalS = this.data.filter(m => m?.isStudent).length
        const totalS20 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 20).length
        const totalS20T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS20TAmount = s20Eng + s20Fr

        const totalS12 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 12).length
        const totalS12T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS12TAmount = s12Eng + s12Fr

        const totalK = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner").length

        const totalK20 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20).length
        const totalK20T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK20TAmount = k20Eng + k20Fr

        const totalK12 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12).length
        const totalK12T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK12TAmount = k12Eng + k12Fr

        const totalFor = this.data.filter(m => m?.national_application?.key === "foreigner").length

        const totalFor20 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20).length
        const totalFor20T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF20TAmount = f20Eng + f20Fr

        const totalFor12 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12).length
        const totalFor12T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF12TAmount = f12Eng + f12Fr

        const total20 = this.data.filter(m => m?.urgent_obj?.key === 20).length
        const total20T = this.data.filter(m => (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total20TAmount = aa20Eng + aa20Fr

        const total12 = this.data.filter(m => m?.urgent_obj?.key === 12).length
        const total12T = this.data.filter(m => (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total12TAmount = aa12Eng + aa12Fr

        const totalKhmer = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglish = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrench = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        const totalKhmerMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglishMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrenchMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        this.statistic = {
            total,
            totalF,

            totalS,
            // totalSF,

            totalS20,
            totalS20T,
            totalS20Amount,
            totalS20TAmount,

            totalS12,
            totalS12T,
            totalS12Amount,
            totalS12TAmount,

            totalK,
            // totalKF,
            totalK20,
            totalK20T,
            totalK12,
            totalK12T,

            totalK20Amount,
            totalK20TAmount,

            totalK12Amount,
            totalK12TAmount,

            totalFor,
            // totalForF,

            totalFor20,
            totalFor20T,
            totalFor12,
            totalFor12T,

            totalF20Amount,
            totalF20TAmount,
            totalF12Amount,
            totalF12TAmount,


            total20,
            total20T,
            total20Amount,
            total20TAmount,

            total12,
            total12T,
            total12Amount,
            total12TAmount,

            totalKhmer,
            totalEnglish,
            totalFrench,

            totalKhmerMOL,
            totalEnglishMOL,
            totalFrenchMOL,
            paid_total
        }
    }


    @action
    async fetchWithdrawOnline(queryParams) {
        this.loading = true;
        this.selectedPost = null
        const { fromdate, todate } = queryParams;

        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)

        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)
        const items = await this.ds.criminalRecordRef(ref => ref
            .where('paid_online', '==', true)
            .where('withdraw_location.key', '==', 'local')
            .where("done_at", ">=", dateFilter?.start)
            .where("done_at", "<=", dateFilter?.end)
            .orderBy("done_at")
        ).get().toPromise()

        const { config } = this.auth;
        const departmentKey = config.department_labor?.key

        const forms = pushToArray(items)
        this.data = forms.filter(m => m?.status?.key >= 1)
        const molData = this.data.filter(m => m?.workplace_entry?.key === this.auth?.config?.department_labor?.key)
        const notMolData = this.data.filter(m => m?.workplace_entry?.key !== this.auth?.config?.department_labor?.key)
        this.data = [...notMolData, ...molData]

        const total = this.data.length
        const totalF = this.data.filter(m => m?.gender?.key === 0).length

        const totalS = this.data.filter(m => m?.isStudent).length
        const totalS20 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 20).length
        const totalS20T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS20TAmount = s20Eng + s20Fr

        const totalS12 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 12).length
        const totalS12T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS12TAmount = s12Eng + s12Fr

        const totalK = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner").length

        const totalK20 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20).length
        const totalK20T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK20TAmount = k20Eng + k20Fr

        const totalK12 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12).length
        const totalK12T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK12TAmount = k12Eng + k12Fr

        const totalFor = this.data.filter(m => m?.national_application?.key === "foreigner").length

        const totalFor20 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20).length
        const totalFor20T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF20TAmount = f20Eng + f20Fr

        const totalFor12 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12).length
        const totalFor12T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF12TAmount = f12Eng + f12Fr

        const total20 = this.data.filter(m => m?.urgent_obj?.key === 20).length
        const total20T = this.data.filter(m => (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total20TAmount = aa20Eng + aa20Fr

        const total12 = this.data.filter(m => m?.urgent_obj?.key === 12).length
        const total12T = this.data.filter(m => (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total12TAmount = aa12Eng + aa12Fr

        const totalKhmer = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglish = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrench = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        const totalKhmerMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglishMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrenchMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        this.statistic = {
            total,
            totalF,

            totalS,
            // totalSF,

            totalS20,
            totalS20T,
            totalS20Amount,
            totalS20TAmount,

            totalS12,
            totalS12T,
            totalS12Amount,
            totalS12TAmount,

            totalK,
            // totalKF,
            totalK20,
            totalK20T,
            totalK12,
            totalK12T,

            totalK20Amount,
            totalK20TAmount,

            totalK12Amount,
            totalK12TAmount,

            totalFor,
            // totalForF,

            totalFor20,
            totalFor20T,
            totalFor12,
            totalFor12T,

            totalF20Amount,
            totalF20TAmount,
            totalF12Amount,
            totalF12TAmount,


            total20,
            total20T,
            total20Amount,
            total20TAmount,

            total12,
            total12T,
            total12Amount,
            total12TAmount,

            totalKhmer,
            totalEnglish,
            totalFrench,

            totalKhmerMOL,
            totalEnglishMOL,
            totalFrenchMOL,
        }
    }


    @action
    async fetchPaidOversea(queryParams) {
        this.loading = true;
        this.selectedPost = null
        const { fromdate, todate } = queryParams;

        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)

        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)
        const items = await this.ds.criminalRecordRef(ref => ref
            .where('paid_online', '==', true)
            .where('apply_from.key', '==', 'oversea')
            .where("paid_at", ">=", dateFilter?.start)
            .where("paid_at", "<=", dateFilter?.end)
            .orderBy("paid_at")
        ).get().toPromise()

        const { config } = this.auth;
        const departmentKey = config.department_labor?.key

        this.data = []
        const forms = pushToArray(items)
        const docs = forms.filter(m => m?.status?.key >= 1)
        const groupCountry = groupBy(docs, 'application_country.key')
        groupCountry?.map(m => {
            const countryData = orderBy(docs?.filter(f => f?.application_country?.key === m?.application_country?.key), 'paid_at')
            this.data = this.data.concat(countryData)
        })

        const total = this.data.length
        const totalF = this.data.filter(m => m?.gender?.key === 0).length

        const totalS = this.data.filter(m => m?.isStudent).length
        const totalS20 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 20).length
        const totalS20T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS20TAmount = s20Eng + s20Fr

        const totalS12 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 12).length
        const totalS12T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS12TAmount = s12Eng + s12Fr

        const totalK = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner").length

        const totalK20 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20).length
        const totalK20T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK20TAmount = k20Eng + k20Fr

        const totalK12 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12).length
        const totalK12T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK12TAmount = k12Eng + k12Fr

        const totalFor = this.data.filter(m => m?.national_application?.key === "foreigner").length

        const totalFor20 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20).length
        const totalFor20T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF20TAmount = f20Eng + f20Fr

        const totalFor12 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12).length
        const totalFor12T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF12TAmount = f12Eng + f12Fr

        const total20 = this.data.filter(m => m?.urgent_obj?.key === 20).length
        const total20T = this.data.filter(m => (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total20TAmount = aa20Eng + aa20Fr

        const total12 = this.data.filter(m => m?.urgent_obj?.key === 12).length
        const total12T = this.data.filter(m => (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total12TAmount = aa12Eng + aa12Fr

        const totalKhmer = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglish = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrench = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        const totalKhmerMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglishMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrenchMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        this.statistic = {
            total,
            totalF,

            totalS,
            // totalSF,

            totalS20,
            totalS20T,
            totalS20Amount,
            totalS20TAmount,

            totalS12,
            totalS12T,
            totalS12Amount,
            totalS12TAmount,

            totalK,
            // totalKF,
            totalK20,
            totalK20T,
            totalK12,
            totalK12T,

            totalK20Amount,
            totalK20TAmount,

            totalK12Amount,
            totalK12TAmount,

            totalFor,
            // totalForF,

            totalFor20,
            totalFor20T,
            totalFor12,
            totalFor12T,

            totalF20Amount,
            totalF20TAmount,
            totalF12Amount,
            totalF12TAmount,


            total20,
            total20T,
            total20Amount,
            total20TAmount,

            total12,
            total12T,
            total12Amount,
            total12TAmount,

            totalKhmer,
            totalEnglish,
            totalFrench,

            totalKhmerMOL,
            totalEnglishMOL,
            totalFrenchMOL,
        }
    }

    @action
    async fetchCompleteOversea(queryParams) {
        this.loading = true;
        this.selectedPost = null
        const { fromdate, todate } = queryParams;

        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)

        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)
        const items = await this.ds.criminalRecordRef(ref => ref
            .where('paid_online', '==', true)
            .where('apply_from.key', '==', 'oversea')
            .where("can_received_at", ">=", dateFilter?.start)
            .where("can_received_at", "<=", dateFilter?.end)
            .orderBy("can_received_at")
        ).get().toPromise()

        const { config } = this.auth;
        const departmentKey = config.department_labor?.key

        this.data = []
        const forms = pushToArray(items)
        const docs = forms.filter(m => m?.status?.key >= 1)
        const groupCountry = groupBy(docs, 'application_country.key')
        groupCountry?.map(m => {
            const countryData = orderBy(docs?.filter(f => f?.application_country?.key === m?.application_country?.key), 'can_received_at')
            this.data = this.data.concat(countryData)
        })

        const total = this.data.length
        const totalF = this.data.filter(m => m?.gender?.key === 0).length

        const totalS = this.data.filter(m => m?.isStudent).length
        const totalS20 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 20).length
        const totalS20T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS20TAmount = s20Eng + s20Fr

        const totalS12 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 12).length
        const totalS12T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS12TAmount = s12Eng + s12Fr

        const totalK = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner").length

        const totalK20 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20).length
        const totalK20T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK20TAmount = k20Eng + k20Fr

        const totalK12 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12).length
        const totalK12T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK12TAmount = k12Eng + k12Fr

        const totalFor = this.data.filter(m => m?.national_application?.key === "foreigner").length

        const totalFor20 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20).length
        const totalFor20T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF20TAmount = f20Eng + f20Fr

        const totalFor12 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12).length
        const totalFor12T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF12TAmount = f12Eng + f12Fr

        const total20 = this.data.filter(m => m?.urgent_obj?.key === 20).length
        const total20T = this.data.filter(m => (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total20TAmount = aa20Eng + aa20Fr

        const total12 = this.data.filter(m => m?.urgent_obj?.key === 12).length
        const total12T = this.data.filter(m => (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total12TAmount = aa12Eng + aa12Fr

        const totalKhmer = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglish = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrench = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        const totalKhmerMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglishMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrenchMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        this.statistic = {
            total,
            totalF,

            totalS,
            // totalSF,

            totalS20,
            totalS20T,
            totalS20Amount,
            totalS20TAmount,

            totalS12,
            totalS12T,
            totalS12Amount,
            totalS12TAmount,

            totalK,
            // totalKF,
            totalK20,
            totalK20T,
            totalK12,
            totalK12T,

            totalK20Amount,
            totalK20TAmount,

            totalK12Amount,
            totalK12TAmount,

            totalFor,
            // totalForF,

            totalFor20,
            totalFor20T,
            totalFor12,
            totalFor12T,

            totalF20Amount,
            totalF20TAmount,
            totalF12Amount,
            totalF12TAmount,


            total20,
            total20T,
            total20Amount,
            total20TAmount,

            total12,
            total12T,
            total12Amount,
            total12TAmount,

            totalKhmer,
            totalEnglish,
            totalFrench,

            totalKhmerMOL,
            totalEnglishMOL,
            totalFrenchMOL,
        }
    }

    @action
    async fetchWithdrawOversea(queryParams) {
        this.loading = true;
        this.selectedPost = null
        const { fromdate, todate } = queryParams;

        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)

        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)
        const items = await this.ds.criminalRecordRef(ref => ref
            .where('paid_online', '==', true)
            .where('apply_from.key', '==', 'oversea')
            .where("done_at", ">=", dateFilter?.start)
            .where("done_at", "<=", dateFilter?.end)
            .orderBy("done_at")
        ).get().toPromise()

        const { config } = this.auth;
        const departmentKey = config.department_labor?.key

        this.data = []
        const forms = pushToArray(items)
        const docs = forms.filter(m => m?.status?.key >= 1)
        const groupCountry = groupBy(docs, 'application_country.key')
        groupCountry?.map(m => {
            const countryData = orderBy(docs?.filter(f => f?.application_country?.key === m?.application_country?.key), 'done_at')
            this.data = this.data.concat(countryData)
        })

        const total = this.data.length
        const totalF = this.data.filter(m => m?.gender?.key === 0).length

        const totalS = this.data.filter(m => m?.isStudent).length
        const totalS20 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 20).length
        const totalS20T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS20TAmount = s20Eng + s20Fr

        const totalS12 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 12).length
        const totalS12T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS12TAmount = s12Eng + s12Fr

        const totalK = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner").length

        const totalK20 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20).length
        const totalK20T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK20TAmount = k20Eng + k20Fr

        const totalK12 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12).length
        const totalK12T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK12TAmount = k12Eng + k12Fr

        const totalFor = this.data.filter(m => m?.national_application?.key === "foreigner").length

        const totalFor20 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20).length
        const totalFor20T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF20TAmount = f20Eng + f20Fr

        const totalFor12 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12).length
        const totalFor12T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF12TAmount = f12Eng + f12Fr

        const total20 = this.data.filter(m => m?.urgent_obj?.key === 20).length
        const total20T = this.data.filter(m => (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total20TAmount = aa20Eng + aa20Fr

        const total12 = this.data.filter(m => m?.urgent_obj?.key === 12).length
        const total12T = this.data.filter(m => (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total12TAmount = aa12Eng + aa12Fr

        const totalKhmer = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglish = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrench = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        const totalKhmerMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglishMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrenchMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        this.statistic = {
            total,
            totalF,

            totalS,
            // totalSF,

            totalS20,
            totalS20T,
            totalS20Amount,
            totalS20TAmount,

            totalS12,
            totalS12T,
            totalS12Amount,
            totalS12TAmount,

            totalK,
            // totalKF,
            totalK20,
            totalK20T,
            totalK12,
            totalK12T,

            totalK20Amount,
            totalK20TAmount,

            totalK12Amount,
            totalK12TAmount,

            totalFor,
            // totalForF,

            totalFor20,
            totalFor20T,
            totalFor12,
            totalFor12T,

            totalF20Amount,
            totalF20TAmount,
            totalF12Amount,
            totalF12TAmount,


            total20,
            total20T,
            total20Amount,
            total20TAmount,

            total12,
            total12T,
            total12Amount,
            total12TAmount,

            totalKhmer,
            totalEnglish,
            totalFrench,

            totalKhmerMOL,
            totalEnglishMOL,
            totalFrenchMOL,
        }
    }


    @action
    async fetchApplyOnlinePaid(queryParams) {
        this.loading = true;
        this.selectedPost = null
        const { fromdate, todate } = queryParams;

        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)

        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)
        const items = await this.ds.criminalRecordRef(ref => ref
            .where('apply', '==', true)
            .where("paid_at", ">=", dateFilter?.start)
            .where("paid_at", "<=", dateFilter?.end)
            .orderBy("paid_at")
        ).get().toPromise()

        const { config } = this.auth;
        const departmentKey = config.department_labor?.key

        const forms = pushToArray(items)?.filter(f => f?.paid_online !== true)
        this.data = orderBy(forms.filter(m => m?.status?.key >= 1), 'issued_at')
        const data20 = this.data?.filter(f => f?.urgent_obj?.key === 20)
        const data12 = this.data?.filter(f => f?.urgent_obj?.key === 12)
        this.data = [...data20, ...data12]

        const total = this.data.length
        const totalF = this.data.filter(m => m?.gender?.key === 0).length

        const totalS = this.data.filter(m => m?.isStudent).length

        const totalS20 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 20).length
        const totalS20T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS20TAmount = s20Eng + s20Fr

        const totalS12 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 12).length
        const totalS12T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS12TAmount = s12Eng + s12Fr

        const totalK = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner").length

        const totalK20 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20).length
        const totalK20T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK20TAmount = k20Eng + k20Fr

        const totalK12 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12).length
        const totalK12T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK12TAmount = k12Eng + k12Fr

        const totalFor = this.data.filter(m => m?.national_application?.key === "foreigner").length

        const totalFor20 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20).length
        const totalFor20T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF20TAmount = f20Eng + f20Fr

        const totalFor12 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12).length
        const totalFor12T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF12TAmount = f12Eng + f12Fr

        const totalOnline = this.data.filter(m => m?.apply).length

        const totalOnline20 = this.data.filter(m => m?.apply && m?.urgent_obj?.key === 20).length
        const totalOnline20T = this.data.filter(m => m?.apply && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalO20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const O20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const O20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalO20TAmount = O20Eng + O20Fr

        const totalOnline12 = this.data.filter(m => m?.apply && m?.urgent_obj?.key === 12).length
        const totalOnline12T = this.data.filter(m => m?.apply && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalO12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const O12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const O12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalO12TAmount = O12Eng + O12Fr

        const totalDirectApply = this.data.filter(m => !m?.apply && (m?.workplace_entry?.key !== departmentKey)).length

        const totalDirectApply20 = this.data.filter(m => !m?.apply && m?.urgent_obj?.key === 20).length
        const totalDirectApply20T = this.data.filter(m => !m?.apply && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalDirectApply12 = this.data.filter(m => !m?.apply && m?.urgent_obj?.key === 12).length
        const totalDirectApply12T = this.data.filter(m => !m?.apply && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalD20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const D20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const D20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalD20TAmount = D20Eng + D20Fr
        const totalD12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const D12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const D12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalD12TAmount = D12Eng + D12Fr

        const total20 = this.data.filter(m => m?.urgent_obj?.key === 20).length
        const total20T = this.data.filter(m => (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total20TAmount = aa20Eng + aa20Fr

        const total12 = this.data.filter(m => m?.urgent_obj?.key === 12).length
        const total12T = this.data.filter(m => (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total12TAmount = aa12Eng + aa12Fr

        const totalKhmer = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglish = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrench = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        const totalMOL = this.data?.filter(f => f?.workplace_entry?.key === departmentKey).length
        const totalMOL_F = this.data?.filter(f => (f?.workplace_entry?.key === departmentKey && f?.gender?.key === 0)).length

        const totalMOL_20 = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20)).length
        const totalMOL_20T = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalM20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const M20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const M20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalM20TAmount = M20Eng + M20Fr

        const totalMOL_12 = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12)).length
        const totalMOL_12T = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalM12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const M12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const M12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalM12TAmount = M12Eng + M12Fr

        const totalKhmerMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglishMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrenchMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        this.statistic = {
            total,
            totalF,

            totalS,
            // totalSF,

            totalS20,
            totalS20T,
            totalS20Amount,
            totalS20TAmount,

            totalS12,
            totalS12T,
            totalS12Amount,
            totalS12TAmount,

            totalK,
            // totalKF,
            totalK20,
            totalK20T,
            totalK12,
            totalK12T,

            totalK20Amount,
            totalK20TAmount,

            totalK12Amount,
            totalK12TAmount,

            totalFor,
            // totalForF,

            totalFor20,
            totalFor20T,
            totalFor12,
            totalFor12T,

            totalF20Amount,
            totalF20TAmount,
            totalF12Amount,
            totalF12TAmount,

            totalOnline,
            // totalOnlineF,

            totalOnline20,
            totalOnline20T,
            totalOnline12,
            totalOnline12T,

            totalO20Amount,
            totalO20TAmount,
            totalO12Amount,
            totalO12TAmount,

            totalDirectApply,
            // totalDirectApplyF,

            totalDirectApply20,
            totalDirectApply20T,
            totalDirectApply12,
            totalDirectApply12T,

            totalD20Amount,
            totalD20TAmount,
            totalD12Amount,
            totalD12TAmount,

            total20,
            total20T,
            total20Amount,
            total20TAmount,

            total12,
            total12T,
            total12Amount,
            total12TAmount,

            totalKhmer,
            totalEnglish,
            totalFrench,

            totalMOL,
            totalMOL_F,

            totalKhmerMOL,
            totalEnglishMOL,
            totalFrenchMOL,

            totalMOL_20,
            totalMOL_20T,

            totalMOL_12,
            totalMOL_12T,

            totalM20Amount,
            totalM20TAmount,

            totalM12Amount,
            totalM12TAmount,
        }
    }

    @action
    async fetchDoExpire(queryParams) {
        this.loading = true;
        this.selectedPost = null
        const { fromdate, todate } = queryParams;

        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)
        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)
        const items = await this.ds.criminalRecordRef(ref => ref
            .where("do_expire_at", ">=", dateFilter?.start)
            .where("do_expire_at", "<=", dateFilter?.end)
            .orderBy("do_expire_at")
        ).get().toPromise()

        const { config } = this.auth;
        const departmentKey = config.department_labor?.key

        const forms = pushToArray(items)
        this.data = forms.filter(m => m?.status?.key >= 1)
        const molData = this.data.filter(m => m?.workplace_entry?.key === this.auth?.config?.department_labor?.key)
        const notMolData = this.data.filter(m => m?.workplace_entry?.key !== this.auth?.config?.department_labor?.key)
        this.data = [...notMolData, ...molData]

        const total = this.data.length
        const totalF = this.data.filter(m => m?.gender?.key === 0).length

        const totalS = this.data.filter(m => m?.isStudent).length
        const totalS20 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 20).length
        const totalS20T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS20TAmount = s20Eng + s20Fr

        const totalS12 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 12).length
        const totalS12T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS12TAmount = s12Eng + s12Fr

        const totalK = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner").length

        const totalK20 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20).length
        const totalK20T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK20TAmount = k20Eng + k20Fr

        const totalK12 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12).length
        const totalK12T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK12TAmount = k12Eng + k12Fr

        const totalFor = this.data.filter(m => m?.national_application?.key === "foreigner").length

        const totalFor20 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20).length
        const totalFor20T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF20TAmount = f20Eng + f20Fr

        const totalFor12 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12).length
        const totalFor12T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF12TAmount = f12Eng + f12Fr

        const total20 = this.data.filter(m => m?.urgent_obj?.key === 20).length
        const total20T = this.data.filter(m => (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total20TAmount = aa20Eng + aa20Fr

        const total12 = this.data.filter(m => m?.urgent_obj?.key === 12).length
        const total12T = this.data.filter(m => (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total12TAmount = aa12Eng + aa12Fr

        const totalKhmer = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglish = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrench = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        const totalKhmerMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglishMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrenchMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        this.statistic = {
            total,
            totalF,

            totalS,
            // totalSF,

            totalS20,
            totalS20T,
            totalS20Amount,
            totalS20TAmount,

            totalS12,
            totalS12T,
            totalS12Amount,
            totalS12TAmount,

            totalK,
            // totalKF,
            totalK20,
            totalK20T,
            totalK12,
            totalK12T,

            totalK20Amount,
            totalK20TAmount,

            totalK12Amount,
            totalK12TAmount,

            totalFor,
            // totalForF,

            totalFor20,
            totalFor20T,
            totalFor12,
            totalFor12T,

            totalF20Amount,
            totalF20TAmount,
            totalF12Amount,
            totalF12TAmount,


            total20,
            total20T,
            total20Amount,
            total20TAmount,

            total12,
            total12T,
            total12Amount,
            total12TAmount,

            totalKhmer,
            totalEnglish,
            totalFrench,

            totalKhmerMOL,
            totalEnglishMOL,
            totalFrenchMOL,
        }
    }

    @action
    async getDocHasExpireAt(dateObject) {
        this.loading = true;
        const items = await this.ds.criminalRecordRef(ref => ref
            .where("do_expire_at", ">=", dateObject?.fromDate)
            .orderBy("do_expire_at").limit(100)
        ).get().toPromise();
        return pushToArray(items);
    }

    async getDocumentVerifyFromDate(dateObject){
        const items = await this.ds.documentVerifyRef(ref => ref
            .where("verify_expire_at", ">=", dateObject?.fromDate)
            .where("verify_expire_at", "<=", dateObject?.toDate)
            .orderBy("verify_expire_at")
        ).get().toPromise();
        return pushToArray(items);
    }

    @action
    async getDocumentVerifyInKey(keys: string[]){
        const items = await this.criminalService.criminalDocumentVerify(ref=>ref.where('criminal_header_key','in',keys)).get().toPromise();
        return pushToArray(items);
    }

    @action
    async getMolPaidReport(queryParams) {
        this.loading = true;
        this.selectedPost = null
        const { fromdate, todate } = queryParams;

        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)

        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)
        const items = await this.ds.criminalRecordRef(ref => ref
            .where("paid_at", ">=", dateFilter?.start)
            .where("paid_at", "<=", dateFilter?.end)
            .where("workplace_entry.key", '==', this.auth?.config?.department_labor?.key)
            .orderBy("paid_at")
        ).get().toPromise()

        const { config } = this.auth;
        const departmentKey = config.department_labor?.key

        const forms = pushToArray(items)?.filter(f => f?.paid_online !== true)
        this.data = [...forms]

        const total = this.data.length
        const totalF = this.data.filter(m => m?.gender?.key === 0).length

        const totalS = this.data.filter(m => m?.isStudent).length
        const totalS20 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 20).length
        const totalS20T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS20TAmount = s20Eng + s20Fr

        const totalS12 = this.data.filter(m => m?.isStudent && m?.urgent_obj?.key === 12).length
        const totalS12T = this.data.filter(m => m?.isStudent && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalS12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const s12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const s12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.isStudent && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalS12TAmount = s12Eng + s12Fr

        const totalK = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner").length

        const totalK20 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20).length
        const totalK20T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK20TAmount = k20Eng + k20Fr

        const totalK12 = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12).length
        const totalK12T = this.data.filter(m => !m?.isStudent && m?.national_application?.key !== "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalK12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const k12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const k12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalK12TAmount = k12Eng + k12Fr

        const totalFor = this.data.filter(m => m?.national_application?.key === "foreigner").length

        const totalFor20 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20).length
        const totalFor20T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF20TAmount = f20Eng + f20Fr

        const totalFor12 = this.data.filter(m => m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12).length
        const totalFor12T = this.data.filter(m => m?.national_application?.key === "foreigner" && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalF12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const f12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const f12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalF12TAmount = f12Eng + f12Fr

        const totalOnline = this.data.filter(m => m?.apply).length

        const totalOnline20 = this.data.filter(m => m?.apply && m?.urgent_obj?.key === 20).length
        const totalOnline20T = this.data.filter(m => m?.apply && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalO20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const O20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const O20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalO20TAmount = O20Eng + O20Fr

        const totalOnline12 = this.data.filter(m => m?.apply && m?.urgent_obj?.key === 12).length
        const totalOnline12T = this.data.filter(m => m?.apply && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalO12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const O12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const O12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalO12TAmount = O12Eng + O12Fr

        const totalOnlineEpay = this.data.filter(m => m?.paid_online).length

        const totalOnlineEpay20 = this.data.filter(m => m?.paid_online && m?.urgent_obj?.key === 20).length
        const totalOnlineEpay20T = this.data.filter(m => m?.paid_online && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalEpay20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.paid_online && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const Epay20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.paid_online && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const Epay20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.paid_online && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalEpay20TAmount = Epay20Eng + Epay20Fr

        const totalOnlineEpay12 = this.data.filter(m => m?.paid_online && m?.urgent_obj?.key === 12).length
        const totalOnlineEpay12T = this.data.filter(m => m?.paid_online && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalEpay12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.paid_online && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const Epay12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.paid_online && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const Epay12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.paid_online && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalEpay12TAmount = Epay12Eng + Epay12Fr

        const totalDirectApply = this.data.filter(m => !m?.apply && (m?.workplace_entry?.key !== departmentKey)).length

        const totalDirectApply20 = this.data.filter(m => !m?.apply && m?.urgent_obj?.key === 20).length
        const totalDirectApply20T = this.data.filter(m => !m?.apply && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalDirectApply12 = this.data.filter(m => !m?.apply && m?.urgent_obj?.key === 12).length
        const totalDirectApply12T = this.data.filter(m => !m?.apply && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length

        const totalD20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const D20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const D20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.apply && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalD20TAmount = D20Eng + D20Fr
        const totalD12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && !m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const D12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && !m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const D12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && !m?.apply && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalD12TAmount = D12Eng + D12Fr

        const total20 = this.data.filter(m => m?.urgent_obj?.key === 20).length
        const total20T = this.data.filter(m => (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 20)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total20TAmount = aa20Eng + aa20Fr

        const total12 = this.data.filter(m => m?.urgent_obj?.key === 12).length
        const total12T = this.data.filter(m => (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const total12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const aa12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const aa12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && m?.urgent_obj?.key === 12)?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const total12TAmount = aa12Eng + aa12Fr

        const totalKhmer = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglish = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrench = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2))))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')

        const totalMOL = this.data?.filter(f => f?.workplace_entry?.key === departmentKey).length
        const totalMOL_F = this.data?.filter(f => (f?.workplace_entry?.key === departmentKey && f?.gender?.key === 0)).length

        const totalMOL_20 = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20)).length
        const totalMOL_20T = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalM20Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const M20Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const M20Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 20))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalM20TAmount = M20Eng + M20Fr

        const totalMOL_12 = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12)).length
        const totalMOL_12T = this.data.filter(m => (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12) && (m.criminal_language?.find(m => m?.key === 2 || m?.key === 3))).length
        const totalM12Amount = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 1)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const M12Fr = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 2)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
        const M12Eng = sum((this.data.filter(m => (m?.criminal_language?.find(m => m?.key === 3)) && (m?.workplace_entry?.key === departmentKey) && (m?.urgent_obj?.key === 12))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalM12TAmount = M12Eng + M12Fr

        const totalKhmerMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
        const totalEnglishMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 3)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
        const totalFrenchMOL = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 2)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')




        this.statistic = {
            total,
            totalF,

            totalS,
            // totalSF,

            totalS20,
            totalS20T,
            totalS20Amount,
            totalS20TAmount,

            totalS12,
            totalS12T,
            totalS12Amount,
            totalS12TAmount,

            totalK,
            // totalKF,
            totalK20,
            totalK20T,
            totalK12,
            totalK12T,

            totalK20Amount,
            totalK20TAmount,

            totalK12Amount,
            totalK12TAmount,

            totalFor,
            // totalForF,

            totalFor20,
            totalFor20T,
            totalFor12,
            totalFor12T,

            totalF20Amount,
            totalF20TAmount,
            totalF12Amount,
            totalF12TAmount,

            totalOnline,
            // totalOnlineF,

            totalOnline20,
            totalOnline20T,
            totalOnline12,
            totalOnline12T,

            totalO20Amount,
            totalO20TAmount,
            totalO12Amount,
            totalO12TAmount,

            totalOnlineEpay,

            totalOnlineEpay20,
            totalOnlineEpay20T,
            totalOnlineEpay12,
            totalOnlineEpay12T,

            totalEpay20Amount,
            totalEpay20TAmount,
            totalEpay12Amount,
            totalEpay12TAmount,


            totalDirectApply,
            // totalDirectApplyF,

            totalDirectApply20,
            totalDirectApply20T,
            totalDirectApply12,
            totalDirectApply12T,

            totalD20Amount,
            totalD20TAmount,
            totalD12Amount,
            totalD12TAmount,

            total20,
            total20T,
            total20Amount,
            total20TAmount,

            total12,
            total12T,
            total12Amount,
            total12TAmount,

            totalKhmer,
            totalEnglish,
            totalFrench,

            totalMOL,
            totalMOL_F,

            totalKhmerMOL,
            totalEnglishMOL,
            totalFrenchMOL,

            totalMOL_20,
            totalMOL_20T,

            totalMOL_12,
            totalMOL_12T,

            totalM20Amount,
            totalM20TAmount,

            totalM12Amount,
            totalM12TAmount,
        }
    }


    @action
    async fetchReportProcessedDoc(queryParams) {
        this.loading = true;
        this.selectedPost = null
        const { fromdate, todate } = queryParams;
        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey()
        this.toDateNum = todate ? todate : ConvertService.dateKey()
        this.getPeriod(this.fromDateNum, this.toDateNum)
        const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate)

        const paidOnlineProcessRef = await this.ds.criminalRecordRef(ref => ref
            .where('paid_online', '==', true)
            .where("start_process_at", ">=", dateFilter?.start)
            .where("start_process_at", "<=", dateFilter?.end)
            .orderBy("start_process_at")
        ).get().toPromise()

        return pushToArray(paidOnlineProcessRef)
    }

}
