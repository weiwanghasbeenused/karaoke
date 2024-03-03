const express = require('express');
const router = express.Router();
const socket_timeout = process.env.SOCKET_TIMEOUT ? process.env.SOCKET_TIMEOUT * 1000 : 60000;
router.get('/', function(req, res){
    let host = req.protocol === 'https' ? 'wss://' + req.get('host') : 'ws://' + req.get('host');
    res.render('player', {view: 'player',host: host, socket_timeout: socket_timeout})
})

module.exports = router;