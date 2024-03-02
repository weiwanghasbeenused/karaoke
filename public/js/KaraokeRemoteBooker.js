class KaraokeRemoteBooker extends KaraokeBooker {
    constructor(container, host, keyword = ''){
        super(container, host, keyword);
        this.container.setAttribute('control-layout', 'full');
    }
    addSocketListeners(){
        this.socket.addEventListener('message', (event) => {
            let data = JSON.parse(event.data);
            console.log(data);
            if(data.type === 'response' && data.status === 'success') {
                this.reportBooking(data.body);
            } else if (data.type === 'register-res'){
                console.log(data.body);
            }
        });
    }
    book(data = null) {
        if(!data) return;
        console.log('socket readyState: ' + this.socket.readyState);
        if( this.socket.readyState === this.socket.CLOSED) {
            console.log('reconnecting...');
            this.initSocket(()=>{
                this.book(data)
            });
        } else if(this.socket.readyState === this.socket.CLOSING ||  this.socket.readyState === this.socket.CONNECTING){
            setTimeout(()=>this.book(data), 500);
        }else {
            let msg = {
                'type': 'book-req',
                'body': data
            };
            this.socket.send(JSON.stringify(msg));
        }
    }
    reportBooking(name){
        this.els.pa.innerText = '已點播: <br>' + name;
        this.container.classList.add('viewing-pa');
        window.setTimeout(() => {
            this.container.classList.remove('viewing-pa');
        }, 3000);
    }
}