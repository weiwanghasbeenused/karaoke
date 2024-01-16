const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    console.log(req.secure);
    let host = req.protocol === 'https' ? 'wss://' + req.get('host') : 'ws://' + req.get('host');
    res.render('index', {host: host})
})

module.exports = router;
