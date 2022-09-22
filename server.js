const SocketServer = require('websocket').server
const express = require('express')
const https = require('https')
const http = require('http')

var app = express()

let start = new Date().toString()

const server = http.createServer(app)

server.listen(process.env.PORT || 3000, ()=>{
    console.log("Listening on port 3000...")
})

let wsServer = new SocketServer({httpServer:server})

wsServer.on('request', (req) => {
    let connection = req.accept()
    console.log('Request Accept')
    connection.on('message', (message) => {
        try {
            if(message.type === 'utf8') {
                console.log(message)
                connection.send()
            }
        } catch (e) {}
    })
    
    connection.on('close', function() {
    })
})

app.get('/', async function(req, res) {
    res.writeHeader(200, {"Content-Type": "text/html"})
    res.write(start+'\n'+new Date().toString())
    res.end()
})

