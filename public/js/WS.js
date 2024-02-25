class KaraokeWS{
    constructor(host){
        this.host = host;
        this.socket = null;
        this.init();
    }
    init(){
        this.socket = new WebSocket(this.host);
        let msg = {
            'type': 'request',
            'body': 'client wants to connect'
        }
        this.socket.addEventListener('open', (event) => this.socket.send(JSON.stringify(msg)) );
    }
    onMessage(callback){
        this.socket.addEventListener('message', callback);
    }
    send(msg, callback) {
        if(this.socket.readyState === this.socket.OPEN) {
            this.socket.send(msg)
            if(typeof callback === 'function') callback(msg);
        } else {
            
        }
        
    }
}