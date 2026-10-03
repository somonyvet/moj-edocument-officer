import * as moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from 'html-to-pdfmake';
import { toDayOfMonthLocal, toKhmerNumber, toMonthKh, toYearOfPeriodLocal } from './mapping.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
    Poppins: {
        normal: 'Poppins-Regular.ttf',
        bold: 'Poppins-SemiBold.ttf',
        italics: 'Poppins-Italic.ttf',
        bolditalics: 'Poppins-BoldItalic.ttf'
    },

    CrimsonText: {
        normal: 'CrimsonText-Regular.ttf',
        bold: 'CrimsonText-Bold.ttf',
        italics: 'CrimsonText-Italic.ttf',
        bolditalics: 'CrimsonText-SemiBoldItalic.ttf'
    },
    Battambang: {
        normal: 'https://raw.githubusercontent.com/ensophearak/fonts/master/Battambang-Regular.ttf',
        bold: 'https://raw.githubusercontent.com/ensophearak/fonts/master/Battambang-Bold.ttf',
    },
    KhmerMoul: {
        normal: 'https://raw.githubusercontent.com/Huyang42/fonts/master/src/assets/Khmer-OS-Muol/KhmerOSMoul.ttf',
        bold: 'https://raw.githubusercontent.com/Huyang42/fonts/master/src/assets/Khmer-OS-Muol/KhmerOSMoul.ttf',
    },
    Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
    },

    Montserrat: {
        normal: 'https://raw.githubusercontent.com/Huyang42/fonts/master/src/assets/Montserrat/Montserrat-Regular.ttf',
        bold: 'https://raw.githubusercontent.com/Huyang42/fonts/master/src/assets/Montserrat/Montserrat-Bold.ttf',
    },

    Khmchantha: {
        normal: 'https://raw.githubusercontent.com/ensophearak/fonts/master/Khmchantha.ttf',
        bold: 'https://raw.githubusercontent.com/ensophearak/fonts/master/Khmchantha.ttf',
    },

    FastHand: {
        normal: 'https://raw.githubusercontent.com/ensophearak/fonts/master/Fasthand-Regular.ttf',
        bold: 'https://raw.githubusercontent.com/ensophearak/fonts/master/Fasthand-Regular.ttf',
    },




};



export function mapReportContent(reportImage, item: any, sizeS1: number, sizeS2: number, sizeS3: number) {
    let decree_result = htmlToPdfmake(removeSpaceSpecialCharacter(item?.decree_result?.name));

    if(decree_result.text === 'undefined'){
      decree_result.text=''
    }

    console.log('decree_result',decree_result)


    // const m = decree_result[0].text.shift()
    // const firstItem = {
    //     ...m,
    //     margin: [118.5, m.margin[1], m.margin[2], 118.5]
    // }
    // decree_result[0].text.unshift(firstItem);

    // decree_result = [...decree_result];
    // console.log('decree_result', decree_result);
    // console.log('decree_result', decree_result);



    const fullName = item?.last_name + " " + item?.first_name;
    const genderText = item?.gender?.name;
    const khBeforeNationalityText = item?.before_nationality?.kh_nationality;
    const khCurrentNationalityText = item?.current_nationality?.kh_nationality;
    const nickName = item?.nick_name;
    const dob = (item?.dateOfBirthDay ? item?.dateOfBirthDay?.name : '') + '\t' + (item?.dateOfBirthMonth?.name ? item?.dateOfBirthMonth?.name : '') + '\t' + (item?.dateOfBirthYear?.name ? item?.dateOfBirthYear?.name : '');

    const pob = getPob(item);
    const permanentAddress = getPermanentAddress(item);
    const occupation = item?.occupation;

    const fatherName = item?.father_name;
    const fatherDob = (item?.fatherDob?.day?.name ? item?.fatherDob?.day?.name : '') + '\t' + (item?.fatherDob?.month?.name ? item?.fatherDob?.month?.name : '') + '\t' + (item?.fatherDob?.year?.name ? item?.fatherDob?.year?.name : '');
    const father_before_nationality = item?.father_before_nationality?.kh_nationality;
    const father_current_nationality = item?.father_current_nationality?.kh_nationality;
    const fatherBirthAddress = getFatherPob(item);


    const motherName = item?.mother_name;
    const motherDob = (item?.motherDob?.day?.name ? item?.motherDob?.day?.name : '') + '\t' + (item?.motherDob?.month?.name ? item?.motherDob?.month?.name : '') + '\t' + (item?.motherDob?.year?.name ? item?.motherDob?.year?.name : '');
    const mother_before_nationality = item?.mother_before_nationality?.kh_nationality;
    const mother_current_nationality = item?.mother_current_nationality?.kh_nationality;
    const motherBirthAddress = getMotherPob(item);

    const spouseName = item?.spouse;
    const spouseDob = (item?.spouseDob?.day?.name ? item?.spouseDob?.day?.name : '') + '\t' + (item?.spouseDob?.month?.name ? item?.spouseDob?.month?.name : '') + '\t' + (item?.spouseDob?.year?.name ? item?.spouseDob?.year?.name : '');
    const spouse_before_nationality = item?.spouse_before_nationality?.kh_nationality;
    const spouse_current_nationality = item?.spouse_current_nationality?.kh_nationality;
    const spouseCurrentOccupation = item?.spouseCurrentOccupation;
    const tableLayout = {
        defaultBorder: false,
        paddingLeft: function (i, node) { return 0; },
        paddingRight: function (i, node) { return 0; },
        paddingTop: function (i, node) { return 0; },
        paddingBottom: function (i, node) { return 0; },
    };

    const fontSize1 = sizeS1?sizeS1:10;
    const fontSize2 = sizeS2?sizeS2:10;
    const fontSize3 = sizeS3?sizeS3:10;

    // console.log('fontSize1', fontSize1);
    // console.log('fontSize2', fontSize2);
    // console.log('fontSize3', fontSize3);

    return {
        images: {
            coverImg: reportImage.khCover,
        },
        info: {
            title: item?.full_name || 'SPS Card',
            author: 'Auxswot',
            subject: 'SPS Card',
            keywords: 'SPS Card',
            gender: item?.gender,
            puc_id: item?.puc_id
        },
        permissions: {
            printing: 'highResolution',//'lowResolution'
            modifying: false,
            copying: false,
            annotating: true,
            fillingForms: true,
            contentAccessibility: true,
            documentAssembly: true
        },
        pageSize: 'A4',
        pageMargins: [0, 158, 0, 0],
        background: function (currentPage) {
            if (currentPage === 1) {
                return {
                    image: 'coverImg',
                    width: 602
                    // fit: [595.35, 842]
                }
            }

            // if (currentPage === 2) {
            //     return {
            //         image: 'spsBackImg',
            //         width: 155.906
            //     }
            // }
        },
        content: [
            {
                // layout: 'noBorders',
                layout: { ...tableLayout },
                margin: [0, 0, 0, 0],
                table: {
                    widths: [132, 174, 13, 35, 40, 55, 50, 66],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            {
                                text: fullName || '/',
                                style: ['FastHand', 'center'],
                                // fillColor: '#555555',
                                fontSize:fontSize1,

                            },
                            {
                                text: '',
                            },
                            {
                                text: genderText || '/',
                                style: ['FastHand', 'center'],
                            },
                            {
                                text: ''
                            },
                            {
                                text: khBeforeNationalityText || '/',
                                style: ['FastHand', 'center'],
                                fontSize:fontSize2,
                            },
                            {
                                text: ''
                            },
                            {
                                text: khCurrentNationalityText || '/',
                                style: ['FastHand', 'center'],
                                fontSize:fontSize3,
                            }

                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -2, 0, 0],
                table: {
                    widths: [132, 439],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            textString(nickName),


                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -2, 0, 0],
                table: {
                    widths: [132, 439],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            textString(dob),


                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -2, 0, 0],
                table: {
                    widths: [132, 439],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            textString(pob),


                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -2, 0, 0],
                table: {
                    widths: [132, 439],
                    heights: 37,
                    body: [
                        [
                            {
                                text: ''
                            },

                            textString(permanentAddress),


                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -1, 0, 0],
                table: {
                    widths: [132, 439],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },

                            textString(occupation),


                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -1, 0, 0],
                table: {
                    widths: [132, 224, 71, 142],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            textString(fatherName),


                            {
                                text: ''
                            },
                            {
                                text: fatherDob || '/',
                                style: ['FastHand', 'center'],
                            },

                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -1, 0, 0],
                table: {
                    widths: [132, 224, 53, 160],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            {
                                text: father_before_nationality || '/',
                                style: ['FastHand', 'center'],

                            },

                            {
                                text: ''
                            },
                            {
                                text: father_current_nationality || '/',
                                style: ['FastHand', 'center'],

                            },

                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -1, 0, 0],
                table: {
                    widths: [132, 439],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            {
                                text: fatherBirthAddress || '/',
                                style: ['FastHand', 'center']
                            },

                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -1, 0, 0],
                table: {
                    widths: [132, 224, 71, 142],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            textString(motherName),
                            {
                                text: ''
                            },
                            {
                                text: motherDob || '/',
                                style: ['FastHand', 'center']
                            },

                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -1, 0, 0],
                table: {
                    widths: [132, 224, 53, 160],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            {
                                text: mother_before_nationality || '/',
                                style: ['FastHand', 'center']
                            },

                            {
                                text: ''
                            },
                            {
                                text: mother_current_nationality || '/',
                                style: ['FastHand', 'center']
                            },

                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -1, 0, 0],
                table: {
                    widths: [132, 439],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            {
                                text: motherBirthAddress || '/',
                                style: ['FastHand', 'center']
                            },

                        ],
                    ]
                }
            },

            {
                layout: { ...tableLayout },
                margin: [0, -1, 0, 0],
                table: {
                    widths: [132, 224, 71, 142],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            textString(spouseName),
                            {
                                text: ''
                            },
                            {
                                text: spouseDob || '/',
                                style: ['FastHand', 'center']
                            },

                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -1, 0, 0],
                table: {
                    widths: [132, 224, 53, 160],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''
                            },
                            {
                                text: spouse_before_nationality || '/',
                                style: ['FastHand', 'center']
                            },

                            {
                                text: ''
                            },
                            {
                                text: spouse_current_nationality || '/',
                                style: ['FastHand', 'center']
                            },

                        ],
                    ]
                }
            },
            {
                layout: { ...tableLayout },
                margin: [0, -1, 0, 0],
                table: {
                    widths: [132, 439],
                    heights: 18.5,
                    body: [
                        [
                            {
                                text: ''

                            },
                            textString(spouseCurrentOccupation)

                        ],
                    ]
                }
            },

            {
                layout: { ...tableLayout },
                margin: [55, 27, 25, 0],
                table: {
                    widths: ['*'],
                    heights: 60,
                    body: [
                        [

                            {
                                text: [
                                    {
                                        text: '\t\t\t\t\t\t',
                                        preserveLeadingSpaces: true,
                                    },
                                    {
                                        text: decree_result || '',
                                    },

                                ],
                                style: ['FastHand', ''],
                                lineHeight:1.1,
                                // fillColor: '#555555',
                            },

                        ],
                    ]
                }
            },

            {
                layout: { ...tableLayout },
                margin: [50, 44, 25, 0],
                table: {
                    widths: [347,45,6,65,8,50],
                    body: [
                        [
                            {
                                text: '',
                            },
                            {
                                text: toDayOfMonthLocal(new Date()),
                                style: ['FastHand', 'center'],
                                // fillColor: '#555555',

                            },
                            {
                                text: '',
                            },
                            {
                                text: toMonthKh(new Date()),
                                style: ['FastHand', 'center'],
                            },
                            {
                                text: '',
                            },
                            {
                                text: toYearOfPeriodLocal(new Date()),
                                style: ['FastHand', 'center'],
                                // fillColor: '#555555',

                            },
                        ],
                    ]
                }
            },

            // {
            //     pageBreak: 'after',
            //     text: '',
            // },

        ],
        defaultStyle: {
            fontSize: 10,
            color: '#000000',
            font: 'Battambang',
        },


        styles: {

            FastHand: {
                font: 'FastHand'
            },
            Battambang: {
                font: 'Battambang',
            },

            center: {
                alignment: 'center',
            },

        },
    };
}
function textString(string: string) {
    if(string){
        return  {
            text: removeSpaceSpecialCharacter(string),
            style: ['FastHand', ''],
            margin: [5, 0, 0, 0],
        }
    }else{
        return  {
            text: '/',
            style: ['FastHand', ''],
            margin: [109, 0, 0, 0],
        }
    }
}


function getPob(item: any) {
    const { isTextAddress } = item;
    if (isTextAddress) {
        return AddMoreSpaceToStringAddress(item?.foreignerPlaceOfBirth)
    } else {
        const pobVillage = item?.birthAddress?.village?.geo_prefix?.name ? item?.birthAddress?.village?.geo_prefix?.name : 'ភូមិ' + item.birthAddress?.village?.name;
        const pobCommune = item?.birthAddress?.commune?.geo_prefix?.name ? item?.birthAddress?.commune?.geo_prefix?.name : 'ឃុំ' + item.birthAddress?.commune?.name;
        const pobDistrict = item?.birthAddress?.district?.geo_prefix?.name ? item?.birthAddress?.district?.geo_prefix?.name : 'ស្រុក' + item.birthAddress?.district?.name;
        const pobProvince = item?.birthAddress?.province?.geo_prefix?.name ? item?.birthAddress?.province?.geo_prefix?.name : 'ខេត្ត' + item.birthAddress?.province?.name;
        return pobVillage + '\t' + pobCommune + '\t' + pobDistrict + '\t' + pobProvince;
    }

}

function getPermanentAddress(item: any) {
    const { isTextAddress } = item;
    if (isTextAddress) {
        return AddMoreSpaceToStringAddress(item?.permanentAddressText)
    } else {

        const homeNo = item?.permanentAddress?.home_no ? 'ផ្ទះលេខ' + item?.permanentAddress?.home_no : null;
        const streetNo = item?.permanentAddress?.street_no ? 'ផ្លូវ' + item?.permanentAddress?.street_no : null;

        const pobVillage = item?.permanentAddress?.village?.geo_prefix?.name ? item?.permanentAddress?.village?.geo_prefix?.name : 'ភូមិ' + item?.permanentAddress?.village?.name;
        const pobCommune = item?.permanentAddress?.commune?.geo_prefix?.name ? item?.permanentAddress?.commune?.geo_prefix?.name : 'ឃុំ' + item?.permanentAddress?.commune?.name;
        const pobDistrict = item?.permanentAddress?.district?.geo_prefix?.name ? item?.permanentAddress?.district?.geo_prefix?.name : 'ស្រុក' + item?.permanentAddress?.district?.name;
        const pobProvince = item?.permanentAddress?.province?.geo_prefix?.name ? item?.permanentAddress?.province?.geo_prefix?.name : 'ខេត្ត' + item?.permanentAddress?.province?.name;
        return homeNo + '\t' + streetNo + '\t' + pobVillage + '\t' + pobCommune + '\t' + pobDistrict + '\t' + pobProvince;
    }

}



function getFatherPob(item: any) {
    const { isTextAddress } = item;
    if (isTextAddress) {
        return AddMoreSpaceToStringAddress(item?.foreignerFatherBirthAddress)
    } else {
        // const pobVillage = item?.fatherBirthAddress?.village?.geo_prefix?.name ? item?.fatherBirthAddress?.village?.geo_prefix?.name : 'ភូមិ' + item.fatherBirthAddress?.village?.name;
        // const pobCommune = item?.fatherBirthAddress?.commune?.geo_prefix?.name ? item?.fatherBirthAddress?.commune?.geo_prefix?.name : 'ឃុំ' + item.fatherBirthAddress?.commune?.name;
        const pobDistrict = item?.fatherBirthAddress?.district?.geo_prefix?.name ? item?.fatherBirthAddress?.district?.geo_prefix?.name : 'ស្រុក' + item.fatherBirthAddress?.district?.name;
        const pobProvince = item?.fatherBirthAddress?.province?.geo_prefix?.name ? item?.fatherBirthAddress?.province?.geo_prefix?.name : 'ខេត្ត' + item.fatherBirthAddress?.province?.name;
        return pobDistrict + '\t' + pobProvince;
    }

}

function getMotherPob(item: any) {
    const { isTextAddress } = item;
    if (isTextAddress) {
        return AddMoreSpaceToStringAddress(item?.foreignerMotherBirthAddress)
    } else {
        // const pobVillage = item?.motherBirthAddress?.village?.geo_prefix?.name ? item?.motherBirthAddress?.village?.geo_prefix?.name : 'ភូមិ' + item.motherBirthAddress?.village?.name;
        // const pobCommune = item?.motherBirthAddress?.commune?.geo_prefix?.name ? item?.motherBirthAddress?.commune?.geo_prefix?.name : 'ឃុំ' + item.motherBirthAddress?.commune?.name;
        const pobDistrict = item?.motherBirthAddress?.district?.geo_prefix?.name ? item?.motherBirthAddress?.district?.geo_prefix?.name : 'ស្រុក' + item.motherBirthAddress?.district?.name;
        const pobProvince = item?.motherBirthAddress?.province?.geo_prefix?.name ? item?.motherBirthAddress?.province?.geo_prefix?.name : 'ខេត្ត' + item.motherBirthAddress?.province?.name;
        return pobDistrict + '\t' + pobProvince;
    }

}

function AddMoreSpaceToStringAddress(str: string) {
    if (!str) return;
    var arr = str?.replace(/​/g, "").split(" ")
    if (Array.isArray(arr) && arr.length > 0) {
        const newString = arr?.map(i => (i)).join("\t")
        return toKhmerNumber(newString)
    }

}


function removeSpaceSpecialCharacter(str: string) {
    if(!str) return null
    return str?.replace(/​/g, "");
}
