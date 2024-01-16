class KaraokePlayer{
    constructor(container){
        this.container = container;
        this.els = {}
        this.players = [];
        this.player_num = 1;
        this.player_ready_num = 0;
        this.isReady = false;
        this.queue = [];
        this.currentIdx = 0;
        this.gapi = null;
        this.init();
    }
    init(){
        this.renderElements();
        this.addListeners();
        this.loadAPI();
    }
    renderElements(){
        this.container.setAttribute('data-role', 'karaoke-container');
        this.els.dashboard = document.createElement('div');
        this.els.dashboard.id = 'karaoke-dashboard';
        this.els.dashboard.setAttribute('data-role', 'karaoke-dashboard');
        this.els.dashboard.setAttribute('data-visibility', 'visible');
        this.els.karaoke_controls_container = document.createElement('div');
        this.els.karaoke_controls_container.id = 'karaoke-controls-container';
        this.els.karaoke_controls_container.setAttribute('data-role', 'karaoke-controls-container');
        this.els.queue_container = document.createElement('div');
        this.els.queue_container.id = 'karaoke-queue-container';
        this.els.currentQueueItem = document.createElement('p');
        this.els.currentQueueItem.className = 'queue-item';
        this.els.currentQueueItem.id = 'current-queue-item';
        this.els.queue_container.appendChild(this.els.currentQueueItem);
        this.els.input = document.createElement('input');
        this.els.input.setAttribute('placeholder', 'Youtube URL . . .');
        this.els.submit = document.createElement('button');
        this.els.submit.innerText = '點歌';
        this.els.karaoke_controls_container.appendChild(this.els.input);
        this.els.karaoke_controls_container.appendChild(this.els.submit);

        // this.els.toggleDashboardButton = document.createElement('input');

        this.els.dashboard.appendChild(this.els.queue_container);
        this.els.dashboard.appendChild(this.els.karaoke_controls_container);
        this.container.appendChild(this.els.dashboard);
        this.els.players_container = document.createElement('div');
        this.els.players_container.id = 'karaoke-players-container';
        this.els.players_container.setAttribute('data-role', 'karaoke-players-container');
        this.els.players_container.setAttribute('data-state', 'pending');
        this.els.players_container.setAttribute('data-player-index', this.currentIdx);
        this.container.setAttribute('data-role', 'karaoke-container');
        this.container.appendChild(this.els.players_container);
        for(let i = 0; i < this.player_num; i++) {
            let p = document.createElement('div');
            p.id = 'player-' + (i + 1);
            p.className = 'player';
            p.setAttribute('data-player-index', i);
            this.els.players_container.appendChild(p);
        }
    }
    addListeners(){
        this.els.submit.addEventListener('click', ()=> {
            this.book(this.els.input.value);
        });
    }
    loadAPI(){
        /*
            youtube iframe api
            https://developers.google.com/youtube/iframe_api_reference
        */
        // 2. This code loads the IFrame Player API code asynchronously.
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    // 4. The API will call this function when the video player is ready.
    onPlayerReady(e) {
        // console.log('Youtube API is ready');
        this.player_ready_num ++;
        if(this.player_ready_num == this.player_ready_num) this.isReady = true;
    }

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    onPlayerStateChange(e) {
        let state = e.data;
        if(state === 0) {
            // video ends
            this.isPlaying = false;
            this.next(e);
        } else if(state === 1) {
            this.isPlaying = true;
            let idx = e.target.o.getAttribute('data-player-index');
            this.els.players_container.setAttribute('data-playing-index', idx);
        } else if(state === 5 && !this.isPlaying) {
            console.log('??');
            this.play(e.target);
        }
    }
    book (url) {
        let id = this.urlToId(url);
        url = 'https://www.youtube.com/v/' +id + '?version=3';
        if(!this.isPlaying) {
            this.els.players_container.setAttribute('data-state', 'playing');
            this.players[this.currentIdx].loadVideoByUrl(url, 0);
            this.updateCurrentQueueItem(id);
        } 
        else {
            this.queue.push(url);
            this.appendQueueItem(id);
        }
        // else if(this.currentIdx + 1 < this.players.length){
        //     this.players[this.currentIdx + 1].load
        // }
        // if(this.currentIdx === false) {
        //     console.log('currently no song is playing/pending.');
        //     console.log('booking ' + url + '...');
        //     this.currentIdx = 0; 
        //     this.players[this.currentIdx].loadVideoByUrl(url, 0);
        // }
        // else if(this.players[this.currentIdx].getPlayerState() === 0) {
        //     this.players[this.currentIdx].cueVideoByUrl(url, 0);
        //     this.currentIdx = (this.currentIdx + 1) % 2;
        // }
    }
    next(){
        if(!this.queue.length) return;
        let url = this.queue.shift();
        let id = this.urlToId(url);
        this.currentIdx = this.currentIdx + 1 >= this.player_num ? 0 : this.currentIdx + 1;
        this.players[this.currentIdx].loadVideoByUrl(url, 0);
        this.updateCurrentQueueItem(id);
    }
    preload(){

    }
    stop (p){
        p = typeof p !== 'Object' ? this.players[p] : p;
        p.classList.remove('playing');
        p.stopVideo();
    }
    play(p){
        p = typeof p !== 'Object' ? this.players[p] : p;
        this.els.players_container.setAttribute('data-state', 'playing');
        p.classList.add('playing');
        p.playVideo();
    }
    urlToId(url){
        // https://www.youtube.com/watch?v=id
        // https://www.youtube.com/v/id?version=3
        // https://youtu.be/B5zaOodFaGI?si=r7Nd0LyWAbfNbjsE
        let id = url;
        if(id.indexOf('https://www.youtube.com/') !== -1) {
            id = id.replace('https://www.youtube.com/', '');
            let pattern = id.indexOf('watch') !== -1 ? /watch\?v=(.*)(?:t=.*?)?/ : /v\/(.*?)\?version\=3/;
            id = id.match(pattern)[1];
        }
        else if(id.indexOf('https://youtu.be/') !== -1){
            id = id.replace('https://youtu.be/', '');
            let pattern = /^(.*?)\?.*?/;
            id = id.match(pattern)[1];
        }

        
        // console.log(id);
        // console.log(pattern);
        // console.log(id.match(pattern));
        id = id.match(pattern)[1];
        return id;
    }
    updateCurrentQueueItem(id){
        let q = document.querySelector('.queue-item[data-video-id="' + id + '"]');
        if(!q) {
            this.requestVideoTitle(id, (title)=>{
                this.els.currentQueueItem.innerText = title;
            })
        }else {
            this.els.currentQueueItem.innerText = q.innerText;
            q.remove();
        }
    }
    requestVideoTitle(id, cb){
        return this.gapi.client.youtube.videos.list({
            "part": [
                "snippet,contentDetails,statistics"
            ],
            "id": [
                id
            ]
        })
        .then(function(response) {
            if(typeof cb === 'function') cb(response.result.items[0].snippet.title);
        }.bind(this),
        function(err) { console.error("Execute error", err); });
    }
    appendQueueItem(id){
        this.requestVideoTitle(id, (title) => {
            let next = document.createElement('p');
            next.className = 'queue-item';
            next.innerText = title;
            next.setAttribute('data-video-id', id);
            this.els.queue_container.appendChild(next);
        });
    }
}