import { observable, action } from "mobx";
import { Injectable } from "@angular/core";
import { ConvertService, toKhMonth, toKhYear, pushToArray, getStartAndEndOfDayFromAndToDate, orderBy, orderByData, sum, getStartEndPeroidWithHours, addDay } from 'src/app/shared/services/convert.service';
import { DataService } from "../shared/services/data.service";
import { AuthStore } from "./auth.store";

@Injectable({ providedIn: "root" })
export class ReportPaidMonthly {
    @observable public loading = false;

    @observable public fromDate: any = null;
    @observable public toDate: any = null;
    @observable public fromDateKey: any = null;
    @observable public toDateKey: any = null;
    @observable public periodText: string = null;

    @observable public periodType: number = 1;

    @observable public fromDateNum = null;
    @observable public toDateNum = null;

    @observable public selectedPost = null;
    @observable public selectedTravel = null;

    @observable public data: any = [];
    @observable public statistic = null;

    pollingController = new AbortController();
    pollingCancelQueryController = new AbortController();

    constructor(
        private ds: DataService,
        private auth: AuthStore,
    ) { }

    getPeriod(fromDate){
        this.fromDate = ConvertService.numberToDate(fromDate);
        this.periodText = `ខែ${toKhMonth(this.fromDate)} ឆ្នាំ${toKhYear(this.fromDate)}`
    }

    @action
    async fetchData(queryParams,paymentOptions) {
        this.loading = true;
        this.selectedPost = null;
        const { fromdate, todate } = queryParams;

        this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey();
        this.getPeriod(this.fromDateNum);

        if (this.processingGetPaidAtData || this.processingGetDataStartProcess) {
            this.breakRecursive = true;
            await this.pollingQueryState(this.pollingCancelQueryController.signal);
        }

        this.breakRecursive = false;

        this.paidAtData = [];
        this.startProcessData = [];
        this.data = [];
        this.statistic = null;

        this.processingGetPaidAtData = true;
        this.processingGetDataStartProcess = true;

        this.getPaidAtData();

        const res = await this.pollingQueryState(this.pollingController.signal);

        if (res) {

            const { config } = this.auth;
            const departmentKey = config.department_labor?.key

            const forms = this.paidAtData?.filter(f => f?.paid_online !== true)
            this.data = orderBy(forms.filter(m => m?.status?.key >= 1), 'issued_at')
            const molData = this.data.filter(m => m?.workplace_entry?.key === this.auth?.config?.department_labor?.key)
            const notMolData = this.data.filter(m => m?.workplace_entry?.key !== this.auth?.config?.department_labor?.key)
            const paidOnlineProcess = this.startProcessData;
            this.data = [...notMolData, ...molData, ...paidOnlineProcess]

            const offlineNormal20 = this.data.filter(m => {
                if(!m?.apply && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20){
                    return true;
                }
            })
            const offlineNormal20Amount = sum((offlineNormal20?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const offlineNormal20Fr = sum((offlineNormal20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const offlineNormal20En = sum((offlineNormal20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const offlineNormal20AmountT = offlineNormal20Fr + offlineNormal20En;

            const offlineNormal12 = this.data.filter(m => {
                if(!m?.apply && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12){
                    return true;
                }
            })
            const offlineNormal12Amount = sum((offlineNormal12?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const offlineNormal12Fr = sum((offlineNormal12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const offlineNormal12En = sum((offlineNormal12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const offlineNormal12AmountT = offlineNormal12Fr + offlineNormal12En;


            const offlineForeigner20 = this.data.filter(m => {
                if(!m?.apply && !m?.isStudent && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20){
                    return true;
                }
            })
            const offlineForeigner20Amount = sum((offlineForeigner20?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const offlineForeigner20Fr = sum((offlineForeigner20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const offlineForeigner20En = sum((offlineForeigner20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const offlineForeigner20AmountT = offlineForeigner20Fr + offlineForeigner20En;


            const offlineForeigner12 = this.data.filter(m => {
                if(!m?.apply && !m?.isStudent && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12){
                    return true;
                }
            })
            const offlineForeigner12Amount = sum((offlineForeigner12?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const offlineForeigner12Fr = sum((offlineForeigner12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const offlineForeigner12En = sum((offlineForeigner12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const offlineForeigner12AmountT = offlineForeigner12Fr + offlineForeigner12En;

            const offlineStudent20 = this.data.filter(m => {
                if(!m?.apply && !m?.isStudent && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20){
                    return true;
                }
            })
            const offlineStudent20Amount = sum((offlineStudent20?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const offlineStudent20Fr = sum((offlineStudent20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const offlineStudent20En = sum((offlineStudent20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const offlineStudent20AmountT = offlineStudent20Fr + offlineStudent20En;


            const offlineStudent12 = this.data.filter(m => {
                if(!m?.apply && !m?.isStudent && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12){
                    return true;
                }
            })
            const offlineStudent12Amount = sum((offlineStudent12?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const offlineStudent12Fr = sum((offlineStudent12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const offlineStudent12En = sum((offlineStudent12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const offlineStudent12AmountT = offlineStudent12Fr + offlineStudent12En;

            const onlineNormal20 = this.data.filter(m => {
                if(m?.apply && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20){
                    return true;
                }
            })
            const onlineNormal20Amount = sum((onlineNormal20?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const onlineNormal20Fr = sum((onlineNormal20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const onlineNormal20En = sum((onlineNormal20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const onlineNormal20AmountT = onlineNormal20Fr + onlineNormal20En;

            const onlineNormal12 = this.data.filter(m => {
                if(m?.apply && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12){
                    return true;
                }
            })
            const onlineNormal12Amount = sum((onlineNormal12?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const onlineNormal12Fr = sum((onlineNormal12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const onlineNormal12En = sum((onlineNormal12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const onlineNormal12AmountT = onlineNormal12Fr + onlineNormal12En;
            

            const onlineForeigner20 = this.data.filter(m => {
                if(m?.apply && !m?.isStudent && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20){
                    return true;
                }
            })
            const onlineForeigner20Amount = sum((onlineForeigner20?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const onlineForeigner20Fr = sum((onlineForeigner20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const onlineForeigner20En = sum((onlineForeigner20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const onlineForeigner20AmountT = onlineForeigner20Fr + onlineForeigner20En;


            const onlineForeigner12 = this.data.filter(m => {
                if(m?.apply && !m?.isStudent && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12){
                    return true;
                }
            })
            const onlineForeigner12Amount = sum((onlineForeigner12?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const onlineForeigner12Fr = sum((onlineForeigner12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const onlineForeigner12En = sum((onlineForeigner12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const onlineForeigner12AmountT = onlineForeigner12Fr + onlineForeigner12En;
            

            const epaymentNormal20 = this.data.filter(m => {
                if(m?.paid_online && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 20){
                    return true;
                }
            })
            const epaymentNormal20Amount = sum((epaymentNormal20?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const epaymentNormal20Fr = sum((epaymentNormal20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const epaymentNormal20En = sum((epaymentNormal20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const epaymentNormal20AmountT = epaymentNormal20Fr + epaymentNormal20En;


            const epaymentNormal12 = this.data.filter(m => {
                if(m?.paid_online && !m?.isStudent && m?.national_application?.key !== "foreigner" && m?.urgent_obj?.key === 12){
                    return true;
                }
            })
            const epaymentNormal12Amount = sum((epaymentNormal12?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const epaymentNormal12Fr = sum((epaymentNormal12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const epaymentNormal12En = sum((epaymentNormal12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const epaymentNormal12AmountT = epaymentNormal12Fr + epaymentNormal12En;


            const epaymentForeigner20 = this.data.filter(m => {
                if(m?.paid_online && !m?.isStudent && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 20){
                    return true;
                }
            })
            const epaymentForeigner20Amount = sum((epaymentForeigner20?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const epaymentForeigner20Fr = sum((epaymentForeigner20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const epaymentForeigner20En = sum((epaymentForeigner20?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const epaymentForeigner20AmountT = epaymentForeigner20Fr + epaymentForeigner20En;


            const epaymentForeigner12 = this.data.filter(m => {
                if(m?.paid_online && !m?.isStudent && m?.national_application?.key === "foreigner" && m?.urgent_obj?.key === 12){
                    return true;
                }
            })
            const epaymentForeigner12Amount = sum((epaymentForeigner12?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')
            const epaymentForeigner12Fr = sum((epaymentForeigner12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 2))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 2)), 'amount')
            const epaymentForeigner12En = sum((epaymentForeigner12?.filter(f=>f?.criminal_language?.find(m=> m?.key === 3))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 3)), 'amount')
            const epaymentForeigner12AmountT = epaymentForeigner12Fr + epaymentForeigner12En;
            const molAmount = sum(((this.data.filter(m => (m.criminal_language?.find(m => m?.key === 1)) && m?.workplace_entry?.key === departmentKey))?.map(m => m?.criminal_language))?.map(m => m?.find(m => m?.key === 1)), 'amount')

            let khmerStudent12 = null;
            let khmerStudent20 = null;
            let khmerNormal12 = null;
            let khmerNormal20 = null;
            let foreigner12 = null;
            let foreigner20 = null;


            paymentOptions.map(m=>{
                if(m?.isStudent && m?.nationality?.key !== "foreigner" && m?.duration?.key == 12){
                    khmerStudent12 = m;
                }
                else if(m?.isStudent && m?.nationality?.key !== "foreigner" && m?.duration?.key == 20){
                    khmerStudent20 = m;
                }
                else if(!m?.isStudent && m?.nationality?.key !== "foreigner" && m?.duration?.key == 12){
                    khmerNormal12 = m;
                }
                else if(!m?.isStudent && m?.nationality?.key !== "foreigner" && m?.duration?.key == 20){
                    khmerNormal20 = m;
                }
                else if(!m?.isStudent && m?.nationality?.key === "foreigner" && m?.duration?.key == 12){
                    foreigner12 = m;
                }
                else if(!m?.isStudent && m?.nationality?.key === "foreigner" && m?.duration?.key == 20){
                    foreigner20 = m;
                }
            })


            let total_offlineNormal20Amount = offlineNormal20Amount * khmerNormal20?.khmer_price
            let total_offlineNormal20AmountT = offlineNormal20AmountT * khmerNormal20?.english_price

            let total_offlineNormal12Amount = offlineNormal12Amount * khmerNormal12?.khmer_price
            let total_offlineNormal12AmountT = offlineNormal12AmountT * khmerNormal12?.english_price

            let total_offlineForeigner20Amount = offlineForeigner20Amount * foreigner20?.khmer_price
            let total_offlineForeigner20AmountT = offlineForeigner20AmountT * foreigner20?.english_price

            let total_offlineForeigner12Amount = offlineForeigner12Amount * foreigner12?.khmer_price
            let total_offlineForeigner12AmountT = offlineForeigner12AmountT * foreigner12?.english_price

            let total_offlineStudent20Amount = offlineStudent20Amount * khmerStudent20?.khmer_price
            let total_offlineStudent20AmountT = offlineStudent20AmountT * khmerStudent20?.english_price

            let total_offlineStudent12Amount = offlineStudent12Amount * khmerStudent12?.khmer_price
            let total_offlineStudent12AmountT = offlineStudent12AmountT * khmerStudent12?.english_price

            let total_onlineNormal20Amount = onlineNormal20Amount * khmerNormal20?.khmer_price
            let total_onlineNormal20AmountT = onlineNormal20AmountT * khmerNormal20?.english_price

            let total_onlineNormal12Amount = onlineNormal12Amount * khmerNormal12?.khmer_price
            let total_onlineNormal12AmountT = onlineNormal12AmountT * khmerNormal12?.english_price

            let total_onlineForeigner20Amount = onlineForeigner20Amount * foreigner20?.khmer_price
            let total_onlineForeigner20AmountT = onlineForeigner20AmountT * foreigner20?.english_price

            let total_onlineForeigner12Amount = onlineForeigner12Amount * foreigner12?.khmer_price
            let total_onlineForeigner12AmountT = onlineForeigner12AmountT * foreigner12?.english_price

            let total_epaymentNormal20Amount = epaymentNormal20Amount * khmerNormal20?.khmer_price
            let total_epaymentNormal20AmountT = epaymentNormal20AmountT * khmerNormal20?.english_price

            let total_epaymentNormal12Amount = epaymentNormal12Amount * khmerNormal12?.khmer_price
            let total_epaymentNormal12AmountT = epaymentNormal12AmountT * khmerNormal12?.english_price

            let total_epaymentForeigner20Amount = epaymentForeigner20Amount * foreigner20?.khmer_price
            let total_epaymentForeigner20AmountT = epaymentForeigner20AmountT * foreigner20?.english_price

            let total_epaymentForeigner12Amount = epaymentForeigner12Amount  * foreigner12?.khmer_price
            let total_epaymentForeigner12AmountT = epaymentForeigner12AmountT  * foreigner12?.english_price

            let total_offline = 
                total_offlineNormal20Amount +
                total_offlineNormal20AmountT +

                total_offlineNormal12Amount +
                total_offlineNormal12AmountT +

                total_offlineForeigner20Amount +
                total_offlineForeigner20AmountT +

                total_offlineForeigner12Amount +
                total_offlineForeigner12AmountT +

                total_offlineStudent20Amount +
                total_offlineStudent20AmountT +

                total_offlineStudent12Amount +
                total_offlineStudent12AmountT;

            let total_online = 
                total_onlineNormal20Amount +
                total_onlineNormal20AmountT +

                total_onlineNormal12Amount +
                total_onlineNormal12AmountT +

                total_onlineForeigner20Amount +
                total_onlineForeigner20AmountT +

                total_onlineForeigner12Amount +
                total_onlineForeigner12AmountT;


            this.statistic = {
                offlineNormal20Amount,
                offlineNormal20AmountT,

                offlineNormal12Amount,
                offlineNormal12AmountT,

                offlineForeigner20Amount,
                offlineForeigner20AmountT,

                offlineForeigner12Amount,
                offlineForeigner12AmountT,

                offlineStudent20Amount,
                offlineStudent20AmountT,

                offlineStudent12Amount,
                offlineStudent12AmountT,

                onlineNormal20Amount,
                onlineNormal20AmountT,

                onlineNormal12Amount,
                onlineNormal12AmountT,

                onlineForeigner20Amount,
                onlineForeigner20AmountT,

                onlineForeigner12Amount,
                onlineForeigner12AmountT,

                epaymentNormal20Amount,
                epaymentNormal20AmountT,

                epaymentNormal12Amount,
                epaymentNormal12AmountT,

                epaymentForeigner20Amount,
                epaymentForeigner20AmountT,

                epaymentForeigner12Amount,
                epaymentForeigner12AmountT,

                molAmount,

                total_offlineNormal20Amount,
                total_offlineNormal20AmountT,

                total_offlineNormal12Amount,
                total_offlineNormal12AmountT,

                total_offlineForeigner20Amount,
                total_offlineForeigner20AmountT,

                total_offlineForeigner12Amount,
                total_offlineForeigner12AmountT,

                total_offlineStudent20Amount,
                total_offlineStudent20AmountT,

                total_offlineStudent12Amount,
                total_offlineStudent12AmountT,

                total_onlineNormal20Amount,
                total_onlineNormal20AmountT,

                total_onlineNormal12Amount,
                total_onlineNormal12AmountT,

                total_onlineForeigner20Amount,
                total_onlineForeigner20AmountT,

                total_onlineForeigner12Amount,
                total_onlineForeigner12AmountT,

                total_epaymentNormal20Amount,
                total_epaymentNormal20AmountT,

                total_epaymentNormal12Amount,
                total_epaymentNormal12AmountT,

                total_epaymentForeigner20Amount,
                total_epaymentForeigner20AmountT,

                total_epaymentForeigner12Amount,
                total_epaymentForeigner12AmountT,

                total_offline,
                total_online
            }
        }

        this.paidAtData = [];
        this.startProcessData = [];
        this.data = [];

        this.loading = false;
    }

    breakRecursive: boolean = false;
    paidAtData: any = [];
    processingGetPaidAtData: boolean = false;
    async getPaidAtData(lastRow?: any) {

        if (this.breakRecursive) {
            this.processingGetPaidAtData = false;
            this.processingGetDataStartProcess = false;
            return;
        }
        this.processingGetPaidAtData = true;
        this.processingGetDataStartProcess = true;

        const {start,end} = this.getStartAndEndOfTheMonth(this.fromDateNum)

        const queryRef = this.ds.criminalRecordRef((ref) => {
            let condition = ref
                .where("paid_at", ">=", start)
                .where("paid_at", "<=", end)
                .orderBy("paid_at")
            if (lastRow) {
                condition = condition.startAfter(lastRow?.paid_at)
            }
            return condition.limit(500)
        })

        let data = pushToArray(await queryRef.get().toPromise()) || []


        this.paidAtData = this.paidAtData.concat(data)
        if (data?.length == 500) {
            setTimeout(() => {
                this.getPaidAtData(data[data?.length - 1]);
            }, 1000)
        } else {
            this.getDataStartProcess();
            this.processingGetPaidAtData = false;
        }
    }

    startProcessData: any = [];
    processingGetDataStartProcess: boolean = false;
    async getDataStartProcess(lastRow?: any) {

        if (this.breakRecursive) {
            this.processingGetDataStartProcess = false;
            return;
        }

        this.processingGetDataStartProcess = true;
        const { start, end} = this.getStartAndEndOfTheMonth(this.fromDateNum)

        const queryRef = this.ds.criminalRecordRef((ref) => {
            let condition = ref
                .where('paid_online', '==', true)
                .where("start_process_at", ">=", start)
                .where("start_process_at", "<=", end)
                .orderBy("start_process_at")
            if (lastRow) {
                condition = condition.startAfter(lastRow?.start_process_at)
            }
            return condition.limit(500)
        })

        let data = pushToArray(await queryRef.get().toPromise())
        this.startProcessData = this.startProcessData.concat(data)
        if (data?.length == 500) {
            setTimeout(() => {
                this.getDataStartProcess(data[data?.length - 1]);
            }, 1000)
        } else {
            this.processingGetDataStartProcess = false;
        }
    }

    awaitTimer(ms: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    pollingQueryState(
        signal?: AbortSignal
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (signal?.aborted) {
                reject(new Error('Polling cancelled'));
                return;
            }
            const intervalId = setInterval(async () => {
                try {
                    if (signal?.aborted) {
                        clearInterval(intervalId);
                        reject(new Error('Polling cancelled'));
                        return;
                    }

                    if (!this.processingGetDataStartProcess && !this.processingGetPaidAtData) {
                        clearInterval(intervalId);
                        resolve(true);
                        return;
                    }

                } catch (err) {
                    clearInterval(intervalId);
                    reject(err);
                }
            }, 300);
        });
    }

    getStartAndEndOfTheMonth(selectedDate:any){
        const str = String(selectedDate);
        const year = parseInt(str.slice(0, 4));
        const month = parseInt(str.slice(4, 6));
        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            throw new Error(`Invalid date format: ${selectedDate}`);
        }
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);
        return { start, end };
    }

}