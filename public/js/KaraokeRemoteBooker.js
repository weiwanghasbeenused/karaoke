class KaraokeRemoteBooker extends KaraokeBooker {
    constructor(container, host, keyword = '', timeout = false){
        super(container, host, keyword, timeout);
        this.container.setAttribute('control-layout', 'full');
        this.init();
    }
    init(){
        super.initSocket();
        super.init();
    }
    addSocketListeners(){
        this.socket.addEventListener('message', (event) => {
            let data = JSON.parse(event.data);
            if(data.type === 'book-res') {
                this.reportBooking(data);
            } else if (data.type === 'register-res'){
                console.log(data.body);
            }
        });
    }
    book(data = null) {
        if(!data) return;
        console.log('socket readyState: ' + this.socket.readyState);
        if( this.socket.readyState === this.socket.CLOSED) {
            console.log('reconnecting now...');
            this.initSocket(()=>{
                this.book(data)
            });
        } else if(this.socket.readyState === this.socket.CLOSING ||  this.socket.readyState === this.socket.CONNECTING){
            console.log('reconnecting in 0.5s ...')
            setTimeout(()=>this.book(data), 500);
        }else {
            console.log('book')
            let msg = {
                'type': 'book-req',
                'body': data
            };
            this.socket.send(JSON.stringify(msg));
        }
    }
    reportBooking(data){
        this.els.pa_text.innerHTML =  data.status === 'success' ? '已點播: <br>' + data.body : '點播失敗: <br>' + data.title;
        this.container.classList.add('viewing-pa');
        window.setTimeout(() => {
            this.container.classList.remove('viewing-pa');
        }, 6000);
    }
}