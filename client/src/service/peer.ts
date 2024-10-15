class PeerService {
    public peer!: RTCPeerConnection;

    constructor(){
        this.initPeer();
    }

    initPeer() {
        // Reinitialize peer connection
        // console.log("init peer........")
        if (this.peer && this.peer.signalingState !== 'closed') {
            this.peer.getTransceivers().forEach(transceiver => {
                if (transceiver && transceiver.stop) {
                    transceiver.stop();
                }
            });
            this.peer.close(); 
        }

        this.peer = new RTCPeerConnection({
            iceServers: [{
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                    "stun:global.stun.twilio.com:3478",
                    "stun:stun.stunprotocol.org:3478",
                    "stun:stun.voipstunt.com",
                    "stun:stun.services.mozilla.com"
                ]
            }]
        });
    }

    async getOffer(){
        if(this.peer){
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return this.peer.localDescription;
        }
        
    }

    async getAnswer(offer: RTCSessionDescriptionInit){
        if(this.peer){
            await this.peer.setRemoteDescription(offer);
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(answer));
            return this.peer.localDescription;
        }
    }

    async setRemoteDescription(answer: RTCSessionDescriptionInit){
        if(this.peer){
            await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }
}

const peerservice = new PeerService();
export default peerservice;