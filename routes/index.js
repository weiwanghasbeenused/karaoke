const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    let host = 'ws://' + req.get('host');
    res.render('index', {host: host})
})

module.exports = router;