const express = require('express');
const router = express.Router();
const socket_timeout = process.env.SOCKET_TIMEOUT * 1000; // 10 mins
router.get('/', function(req, res){
    let host = req.protocol === 'https' ? 'wss://' + req.get('host') : 'ws://' + req.get('host');
    res.render('index', {view: 'index', host: host, keyword: req.query.keyword, socket_timeout: socket_timeout})
})

module.exports = router;
