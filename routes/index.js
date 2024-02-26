const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    let host = req.protocol === 'https' ? 'wss://' + req.get('host') : 'ws://' + req.get('host');
    // console.log()
    res.render('index', {view: 'index', host: host, keyword: req.query.keyword})
})

module.exports = router;
