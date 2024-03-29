class KaraokePlayer{
    constructor(container){
        this.container = container;
        this.els = {}
        this.players = [];
        this.player_num = 1;
        this.player_ready_num = 0;
        // this.isReady = false;
        this.queue = [];
        this.currentIdx = 0;
        this.gapi = null;
        this.fetchUrl = '/video/fetch';
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
        this.els.dashboard.appendChild(this.els.queue_container);
        this.els.dashboard.appendChild(this.els.karaoke_controls_container);
        this.els.expand_btn = document.createElement('div');
        this.els.expand_btn.setAttribute('data-btn-status', 'on');
        this.els.expand_btn.id = 'expand-dashboard-btn';
        this.els.expand_btn.className = 'btn';
        this.container.appendChild(this.els.expand_btn);
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
        this.els.expand_btn.addEventListener('click', ()=> {
            let v = this.els.dashboard.getAttribute('data-visibility') == 'visible' ? 'hidden' : 'visible';
            let s = v === 'visible' ? 'on' : 'off';
            this.els.dashboard.setAttribute('data-visibility', v);
            this.els.expand_btn.setAttribute('data-btn-status', s);
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
        console.log('onPlayerReady');
    }

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    onPlayerStateChange(e) {
        /*
            -1 (unstarted)
            0 (ended)
            1 (playing)
            2 (paused)
            3 (buffering)
            5 (video cued).
        */
        let state = e.data;
        // console.log(e);
        console.log('playerStateChange: ' + state);
        if(state === 0) {
            // video ends
            this.isPlaying = false;
            this.next(e);
        } else if(state === 1) {
            this.isPlaying = true;
            let idx = e.target.o.getAttribute('data-player-index');
            this.els.players_container.setAttribute('data-playing-index', idx);
        } else if((state === 5) && !this.isPlaying) {
            this.play(e.target);
        }
    }
    request (id) {
        if(!id) return false;
        console.log('requesting .. . .' + id);
        if(!this.isPlaying) {
            let url = 'https://www.youtube.com/v/' +id + '?version=3';
            this.els.players_container.setAttribute('data-state', 'playing');
            console.log(this.players[this.currentIdx]);
            this.players[this.currentIdx].cueVideoByUrl(url, 0);
            console.log('post loadVideoByUrl()')
            this.updateCurrentQueueItem(id);
        } 
        else {
            this.queue.push(id);
            this.appendQueueItem(id);
        }
        return true;
    }
    next(){
        if(!this.queue.length) return;
        let id = this.queue.shift();
        let url = 'https://www.youtube.com/v/' +id + '?version=3';
        this.currentIdx = this.currentIdx + 1 >= this.player_num ? 0 : this.currentIdx + 1;
        this.players[this.currentIdx].loadVideoByUrl(url, 0);
        this.updateCurrentQueueItem(id);
    }
    preload(){

    }
    stop (p){
        p = typeof p !== 'object' ? this.players[p] : p;
        p.classList.remove('playing');
        p.stopVideo();
    }
    play(p){
        p = typeof p !== 'object' ? this.players[p] : p;
        this.els.players_container.setAttribute('data-state', 'playing');
        setTimeout(()=>{
            console.log('play');
            // this.players[this.currentIdx])
            console.log(this.players[this.currentIdx].playVideo());
        }, 5000);
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
        let request = new XMLHttpRequest();
        let url = this.fetchUrl + '?id=' + id;
        request.onreadystatechange = async () => {
            if(request.readyState === 4 && request.status === 200) {
                try {
                    let res = JSON.parse(request.responseText);
                    if(typeof cb === 'function' && res.items[0].snippet.title) {
                        cb(res.items[0].snippet.title);
                    }
                }
                catch(err){
                    console.log(err)
                }
                
            }
        };
        request.open('GET', url);
        request.send();
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