const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    let host = req.protocol === 'https' ? 'wss://' + req.get('host') : 'ws://' + req.get('host');
    // console.log()
    res.render('index', {view: 'index', host: host, prompt: req.query.prompt ? req.query.prompt : 0})
})

module.exports = router;
