const express = require('express')
const app = express()
require('dotenv').config()
const server = require('http').createServer(app)
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: server })
const port = process.env.PORT;

wss.on('connection', function connection(ws) {
    console.log('A new client connected')
    ws.on('message', function incoming(message, isBinary){
        // console.log('received: %s', message);
        let ws_res = {
            'type': 'status',
            'body': 1
        };
        let message_json = JSON.parse(message);
        ws.send(JSON.stringify(ws_res));
        if(message_json.type === 'book') {
            wss.clients.forEach(function each(client){
                if(client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message, {binary:isBinary});
                }
            })
        }
    })
})
app.set('view engine', 'pug')
app.use(express.static(__dirname + "/public"));
const indexRouter = require('./routes/index')
const playerRouter = require('./routes/player')

app.enable('trust proxy');

app.use('/', indexRouter);
app.use('/player', playerRouter);

server.listen(port, () => console.log('Listening to port ' + port))
