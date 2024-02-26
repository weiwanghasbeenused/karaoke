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
    book(id) {
        if(!id) return;
        console.log('book()');
        console.log(id);
        if( this.socket.readyState !== this.socket.OPEN) {
            this.initSocket(()=>this.book(id));
        } else {
            let msg = {
                'type': 'book-req',
                'body': id
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