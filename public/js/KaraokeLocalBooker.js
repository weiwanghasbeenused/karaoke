class KaraokeLocalBooker extends KaraokeBooker {
    constructor(container, host, player = null, timeout = false){
        super(container, host, null, timeout);
        this.player = player;
        this.container.setAttribute('data-booker-type', 'local');
        this.init();
    }
    init(){
        super.initSocket(null, true);
        super.init();
    }
    addSocketListeners(){
        this.socket.addEventListener('message', (event) => {
            let data = JSON.parse(event.data);
            if(data.type === 'book-req') {
                if(!this.player.isReady) return;
                console.log('ready?');
                this.book(data.body, data.client_id);
            } else if (data.type === 'register-res'){
                if(data.status === 'success') {
                    console.log('registered as a player successfully. display the code on the screen . . .');

                }
            }
                
        });
    }
    async book(data, client_id='') {
        if(!data) return;
        // console.log(data);
        let id = data.id;
        await this.player.request(id);
        if(client_id) {
            let msg = {
                'type': 'book-res',
                'status': 'success',
                'c_id': client_id,
                'body': 'title'
             };
             this.socket.send(JSON.stringify(msg));
        }
    }
}