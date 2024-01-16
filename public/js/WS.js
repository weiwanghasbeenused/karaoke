class KaraokeWS{
    constructor(host){
        this.host = host;
        this.socket = null;
        this.init();
    }
    init(){
        this.socket = new WebSocket(this.host);
        
        let msg = {
            'type': 'notification',
            'body': 'client wants to connect'
        }
        this.socket.addEventListener('open', (event) => this.socket.send(JSON.stringify(msg)) );
        // this.socket.addEventListener('open');
    }
    onMessage(callback){
        this.socket.addEventListener('message', callback);
    }
    send(msg, callback) {
        this.socket.send(msg);
        if(typeof callback === 'function') callback(msg);
    }
}