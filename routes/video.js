const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
// const key = require('./service-account-key.json');
const key = './service-account-key.json';

// Create an OAuth2 client with the given credentials
const auth = new google.auth.GoogleAuth({
  keyFile: key,
  scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
});

// Obtain an OAuth2 client, which can be used to make API requests


async function search(q, cb){
    await auth.getClient()
    .then( async (client)=>{
    await google.youtube('v3').search.list({
        auth: client,
        part: 'snippet',
        q: q,
        maxResults: 25
    })
    .then((response)=>{
        if(typeof cb === 'function') cb(response);
    })
    });
}
async function fetch(id, cb){
    const client = await auth.getClient();
    const response = await google.youtube('v3').videos.list({
        auth: client,
        part: 'snippet,contentDetails',
        id: id
    });
    if(typeof cb === 'function') cb(response);
}

module.exports = function(list){
    // Use the client to make API requests
    router.get('/search', function(req, res){
        let keyword = req.query.q;
        if(!keyword) {
            let r = {
                'status': 'error',
                'body': 'q is not specified'
            }
            res.send(JSON.stringify(r))
        }else {
            search(keyword, function(response){
                res.send(JSON.stringify(response.data))
            });
        }
    })
    router.get('/fetch', function(req, res){
        let id = req.query.id;
        if(!id) {
            let r = {
                'status': 'error',
                'type': 'fetch-res',
                'body': 'id is not specified'
            }
            res.send(JSON.stringify(r));
        }else {
            fetch(id, function(response){
                res.send(JSON.stringify(response.data))
            });
        }
    })
    router.get('/list', function(req, res){
        let r = {
            'status': 'success',
            'type': 'list-res',
            'body': list
        }
        res.send(JSON.stringify(r));
    })
    return router;
};