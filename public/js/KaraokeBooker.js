class KaraokeBooker{
    constructor(container, ws, player=null){
        this.container = container;
        this.ws = ws;
        this.player = player;
        this.els = {};
        this.renderElements();
        this.addListeners();
    }
    renderElements(){
        this.els.label = document.createElement('label');
        this.els.label.innerText = '請輸入想點播的 Youtube 影片 URL';
        this.els.wrapper = document.createElement('div');
        this.els.wrapper.setAttribute('data-input-status', 'empty');
        this.els.wrapper.className = 'input-wrapper';
        this.els.input = document.createElement('input');
        this.els.input.className = 'song-input large-input';
        this.els.input.type = 'text';
        this.els.clean_btn = document.createElement('div');
        this.els.clean_btn.className = 'clean-input-btn';
        this.els.book_btn = document.createElement('button');
        this.els.book_btn.className = 'book-btn';
        this.els.book_btn.innerText = '點歌';
        this.els.wrapper.appendChild(this.els.input);
        this.els.wrapper.appendChild(this.els.clean_btn);
        this.container.appendChild(this.els.label);
        this.container.appendChild(this.els.wrapper);
        this.container.appendChild(this.els.book_btn);
    }
    addListeners(){
        this.els.input.addEventListener('change', ()=> this.toggleInputStatus());
        this.els.clean_btn.addEventListener('click', ()=> this.cleanInput());
        this.els.book_btn.addEventListener('click', ()=> {
            let id = this.urlToId(this.els.input.value);
            this.book(id);
        });
    }
    toggleInputStatus() {
        let status = this.els.input.value === '' ? 'empty' : 'filled';
        this.els.wrapper.setAttribute('data-input-status', status);
    }
    cleanInput(){
        this.els.input.value = '';
        this.toggleInputStatus(this.els.input);
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
        else {
            console.log('fail to recognize url');
            return false;
        }
        return id;
    }
    book(id) {
        if(!id) return;
        if(!this.player) {
            let msg = {'type': 'book', 'body': id};
            this.ws.send(JSON.stringify(msg));
        }
        else {
            this.player.request(id);
        }
    }
}