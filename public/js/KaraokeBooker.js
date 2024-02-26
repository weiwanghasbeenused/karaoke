class KaraokeBooker{
    constructor(container, host, keyword=''){
        this.container = container;
        this.container.setAttribute('data-role', 'booker-container');
        this.keyword = keyword ? keyword : '';
        this.host = host;
        this.socket = null;
        this.els = {};
        this.searchUrl = '/video/search';
        this.timer = null;
        this.init();
    }
    init(){
        this.initSocket();
        this.renderElements();
        this.addListeners();
        // this.els.input.value = '新不了情';
        // this.els.search_btn.click();
    }
    initSocket(body = '', cb){
        this.socket = new WebSocket(this.host);
        let msg = {
            'type': 'register',
            'body': location.pathname
        }
        this.socket.addEventListener('open', (event) => this.socket.send(JSON.stringify(msg)) );
        this.addSocketListeners();
        if(typeof cb === 'function') cb();
    }
    // addSocketListeners(){
    // }
    renderElements(){
        this.els.form = document.createElement('form');
        this.els.form.className = 'karaoke-booker-control-container full-vw';
        this.els.form.action = '/';
        // this.els.form.method = 'GET';
        this.els.wrapper = document.createElement('div');
        let s = this.keyword === '' ? 'empty' : 'filled';
        this.els.wrapper.setAttribute('data-input-status', s);
        this.els.wrapper.className = 'input-wrapper';
        this.els.input = document.createElement('input');
        this.els.input.className = 'song-input large-input popped';
        this.els.input.id = 'search-youtube-input';
        this.els.input.name = 'keyword';
        this.els.input.type = 'search';
        this.els.input.value = this.keyword;
        this.els.input.placeholder = "搜尋影片 (Youtube)";
        this.els.clean_btn = document.createElement('div');
        this.els.clean_btn.className = 'clean-input-btn';
        this.els.search_btn = document.createElement('button');
        this.els.search_btn.className = 'btn circle-btn popped';
        this.els.search_btn.id = 'search-youtube-button';
        this.els.arrow = document.createElement('div');
        this.els.arrow.className = 'arrow right-arrow';
        this.els.search_btn.appendChild(this.els.arrow);
        this.els.wrapper.appendChild(this.els.input);
        this.els.wrapper.appendChild(this.els.clean_btn);
        this.els.pa = document.createElement('div');
        this.els.pa.id = 'karaoke-booker-pa';
        this.els.pa.className = 'full-vw';

        this.els.form.appendChild(this.els.wrapper);
        this.els.form.appendChild(this.els.search_btn);
        this.els.result_container = document.createElement('div');
        this.els.result_container.setAttribute('data-role', 'search-result-container');
        this.container.appendChild(this.els.result_container);
        this.container.appendChild(this.els.form);
        this.container.appendChild(this.els.pa);
        if(this.keyword === '') return;
        this.search(this.keyword, (res)=>{
            clearInterval(this.timer);
            this.els.input.invalid = false;
            this.els.arrow.style.transform = '';
            for(let i = 0; i < res.items.length; i++) {
                let r = this.renderSearchResult(res.items[i]);
                this.els.result_container.appendChild(r);
                r.addEventListener('click', (event)=>{
                    this.toggleZoomResult(event, r);
                }, true);
            }
        });
    }
    addListeners(){
        this.els.input.addEventListener('keyup', ()=> this.toggleInputStatus());
        this.els.input.addEventListener('keydown', this.inputControlByKeybaord.bind(this));
        this.els.clean_btn.addEventListener('click', ()=> this.cleanInput());
        // this.els.search_btn.addEventListener('click', () => {
        //     let keyword = this.els.input.value;
        //     if(!keyword || keyword.match(/^\s*&/)) return;
        //     this.els.result_container.innerHTML = '';
        //     this.timer = this.animateArrow();
        //     this.els.input.invalid = true;
        //     this.search(keyword, (res)=>{
        //         clearInterval(this.timer);
        //         this.els.input.invalid = false;
        //         this.els.arrow.style.transform = '';
        //         for(let i = 0; i < res.items.length; i++) {
        //             let r = this.renderSearchResult(res.items[i]);
        //             this.els.result_container.appendChild(r);
        //             r.addEventListener('click', (event)=>{
        //                 this.toggleZoomResult(event, r);
        //             }, true);
        //         }
        //     });
        // });
    }
    inputControlByKeybaord(event){
        if(event.keyCode === 13) {
            let keyword = this.els.input.value;
            if(!keyword || keyword.match(/^\s*&/)) return;
            this.els.result_container.innerHTML = '';
            this.timer = this.animateArrow();
            this.els.input.invalid = true;
            this.search(keyword, (res)=>{
                clearInterval(this.timer);
                this.els.input.invalid = false;
                this.els.arrow.style.transform = '';
                for(let i = 0; i < res.items.length; i++) {
                    let r = this.renderSearchResult(res.items[i]);
                    this.els.result_container.appendChild(r);
                    r.addEventListener('click', (event)=>{
                        this.toggleZoomResult(event, r);
                    });
                }
            });
        } else if (event.keyCode === 27) {
            this.cleanInput();
        }
    }
    search(keyword, cb){
        let request = new XMLHttpRequest();
        let url = this.searchUrl + '?q=' + keyword;
        request.onreadystatechange = () => {
            if(request.readyState === 4 && request.status === 200) {
                try {
                    let res = JSON.parse(request.responseText);
                    if(typeof cb === 'function') cb(res);
                }
                catch(err){
                    console.log(err)
                }
            }
        };
        request.open('GET', url);
        request.send();
    }
    renderSearchResult(data){
        let output = document.createElement('article');
        output.className = 'row search-result-wrapper';
        output.setAttribute('data-videoId', data.id.videoId);
        let title = document.createElement('h2');
        title.className = 'search-result-title'
        title.innerHTML = data.snippet.title;
        let tn_wrapper = document.createElement('div');
        tn_wrapper.className = 'search-result-thumbnail-wrapper';
        let tn = document.createElement('img');
        tn.className = 'search-result-thumbnail';
        tn.src = data.snippet.thumbnails.default.url;
        tn_wrapper.appendChild(tn);
        let btn = document.createElement('button');
        btn.className = 'btn book-btn';
        let arrow = document.createElement('div');
        arrow.className = 'arrow up-arrow';
        btn.appendChild(arrow);
        btn.onclick = () => this.book(data.id.videoId);
        output.appendChild(tn_wrapper);
        output.appendChild(title);
        output.appendChild(btn);
        return output;
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
    animateArrow(deg=0){
        if(!this.els.arrow) return null;
        return setInterval(()=>{
            deg += Math.random() >= 0.5 ? 8 : -8;
            this.els.arrow.style.transform = 'rotate('+deg+'deg)';
        }, 100);
    }
    toggleZoomResult(event, el){
        // console.log(el);
        if(event.target.classList.contains('book-btn')) return;
        // console.log(event.target)
        let zoomIn = !el.classList.contains('popped');
        let popped = document.querySelectorAll('.search-result-wrapper.popped');
        // console.log(popped);
        for(let i = 0; i < popped.length; i++) 
            popped[i].classList.remove('popped');
        if(zoomIn) el.classList.add('popped');
    }
}