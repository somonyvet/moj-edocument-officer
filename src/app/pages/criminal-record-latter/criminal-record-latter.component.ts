import { Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, AfterViewChecked, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { WindowService } from 'src/app/shared/services/window.service';
import firebase from 'firebase/compat/app';

import { toNumber } from 'src/app/shared/services/mapping.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AnimationOptions } from 'ngx-lottie';
import { AuthStore } from 'src/app/stores/auth.store';
import { SignupComponent } from '../auth/signup/signup.component';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-criminal-record-latter',
  templateUrl: './criminal-record-latter.component.html',
  styleUrls: ['./criminal-record-latter.component.scss']
})
export class CriminalRecordLatterComponent implements OnInit {
  options: AnimationOptions = {
    path: '../../../../assets/bgsty.json',
  };

  form: FormGroup;
  error: string = null;
  process: boolean = false;

  processItems: any[] = [false, false, false];
  windowRef: any;

  vTitlefirstTop: string = "ហេតុអ្វីយើងត្រូវប្រើ ប្រព័ន្ធអេកូឡូស៊ីនៃក្រសួងយុត្តិធម៌";
  vSubTitlefirstTop: string = 'ប្រព័ន្ធអេកូឡូស៊ីនៃក្រសួងយុត្តិធម៌ គឺជាប្រព័ន្ធដែលព្រឹត្តិបត្រថ្កោលទោសបែបឌីជីថលនឹងមានភាពងាយស្រួលក្នុងការប្រើប្រាស់ជាងគេនៅក្នុងប្រទេសកម្ពុជា។';
  vFirstTitleMedia: string = "អ្នកប្រើប្រាស់អាចប្រើនៅលើ<br>អេក្រង់គ្រប់ប្រភេទ";
  vFirstSubTitleMedia: string = "យើងបានដាក់ទៅឧបករណ៍ជាច្រើនពីមូលដ្ឋានកូដតែមួយ៖ <br>ទូរសព្ទចល័ត គេហទំព័រ កុំព្យូទ័រលើតុ និងឧបករណ៍ដែលបានបង្កប់។";
  vFrisBtnLoginForm: string = "ចុចទីនេះដើម្បីចូលប្រព័ន្ធ";
  vFirstImagePath: any = "../../../assets/images/device22.png";

  vAppName: string = "kh";
  vTitleTor: string = "សេចក្តីណែនាំ";
  vSubTitleTor: string = "អ្នកអាចចូលមើលវីឌីអូខាងក្រោមនេះដើម្បីដឹងពីរប្រៀបប្រើប្រាស់យ៉ាងងាយស្រួល";

  index: any = null;

  public slides = [
    {name: 'First slide', color:'red'},
    // {name: 'Second slide', color:'blue'},
    // {name: 'Third slide', color:'orange'},
    // {name: 'Fourth slide', color:'black'},
    // {name: 'Fifth slide', color:'yellow'},
  ];

  config: SwiperOptions = {
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    spaceBetween: 30
  };

  LANGAUGE_BUTTON = [
    { key: '1', text: 'ខ្មែរ', en_name: 'Khmer', kh_name: 'ខ្មែរ', fr_name: 'Khmer', key_lang: 'kh' },
    { key: '2', text: 'អង់គ្លេស', en_name: 'English', kh_name: 'អង់គ្លេស', fr_name: 'Anglaise', key_lang: 'en' },
    { key: '3', text: 'បារាំង', en_name: 'French', kh_name: 'បារាំង', fr_name: 'français', key_lang: 'fr' },
  ]
  LISTC_CARD = [
    { key: '1', text: 'ប្រព័ន្ធដំណើការល្អ', en_name: 'High Performance', kh_name: 'ខ្មែរ', fr_name: 'Khmer', icon: '../../../assets/images/desktop.png', discription: `Scanning with MRZ Scanner is way faster than manual input. Mobile OCR also removes any human error from your processes. This means the accuracy of your scans will be higher than manual verification. You can use MRZ Scanner to provide the most reliable service possible to your customers. It provides you with near instant scan results once you point your device at your target. Average scan time takes less than half a second. You can optimize your company processes and procedures by adding the fastest scanning ever to your mobile app. This will also give you more time to focus on other aspects of your business.` },
    { key: '2', text: 'ប្រព័ន្ធមានសុវត្ថិភាព', en_name: 'Data Security', kh_name: 'ខ្មែរ', fr_name: 'Khmer', icon: '../../../assets/images/data-protection.png', discription: `We do not collect personal information! The app however does need to process the personal information that is on the MRZ of the identity document. This includes privacy-sensitive information like name, date of birth, personal number and document number. In addition, the app scans via OCR technology for the date of expiry and any optional data on the document, because all these are needed for information processing. The personal information is secured since all the processing is done on the phone. Confidentiality of this information is also protected by using encrypted network connections for any requested communication.` },
    { key: '3', text: `ប្រព័ន្ធលក្ខណៈឯកជនភាព`, en_name: 'Privacy', kh_name: 'ខ្មែរ', fr_name: 'Khmer', icon: '../../../assets/images/compliant.png', discription: `Scanning with MRZ Scanner is way faster than manual input. Mobile OCR also removes any human error from your processes. This means the accuracy of your scans will be higher than manual verification. You can use MRZ Scanner to provide the most reliable service possible to your customers. It provides you with near instant scan results once you point your device at your target. Average scan time takes less than half a second. You can optimize your company processes and procedures by adding the fastest scanning ever to your mobile app. This will also give you more time to focus on other aspects of your business.` },
    { key: '4', text: 'ប្រព័ន្ធបញ្ញាសិប្បនិម្មិត (AI)', en_name: 'Artificial intelligence', kh_name: 'ខ្មែរ', fr_name: 'Khmer', icon: '../../../assets/images/ai.png', discription: `We do not collect personal information! The app however does need to process the personal information that is on the MRZ of the identity document. This includes privacy-sensitive information like name, date of birth, personal number and document number. In addition, the app scans via OCR technology for the date of expiry and any optional data on the document, because all these are needed for information processing. The personal information is secured since all the processing is done on the phone. Confidentiality of this information is also protected by using encrypted network connections for any requested communication.` },

  ]
  LISTC_MRZ = [
    { key: '1', title: '', en_name: 'Machine Readable Zone', kh_name: 'ខ្មែរ', fr_name: 'Khmer', sub_title: 'MRZ', url: '../../../assets/images/cloud.png', des: `We do not collect personal information! The app however does need to process the personal information that is on the MRZ of the identity document. This includes privacy-sensitive information like name, date of birth, personal number and document number. In addition, the app scans via OCR technology for the date of expiry and any optional data on the document, because all these are needed for information processing. The personal information is secured since all the processing is done on the phone. Confidentiality of this information is also protected by using encrypted network connections for any requested communication.` },
  ]

  LISTC_QA = [
    { key: '1', title: 'ហេតុអ្វីយើងត្រូវប្រើ ប្រព័ន្ធអេកូឡូស៊ីនៃក្រសួងយុត្តិធម៌ ?', en_name: 'High Performance', kh_name: 'ខ្មែរ', fr_name: 'Khmer', icon: 'add_circle', discription: `ប្រព័ន្ធអេកូឡូស៊ីនៃក្រសួងយុត្តិធម៌ គឺជាប្រព័ន្ធដែលព្រឹត្តិបត្រថ្កោលទោសបែបឌីជីថលនឹងមានភាពងាយស្រួលក្នុងការប្រើប្រាស់ជាងគេនៅក្នុងប្រទេសកម្ពុជា។ ក្រសួងយុត្តិធម៌ សូមស្វាគមន៍នូវការចូលរួមចំណែក និងរាល់មតិយោបល់ដ៏មានតម្លៃរបស់លោកអ្នក ក្នុងការចូលរួមកែលម្អគេហទំព័រនេះ ក៏ដូចជាសេវាសាធារណៈនានារបស់ក្រសួងយុត្តិធម៌ ឱ្យកាន់តែមានភាពសកម្ម     និងភាពឆ្លើយតបបាន កាន់តែមានប្រសិទ្ធភាពខ្ពស់។ ` },
    { key: '2', title: 'តើប្រព័ន្ធអេកូឡូស៊ីនៃក្រសួងយុត្តិធម៌ មានប្រយោជន៏អ្វីខ្លះ ?', en_name: 'High Performance', kh_name: 'ខ្មែរ', fr_name: 'Khmer', icon: 'add_circle', discription: `ប្រព័ន្ធអេកូឡូស៊ីនៃក្រសួងយុត្តិធម៌ គេហទំព័រផ្លូវការនេះក៏នឹងក្លាយជាឧបករណ៍ស្រាវជ្រាវ ឬជាបណ្ណាល័យអេឡិចត្រូនិកមួយដ៏មានសារៈសំខាន់ផងដែរសម្រាប់អ្នកច្បាប់ អ្នកស្រាវជ្រាវ និងសាធារណជន   ទូទៅ ដែលចង់ស្វែងរកនូវរាល់អត្ថបទច្បាប់ និងបទដ្ឋានគតិយុត្តក្នុងវិស័យយុត្តិធម៌ ក៏ដូចជាអត្ថបទច្បាប់ និងលិខិតបទដ្ឋានគតិយុត្តជាធរមានផ្សេងទៀតនៅក្នុងព្រះរាជាណាចក្រកម្ពុជា    និងកម្មវិធីសន្ទានុក្រមផ្នែកច្បាប់ផងដែរ ។ បន្ថែមពីលើនេះ គេហទំព័រផ្លូវការរបស់ក្រសួងយុត្តិធម៌ ក៏នឹងក្លាយជាប្រព័ន្ធទំនាក់ទំនងមួយដ៏សំខាន់ ដែលអាចជួយលោកអ្នកក្នុងការដោះស្រាយនូវចម្ងល់ ឬបញ្ហាផ្សេងៗដែលទាក់ទងនឹងវិស័យយុត្តិធម៌ ឬអាចផ្តល់នូវមតិយោបល់នានាពាក់ព័ន្ធនឹងសកម្មភាពការងាររបស់ក្រសួង ក៏ដូចជារបស់មន្រ្តីក្រសួងយុត្តិធម៌ សំដៅពង្រឹងប្រសិទ្ធភាពការងារក្នុងវិស័យយុត្តិធម៌។ ` },
  ]

  panelOpenState = false;
  // if(vAppName = 'en'){
  //   this.LANGAUGE_BUTTON =
  // }
  // reveal
  constructor(
    private fb: FormBuilder,
    public store: AuthStore,
    private router: Router,
    private win: WindowService,
    private changeRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: [null, [Validators.required]],
      password: [null, Validators.required],
    })
    window.addEventListener('scroll', this.reveal);
  }

  ngAfterViewInit() {
    this.windowRef = this.win.windowRef;
    this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
    });
  }

  ngAfterViewChecked() {
    this.changeRef.detectChanges();
  }

  openBottomSheet(): void {
    this._bottomSheet.open(SignupComponent);
  }

  _onSignUp() {
    this.router.navigate([`/login/signup`])
  }

  // _signInWithGoogle(i) {
  //   this.processItems[i] = true;
  //   this.process = true;
  //   this.store.signInWithGoogleAccount((success, res) => {
  //     this.processItems[i] = false;
  //     this.process = false;
  //     if (success) {
  //       this.router.navigate(['/ecosystem'])
  //     } else {
  //       alert(res)
  //     }
  //   })
  // }

  _onSignIn(f: any) {
    if (this.form.valid) {
      this.error = null;
      this.form.disable();
      this.process = true;
      this.store.signIn(f, async (success, error) => {
        this.form.enable();
        this.process = false;
        if (success) {
          this.router.navigate(['/'])
        }
        else {
          this.error = "គណនីនិងពាក្យសម្ងាត់របស់លោកអ្នកមិនមាននៅក្នុងប្រព័ន្ធទេ";
        }
      })
    }
    else {
      this.form.enable();
      this.error = null;
      this.process = false;
    }
  }

  onScroll(vtop?: any) {
    window.scrollTo({ top: vtop, behavior: "smooth" });
  }

  checkActive(key?: any) {
    key == '1' ? this.vAppName = 'kh' : key == '2' ? this.vAppName = 'en' : key == '3' ? this.vAppName = 'fr' : '';

    // this.vTitleTor= this.vAppName ='kh' ? "សេចក្តីណែនាំ": this.vAppName= 'en' ? "Tutorial" : this.vAppName = 'fr'? '' : '';
    // this.vSubTitleTor= this.vAppName ='kh' ? "អ្នកអាចចូលមើលវីឌីអូខាងក្រោមនេះដើម្បីដឹងពីរប្រៀបប្រើប្រាស់យ៉ាងងាយស្រួល": this.vAppName= 'en' ? "You can watch our videos tutorial here for free " : this.vAppName = 'fr'? '' : '';

  }

  reveal() {
    let revealRight = document.querySelector('.app-pro-right');
    let revealLeft = document.querySelector('.app-pro-left');

    let windowheight = window.innerHeight;
    let reabaltop = revealRight.getBoundingClientRect().top;
    let revalspoint = 100;

    if (reabaltop < windowheight - revalspoint) {
      revealRight.classList.add('active-reveal-right');
      revealLeft.classList.add('active-reveal-left');
    } else {
      revealRight.classList.remove('.active-reveal');
    }

    // let perCard = document.querySelector('.data-ai-title');
    // let reabaltopCard = perCard.getBoundingClientRect().top;
    // if (reabaltopCard < windowheight - revalspoint) {
    //   perCard.classList.add('active-per-card');
    // }

  }


}
