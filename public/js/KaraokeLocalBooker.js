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
    reportBooking(){
        console.log('reportBooking for local bookers');
    }
    addSocketListeners(){
        this.socket.addEventListener('message', (event) => {
            let data = JSON.parse(event.data);
            if(data.type === 'book-req') {
                this.book(data.body, data.client_id);
            } else if (data.type === 'book-res') {
                if(data.status === 'success') {
                    this.reportBooking(data.body);
                }
            }
            else if (data.type === 'register-res'){
                if(data.status === 'success') {
                    console.log('registered as a player successfully. display the code on the screen . . .');
                }
            } 
        });
    }
    async book(data) {
        if(!data) return;
        console.log(data);
        let id = data.id;
        let booked = await this.player.request(id);
        
        let msg = {
            'type': 'book-res',
            'status': booked ? 'success' : 'error',
            'body': data.title
         };
         this.socket.send(JSON.stringify(msg));
    }
}