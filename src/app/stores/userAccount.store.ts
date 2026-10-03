import { observable, action, toJS } from "mobx";
import { Injectable } from "@angular/core";
import { DataService } from "../shared/services/data.service";
import * as XLSX from 'xlsx';
import { pushToArray, pushToObject, ConvertService, toLatinNumber, covertNumKhmerToLatin } from "../shared/services/convert.service";
import { DOC_CATEGORY_OBJ, GENDER_OPTIONS } from "../dummy/status";
import { STATUS_OBJ } from "../dummy/appinfo";
import { generateKeywords, toCompany, toNameKey, toNumber, toRanking } from "../shared/services/mapping.service";
type AOA = any[];

@Injectable({ providedIn: 'root' })
export class UserAccountStore {
  @observable loading = false;
  @observable fetching = false;
  @observable empty = false;
  @observable process = false;
  @observable data = [];
  @observable lastVisible: any = null;

  @observable public categoryText = "បទល្មើសទាំងអស់";
  @observable public provinceText = "គ្រប់ខេត្តក្រុងទាំងអស់";

  @observable public provinceFilter = null;
  @observable public districtFilter = null;
  @observable public communeFilter = null;

  @observable public selectedProvince: any = null;
  @observable public selectedDistrict: any = null;
  @observable public selectedCommune: any = null;

  @observable page: number = 1;
  @observable pageSize = 30;

  selectedFiles: FileList;
  @observable excelData: any[] = [];

  constructor(
    public ds: DataService
  ) { }

  @action
  async fetchCRToDraft() {
    const docs = await this.ds.dbRef().collection("criminal_record", ref => ref
      // .where("key", "==", "q6Fx94tuD4YOCg0bV5qb")
      // .limit(1)
    ).get().toPromise()
    const data = docs.docs.map((m: any) => ({ key: m.data().key }));

    console.log('data', data)

    data.map(m => {
      const ref = this.ds.fireRef().collection("criminal_record").doc(m.key)
      const batch = this.ds.batch()

      batch.update(ref, { status: STATUS_OBJ.DRAFT })

      // batch.commit().then(() => {
      //   console.log('done');
      // })
    })
  }

  @action
  async fetchResolve() {
    const docs = await this.ds.dbRef().collection("citizens", ref => ref
      .where("key", "==", "TPuYPm7DFfe4jlatLybOeHOkoxS2")
      // .limit(1)
    ).get().toPromise()
    const data = pushToArray(docs)

    data.map(m => {
      const ref = this.ds.fireRef().collection("criminal_record").doc("tq1JEosHzKLFMJgxdSjD").collection("citizen").doc(m.citizen_ref)
      const batch = this.ds.batch()

      batch.set(ref, { ...m }, { merge: true })

      // batch.commit().then(() => {
      //   console.log('done');
      // })
    })
  }

  @action
  async fetchDocument() {
    const docs = await this.ds.dbRef().collection("documents_header", ref => ref
      .where("status.key", "==", 1)
      // .limit(1)
    ).get().toPromise()
    const data = docs.docs.map((m: any) => ({ key: m.data().key }));

    data.map(m => {
      const ref = this.ds.fireRef().collection("documents_header").doc(m.key)
      const batch = this.ds.batch()

      batch.update(ref, {
        document_category: DOC_CATEGORY_OBJ.edoc
      })

      // batch.commit().then(() => {
      //   console.log('done');
      // })

    })

  }

  @action
  async fetchUser() {
    const docs = await this.ds.dbRef().collection("officers", ref => ref
      // .where("key","==","1KYC0XW75UpUBWL7tjsX")
      .where("isImport", "==", true)
      // .limit(1)
    ).get().toPromise()
    const data = pushToArray(docs)

    data.map(m => {
      const batch = this.ds.batch()
      // const ref = this.ds.fireRef().collection("officers").doc(m.key)
      const uref = this.ds.fireRef().collection("users").doc(m.key)

      // batch.update(ref, { status: STATUS_OBJ.PENDING })
      batch.update(uref, { status: STATUS_OBJ.PENDING })
      // batch.commit().then(() => {
      //   console.log('done');
      // })
    })
  }

  @action
  async fileImportStudentFromExcel(evt: any) {
    this.process = true;
    this.excelData = [];
    let officeData = []
    this.selectedFiles = evt.target.files;
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      /* save data */
      officeData = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
      //remove header

      if (officeData.length > 1) {
        officeData = officeData.slice(2, officeData.length)

        officeData = officeData.map(m => {
          const idNumber = covertNumKhmerToLatin(m[3])
          const phoneNumber = covertNumKhmerToLatin(m[14])

          return {
            id_number: idNumber,
            full_name: m[1],
            gender: m[2],
            title: m[4],
            position: m[5],
            full_name_en: m[12],
            phone: phoneNumber,
          }
        })

        officeData = officeData.filter(m => m.full_name && m.id_number !== '01411')

        await Promise.all(
          officeData.map(async m => {
            const docs = await this.ds.dbRef().collection("officers", ref => ref.where("officerId", "==", m.id_number)).get().toPromise()
            const data = pushToArray(docs)
            if (data && data.length === 0) {
              this.excelData.push(m)
            }
          })
        )

      }
      this.process = false;
    };
    await reader.readAsBinaryString(target.files[0]);
  }

  @action
  async importUser(items: Array<any>, callback) {
    this.loading = true;
    items.map((m, index) => {
      const ref = this.ds.fireRef().collection("officers")

      const batch = this.ds.batch();
      const { id_number, title, position, full_name, full_name_en, gender, phone } = m

      const genderData = gender.trim() === ("ស្រី" || "ស") ? GENDER_OPTIONS[1] : GENDER_OPTIONS[0]
      const fullName = `${ConvertService.toCapitalize(full_name)}`;

      const fullNameArray = fullName.split(" ");
      const lastName = fullNameArray[0]
      let firstName = fullNameArray[1]

      if (fullNameArray.length === 2) {
        firstName = fullNameArray[1]
      }
      else if (fullNameArray.length === 3) {
        firstName = `${fullNameArray[1]} ${fullNameArray[2]}`
      }
      else if (fullNameArray.length === 4) {
        firstName = `${fullNameArray[1]} ${fullNameArray[2]} ${fullNameArray[3]}`
      }


      const fullNameEn = `${ConvertService.toCapitalize(full_name_en)}`;

      const fullNameEnArray = fullNameEn.split(" ");
      const lastNameEn = fullNameEnArray[0]
      let firstNameEn = fullNameEnArray[1]

      if (fullNameEnArray.length === 2) {
        firstNameEn = fullNameEnArray[1]
      }
      else if (fullNameEnArray.length === 3) {
        firstNameEn = `${fullNameEnArray[1]} ${fullNameEnArray[2]}`
      }
      else if (fullNameEnArray.length === 4) {
        firstNameEn = `${fullNameEnArray[1]} ${fullNameEnArray[2]} ${fullNameEnArray[3]}`
      }

      const uid = "D2QrKXI6cCwE7VX0V6oE"
      const officerId = id_number
      const phoneNumber = phone
      const data = {

        isImport: true,
        key: this.ds.createId(),
        status: STATUS_OBJ.PENDING,
        created_at: this.ds.serverTimestamp(),
        created_by: uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: ConvertService.dateKey(),
        page_key: ConvertService.pageKey(),
        keyword: generateKeywords([`${officerId}`, ConvertService.toCapitalize(fullName), ConvertService.toCapitalize(fullNameEn)]),
        isDelete: false,
        //fields
        phoneNumber: `0${toNumber(`${phoneNumber}`.trim())}`,
        officerIdNo: toNumber(`${officerId}`.trim()),
        currentTitle: title,
        currentPosition: position,
        officerId: officerId,
        first_name: ConvertService.toCapitalize(firstName),
        last_name: ConvertService.toCapitalize(lastName),
        nameKey: toNameKey(officerId),
        gender: genderData,
        last_name_en: ConvertService.toCapitalize(lastNameEn),
        first_name_en: ConvertService.toCapitalize(firstNameEn),
        displayName: `${ConvertService.toCapitalize(lastName)} ${ConvertService.toCapitalize(firstName)}`,
        file: null,
        workingOffices: null,
        title: [],

        positions: [],
        positionKeys: [],
        position: null,
        positionWorkplaceKeys: [],
        officeKeys: [],
        workplace: [],
        workplaceKeys: [],
        currentDepartment: null,
        workplaceKey: null,
        company: {
          key: "interior.gov.kh",
          name: "ក្រសួងមហាផ្ទៃ",
          name_en: "Ministry of Interior Cambodia"
        },

        isAdmin: false,
        stampFile: null,
        remarkFile: null,
        signatureFile: null,

      }

      batch.set(ref.doc(data.key), data)

      // batch.commit().then(() => {
      // })

      // if (index + 1 === items.length) {
      //   this.loading = false;
      //   this.excelData = [];
      //   callback(true, null)
      // }
    })

  }

  @action
  addNew(item: any, callback) {
    this.process = true;
    this.ds.usersRef().doc(item.key).set(item, { merge: true }).then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  deleteItem(item: any, callback) {
    this.process = true;
    this.ds.usersRef().doc(item.key).delete().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  fetchUserData(key: string, callback) {
    this.loading = true;
    this.ds.usersRef().doc(key).valueChanges().subscribe(user => {
      this.loading = false;
      callback(user)
    })
  }

}
