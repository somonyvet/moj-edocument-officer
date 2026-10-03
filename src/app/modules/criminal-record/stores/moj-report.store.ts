import { Injectable } from "@angular/core";
import { CriminalService } from "../services/criminal.service";
import { ConvertService, getStartAndEndOfDayFromAndToDate, orderBy, pushToArray, sum, toKhDay, toKhMonth, toKhYear } from "src/app/shared/services/convert.service";
import { observable } from "mobx";
import { DataService } from "src/app/shared/services/data.service";
import { AuthStore } from "src/app/stores/auth.store";

@Injectable({ providedIn: 'root' })
export class MOJReportStore {
  
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
    private dataService: CriminalService,
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

  async getDailyFolder(date: any){
    let startDate = new Date();
    startDate.setDate(date?.getDate());
    startDate.setHours(0)
    startDate.setMinutes(0)
    startDate.setSeconds(0)
    let endDate = new Date();
    endDate.setDate(date?.getDate() + 1);
    endDate.setHours(0)
    endDate.setMinutes(0)
    endDate.setSeconds(0)
    const ref = this.dataService.criminalRecordFolderRef(ref=>{
      const condition = ref.where('created_at','>',startDate).where('created_at','<',endDate)
      return condition
    })
    return pushToArray(await ref.get().toPromise())
  }

  async mapFolderCriminalRecord(folders: any){
    let data = []
    for await(let m of folders){
      const records = m?.criminal_records;
      const chunkSize = 10;
      let recordsData = [];
      const chunkItems = []
      for (let i = 0; i < records?.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        chunkItems.push(chunk);
      }
      for await(let item of chunkItems){
        const ref = this.ds.criminalRecordRef(ref=>ref.where('key','in',item)).get();
        const data = pushToArray(await ref.toPromise());
        recordsData = recordsData?.concat(data);
      }
      data.push({
        ...m,
        recordsData : recordsData,
      })
    }
    return data
  }

  async getDaily014(queryParams) {

      const { fromdate, todate } = queryParams;

      this.fromDateNum = fromdate ? fromdate : ConvertService.dateKey();
      this.toDateNum = todate ? todate : ConvertService.dateKey();
      this.getPeriod(this.fromDateNum, this.toDateNum);

      const dateFilter = getStartAndEndOfDayFromAndToDate(this.fromDate, this.toDate);
      const items = await  this.ds.criminalRecordRef(ref => ref
          .where("paid_at", ">=", dateFilter?.start)
          .where("paid_at", "<=", dateFilter?.end)
          .orderBy("paid_at")
      ).get().toPromise();

      const paidOnlineProcessRef = await this.ds.criminalRecordRef(ref => ref
          .where('paid_online','==',true)
          .where("start_process_at", ">=", dateFilter?.start)
          .where("start_process_at", "<=", dateFilter?.end)
          .orderBy("start_process_at")
      ).get().toPromise();

      const forms = pushToArray(items)?.filter(f=>f?.paid_online!==true);
      this.data = orderBy(forms.filter(m=> m?.status?.key >= 1),'issued_at');
      const molData = this.data.filter(m=> m?.workplace_entry?.key === this.auth?.config?.department_labor?.key);
      const notMolData = this.data.filter(m=> m?.workplace_entry?.key !== this.auth?.config?.department_labor?.key);
      const paidOnlineProcess = pushToArray(paidOnlineProcessRef);
      this.data = [...notMolData,...molData,...paidOnlineProcess];

      const data12 = this.data.filter(m => 
        (m?.criminal_language?.length === 1) &&
        m?.urgent_obj?.key === 12
      );

      const data12T = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        m?.urgent_obj?.key === 12
      );

      const data20 = this.data.filter(m => 
        (m?.criminal_language?.length === 1) &&
        m?.urgent_obj?.key === 20
      );

      const data20T = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        m?.urgent_obj?.key === 20
      );

      this.data = [ ...data12, ...data12T, ...data20, ...data20T ]
      
      const total = sum((this.data?.map(m=>m?.criminal_language))?.map(m=>m?.find(m=> m?.key === 1)),'amount')

      const filteredDataK20T = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        !m?.isStudent &&
        m?.national_application?.key !== "foreigner" &&
        m?.urgent_obj?.key === 20
      );
      const extractedLanguagesK20T = filteredDataK20T.map(m => m?.criminal_language);
      const selectedLanguagesK20T = extractedLanguagesK20T.map(langs => 
          langs?.find(lang => lang?.key === 1)
      );
      const totalK20TAmount = sum(selectedLanguagesK20T, 'amount');

      // Filter the data based on conditions
      const filteredS20Online = this.data.filter(m => 
        (m?.criminal_language?.length === 1) && 
        m?.apply &&
        m?.isStudent &&
        m?.urgent_obj?.key === 20
      );

      // Extract the relevant criminal language entry
      const selectedLanguages = filteredS20Online.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Calculate the total amount
      const totalS20Amount_online = sum(selectedLanguages, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredS20 = this.data.filter(m => 
          (m?.criminal_language?.length === 1) &&
          m?.isStudent &&
          m?.urgent_obj?.key === 20
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesS20 = filteredS20.map(m => 
          m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalS20Amount = sum(selectedLanguagesS20, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredS20T = this.data.filter(m => 
          (m?.criminal_language?.length > 1) &&
          m?.isStudent &&
          m?.urgent_obj?.key === 20
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesS20T = filteredS20T.map(m => 
          m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalS20TAmount = sum(selectedLanguagesS20T, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredS20TOnline = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        m?.apply &&
        m?.isStudent &&
        m?.urgent_obj?.key === 20
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesS20TOnline = filteredS20TOnline.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalS20TAmount_online = sum(selectedLanguagesS20TOnline, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredS12Online = this.data.filter(m => 
        (m?.criminal_language?.length === 1) &&
        m?.apply &&
        m?.isStudent &&
        m?.urgent_obj?.key === 12
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesS12Online = filteredS12Online.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalS12Amount_online = sum(selectedLanguagesS12Online, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredS12 = this.data.filter(m => 
        (m?.criminal_language?.length === 1) &&
        m?.isStudent &&
        m?.urgent_obj?.key === 12
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesS12 = filteredS12.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalS12Amount = sum(selectedLanguagesS12, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredS12T = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        m?.isStudent &&
        m?.urgent_obj?.key === 12
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesS12T = filteredS12T.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalS12TAmount = sum(selectedLanguagesS12T, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredS12TOnline = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        m?.apply &&
        m?.isStudent &&
        m?.urgent_obj?.key === 12
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesS12TOnline = filteredS12TOnline.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalS12TAmount_online = sum(selectedLanguagesS12TOnline, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredK20 = this.data.filter(m => 
        (m?.criminal_language?.length === 1) &&
        !m?.isStudent &&
        m?.national_application?.key !== "foreigner" &&
        m?.urgent_obj?.key === 20
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesK20 = filteredK20.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalK20Amount = sum(selectedLanguagesK20, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredK20Online = this.data.filter(m => 
        (m?.criminal_language?.length === 1) &&
        m?.apply &&
        !m?.isStudent &&
        m?.national_application?.key !== "foreigner" &&
        m?.urgent_obj?.key === 20
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesK20Online = filteredK20Online.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalK20Amount_online = sum(selectedLanguagesK20Online, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredK20TOnline = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        m?.apply &&
        !m?.isStudent &&
        m?.national_application?.key !== "foreigner" &&
        m?.urgent_obj?.key === 20
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesK20TOnline = filteredK20TOnline.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1 )
      );

      // Step 3: Calculate the total amount
      const totalK20TAmount_online = sum(selectedLanguagesK20TOnline, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredK12 = this.data.filter(m => 
        (m?.criminal_language?.length === 1) &&
        !m?.isStudent &&
        m?.national_application?.key !== "foreigner" &&
        m?.urgent_obj?.key === 12
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesK12 = filteredK12.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalK12Amount = sum(selectedLanguagesK12, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredK12T = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        !m?.isStudent &&
        m?.national_application?.key !== "foreigner" &&
        m?.urgent_obj?.key === 12
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesK12T = filteredK12T.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalK12TAmount = sum(selectedLanguagesK12T, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredK12Online = this.data.filter(m => 
        (m?.criminal_language?.length === 1) &&
        m?.apply &&
        !m?.isStudent &&
        m?.national_application?.key !== "foreigner" &&
        m?.urgent_obj?.key === 12
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesK12Online = filteredK12Online.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalK12Amount_online = sum(selectedLanguagesK12Online, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredK12TOnline = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        m?.apply &&
        !m?.isStudent &&
        m?.national_application?.key !== "foreigner" &&
        m?.urgent_obj?.key === 12
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesK12TOnline = filteredK12TOnline.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalK12TAmount_online = sum(selectedLanguagesK12TOnline, 'amount');



      // Step 1: Filter the data based on conditions
      const filteredF20 = this.data.filter(m => 
        (m?.criminal_language?.length === 1) &&
        m?.national_application?.key === "foreigner" &&
        m?.urgent_obj?.key === 20
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesF20 = filteredF20.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalF20Amount = sum(selectedLanguagesF20, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredF20T = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        m?.national_application?.key === "foreigner" &&
        m?.urgent_obj?.key === 20
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesF20T = filteredF20T.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalF20TAmount = sum(selectedLanguagesF20T, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredF20Online = this.data.filter(m => 
        (m?.criminal_language?.length === 1) &&
        m?.apply &&
        m?.national_application?.key === "foreigner" &&
        m?.urgent_obj?.key === 20
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesF20Online = filteredF20Online.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalF20AmountOnline = sum(selectedLanguagesF20Online, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredF20TOnline = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        m?.apply &&
        m?.national_application?.key === "foreigner" &&
        m?.urgent_obj?.key === 20
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesF20TOnline = filteredF20TOnline.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalF20TAmountOnline = sum(selectedLanguagesF20TOnline, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredF12 = this.data.filter(m => 
          (m?.criminal_language?.length === 1) &&
          m?.national_application?.key === "foreigner" &&
          m?.urgent_obj?.key === 12
      );

      // Step 2: Extract the relevant criminal language entry
      const selectedLanguagesF12 = filteredF12.map(m => 
          m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalF12Amount = sum(selectedLanguagesF12, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredF12T = this.data.filter(m => 
        (m?.criminal_language?.length > 1) &&
        m?.national_application?.key === "foreigner" &&
        m?.urgent_obj?.key === 12
      );

      // Step 2: Extract the relevant criminal language entries with key 2 or 3
      const selectedLanguagesF12T = filteredF12T.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalF12TAmount = sum(selectedLanguagesF12T, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredF12Online = this.data.filter(m => 
        (m?.criminal_language?.length === 1) &&
        m?.apply && 
        m?.national_application?.key === "foreigner" &&
        m?.urgent_obj?.key === 12
      );

      // Step 2: Extract the relevant criminal language entries with key 1
      const selectedLanguagesF12Online = filteredF12Online.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalF12Amount_online = sum(selectedLanguagesF12Online, 'amount');

      // Step 1: Filter the data based on conditions
      const filteredF12TOnline = this.data.filter(m => 
        (m?.criminal_language?.length > 1) && 
        m?.apply && 
        m?.national_application?.key === "foreigner" && 
        m?.urgent_obj?.key === 12
      );

      console.log('filteredF12TOnline',filteredF12TOnline)

      // Step 2: Extract the relevant criminal language entries with key 2
      const selectedLanguagesF12TOnline = filteredF12TOnline.map(m => 
        m?.criminal_language?.find(lang => lang?.key === 1)
      );

      // Step 3: Calculate the total amount
      const totalF12TAmount_online = sum(selectedLanguagesF12TOnline, 'amount');

      this.statistic = {

        total,

        totalS20Amount,
        totalS20Amount_online,

        totalS20TAmount,
        totalS20TAmount_online,

        totalS12Amount,
        totalS12Amount_online,

        totalS12TAmount,
        totalS12TAmount_online,

        totalK20Amount,
        totalK20Amount_online,

        totalK20TAmount,
        totalK20TAmount_online,

        totalK12Amount,
        totalK12Amount_online,

        totalK12TAmount,
        totalK12TAmount_online,

        totalF20Amount,
        totalF20AmountOnline,

        totalF20TAmount,
        totalF20TAmountOnline,

        totalF12Amount,
        totalF12Amount_online,

        totalF12TAmount,
        totalF12TAmount_online
      }

  }
}
