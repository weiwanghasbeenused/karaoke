class KaraokeLocalBooker extends KaraokeBooker {
    constructor(container, host, player = null){
        super(container, host);
        this.player = player;
        this.container.setAttribute('data-booker-type', 'local');
        // this.init();
    }

    addSocketListeners(){
        console.log('addSocketListeners local');
        this.socket.addEventListener('message', (event) => {
            let data = JSON.parse(event.data);
            console.log(data);
            if(data.type === 'book-req') {
                if(!this.player.isReady) return;
                console.log('ready?');
                this.book(data.body, data.client_id);
            } else if (data.type === 'register-res'){
                console.log(data.status);
                console.log(data.body);
            }
                
        });
    }
    async book(data, client_id='') {
        if(!data) return;
        console.log(data);
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