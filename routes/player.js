const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    let host = 'ws://' + req.get('host');
    res.render('player', {host: host, YOUTUBE_API_KEY: process.env['YOUTUBE_API_KEY'], YOUTUBE_CLIENT_ID: process.env['YOUTUBE_CLIENT_ID']})
})

module.exports = router;