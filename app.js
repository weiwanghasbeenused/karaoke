const express = require('express')
const app = express()
require('dotenv').config()
const server = require('http').createServer(app)
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server: server })

wss.on('connection', function connection(ws) {
    console.log('A new client connected')
    ws.on('message', function incoming(message, isBinary){
        console.log('received: %s', message);
        ws.send('Got your message: ' + message);
        wss.clients.forEach(function each(client){
            if(client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message, {binary:isBinary});
            }
        })
    })
})
app.set('view engine', 'pug')
app.use(express.static(__dirname + "/public"));
const indexRouter = require('./routes/index')
const playerRouter = require('./routes/player')

app.enable('trust proxy');

app.use('/', indexRouter);
app.use('/player', playerRouter);

server.listen(3000, () => console.log('Listening to port 3000'))
