class KaraokeWS{
    constructor(host){
        this.host = host;
        this.socket = null;
        this.init();
    }
    init(){
        this.socket = new WebSocket(this.host);
        this.socket.addEventListener('open', (event) => this.socket.send('player wants to connect') );
        
    }
    onMessage(callback){
        this.socket.addEventListener('message', callback);
    }
}