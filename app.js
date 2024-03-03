const express = require('express')
const app = express()
require('dotenv').config()
const server = require('http').createServer(app)
const WebSocket = require('ws');
// const url = require('url');
const wss = new WebSocket.Server({ server: server })
const port = process.env.PORT;
const bookers = new Map();
const players = new Map();
const list = [];
const SOCKET_TIMEOUT = process.env.SOCKET_TIMEOUT * 1000; // 10 mins
// const begin = false;

wss.on('connection', function connection(ws, request, client) {
    // let body = 'You are connected.';
    // let welcome_msg = {
    //     'type': 'welcome',
    //     'body': body
    // };
    // ws.send(JSON.stringify(welcome_msg));
    ws.on('message', function incoming(message, isBinary){
        let data = JSON.parse(message);
        if(data.type === 'register') {
            let client_id = Date.now();
            let response = {
                'type': 'register-res',
                'status': 'success',
                'body': ''
            };
            if(data.body === '/player') {
                console.log('A new player connected');
                let code = '';
                for(let i = 0; i < 4; i++) {
                    code += parseInt(10 * Math.random());
                }
                players.set(client_id, ws);
                response['body'] = code;
                ws.send(JSON.stringify(response));

                // keep players alive
                let timer = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                      // Check if the connection is still open
                      // If the connection is idle for too long, close it
                      ws.terminate();
                    }
                }, SOCKET_TIMEOUT);
process.env.SOCKET_TIMEOUT * 1000          
                ws.on('close', () => {
                    // Clear the interval when the connection is closed
                    clearInterval(timer);
                });

            }
            else if(data.body === '/') {
                console.log('A new user connected')
                bookers.set(client_id, ws);
                response['body'] += 'you\'re registered as booker ('+client_id+').';
                ws.send(JSON.stringify(response));
            }
            else {
                console.log('failed attempt to connect')
                response['status'] = 'error';
                response['body'] = 'fail to register: known path.'
                ws.send(JSON.stringify(response));
            }
        } else if(data.type === 'book-res') {
            let c_id = data.body;
            bookers[c_id].send(message, {binary:isBinary});
        } else if(data.type === 'book-req') {
            list.push(data.body);
            players.forEach(function(p, key){
                if(p.readyState === WebSocket.OPEN) {
                    p.send(message, {binary:isBinary});
                }
            });
        }
    })
})
app.set('view engine', 'pug')
app.use(express.static(__dirname + "/public"));
const indexRouter = require('./routes/index')
const playerRouter = require('./routes/player')
const videoRouter = require('./routes/video')(list);

app.enable('trust proxy');

app.use('/', indexRouter);
app.use('/player', playerRouter);
app.use('/video', videoRouter);

server.listen(port, () => console.log('Listening to port ' + port))
