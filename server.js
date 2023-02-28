const bodyParser = require('body-parser')
const express = require('express')
const request = require('request')
const http = require('http')
const fs = require('fs')

const SIGNATURE = 'D04C0455223E30A43C3B5CDFC4C0ED14'

const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(process.env.PORT || 3000, ()=>{
    console.log("Listening on port 3000...")
})

let mTempAllProxy = {}
let mTempAllProxy2 = {}
let mAllProxy = {}
let mTempProxy = {}
let mProxy = {}
let mTime = 0
let mCompleted = 0
let SERVER = 1
let TOKEN = null

const URL = 'https://server-9099-default-rtdb.firebaseio.com/public/proxy'

const country = [
    { code: 'AD', name: 'Andorra' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AI', name: 'Anguilla' },
    { code: 'AL', name: 'Albania' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AO', name: 'Angola' },
    { code: 'AP', name: 'Asia/Pacific Region' },
    { code: 'AQ', name: 'Antarctica' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AS', name: 'American Samoa' },
    { code: 'AT', name: 'Austria' },
    { code: 'AU', name: 'Australia' },
    { code: 'AW', name: 'Aruba' },
    { code: 'AX', name: 'Aland Islands' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BI', name: 'Burundi' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BL', name: 'Saint Barthelemy' },
    { code: 'BM', name: 'Bermuda' },
    { code: 'BN', name: 'Brunei Darussalam' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BQ', name: 'Bonaire, Saint Eustatius and Saba' },
    { code: 'BR', name: 'Brazil' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BV', name: 'Bouvet Island' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BZ', name: 'Belize' },
    { code: 'CA', name: 'Canada' },
    { code: 'CC', name: 'Cocos (Keeling) Islands' },
    { code: 'CD', name: 'Congo, The Democratic Republic of the' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'CG', name: 'Congo' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'CI', name: 'Cote d\'Ivoire' },
    { code: 'CK', name: 'Cook Islands' },
    { code: 'CL', name: 'Chile' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CV', name: 'Cape Verde' },
    { code: 'CW', name: 'Curacao' },
    { code: 'CX', name: 'Christmas Island' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DE', name: 'Germany' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EE', name: 'Estonia' },
    { code: 'EG', name: 'Egypt' },
    { code: 'EH', name: 'Western Sahara' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'ES', name: 'Spain' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'EU', name: 'Europe' },
    { code: 'FI', name: 'Finland' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'FK', name: 'Falkland Islands (Malvinas)' },
    { code: 'FM', name: 'Micronesia, Federated States of' },
    { code: 'FO', name: 'Faroe Islands' },
    { code: 'FR', name: 'France' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GE', name: 'Georgia' },
    { code: 'GF', name: 'French Guiana' },
    { code: 'GG', name: 'Guernsey' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GI', name: 'Gibraltar' },
    { code: 'GL', name: 'Greenland' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GP', name: 'Guadeloupe' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'GR', name: 'Greece' },
    { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GU', name: 'Guam' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'HM', name: 'Heard Island and McDonald Islands' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HR', name: 'Croatia' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HU', name: 'Hungary' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IL', name: 'Israel' },
    { code: 'IM', name: 'Isle of Man' },
    { code: 'IN', name: 'India' },
    { code: 'IO', name: 'British Indian Ocean Territory' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IR', name: 'Iran, Islamic Republic of' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IT', name: 'Italy' },
    { code: 'JE', name: 'Jersey' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JO', name: 'Jordan' },
    { code: 'JP', name: 'Japan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KM', name: 'Comoros' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'KP', name: 'Korea, Democratic People\'s Republic of' },
    { code: 'KR', name: 'Korea, Republic of' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KY', name: 'Cayman Islands' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'LA', name: 'Lao People\'s Democratic Republic' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LY', name: 'Libyan Arab Jamahiriya' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MD', name: 'Moldova, Republic of' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MF', name: 'Saint Martin' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'MK', name: 'Macedonia' },
    { code: 'ML', name: 'Mali' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'MO', name: 'Macao' },
    { code: 'MP', name: 'Northern Mariana Islands' },
    { code: 'MQ', name: 'Martinique' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MS', name: 'Montserrat' },
    { code: 'MT', name: 'Malta' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'MV', name: 'Maldives' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MX', name: 'Mexico' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NC', name: 'New Caledonia' },
    { code: 'NE', name: 'Niger' },
    { code: 'NF', name: 'Norfolk Island' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NO', name: 'Norway' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NU', name: 'Niue' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'OM', name: 'Oman' },
    { code: 'PA', name: 'Panama' },
    { code: 'PE', name: 'Peru' },
    { code: 'PF', name: 'French Polynesia' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PL', name: 'Poland' },
    { code: 'PM', name: 'Saint Pierre and Miquelon' },
    { code: 'PN', name: 'Pitcairn' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'PS', name: 'Palestinian Territory' },
    { code: 'PT', name: 'Portugal' },
    { code: 'PW', name: 'Palau' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RE', name: 'Reunion' },
    { code: 'RO', name: 'Romania' },
    { code: 'RS', name: 'Serbia' },
    { code: 'RU', name: 'Russian Federation' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SE', name: 'Sweden' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SH', name: 'Saint Helena' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SJ', name: 'Svalbard and Jan Mayen' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SM', name: 'San Marino' },
    { code: 'SN', name: 'Senegal' },
    { code: 'SO', name: 'Somalia' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SS', name: 'South Sudan' },
    { code: 'ST', name: 'Sao Tome and Principe' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'SX', name: 'Sint Maarten' },
    { code: 'SY', name: 'Syrian Arab Republic' },
    { code: 'SZ', name: 'Swaziland' },
    { code: 'TC', name: 'Turks and Caicos Islands' },
    { code: 'TD', name: 'Chad' },
    { code: 'TF', name: 'French Southern Territories' },
    { code: 'TG', name: 'Togo' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TK', name: 'Tokelau' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'TZ', name: 'Tanzania, United Republic of' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'UG', name: 'Uganda' },
    { code: 'UM', name: 'United States Minor Outlying Islands' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VA', name: 'Holy See (Vatican City State)' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VG', name: 'Virgin Islands, British' },
    { code: 'VI', name: 'Virgin Islands, U.S.' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'WF', name: 'Wallis and Futuna' },
    { code: 'WS', name: 'Samoa' },
    { code: 'YE', name: 'Yemen' },
    { code: 'YT', name: 'Mayotte' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' }
]


collectProxy()

setInterval(() => {
    collectProxy()
}, 10*60*1000)


function getCountryCode(name) {
    for (var i = 0; i < country.length; i++) {
        if(country[i]['name'] == name) {
            return country[i]['code']
        }
    }

    for (var i = 0; i < country.length; i++) {
        if(country[i]['name'].includes(name)) {
            return country[i]['code']
        }
    }
    return ''
}

function collectProxy() {
    request({
        url: URL+'/config.json',
        method: 'GET',
        json: true
    }, function (error, response, body) {
        if(!error) {
            try {
                if(body == null) {
                    SERVER = 1
                    updateProxy(0)
                } else {
                    if (body.server != null) {
                        SERVER = parseInt(body.server)
                    } else {
                        SERVER = 1
                    }
                    if (body.token != null) {
                        TOKEN = body.token[getSetver(SERVER)]
                    } else {
                        TOKEN = null
                    }
                    if (body.ip != null) {
                        mProxy = body.ip
                    }
                    if (body.update != null) {
                        updateProxy(parseInt(body.update))
                    } else {
                        updateProxy(0)
                    }
                }
            } catch (e) {
                SERVER = 1
                updateProxy(0)
            }
        }
    })
}

function updateProxy(time) {
    mTempAllProxy = {}
    mTempAllProxy2 = {}
    mTempProxy = {}

    mTime = time

    if(time < new Date().getTime()) {
        collectProxy1()
    } else {
        request({
            url: URL+'/ip.json',
            method: 'GET',
            json: true
        }, function (error, response, body) {
            if(!error && body) {
                for (let i = 0; i < Object.entries(body).length; i++) {
                    try {
                        for(let [key, value] of Object.entries(body[i])) {
                            mTempAllProxy[key] = value
                        }
                    } catch (e) {}
                }

                collectProxy3()
                mAllProxy = mTempAllProxy
                
                request({
                    url: URL+'/webshare.json',
                    method: 'GET',
                    json: true
                }, function (error, response, body) {
                    try {
                        for(let [key, value] of Object.entries(body)) {
                            mTempProxy[key] = value
                        }
                    } catch (e) {}
                    
                    checkProxy(0)
                })
            }
        })
    }
}

function collectProxy1() {
    if(TOKEN) {
        request({
            url: 'https://proxy.webshare.io/api/v2/proxy/list/?mode=direct',
            headers: {
                'authorization': 'Token '+TOKEN
            },
            json: true
        }, function (error, response, body) {
            try {
                let list = body.results
                for (let i = 0; i < list.length; i++) {
                    let ip = list[i].proxy_address.replace(/\./g, '_')
                    mTempProxy[ip] = list[i].port+'@'+list[i].username+':'+list[i].password+'@'+list[i].country_code+'@1'
                }
            } catch (e) {}

            updateData('webshare', mTempProxy)

            collectProxy2()
        })
    } else {
        collectProxy2()
    }
}

function collectProxy2() {
    request({
        url: 'https://free-proxy-list.net/',
        method: 'GET'
    }, function (error, response, body) {
        try {
            let start = body.indexOf('<tbody>')
            let end = body.indexOf('</tbody>')
            let table = body.substring(start+7, end).split('</tr>')
            for (let i = 0; i<table.length-1; i++) {
                try {
                    let row = table[i].split('</td>')
                    let ip = row[0].replace('<tr>','').replace('<td>','')
                    let port = row[1].replace('<tr>','').replace('<td>','')
                    let name = row[2].replace('<tr>','').replace('<td>','')
                    mTempAllProxy[ip.replace(/\./g, '_')] = port+'@@'+name+'@3'
                } catch (e) {}
            }
        } catch (error) {}

        request({
            url: 'https://us-proxy.org/',
            method: 'GET'
        }, function (error, response, body) {
            try {
                let start = body.indexOf('<tbody>')
                let end = body.indexOf('</tbody>')
                let table = body.substring(start+7, end).split('</tr>')
                for (let i = 0; i<table.length-1; i++) {
                    try {
                        let row = table[i].split('</td>')
                        let ip = row[0].replace('<tr>','').replace('<td>','')
                        let port = row[1].replace('<tr>','').replace('<td>','')
                        let name = row[2].replace('<tr>','').replace('<td>','')
                        mTempAllProxy[ip.replace(/\./g, '_')] = port+'@@'+name+'@3'
                    } catch (e) {}
                }
            } catch (error) {}

            request({
                url: 'https://sslproxies.org/',
                method: 'GET'
            }, function (error, response, body) {
                try {
                    let start = body.indexOf('<tbody>')
                    let end = body.indexOf('</tbody>')
                    let table = body.substring(start+7, end).split('</tr>')
                    for (let i = 0; i<table.length-1; i++) {
                        try {
                            let row = table[i].split('</td>')
                            let ip = row[0].replace('<tr>','').replace('<td>','')
                            let port = row[1].replace('<tr>','').replace('<td>','')
                            let name = row[2].replace('<tr>','').replace('<td>','')
                            mTempAllProxy[ip.replace(/\./g, '_')] = port+'@@'+name+'@3'
                        } catch (e) {}
                    }
                } catch (error) {}

                if(Object.keys(mTempAllProxy).length == 0) {
                    request({
                        url: URL+'/ip/1.json',
                        method: 'GET',
                        json: true
                    }, function (error, response, body) {
                        if(!error && body) {
                            for(let [key, value] of Object.entries(body)) {
                                mTempAllProxy[key] = value
                            }
                        }
                        collectProxy3()
                        collectProxy4(1)
                    })
                } else {
                    updateData('ip/1', mTempAllProxy)
                    console.log('Upload ip-1')
                    collectProxy3()
                    collectProxy4(1)
                }
            })
        })
    })
}

function collectProxy3() {
    mTempAllProxy['176_113_73_104'] = '3128@@@4'
    mTempAllProxy['176_113_73_99'] = '3128@@@4'
    mTempAllProxy['67_205_190_164'] = '8080@@@4'
    mTempAllProxy['46_21_153_16'] = '3128@@@4'
    mTempAllProxy['84_17_35_129'] = '3128@@@4'
    mTempAllProxy['104_248_59_38'] = '80@@@4'
    mTempAllProxy['12_156_45_155'] = '3128@@@4'
    mTempAllProxy['176_113_73_102'] = '3128@@@4'
    mTempAllProxy['141_11_250_80'] = '80@@@4'
    mTempAllProxy['173_82_71_130'] = '1994@@@4'
    mTempAllProxy['162_144_236_128'] = '80@@@4'
    mTempAllProxy['174_108_200_2'] = '8080@@@4'
    mTempAllProxy['208_109_32_60'] = '81@@@4'
    mTempAllProxy['3_234_140_61'] = '9999@@@4'
    mTempAllProxy['149_28_218_51'] = '80@@@4'
    mTempAllProxy['193_122_197_154'] = '80@@@4'
    mTempAllProxy['3_13_80_246'] = '8989@@@4'
    mTempAllProxy['142_11_222_22'] = '80@@@4'
    mTempAllProxy['143_198_2_220'] = '8080@@@4'
    mTempAllProxy['104_194_224_204'] = '1994@@@4'
    mTempAllProxy['63_40_237_21'] = '80@@@4'
    mTempAllProxy['167_99_124_118'] = '80@@@4'
    mTempAllProxy['128_14_27_145'] = '80@@@4'
    mTempAllProxy['71_14_23_121'] = '8080@@@4'
    mTempAllProxy['128_14_27_138'] = '80@@@4'
    mTempAllProxy['173_82_43_108'] = '1994@@@4'
    mTempAllProxy['161_35_235_149'] = '3128@@@4'
    mTempAllProxy['192_227_194_54'] = '3128@@@4'
    mTempAllProxy['100_42_69_66'] = '1994@@@4'
    mTempAllProxy['24_51_32_59'] = '8080@@@4'
    mTempAllProxy['75_101_218_120'] = '80@@@4'
    mTempAllProxy['45_86_209_108'] = '3128@@@4'
    mTempAllProxy['198_211_55_167'] = '1994@@@4'
    mTempAllProxy['170_178_193_106'] = '1994@@@4'
    mTempAllProxy['162_240_75_37'] = '80@@@4'
    mTempAllProxy['23_239_10_61'] = '3128@@@4'
    mTempAllProxy['45_35_13_169'] = '8080@@@4'
    mTempAllProxy['191_101_1_116'] = '80@@@4'
    mTempAllProxy['45_79_17_203'] = '80@@@4'
    mTempAllProxy['12_218_209_130'] = '53281@@@4'
    mTempAllProxy['173_82_74_215'] = '1994@@@4'
    mTempAllProxy['192_236_160_186'] = '80@@@4'
    mTempAllProxy['192_227_166_144'] = '1994@@@4'
    mTempAllProxy['54_210_239_35'] = '80@@@4'
    mTempAllProxy['34_75_202_63'] = '80@@@4'
    mTempAllProxy['174_73_158_152'] = '3129@@@4'
    mTempAllProxy['54_162_154_65'] = '5000@@@4'
    mTempAllProxy['108_166_223_185'] = '1994@@@4'
    mTempAllProxy['132_145_212_19'] = '3128@@@4'
    mTempAllProxy['68_178_161_107'] = '80@@@4'
    mTempAllProxy['104_236_78_102'] = '3128@@@4'
    mTempAllProxy['168_235_69_34'] = '80@@@4'
    mTempAllProxy['104_194_232_179'] = '1994@@@4'
    mTempAllProxy['44_159_12_58'] = '8080@@@4'
    mTempAllProxy['45_72_110_156'] = '8118@@@4'
    mTempAllProxy['208_70_77_222'] = '1994@@@4'
    mTempAllProxy['37_120_222_132'] = '3128@@@4'
    mTempAllProxy['89_249_65_191'] = '3128@@@4'
    mTempAllProxy['144_91_118_176'] = '3128@@@4'
    mTempAllProxy['85_214_94_28'] = '3128@@@4'
    mTempAllProxy['167_172_109_12'] = '39452@@@4'
    mTempAllProxy['95_111_226_235'] = '3128@@@4'
    mTempAllProxy['167_172_109_12'] = '40825@@@4'
    mTempAllProxy['185_189_112_157'] = '3128@@@4'
    mTempAllProxy['185_189_112_133'] = '3128@@@4'
    mTempAllProxy['85_214_244_174'] = '3128@@@4'
    mTempAllProxy['167_172_109_12'] = '41491@@@4'
    mTempAllProxy['167_172_109_12'] = '39533@@@4'
    mTempAllProxy['167_172_109_12'] = '46249@@@4'
    mTempAllProxy['88_99_10_252'] = '1080@@@4'
    mTempAllProxy['167_172_109_12'] = '37355@@@4'
    mTempAllProxy['194_163_45_239'] = '3128@@@4'
    mTempAllProxy['148_251_110_147'] = '3128@@@4'
    mTempAllProxy['82_165_105_48'] = '80@@@4'
    mTempAllProxy['94_130_65_231'] = '4444@@@4'
    mTempAllProxy['185_33_181_41'] = '80@@@4'
    mTempAllProxy['176_9_248_241'] = '80@@@4'
    mTempAllProxy['185_211_6_165'] = '10000@@@4'
    mTempAllProxy['5_189_166_169'] = '22@@@4'
    mTempAllProxy['213_133_102_103'] = '80@@@4'
    mTempAllProxy['164_90_223_67'] = '8088@@@4'
    mTempAllProxy['144_91_88_27'] = '3128@@@4'
    mTempAllProxy['88_198_125_157'] = '3128@@@4'
    mTempAllProxy['138_201_243_84'] = '8080@@@4'
    mTempAllProxy['144_76_75_25'] = '4444@@@4'
    mTempAllProxy['94_130_72_244'] = '3128@@@4'
    mTempAllProxy['116_203_252_129'] = '8080@@@4'
    mTempAllProxy['88_150_15_30'] = '80@@@4'
    mTempAllProxy['116_203_254_38'] = '80@@@4'
    mTempAllProxy['207_180_250_238'] = '80@@@4'
    mTempAllProxy['116_202_165_119'] = '3124@@@4'
    mTempAllProxy['138_201_111_171'] = '8080@@@4'
    mTempAllProxy['82_165_184_53'] = '80@@@4'
    mTempAllProxy['5_189_146_57'] = '80@@@4'
    mTempAllProxy['195_201_231_22'] = '8080@@@4'
    mTempAllProxy['185_135_157_89'] = '8080@@@4'
    mTempAllProxy['161_97_133_233'] = '3128@@@4'
    mTempAllProxy['94_130_67_242'] = '80@@@4'
    mTempAllProxy['192_248_190_103'] = '3128@@@4'
    mTempAllProxy['82_165_21_59'] = '80@@@4'
    mTempAllProxy['65_109_84_104'] = '80@@@4'
    mTempAllProxy['195_201_216_194'] = '80@@@4'
    mTempAllProxy['89_58_39_225'] = '80@@@4'
    mTempAllProxy['51_158_68_133'] = '8811@@@4'
    mTempAllProxy['51_158_68_68'] = '8811@@@4'
    mTempAllProxy['159_8_114_37'] = '80@@@4'
    mTempAllProxy['35_180_188_216'] = '80@@@4'
    mTempAllProxy['51_158_172_165'] = '8811@@@4'
    mTempAllProxy['159_8_114_37'] = '8123@@@4'
    mTempAllProxy['89_44_9_172'] = '3128@@@4'
    mTempAllProxy['54_37_105_157'] = '8080@@@4'
    mTempAllProxy['146_59_14_159'] = '80@@@4'
    mTempAllProxy['51_91_109_83'] = '80@@@4'
    mTempAllProxy['82_64_233_180'] = '80@@@4'
    mTempAllProxy['51_178_106_44'] = '3030@@@4'
    mTempAllProxy['37_187_20_166'] = '3128@@@4'
    mTempAllProxy['176_168_127_74'] = '80@@@4'
    mTempAllProxy['149_202_83_204'] = '7080@@@4'
    mTempAllProxy['135_125_216_93'] = '80@@@4'
    mTempAllProxy['82_66_172_182'] = '80@@@4'
    mTempAllProxy['82_210_8_173'] = '80@@@4'
    mTempAllProxy['164_132_170_100'] = '80@@@4'
    mTempAllProxy['80_74_77_48'] = '80@@@4'
    mTempAllProxy['51_159_28_20'] = '8000@@@4'
    mTempAllProxy['212_83_135_130'] = '8090@@@4'
    mTempAllProxy['13_229_107_106'] = '80@@@4'
    mTempAllProxy['13_229_47_109'] = '80@@@4'
    mTempAllProxy['119_81_71_27'] = '80@@@4'
    mTempAllProxy['119_81_71_27'] = '8123@@@4'
    mTempAllProxy['193_56_255_179'] = '3128@@@4'
    mTempAllProxy['139_180_140_254'] = '1080@@@4'
    mTempAllProxy['104_248_146_99'] = '3128@@@4'
    mTempAllProxy['18_141_177_23'] = '80@@@4'
    mTempAllProxy['193_56_255_181'] = '3128@@@4'
    mTempAllProxy['188_166_252_135'] = '8080@@@4'
    mTempAllProxy['178_128_219_124'] = '8080@@@4'
    mTempAllProxy['13_76_171_61'] = '3128@@@4'
    mTempAllProxy['172_104_40_124'] = '3128@@@4'
    mTempAllProxy['206_189_146_13'] = '8080@@@4'
    mTempAllProxy['47_241_122_19'] = '80@@@4'
    mTempAllProxy['68_183_185_62'] = '80@@@4'
    mTempAllProxy['209_97_171_82'] = '8080@@@4'
    mTempAllProxy['3_1_18_166'] = '3128@@@4'
    mTempAllProxy['206_189_130_107'] = '8080@@@4'
    mTempAllProxy['15_207_196_77'] = '3128@@@4'
    mTempAllProxy['13_71_80_224'] = '80@@@4'
    mTempAllProxy['103_47_67_154'] = '8080@@@4'
    mTempAllProxy['202_91_70_202'] = '84@@@4'
    mTempAllProxy['43_205_181_141'] = '3128@@@4'
    mTempAllProxy['103_141_247_6'] = '8080@@@4'
    mTempAllProxy['115_247_146_65'] = '8080@@@4'
    mTempAllProxy['115_240_163_31'] = '80@@@4'
    mTempAllProxy['122_166_206_148'] = '3127@@@4'
    mTempAllProxy['103_51_21_250'] = '83@@@4'
    mTempAllProxy['103_248_120_5'] = '8080@@@4'
    mTempAllProxy['182_72_234_138'] = '3127@@@4'
    mTempAllProxy['103_168_164_26'] = '83@@@4'
    mTempAllProxy['182_70_117_107'] = '83@@@4'
    mTempAllProxy['103_83_146_54'] = '8080@@@4'
    mTempAllProxy['222_129_38_21'] = '57114@@@4'
    mTempAllProxy['106_45_221_168'] = '3256@@@4'
    mTempAllProxy['113_121_240_114'] = '3256@@@4'
    mTempAllProxy['121_206_205_75'] = '4216@@@4'
    mTempAllProxy['115_221_242_131'] = '9999@@@4'
    mTempAllProxy['125_87_82_86'] = '3256@@@4'
    mTempAllProxy['183_164_254_8'] = '4216@@@4'
    mTempAllProxy['116_242_89_230'] = '3128@@@4'
    mTempAllProxy['119_84_215_127'] = '3256@@@4'
    mTempAllProxy['113_195_224_222'] = '9999@@@4'
    mTempAllProxy['112_98_218_73'] = '57658@@@4'
    mTempAllProxy['223_113_89_138'] = '1080@@@4'
    mTempAllProxy['36_7_252_165'] = '3256@@@4'
    mTempAllProxy['113_100_209_184'] = '3128@@@4'
    mTempAllProxy['111_40_62_176'] = '9091@@@4'
    mTempAllProxy['124_220_168_140'] = '3128@@@4'
    mTempAllProxy['79_122_230_20'] = '8080@@@4'
    mTempAllProxy['213_59_156_119'] = '3128@@@4'
    mTempAllProxy['80_244_236_205'] = '1256@@@4'
    mTempAllProxy['87_76_1_69'] = '8080@@@4'
    mTempAllProxy['178_218_88_12'] = '8123@@@4'
    mTempAllProxy['213_87_106_117'] = '3128@@@4'
    mTempAllProxy['91_143_175_57'] = '8080@@@4'
    mTempAllProxy['188_235_0_207'] = '8282@@@4'
    mTempAllProxy['94_73_239_124'] = '55443@@@4'
    mTempAllProxy['87_255_6_218'] = '8080@@@4'
    mTempAllProxy['213_171_63_210'] = '41890@@@4'
    mTempAllProxy['194_186_35_70'] = '3128@@@4'
    mTempAllProxy['195_3_245_193'] = '3128@@@4'
    mTempAllProxy['77_236_236_85'] = '8080@@@4'
    mTempAllProxy['95_154_76_20'] = '3128@@@4'
    mTempAllProxy['79_111_13_155'] = '50625@@@4'
    mTempAllProxy['190_60_28_31'] = '80@@@4'
    mTempAllProxy['190_7_112_12'] = '3130@@@4'
    mTempAllProxy['200_25_254_193'] = '54240@@@4'
    mTempAllProxy['191_102_68_105'] = '999@@@4'
    mTempAllProxy['191_102_74_138'] = '999@@@4'
    mTempAllProxy['45_173_6_5'] = '999@@@4'
    mTempAllProxy['181_205_132_98'] = '999@@@4'
    mTempAllProxy['181_143_224_43'] = '999@@@4'
    mTempAllProxy['181_129_208_27'] = '999@@@4'
    mTempAllProxy['191_102_90_116'] = '999@@@4'
    mTempAllProxy['177_93_36_50'] = '999@@@4'
    mTempAllProxy['190_90_79_106'] = '999@@@4'
    mTempAllProxy['181_78_8_215'] = '999@@@4'
    mTempAllProxy['190_145_171_198'] = '1994@@@4'
    mTempAllProxy['190_121_143_129'] = '999@@@4'
    mTempAllProxy['81_12_119_171'] = '8080@@@4'
    mTempAllProxy['217_172_122_14'] = '8080@@@4'
    mTempAllProxy['185_83_197_154'] = '8080@@@4'
    mTempAllProxy['188_136_154_38'] = '8080@@@4'
    mTempAllProxy['5_202_191_225'] = '8080@@@4'
    mTempAllProxy['5_202_103_100'] = '514@@@4'
    mTempAllProxy['217_66_200_154'] = '3128@@@4'
    mTempAllProxy['185_3_214_3'] = '80@@@4'
    mTempAllProxy['92_119_71_90'] = '8880@@@4'
    mTempAllProxy['109_201_9_100'] = '8080@@@4'
    mTempAllProxy['89_43_10_141'] = '80@@@4'
    mTempAllProxy['212_16_71_187'] = '80@@@4'
    mTempAllProxy['185_105_184_41'] = '443@@@4'
    mTempAllProxy['37_120_133_137'] = '3128@@@4'
    mTempAllProxy['84_17_51_235'] = '3128@@@4'
    mTempAllProxy['84_17_51_241'] = '3128@@@4'
    mTempAllProxy['84_17_51_240'] = '3128@@@4'
    mTempAllProxy['94_177_249_42'] = '3128@@@4'
    mTempAllProxy['178_128_172_154'] = '3128@@@4'
    mTempAllProxy['134_209_189_42'] = '80@@@4'
    mTempAllProxy['136_228_234_29'] = '8082@@@4'
    mTempAllProxy['136_228_234_4'] = '8009@@@4'
    mTempAllProxy['119_81_189_194'] = '80@@@4'
    mTempAllProxy['119_81_189_194'] = '8123@@@4'
    mTempAllProxy['193_239_86_249'] = '3128@@@4'
    mTempAllProxy['193_239_86_247'] = '3128@@@4'
    mTempAllProxy['193_239_86_248'] = '3128@@@4'
    mTempAllProxy['42_98_75_138'] = '80@@@4'
    mTempAllProxy['45_142_106_133'] = '80@@@4'
    mTempAllProxy['218_250_67_85'] = '80@@@4'
    mTempAllProxy['43_129_223_147'] = '38080@@@4'
    mTempAllProxy['185_123_101_174'] = '3128@@@4'
    mTempAllProxy['93_180_135_243'] = '3128@@@4'
    mTempAllProxy['92_119_59_118'] = '3128@@@4'
    mTempAllProxy['46_1_103_186'] = '10001@@@4'
    mTempAllProxy['176_33_14_34'] = '3127@@@4'
    mTempAllProxy['45_156_31_185'] = '9090@@@4'
    mTempAllProxy['176_236_85_246'] = '9090@@@4'
    mTempAllProxy['31_223_6_135'] = '9090@@@4'
    mTempAllProxy['188_166_30_17'] = '8888@@@4'
    mTempAllProxy['79_110_52_252'] = '3128@@@4'
    mTempAllProxy['94_100_18_111'] = '3128@@@4'
    mTempAllProxy['185_234_217_147'] = '39811@@@4'
    mTempAllProxy['13_81_217_201'] = '80@@@4'
    mTempAllProxy['188_166_56_246'] = '80@@@4'
    mTempAllProxy['20_71_241_197'] = '80@@@4'
    mTempAllProxy['180_183_97_16'] = '8080@@@4'
    mTempAllProxy['113_53_53_7'] = '8080@@@4'
    mTempAllProxy['14_207_18_198'] = '8080@@@4'
    mTempAllProxy['1_1_220_100'] = '8080@@@4'
    mTempAllProxy['14_207_166_225'] = '8080@@@4'
    mTempAllProxy['110_77_146_152'] = '8080@@@4'
    mTempAllProxy['101_109_48_185'] = '8080@@@4'
    mTempAllProxy['159_89_113_155'] = '8080@@@4'
    mTempAllProxy['159_203_13_121'] = '80@@@4'
    mTempAllProxy['107_6_27_132'] = '80@@@4'
    mTempAllProxy['167_114_19_195'] = '8050@@@4'
    mTempAllProxy['66_85_30_138'] = '80@@@4'
    mTempAllProxy['204_83_205_117'] = '3128@@@4'
    mTempAllProxy['15_223_7_246'] = '3128@@@4'
    mTempAllProxy['161_202_226_194'] = '8123@@@4'
    mTempAllProxy['152_32_202_108'] = '80@@@4'
    mTempAllProxy['140_227_25_191'] = '23456@@@4'
    mTempAllProxy['128_22_123_175'] = '80@@@4'
    mTempAllProxy['138_2_55_182'] = '8080@@@4'
    mTempAllProxy['163_44_253_160'] = '80@@@4'
    mTempAllProxy['34_84_72_91'] = '3128@@@4'
    mTempAllProxy['45_70_198_37'] = '1994@@@4'
    mTempAllProxy['190_152_182_150'] = '41890@@@4'
    mTempAllProxy['45_229_87_233'] = '999@@@4'
    mTempAllProxy['45_70_236_194'] = '999@@@4'
    mTempAllProxy['177_234_209_118'] = '999@@@4'
    mTempAllProxy['157_100_53_110'] = '999@@@4'
    mTempAllProxy['154_236_177_117'] = '1981@@@4'
    mTempAllProxy['156_200_116_69'] = '1981@@@4'
    mTempAllProxy['196_204_24_251'] = '8080@@@4'
    mTempAllProxy['41_65_67_166'] = '1976@@@4'
    mTempAllProxy['217_52_247_87'] = '1976@@@4'
    mTempAllProxy['154_236_179_233'] = '1981@@@4'
    mTempAllProxy['38_41_0_91'] = '999@@@4'
    mTempAllProxy['45_234_61_6'] = '999@@@4'
    mTempAllProxy['190_97_255_37'] = '999@@@4'
    mTempAllProxy['38_41_4_118'] = '999@@@4'
    mTempAllProxy['181_191_226_1'] = '999@@@4'
    mTempAllProxy['190_108_82_106'] = '999@@@4'
    mTempAllProxy['131_255_137_94'] = '80@@@4'
    mTempAllProxy['190_43_232_159'] = '999@@@4'
    mTempAllProxy['200_123_27_162'] = '999@@@4'
    mTempAllProxy['45_174_87_18'] = '999@@@4'
    mTempAllProxy['187_190_249_113'] = '1994@@@4'
    mTempAllProxy['45_230_172_182'] = '8080@@@4'
    mTempAllProxy['45_188_166_50'] = '1994@@@4'
    mTempAllProxy['185_123_143_251'] = '3128@@@4'
    mTempAllProxy['185_123_143_247'] = '3128@@@4'
    mTempAllProxy['37_120_140_158'] = '3128@@@4'
    mTempAllProxy['118_99_108_4'] = '8080@@@4'
    mTempAllProxy['103_114_53_2'] = '8080@@@4'
    mTempAllProxy['182_253_109_100'] = '8080@@@4'
    mTempAllProxy['103_28_121_58'] = '3128@@@4'
    mTempAllProxy['103_28_121_58'] = '80@@@4'
    mTempAllProxy['103_119_95_2'] = '80@@@4'
    mTempAllProxy['138_0_123_233'] = '999@@@4'
    mTempAllProxy['181_212_41_172'] = '999@@@4'
    mTempAllProxy['200_54_194_13'] = '53281@@@4'
    mTempAllProxy['113_161_131_43'] = '80@@@4'
    mTempAllProxy['221_132_18_26'] = '8090@@@4'
    mTempAllProxy['113_160_37_152'] = '53281@@@4'
    mTempAllProxy['190_61_88_154'] = '999@@@4'
    mTempAllProxy['190_61_101_205'] = '8080@@@4'
    mTempAllProxy['190_61_88_147'] = '8080@@@4'
    mTempAllProxy['115_144_102_39'] = '10080@@@4'
    mTempAllProxy['59_26_24_127'] = '808@@@4'
    mTempAllProxy['115_144_101_200'] = '10000@@@4'
    mTempAllProxy['80_252_5_34'] = '7001@@@4'
    mTempAllProxy['194_31_53_250'] = '80@@@4'
    mTempAllProxy['83_238_80_10'] = '8081@@@4'
    mTempAllProxy['169_57_157_148'] = '80@@@4'
    mTempAllProxy['169_57_157_146'] = '8123@@@4'
    mTempAllProxy['185_236_202_205'] = '3128@@@4'
    mTempAllProxy['185_236_202_170'] = '3128@@@4'
    mTempAllProxy['185_74_6_248'] = '8080@@@4'
    mTempAllProxy['213_230_65_9'] = '3128@@@4'
    mTempAllProxy['85_117_56_147'] = '8080@@@4'
    mTempAllProxy['80_241_251_54'] = '8080@@@4'
    mTempAllProxy['82_223_102_92'] = '9443@@@4'
    mTempAllProxy['188_240_192_92'] = '8090@@@4'
    mTempAllProxy['134_195_242_1'] = '999@@@4'
    mTempAllProxy['184_95_3_146'] = '8888@@@4'
    mTempAllProxy['41_57_37_50'] = '8080@@@4'
    mTempAllProxy['105_19_63_217'] = '9812@@@4'
    mTempAllProxy['52_30_164_26'] = '80@@@4'
    mTempAllProxy['137_135_187_185'] = '80@@@4'
    mTempAllProxy['41_184_188_25'] = '8080@@@4'
    mTempAllProxy['41_203_83_242'] = '8080@@@4'
    mTempAllProxy['190_113_42_162'] = '999@@@4'
    mTempAllProxy['201_229_250_21'] = '8080@@@4'
    mTempAllProxy['91_215_137_155'] = '8080@@@4'
    mTempAllProxy['93_185_74_214'] = '8088@@@4'
    mTempAllProxy['95_216_17_79'] = '3888@@@4'
    mTempAllProxy['3_24_178_81'] = '80@@@4'
    mTempAllProxy['185_236_203_208'] = '3128@@@4'
    mTempAllProxy['193_34_95_110'] = '8080@@@4'
    mTempAllProxy['185_38_111_1'] = '8080@@@4'
    mTempAllProxy['95_170_219_13'] = '8080@@@4'
    mTempAllProxy['41_93_71_21'] = '80@@@4'
    mTempAllProxy['190_52_165_120'] = '8080@@@4'
    mTempAllProxy['103_69_2_137'] = '999@@@4'
    mTempAllProxy['200_85_169_18'] = '47548@@@4'
    mTempAllProxy['201_217_246_178'] = '8080@@@4'
    mTempAllProxy['41_204_87_90'] = '8080@@@4'
    mTempAllProxy['165_16_46_215'] = '8080@@@4'
    mTempAllProxy['194_169_167_5'] = '8080@@@4'
    mTempAllProxy['95_214_8_128'] = '3128@@@4'
    mTempAllProxy['197_248_184_158'] = '53281@@@4'
    mTempAllProxy['212_112_127_20'] = '8080@@@4'
    mTempAllProxy['217_165_94_240'] = '53281@@@4'
    mTempAllProxy['151_22_181_205'] = '8080@@@4'
    mTempAllProxy['179_49_117_17'] = '999@@@4'
    mTempAllProxy['197_243_20_178'] = '80@@@4'
    mTempAllProxy['1_171_143_153'] = '8080@@@4'
    mTempAllProxy['113_23_176_254'] = '8118@@@4'
    mTempAllProxy['213_6_17_251'] = '19000'
}

function collectProxy4(page) {
    if(page > 5) {
        if(page == 99) {
            request({
                url: URL+'/ip/2.json',
                method: 'GET',
                json: true
            }, function (error, response, body) {
                if(!error && body) {
                    for(let [key, value] of Object.entries(body)) {
                        mTempAllProxy[key] = value
                    }
                }
                setData('config/update', new Date().getTime()+(60*60*1000))
                checkProxy(0)
            })
        } else {
            mAllProxy = mTempAllProxy
            if(Object.keys(mAllProxy).length > 0) {
                setData('config/update', new Date().getTime()+(60*60*1000))
                updateData('ip/2', mTempAllProxy2)
                console.log('Upload ip-2')
                checkProxy(0)
            }
        }
    } else {
        request({
            url: 'http://free-proxy.cz/en/proxylist/country/all/https/ping/all/'+page,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8,zh-CN;q=0.7,zh;q=0.6',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Cookie': '__utmz=104525399.1675906414.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __gads=ID=f6042565e9628965-22d653bf94d900b9:T=1675906415:RT=1675906415:S=ALNI_MaBBpoRWru3egO-Lbx6xNxedU4e-w; fp=6e9a6dd0311936cf37c0444c15d7b8ff; __utmc=104525399; __utma=104525399.1728124974.1675906414.1675906414.1675944308.2; __utmb=104525399.1.10.1675944309; __gpi=UID=00000bbe821d60da:T=1675906415:RT=1675944310:S=ALNI_MZ5EkcLVcO1FppHbpHkh1WuAYMOGw',
                'Pragma': 'no-cache',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
            }
        }, function (error, response, body) {
            let size = 0
            try {
                let start = body.indexOf('<tbody>')
                let end = body.indexOf('</tbody>')
                let table = body.substring(start+7, end).split('</tr>')
                for (let i = 0; i<table.length-1; i++) {
                    try {
                        let row = table[i].split('</td>')
                        let temp = row[0].substring(row[0].indexOf('decode("')+8)
                        let ip = Buffer.from(temp.substring(0, temp.indexOf('"')), 'base64').toString('ascii')
                        temp = row[1].substring(row[1].indexOf('span'))
                        let port = temp.substring(temp.indexOf('>')+1, temp.indexOf('</span>'))
                        temp = row[3].substring(row[3].indexOf('<a'), row[3].indexOf('</a>'))
                        let name = temp.substring(temp.indexOf('>')+1)
                 
                        let ips = ip.replace(/\./g, '_')
                        mTempAllProxy[ips] = port+'@@'+getCountryCode(name)+'@2'
                        mTempAllProxy2[ips] = mTempAllProxy[ips]
                        size++
                    } catch (e) {}
                }
            } catch (error) {}

            if(size > 0) {
                collectProxy4(page+1)
            } else {
                collectProxy4(99)
            }
        })
    }
}


app.post('/proxy', async function (req, res) {
    if(req.body && req.body.data && req.body.data == SIGNATURE) {
        let proxy = []
        for(let [key, value] of Object.entries(mProxy)) {
            proxy.push(key.replace(/\_/g, '.')+':'+value)
        }
        res.end(JSON.stringify(proxy))
    } else {
        res.end('error')
    }
})

app.get('/status', async function (req, res) {
    let status = {
        tempAllSize: Object.keys(mTempAllProxy).length,
        allSize: Object.keys(mAllProxy).length,
        tempProxy: Object.keys(mTempProxy).length,
        proxy: Object.keys(mProxy).length,
        time: mTime,
        have: mTime - new Date().getTime(),
        success: mCompleted
    }
    res.end(JSON.stringify(status))
})

function checkProxy(loop) {
    
    let list = []

    for(let [key, value] of Object.entries(mAllProxy)) {
        list.push(key+'@'+value)
    }
    
    console.log(list.length)

    if(list.length > 0) {
        checkProxyLoop(loop, list)
    }
}

function checkProxyLoop(loop, list) {
    if(loop < list.length) {
        let length = list.length-loop>300 ? 300:list.length-loop
        let size = 0
        for(let i=loop; i<loop+length; i++) {
            try {
                let proxy = {
                    host: '',
                    port: 0,
                    name: '',
                    type: 0,
                    auth: ''
                }
    
                let split = list[i].split('@')
                proxy.host = split[0].replace(/_/g, '.')
                proxy.port = parseInt(split[1])
                if(split.length > 2 && split[2].length > 0) {
                    proxy.auth = split[2]
                }
    
                if(split.length > 3 && split[3].length > 0) {
                    proxy.name = split[3]
                }

                if(split.length > 4 && split[4].length > 0) {
                    proxy.type = split[4]
                }
            
                proxyCheck(proxy).then(res => {
                    mTempProxy[res.host.replace(/\./g, '_')] = res.port+'@'+res.auth+'@'+res.name+'@'+res.type
                    size++
                    if(size == length) {
                        checkProxyLoop(loop+300, list)
                    }
                }).catch(e => {
                    size++
                    if(size == length) {
                        checkProxyLoop(loop+300, list)
                    }
                })
            } catch (error) {} 
        }
    } else {
        mCompleted++
        mProxy = mTempProxy
        mProxy['185_135_157_89'] = '8080@@DE@2'
        
        if(Object.keys(mProxy).length > 20) {
            updateData('config/ip', mProxy)
        }
        console.log('Completed', Object.keys(mProxy).length)
    }
}

function setData(path, data) {
    request({
        url: URL+'/'+path+'.json',
        method: 'PUT',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: JSON.stringify(data)
    }, function (error, response, body) {})
}

function updateData(path, data) {
    request({
        url: URL+'/'+path+'.json',
        method: 'PUT',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: JSON.stringify(data)
    }, function (error, response, body) {})
}

function getSetver(id) {
    let zero = ''
    let loop = id.toString().length
    for(let i=0; i<2-loop; i++) {
        zero += '0'
    }
    return 'server_'+zero+id
}


function proxyCheck(proxy) {
    return new Promise((resolve, reject) => {

        const proxy_options = {
            method: 'CONNECT',
            path: 'www.google.com:443',
            timeout: 1000,
            agent: false
        }

        if (proxy.host) {
            proxy_options.host = proxy.host
        }

        if (proxy.port) {
            proxy_options.port = proxy.port
        }

        if (proxy.auth) {
            proxy_options.headers = {
                'Proxy-Authorization': 'Basic ' + Buffer.from(proxy.auth).toString('base64')
            }
        }

        const req = http.request(proxy_options)
        
        req.on('connect', res => {
            req.destroy()
            if (res.statusCode === 200) {
                return resolve(proxy)
            } else {
                return reject('Proxy offline')
            }
        })

        req.on('timeout', () => {
            req.destroy()
        })

        req.on('error', err => {
            return reject((err && err.code) || 'Proxy offline')
        })

        req.end()
    })
}
