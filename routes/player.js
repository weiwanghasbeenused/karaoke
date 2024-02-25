const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    let host = req.protocol === 'https' ? 'wss://' + req.get('host') : 'ws://' + req.get('host');
    res.render('player', {view: 'player',host: host})
})

module.exports = router;