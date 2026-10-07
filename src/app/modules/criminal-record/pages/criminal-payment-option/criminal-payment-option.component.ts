import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { HR_FUNCTION } from 'src/app/dummy/config';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../dummy/criminal.dummy';
import { CriminalStore } from '../../stores/criminal.store';
import { PaymentOptionFormComponent } from './payment-option-form/payment-option-form.component';
import { paymentOptionStore } from '../../stores/paymentOption.store';

@Component({
    selector: 'app-criminal-payment-option',
    templateUrl: './criminal-payment-option.component.html',
    styleUrls: ['./criminal-payment-option.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalPaymentOptionComponent implements OnInit {

  HR_FUNCTION = HR_FUNCTION;
  title: string = `ជម្រើសបង់ប្រាក់`;
  tabs = criminal_tabs.payment_potion;
  loading: boolean = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public store: paymentOptionStore,
    private ds: DataService,
    public auth: AuthStore,
    public criminal: CriminalStore,
  ) { }

  ngOnInit() {
    this.criminal.newButtonName = `បង្កើតជម្រើសបង់ប្រាក់`;
    this.criminal.componentDialog = PaymentOptionFormComponent;
    this.store.fetchData();
  }

  ngOnDestroy(): void {
    this.store.subscribe()
    this.criminal.newButtonName = null;
    this.criminal.componentDialog = null;
  }

  create(item?: any) {
    let dialogRef = this.dialog.open(PaymentOptionFormComponent, {
      data: { item: item || null },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }


  onDelete(item) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete Payment Option', memo: 'If this Payment Option is using in other list you cannot delete.', name: item.name },
      width: '680px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.delete(this.ds.paymentOptionsRef(), item, (success, error) => {
          if (success) {
            this.snackBar.open('Payment option has been deleted.', 'done', { duration: 2000 });
          }
          else {
            this.snackBar.open(error, 'Error')
          }
        })
      }
    });
  }

  // generateData(){
  //   data?.map(m=>{
  //     const doc = {
  //       ...m,
  //       created_at: new Date(),
  //       updated_at: new Date(),
  //     }
  //     this.store.addNew(this.ds.paymentOptionsRef(), doc, (success, error) => {
  //       if (success) {
  //       }
  //     })
  //   })
  // }
}

// const data = [
//   {
//       "isDelete": false,
//       "update_at": {
//           "seconds": 1711362255,
//           "nanoseconds": 980000000
//       },
//       "france_form": true,
//       "status": {
//           "key": 1,
//           "text": "Active"
//       },
//       "create_by": {
//           "display_name": "គឹម សន្តិភាព",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP"
//       },
//       "duration": {
//           "key": 20,
//           "name_en": "20 days",
//           "name_fr": "20 jours",
//           "name": "២០ ថ្ងៃ"
//       },
//       "france_price": 40000,
//       "tran_fee": 0,
//       "apply_from": {
//           "key": "oversea",
//           "name": "ក្រៅប្រទេស",
//           "name_en": "Oversea"
//       },
//       "isStudent": false,
//       "khmer_price": 30000,
//       "key": "6Lk8mSm5p7uxfVqmOdVG",
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "update_by": {
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "totalPrice": 6,
//       "english_price": 40000,
//       "nationality": {
//           "icon": "../../../../../assets/logo/cambodia_flag.svg",
//           "name_en": "Khmer",
//           "name": "ជនជាតិខ្មែរ",
//           "remark": "",
//           "key": "khmer"
//       },
//       "english_form": true
//   },
//   {
//       "france_price": 40000,
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "duration": {
//           "name_fr": "20 jours",
//           "name_en": "20 days",
//           "key": 20,
//           "name": "២០ ថ្ងៃ"
//       },
//       "create_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "update_by": {
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f"
//       },
//       "english_form": true,
//       "totalPrice": 6,
//       "tran_fee": 0,
//       "isDelete": false,
//       "status": {
//           "text": "Active",
//           "key": 1
//       },
//       "key": "7ljRdI6oJVZWqMJIW2WB",
//       "english_price": 40000,
//       "khmer_price": 30000,
//       "isStudent": false,
//       "france_form": true,
//       "nationality": {
//           "icon": "../../../../../assets/logo/cambodia_flag.svg",
//           "remark": "",
//           "name_en": "Khmer",
//           "key": "khmer",
//           "name": "ជនជាតិខ្មែរ"
//       },
//       "apply_from": {
//           "name": "ក្នុងប្រទេស",
//           "name_en": "Local",
//           "key": "local"
//       },
//       "update_at": {
//           "seconds": 1711362264,
//           "nanoseconds": 737000000
//       }
//   },
//   {
//       "status": {
//           "text": "Active",
//           "key": 1
//       },
//       "apply_from": {
//           "key": "oversea",
//           "name_en": "Oversea",
//           "name": "ក្រៅប្រទេស"
//       },
//       "isStudent": true,
//       "khmer_price": 10000,
//       "update_at": {
//           "seconds": 1711362237,
//           "nanoseconds": 121000000
//       },
//       "duration": {
//           "name": "២០ ថ្ងៃ",
//           "name_fr": "20 jours",
//           "key": 20,
//           "name_en": "20 days"
//       },
//       "english_form": true,
//       "update_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "totalPrice": 3,
//       "key": "cSio55bOZ3XKOF5Libw3",
//       "isDelete": false,
//       "france_form": true,
//       "tran_fee": 0,
//       "create_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "english_price": 40000,
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "france_price": 40000,
//       "nationality": {
//           "name_en": "Khmer",
//           "icon": "../../../../../assets/logo/cambodia_flag.svg",
//           "key": "khmer",
//           "remark": "",
//           "name": "ជនជាតិខ្មែរ"
//       }
//   },
//   {
//       "apply_from": {
//           "name": "ក្នុងប្រទេស",
//           "name_en": "Local",
//           "key": "local"
//       },
//       "key": "dZLiL8WRMBIbzFAuA96C",
//       "create_by": {
//           "display_name": "គឹម សន្តិភាព",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP"
//       },
//       "update_at": {
//           "seconds": 1711362319,
//           "nanoseconds": 831000000
//       },
//       "english_price": 40000,
//       "france_form": true,
//       "khmer_price": 10000,
//       "totalPrice": 3,
//       "duration": {
//           "name_fr": "20 jours",
//           "name": "២០ ថ្ងៃ",
//           "key": 20,
//           "name_en": "20 days"
//       },
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "nationality": {
//           "key": "khmer",
//           "name": "ជនជាតិខ្មែរ",
//           "remark": "",
//           "icon": "../../../../../assets/logo/cambodia_flag.svg",
//           "name_en": "Khmer"
//       },
//       "tran_fee": 0,
//       "france_price": 40000,
//       "status": {
//           "text": "Active",
//           "key": 1
//       },
//       "isStudent": true,
//       "update_by": {
//           "display_name": "គឹម សន្តិភាព",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP"
//       },
//       "isDelete": false,
//       "english_form": true
//   },
//   {
//       "key": "gdIlym4q7kemON0JBLu3",
//       "france_form": true,
//       "create_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "khmer_price": 60000,
//       "isStudent": false,
//       "isDelete": false,
//       "apply_from": {
//           "name_en": "Local",
//           "key": "local",
//           "name": "ក្នុងប្រទេស"
//       },
//       "update_by": {
//           "display_name": "គឹម សន្តិភាព",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f"
//       },
//       "nationality": {
//           "remark": "",
//           "name": "ជនជាតិខ្មែរ",
//           "icon": "../../../../../assets/logo/cambodia_flag.svg",
//           "name_en": "Khmer",
//           "key": "khmer"
//       },
//       "update_at": {
//           "seconds": 1711362379,
//           "nanoseconds": 821000000
//       },
//       "english_price": 60000,
//       "status": {
//           "key": 1,
//           "text": "Active"
//       },
//       "tran_fee": 0,
//       "totalPrice": 15,
//       "duration": {
//           "name_fr": "12 jours",
//           "name_en": "12 days",
//           "key": 12,
//           "name": "១២ ថ្ងៃ"
//       },
//       "france_price": 60000,
//       "english_form": true,
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       }
//   },
//   {
//       "english_price": 60000,
//       "key": "jzzxzh6MxAo66At7bt5I",
//       "status": {
//           "text": "Active",
//           "key": 1
//       },
//       "tran_fee": 0,
//       "isDelete": false,
//       "france_price": 60000,
//       "nationality": {
//           "name_en": "Khmer",
//           "name": "ជនជាតិខ្មែរ",
//           "icon": "../../../../../assets/logo/cambodia_flag.svg",
//           "remark": "",
//           "key": "khmer"
//       },
//       "update_by": {
//           "display_name": "គឹម សន្តិភាព",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP"
//       },
//       "create_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "display_name": "គឹម សន្តិភាព",
//           "key": "pGA5AIVATo4JKSQQNFXP"
//       },
//       "update_at": {
//           "seconds": 1711362433,
//           "nanoseconds": 217000000
//       },
//       "isStudent": true,
//       "totalPrice": 9,
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "apply_from": {
//           "name_en": "Local",
//           "key": "local",
//           "name": "ក្នុងប្រទេស"
//       },
//       "duration": {
//           "name_fr": "12 jours",
//           "key": 12,
//           "name_en": "12 days",
//           "name": "១២ ថ្ងៃ"
//       },
//       "khmer_price": 20000,
//       "france_form": true,
//       "english_form": true
//   },
//   {
//       "duration": {
//           "name_fr": "12 jours",
//           "name": "១២ ថ្ងៃ",
//           "key": 12,
//           "name_en": "12 days"
//       },
//       "status": {
//           "key": 1,
//           "text": "Active"
//       },
//       "khmer_price": 20000,
//       "france_form": true,
//       "nationality": {
//           "name": "ជនជាតិខ្មែរ",
//           "key": "khmer",
//           "remark": "",
//           "icon": "../../../../../assets/logo/cambodia_flag.svg",
//           "name_en": "Khmer"
//       },
//       "tran_fee": 0,
//       "create_by": {
//           "display_name": "គឹម សន្តិភាព",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP"
//       },
//       "english_price": 60000,
//       "update_by": {
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "france_price": 60000,
//       "isDelete": false,
//       "totalPrice": 9,
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "update_at": {
//           "seconds": 1711362453,
//           "nanoseconds": 978000000
//       },
//       "apply_from": {
//           "name_en": "Oversea",
//           "key": "oversea",
//           "name": "ក្រៅប្រទេស"
//       },
//       "english_form": true,
//       "key": "m4z3YKWbFFzO4VYErCmO",
//       "isStudent": true
//   },
//   {
//       "isStudent": false,
//       "tran_fee": 0,
//       "update_at": {
//           "seconds": 1711362474,
//           "nanoseconds": 371000000
//       },
//       "apply_from": {
//           "name_en": "Oversea",
//           "key": "oversea",
//           "name": "ក្រៅប្រទេស"
//       },
//       "update_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "isDelete": false,
//       "nationality": {
//           "name": "ជនជាតិខ្មែរ",
//           "icon": "../../../../../assets/logo/cambodia_flag.svg",
//           "name_en": "Khmer",
//           "remark": "",
//           "key": "khmer"
//       },
//       "status": {
//           "key": 1,
//           "text": "Active"
//       },
//       "france_form": true,
//       "duration": {
//           "key": 12,
//           "name_fr": "12 jours",
//           "name_en": "12 days",
//           "name": "១២ ថ្ងៃ"
//       },
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "create_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "english_price": 60000,
//       "totalPrice": 15,
//       "khmer_price": 60000,
//       "france_price": 60000,
//       "key": "r8etgrCPCnRRHz3oLBJr",
//       "english_form": true
//   },
//   {
//       "totalPrice": 30,
//       "khmer_price": 500000,
//       "france_form": true,
//       "isDelete": false,
//       "france_price": 60000,
//       "duration": {
//           "key": 12,
//           "name_fr": "12 jours",
//           "name_en": "12 days",
//           "name": "១២ ថ្ងៃ"
//       },
//       "update_by": {
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "create_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "display_name": "គឹម សន្តិភាព",
//           "key": "pGA5AIVATo4JKSQQNFXP"
//       },
//       "english_price": 60000,
//       "key": "CMB6A5qElmqxLXGvkgM8",
//       "nationality": {
//           "name": "ជនជាតិបរទេស",
//           "name_en": "Foreigner",
//           "key": "foreigner",
//           "icon": "../../../../../assets/logo/global_flag.png",
//           "remark": ""
//       },
//       "tran_fee": 0,
//       "english_form": true,
//       "isStudent": false,
//       "apply_from": {
//           "key": "local",
//           "name": "ក្នុងប្រទេស",
//           "name_en": "Local"
//       },
//       "status": {
//           "key": 1,
//           "text": "Active"
//       },
//       "update_at": {
//           "seconds": 1711362518,
//           "nanoseconds": 183000000
//       }
//   },
//   {
//       "status": {
//           "text": "Active",
//           "key": 1
//       },
//       "isDelete": false,
//       "isStudent": false,
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "update_at": {
//           "seconds": 1711362531,
//           "nanoseconds": 579000000
//       },
//       "nationality": {
//           "name_en": "Foreigner",
//           "name": "ជនជាតិបរទេស",
//           "remark": "",
//           "key": "foreigner",
//           "icon": "../../../../../assets/logo/global_flag.png"
//       },
//       "france_price": 60000,
//       "english_form": true,
//       "tran_fee": 0,
//       "apply_from": {
//           "key": "oversea",
//           "name_en": "Oversea",
//           "name": "ក្រៅប្រទេស"
//       },
//       "create_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "key": "MkHhqupkV4XET68vOAjm",
//       "update_by": {
//           "display_name": "គឹម សន្តិភាព",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP"
//       },
//       "france_form": true,
//       "totalPrice": 30,
//       "english_price": 60000,
//       "duration": {
//           "key": 12,
//           "name_fr": "12 jours",
//           "name": "១២ ថ្ងៃ",
//           "name_en": "12 days"
//       },
//       "khmer_price": 500000
//   },
//   {
//       "france_form": true,
//       "english_form": true,
//       "isDelete": false,
//       "tran_fee": 0,
//       "nationality": {
//           "remark": "",
//           "name_en": "Foreigner",
//           "icon": "../../../../../assets/logo/global_flag.png",
//           "key": "foreigner",
//           "name": "ជនជាតិបរទេស"
//       },
//       "totalPrice": 15,
//       "status": {
//           "key": 1,
//           "text": "Active"
//       },
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "key": "OcRD3zm0OQwdh9M1cUZK",
//       "update_at": {
//           "seconds": 1711362711,
//           "nanoseconds": 703000000
//       },
//       "english_price": 40000,
//       "duration": {
//           "name": "២០ ថ្ងៃ",
//           "key": 20,
//           "name_fr": "20 jours",
//           "name_en": "20 days"
//       },
//       "update_by": {
//           "display_name": "គឹម សន្តិភាព",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f"
//       },
//       "isStudent": true,
//       "france_price": 40000,
//       "khmer_price": 250000,
//       "create_by": {
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "apply_from": {
//           "name_en": "Oversea",
//           "key": "oversea",
//           "name": "ក្រៅប្រទេស"
//       }
//   },
//   {
//       "duration": {
//           "key": 12,
//           "name": "១២ ថ្ងៃ",
//           "name_fr": "12 jours",
//           "name_en": "12 days"
//       },
//       "totalPrice": 30,
//       "france_form": true,
//       "isStudent": true,
//       "france_price": 60000,
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "tran_fee": 0,
//       "english_form": true,
//       "isDelete": false,
//       "update_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "display_name": "គឹម សន្តិភាព",
//           "key": "pGA5AIVATo4JKSQQNFXP"
//       },
//       "create_by": {
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f"
//       },
//       "khmer_price": 500000,
//       "english_price": 60000,
//       "update_at": {
//           "seconds": 1711362578,
//           "nanoseconds": 264000000
//       },
//       "key": "RgOdegeqAr5jNLxJT8c0",
//       "apply_from": {
//           "name": "ក្រៅប្រទេស",
//           "key": "oversea",
//           "name_en": "Oversea"
//       },
//       "status": {
//           "text": "Active",
//           "key": 1
//       },
//       "nationality": {
//           "remark": "",
//           "name_en": "Foreigner",
//           "name": "ជនជាតិបរទេស",
//           "key": "foreigner",
//           "icon": "../../../../../assets/logo/global_flag.png"
//       }
//   },
//   {
//       "totalPrice": 15,
//       "update_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "khmer_price": 250000,
//       "english_form": true,
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "france_form": true,
//       "apply_from": {
//           "key": "local",
//           "name_en": "Local",
//           "name": "ក្នុងប្រទេស"
//       },
//       "isDelete": false,
//       "english_price": 40000,
//       "france_price": 40000,
//       "tran_fee": 0,
//       "update_at": {
//           "seconds": 1711362698,
//           "nanoseconds": 416000000
//       },
//       "status": {
//           "text": "Active",
//           "key": 1
//       },
//       "nationality": {
//           "name_en": "Foreigner",
//           "icon": "../../../../../assets/logo/global_flag.png",
//           "remark": "",
//           "name": "ជនជាតិបរទេស",
//           "key": "foreigner"
//       },
//       "isStudent": false,
//       "key": "beMVUKBq426YaOrYCcMB",
//       "duration": {
//           "key": 20,
//           "name": "២០ ថ្ងៃ",
//           "name_fr": "20 jours",
//           "name_en": "20 days"
//       },
//       "create_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "display_name": "គឹម សន្តិភាព",
//           "key": "pGA5AIVATo4JKSQQNFXP"
//       }
//   },
//   {
//       "khmer_price": 250000,
//       "isStudent": true,
//       "totalPrice": 15,
//       "isDelete": false,
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "nationality": {
//           "name": "ជនជាតិបរទេស",
//           "icon": "../../../../../assets/logo/global_flag.png",
//           "key": "foreigner",
//           "remark": "",
//           "name_en": "Foreigner"
//       },
//       "tran_fee": 0,
//       "key": "lmtxERijUPw9mEFv1bch",
//       "france_form": true,
//       "create_by": {
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f"
//       },
//       "duration": {
//           "name_en": "20 days",
//           "name": "២០ ថ្ងៃ",
//           "key": 20,
//           "name_fr": "20 jours"
//       },
//       "english_price": 40000,
//       "france_price": 40000,
//       "english_form": true,
//       "update_by": {
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "display_name": "គឹម សន្តិភាព"
//       },
//       "update_at": {
//           "seconds": 1711362634,
//           "nanoseconds": 190000000
//       },
//       "apply_from": {
//           "name": "ក្នុងប្រទេស",
//           "key": "local",
//           "name_en": "Local"
//       },
//       "status": {
//           "key": 1,
//           "text": "Active"
//       }
//   },
//   {
//       "duration": {
//           "name_en": "12 days",
//           "key": 12,
//           "name_fr": "12 jours",
//           "name": "១២ ថ្ងៃ"
//       },
//       "khmer_price": 500000,
//       "create_by": {
//           "display_name": "គឹម សន្តិភាព",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP"
//       },
//       "update_at": {
//           "seconds": 1711362650,
//           "nanoseconds": 629000000
//       },
//       "totalPrice": 30,
//       "isStudent": true,
//       "france_price": 60000,
//       "apply_from": {
//           "name_en": "Local",
//           "key": "local",
//           "name": "ក្នុងប្រទេស"
//       },
//       "update_by": {
//           "display_name": "គឹម សន្តិភាព",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f"
//       },
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "france_form": true,
//       "nationality": {
//           "name": "ជនជាតិបរទេស",
//           "icon": "../../../../../assets/logo/global_flag.png",
//           "key": "foreigner",
//           "remark": "",
//           "name_en": "Foreigner"
//       },
//       "key": "yUlemoVWvrfChT3H0McX",
//       "tran_fee": 0,
//       "english_form": true,
//       "status": {
//           "text": "Active",
//           "key": 1
//       },
//       "english_price": 60000,
//       "isDelete": false
//   },
//   {
//       "nationality": {
//           "remark": "",
//           "icon": "../../../../../assets/logo/global_flag.png",
//           "name": "ជនជាតិបរទេស",
//           "name_en": "Foreigner",
//           "key": "foreigner"
//       },
//       "isDelete": false,
//       "update_at": {
//           "seconds": 1711362679,
//           "nanoseconds": 944000000
//       },
//       "duration": {
//           "key": 20,
//           "name_en": "20 days",
//           "name_fr": "20 jours",
//           "name": "២០ ថ្ងៃ"
//       },
//       "france_price": 40000,
//       "totalPrice": 15,
//       "update_by": {
//           "display_name": "គឹម សន្តិភាព",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f"
//       },
//       "france_form": true,
//       "khmer_price": 250000,
//       "apply_from": {
//           "name": "ក្រៅប្រទេស",
//           "key": "oversea",
//           "name_en": "Oversea"
//       },
//       "status": {
//           "key": 1,
//           "text": "Active"
//       },
//       "key": "zRaOw1RaofjBJqcmgieO",
//       "english_form": true,
//       "tran_fee": 0,
//       "isStudent": false,
//       "english_price": 40000,
//       "created_at": {
//           "seconds": 1711361927,
//           "nanoseconds": 196000000
//       },
//       "create_by": {
//           "photoUrl": "https://firebasestorage.googleapis.com/v0/b/justice-edoc.appspot.com/o/files%2FrU8ZZq9HF2y3GkJkuMxS8l5TPp0Ka1wzZ73zHmycphoto_2021-10-10_17-41-09.jpeg?alt=media&token=45a795a2-164b-41df-a06d-1b3d1377008f",
//           "key": "pGA5AIVATo4JKSQQNFXP",
//           "display_name": "គឹម សន្តិភាព"
//       }
//   }
// ]
