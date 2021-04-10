import openSocket from 'socket.io-client';
import Peer from './models/Peer';
import Stream from './models/Stream';
import joinSound from './sounds/join.mp3';
import leaveSound from './sounds/leave.mp3';
import chatSound from './sounds/chat.mp3';
import * as stateActions from '../redux/actions/roomActions';

//yeet

var store;

class P2P {
    /**
     * @param  {Object} data
     * @param  {Object} data.store - The Redux ////store.
     */
    static initialize(data) {
        store = data.store;
    }
    /**
     * Creates an instance of SecureMeeting's P2P API
     * @constructor
     * @param {String} socketUrl The address of the signalling server to establish a connection with
     */
    constructor(socketUrl) {
        this.name = null;
        this.webcamOn = false;
        this.micOn = false;
        this.isScreenSharing = false;
        this.isConnected = false;
        this.localStream = null;
        this.screenShareStream = null;
        this.socket = openSocket(socketUrl);
        this.configuration = {
            iceServers: [
                { url: 'stun:stun.l.google.com:19302' },
                {
                    url: 'turn:numb.viagenie.ca',
                    credential: 'enter1234',
                    username: 'bethin.charles@yahoo.com',
                },
            ],
        };
        this.screenSharing = [];
        this.peers = [];
        this.youtubeVideo = null;
        this.selectedWebcam = null;
        this.selectedMic = null;
        this.webcams = new Map();
        this.mics = new Map();
        this.speakers = new Map();
        this.devices = [];
        this.peerConnections = new Object();
        this.dataChannels = [];
        this.init();
    }

    setName(name) {
        this.name = name;
        this.socket.emit('set_name', { name: name });
        store.dispatch(stateActions.setMe(this.getMe()));
    }

    getMe() {
        let newMe = new Peer('me');
        newMe.setName(this.name);
        newMe.setWebcamOn(this.webcamOn);
        newMe.setMicOn(this.micOn);
        if (this.localStream) {
            newMe.addStream('webcam', this.localStream);
        }
        if (this.screenShareStream) {
            newMe.addStream('screenshare', this.screenShareStream);
        }
        return newMe;
    }

    setYoutubeVideo(videoLink) {
        this.youtubeVideo = videoLink;
        // store.dispatch(stateActions.setYoutubeVideo(videoLink));
    }

    async startScreenShare() {
        await navigator.mediaDevices
            .getDisplayMedia({
                audio: true,
                video: true,
            })
            .then((stream) => {
                this.isScreenSharing = true;
                this.screenShareStream = stream;
                this.screenShareStream.getVideoTracks()[0].addEventListener('ended', () => {
                    this.stopScreenShare();
                });
                let peers = Object.keys(this.peerConnections);
                for (let i = 0; i < peers.length; i++) {
                    let currentSocketId = peers[i];
                    this.screenShareStream.getTracks().forEach((track) => {
                        this.peerConnections[currentSocketId].addTrack(track, this.screenShareStream);
                    });
                }
                this.socket.emit('start_screen_share', { streamId: stream.id });
                store.dispatch(stateActions.setScreenSharing(this.screenSharing));
                store.dispatch(stateActions.setMe(this.getMe()));
                store.dispatch(stateActions.setMeScreensharing(true));
            })
            .catch((err) => {
                console.error(err);
            });
    }

    async stopScreenShare() {
        if (this.screenShareStream) {
            let screenshareId = this.screenShareStream.id;
            let screenShareTracks = this.screenShareStream.getTracks();
            let peers = Object.keys(this.peerConnections);

            for (let i = 0; i < peers.length; i++) {
                let currentSocketId = peers[i];
                let senders = await this.peerConnections[currentSocketId].getSenders();
                for (let j = 0; j < senders.length; j++) {
                    for (let m = 0; m < screenShareTracks.length; m++) {
                        if (senders[j].track != null && senders[j].track.id === screenShareTracks[m].id) {
                            this.peerConnections[currentSocketId].removeTrack(senders[j]);
                        }
                    }
                }
            }
            screenShareTracks.forEach((track) => track.stop());
            this.screenShareStream = null;
            this.isScreenSharing = false;
            this.socket.emit('stop_screen_share', { streamId: screenshareId });
            store.dispatch(stateActions.setScreenSharing(this.screenSharing));
            store.dispatch(stateActions.setMe(this.getMe()));
            store.dispatch(stateActions.setMeScreensharing(false));
        }
    }

    gotDevices(deviceInfos) {
        for (let i = 0; i !== deviceInfos.length; i++) {
            const deviceInfo = deviceInfos[i];
            if (deviceInfo.kind === 'audioinput') {
                this.mics.set(deviceInfo.deviceId, deviceInfo);
            } else if (deviceInfo.kind === 'audiooutput') {
                this.speakers.set(deviceInfo.deviceId, deviceInfo);
            } else if (deviceInfo.kind === 'videoinput') {
                this.webcams.set(deviceInfo.deviceId, deviceInfo);
            } else {
                console.log('Some other kind of source/device: ', deviceInfo);
            }
        }
    }

    getPeersScreensharing() {
        let peersScreensharing = [];
        for (let i = 0; i < this.peers.length; i++) {
            let currentPeer = this.peers[i];
            let peerStream = currentPeer.getScreenShareStream();
            if (peerStream) {
                peersScreensharing.push(currentPeer);
            }
        }
        return peersScreensharing;
    }

    /**
     * Get the mics from the local client
     * @returns {Array} an array of the Mics
     */
    getMics() {
        let mics = [];
        let a = Array.from(this.mics);
        for (let i = 0; i < a.length; i++) {
            mics.push(a[i][1]);
        }
        return mics;
    }

    /**
     * Get the webcams from the local client
     * @returns {Array} an array of the Webcams
     */
    getWebcams() {
        let cams = [];
        let a = Array.from(this.webcams);
        for (let i = 0; i < a.length; i++) {
            cams.push(a[i][1]);
        }
        return cams;
    }

    /**
     * Changes the webcam track on the RTCpeerconnections
     * @param {String} deviceId the device id of the new webcam
     */
    changeWebcam(deviceId) {
        var video = document.getElementById('localStream');
        let config = { audio: true, video: { deviceId: deviceId } };
        navigator.mediaDevices
            .getUserMedia(config)
            .then((stream) => {
                if (stream.getVideoTracks().length != 0) {
                    this.webcamOn = true;
                    this.selectedWebcam = deviceId;
                } else {
                    this.webcamOn = false;
                }
                if (stream.getAudioTracks().length != 0) {
                    this.micOn = true;
                } else {
                    this.micOn = false;
                }

                this.localStream = stream;
                let track = stream.getVideoTracks()[0];
                this.replaceTrack(track);
                video.srcObject = stream;
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    /**
     * Changes the mic track on the RTCpeerconnections
     * @param {String} deviceId the device id of the new mic
     */
    changeMic(deviceId) {
        let config = { audio: { deviceId: deviceId }, video: true };
        navigator.mediaDevices
            .getUserMedia(config)
            .then((stream) => {
                if (stream.getVideoTracks().length != 0) {
                    this.webcamOn = true;
                } else {
                    this.webcamOn = false;
                }
                if (stream.getAudioTracks().length != 0) {
                    this.micOn = true;
                    this.selectedMic = deviceId;
                } else {
                    this.micOn = false;
                }

                this.localStream = stream;
                let track = stream.getAudioTracks()[0];
                this.replaceTrack(track);
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    /**
     * Changes the mic track on the RTCpeerconnections
     * @param {MediaStreamTrack} track the new track to replace on the RTCpeerconnections
     */
    async replaceTrack(track) {
        let peers = Object.keys(this.peerConnections);
        let trackType = track.kind;
        let screenshareTracks = null;
        if (this.isScreenSharing) {
            screenshareTracks = this.screenShareStream.getTracks();
        }
        for (let i = 0; i < peers.length; i++) {
            let currentSocketId = peers[i];
            let senders = this.peerConnections[currentSocketId].getSenders();
            let rtcSenders = senders.filter((sender) => {
                return sender.track.kind === trackType;
            });
            for (let j = 0; j < rtcSenders.length; j++) {
                if (this.isScreenSharing) {
                    for (let m = 0; m < screenshareTracks.length; m++) {
                        //prevents the sccreenshare tracks from being over written
                        if (screenshareTracks[m].id != rtcSenders[j].track.id) {
                            await rtcSenders[j].replaceTrack(track);
                        }
                    }
                } else {
                    await rtcSenders[j].replaceTrack(track);
                }
            }
        }
    }

    turnOffMic() {
        let peers = Object.keys(this.peerConnections);

        //remove senders
        for (let i = 0; i < peers.length; i++) {
            let currentSocketId = peers[i];

            let senders = this.peerConnections[currentSocketId].getSenders();

            let audioSenders = senders.filter((sender) => {
                return sender.track?.kind === 'audio';
            });

            for (let j = 0; j < audioSenders.length; j++) {
                this.peerConnections[currentSocketId].removeTrack(audioSenders[j]);
            }
        }

        this.micOn = false;
        let localStreamTracks = this.localStream.getAudioTracks();
        localStreamTracks.forEach((track) => track.stop());

        localStreamTracks.forEach((track) => this.localStream.removeTrack(track));

        store.dispatch(stateActions.setMe(this.getMe()));
    }

    async turnOnMic() {
        let stream = await this.getMedia(this.webcamOn, true);

        let hasMicStream = false;
        let streamTracks = stream.getTracks();
        let micTrack = null;
        for (let i = 0; i < streamTracks.length; i++) {
            if (streamTracks[i].kind === 'audio') {
                hasMicStream = true;
                micTrack = streamTracks[i];
            }
        }

        let peers = Object.keys(this.peerConnections);

        if (this.localStream) {
            this.localStream.addTrack(micTrack);
            console.log('added mic track to your localstream');
        }

        for (let i = 0; i < peers.length; i++) {
            let currentSocketId = peers[i];
            if (micTrack) {
                console.log('attach to remote peer');
                this.attachOneTrack(currentSocketId, micTrack);
            }
        }

        this.micOn = hasMicStream;
        store.dispatch(stateActions.setMe(this.getMe()));
    }

    async turnOnWebcam() {
        let stream = await this.getMedia(true, this.micOn);

        let hasWebcamStream = false;
        let streamTracks = stream.getTracks();
        let videoTrack = null;
        for (let i = 0; i < streamTracks.length; i++) {
            if (streamTracks[i].kind === 'video') {
                hasWebcamStream = true;
                videoTrack = streamTracks[i];
            }
        }

        let peers = Object.keys(this.peerConnections);

        if (this.localStream) {
            this.localStream.addTrack(videoTrack);
            console.log('added webcam track to your localstream');
        }

        for (let i = 0; i < peers.length; i++) {
            let currentSocketId = peers[i];
            if (videoTrack) {
                console.log('attach to remote peer');
                this.attachOneTrack(currentSocketId, videoTrack);
            }
        }

        this.webcamOn = hasWebcamStream;
        store.dispatch(stateActions.setMe(this.getMe()));
    }

    turnOffWebcam() {
        let peers = Object.keys(this.peerConnections);

        //remove senders
        for (let i = 0; i < peers.length; i++) {
            let currentSocketId = peers[i];

            let senders = this.peerConnections[currentSocketId].getSenders();

            let videoSenders = senders.filter((sender) => {
                return sender.track?.kind === 'video';
            });

            for (let j = 0; j < videoSenders.length; j++) {
                this.peerConnections[currentSocketId].removeTrack(videoSenders[j]);
            }
        }

        this.webcamOn = false;
        let localStreamTracks = this.localStream.getVideoTracks();
        localStreamTracks.forEach((track) => track.stop());

        localStreamTracks.forEach((track) => this.localStream.removeTrack(track));

        store.dispatch(stateActions.setMe(this.getMe()));
    }
    /**
     * Initializes the webcam and websocket connections
     *
     */
    async init() {
        this.initSocket();
        await this.initUserDevices();
        this.addNewDeviceEventHandler();
    }

    addNewDeviceEventHandler() {
        // Listen for changes to media devices and update the list accordingly
        if (navigator.mediaDevices) {
            navigator.mediaDevices.addEventListener('devicechange', (event) => {
                console.log('new device detected!');
                this.initUserDevices();
            });
        }
    }

    async initUserDevices() {
        this.mics = new Map();
        this.speakers = new Map();
        this.webcams = new Map();
        try {
            if (navigator.mediaDevices) {
                await navigator.mediaDevices
                    .enumerateDevices()
                    .then((devices) => {
                        this.gotDevices(devices);
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Sends the local Offer to the remote peer
     * @param {Object} offer the offer generated by the RTCPeerconnection
     * @param {String} socketId the socketId of the remote peer
     */
    sendLocalOffer(offer, socketId) {
        this.socket.emit('send_local_offer', { offer: offer, socketId: socketId });
    }

    /**
     * Sends the local Answer to the remote peer
     * @param {Object} answer the offer generated by the RTCPeerconnection
     * @param {String} socketId the socketId of the remote peer
     */
    sendLocalAnswer(answer, socketId) {
        this.socket.emit('send_local_answer', {
            answer: answer,
            socketId: socketId,
        });
    }

    /**
     * Removes a peer from the P2P connections
     * @param {String} socketId the socketId of the peer who disconnected
     */
    removePeer(socketId) {
        for (let i = 0; i < this.peers.length; i++) {
            if (this.peers[i].socketId === socketId) {
                this.peers.splice(i, 1);
                break;
            }
        }
        const audio = new Audio(leaveSound);
        audio.play();
        store.dispatch(stateActions.setPeersInRoom(this.peers));
    }

    /**
     * Allows a peer to join a room
     * @param {String} roomName a unique roomName to join
     */
    async joinRoom(roomName, peerName) {
        this.socket.emit('join_room', { roomName: roomName, peerName });
        if (peerName) {
            this.setName(peerName);
        }
    }

    /**
     * Creates and sends an answer to the remote peer
     * @param {String} socketId the socketId of the remote peer
     */
    async createAnswer(socketId) {
        const answer = await this.peerConnections[socketId].createAnswer();
        await this.peerConnections[socketId].setLocalDescription(answer);
        this.sendLocalAnswer(answer, socketId);
    }

    /**
     * Creates and sends an offer to the remote peer
     * @param {String} socketId the socketId of the remote peer
     */
    async getLocalOffer(socketId) {
        const offer = await this.peerConnections[socketId].createOffer();
        await this.peerConnections[socketId].setLocalDescription(offer);
        await this.sendLocalOffer(offer, socketId);
    }

    async getMediaVoid() {
        if (navigator.mediaDevices) {
            console.log(navigator.mediaDevices);
            await navigator.mediaDevices
                .getUserMedia({
                    audio: true,
                    video: true,
                })
                .then((stream) => {
                    let vidTracks = stream.getVideoTracks();
                    let micTracks = stream.getAudioTracks();
                    if (vidTracks.length != 0) {
                        this.webcamOn = true;
                        let webcams = Array.from(this.webcams);
                        for (let i = 0; i < webcams.length; i++) {
                            if (webcams[i][1].label === vidTracks[0].label) {
                                this.selectedWebcam = webcams[i][1].deviceId;
                            }
                        }
                    } else {
                        this.webcamOn = false;
                    }
                    if (micTracks.length != 0) {
                        this.micOn = true;
                        let mics = Array.from(this.mics);
                        for (let i = 0; i < mics.length; i++) {
                            if (mics[i][1].label === micTracks[0].label) {
                                this.selectedMic = mics[i][1].deviceId;
                            }
                        }
                    } else {
                        this.micOn = false;
                    }
                    this.localStream = stream;
                    store.dispatch(stateActions.setMe(this.getMe()));
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }
    /**
     * Gets the webcam and microphone of the user
     */
    async getMedia(getWebcam, getMic) {
        return new Promise((resolve, reject) => {
            if (navigator.mediaDevices) {
                navigator.mediaDevices
                    .getUserMedia({
                        audio: getMic,
                        video: getWebcam,
                    })
                    .then((stream) => {
                        let vidTracks = stream.getVideoTracks();
                        let micTracks = stream.getAudioTracks();
                        if (vidTracks.length != 0) {
                            this.webcamOn = true;
                            let webcams = Array.from(this.webcams);
                            for (let i = 0; i < webcams.length; i++) {
                                if (webcams[i][1].label === vidTracks[0].label) {
                                    this.selectedWebcam = webcams[i][1].deviceId;
                                }
                            }
                        } else {
                            this.webcamOn = false;
                        }
                        if (micTracks.length != 0) {
                            this.micOn = true;
                            let mics = Array.from(this.mics);
                            for (let i = 0; i < mics.length; i++) {
                                if (mics[i][1].label === micTracks[0].label) {
                                    this.selectedMic = mics[i][1].deviceId;
                                }
                            }
                        } else {
                            this.micOn = false;
                        }
                        this.localStream = stream;
                        resolve(stream);
                        store.dispatch(stateActions.setMe(this.getMe()));
                    })
                    .catch((err) => {
                        console.error(err);
                        reject(err);
                    });
            }
        });
    }

    /**
     * Attaches tracks onto a peer connection
     * @param {String} socketId the socketId of the peerConnection to attach tracks to
     */
    async attachTracks(socketId) {
        if (this.localStream == null) {
            await this.getMediaVoid();
        }

        this.localStream.getTracks().forEach((track) => {
            this.peerConnections[socketId].addTrack(track, this.localStream);
        });

        if (this.screenShareStream) {
            this.screenShareStream.getTracks().forEach((track) => {
                this.peerConnections[socketId].addTrack(track, this.screenShareStream);
            });
        }
    }

    /**
     * Attaches a single track onto a peer connection
     * @param {String} socketId the socketId of the peerConnection to attach tracks to
     */
    async attachOneTrack(socketId, track) {
        this.peerConnections[socketId].addTrack(track, this.localStream);
    }

    onRemotePeerInactiveStream(event) {
        console.log('turned off webcam');
    }

    /**
     * Initializes the RTC Event Handlers for the specifiec peer connection
     * @param {String} socketId the socketId of the remote peer
     */
    initRTCEvents(socketId) {
        this.peerConnections[socketId].connectionWith = socketId;

        this.peerConnections[socketId].onicecandidate = (iceEvent) => {
            let candidate = iceEvent.candidate;
            let socketId = iceEvent.target.connectionWith;
            if (candidate) {
                this.socket.emit('send_ice_candidate', {
                    candidate: candidate,
                    socketId: socketId,
                });
            }
        };

        this.peerConnections[socketId].ontrack = (event) => {
            let id = this.peerConnections[socketId].connectionWith;
            let stream = event.streams[0];

            console.log('onTrack');
            console.log(stream);

            //find the peer connection that has the track
            //update the redux state of that user
            stream.onremovetrack = (e) => {
                console.log('removed track');
                let track = e.track;
                let streamWithTrackRemoved = e.currentTarget;
                console.log(streamWithTrackRemoved);

                if (this.peers) {
                    for (let i = 0; i < this.peers.length; i++) {
                        let currentPeer = this.peers[i];
                        let currentPeerStreams = this.peers[i].streams;

                        /*
                        for (let j = 0; j < currentPeerStreams.length; j++) {
                            let curStream = currentPeerStreams[j].stream;
                            let tracks = curStream.getTracks();

                            //if this stream is the stream where the track was removed, check if they have a webcam and mic
                            if (curStream.id === streamWithTrackRemoved.id) {
                                let hasWebcamTrack = false;
                                let hasMicTrack = false;

                                for (let m = 0; m < tracks.length; m++) {
                                    if (tracks[m].kind === 'audio') {
                                        hasMicTrack = true;
                                    }
                                    if (tracks[m].kind === 'video') {
                                        hasWebcamTrack = true;
                                    }
                                }
                                currentPeer.isMicOn = hasMicTrack;
                                currentPeer.isWebcamOn = hasWebcamTrack;
                                store.dispatch(stateActions.setPeersInRoom(this.peers));
                            }
                        }
                        */
                        if (track.kind === 'video') {
                            console.log('screenshairng');
                            console.log(this.screenSharing);
                            let isAScreenshareStream = false;
                            for (let m = 0; m < this.screenSharing.length; m++) {
                                let curScreenShareId = this.screenSharing[m];
                                if (streamWithTrackRemoved.id === curScreenShareId) {
                                    isAScreenshareStream = true;
                                    this.peerStoppedScreenSharing(curScreenShareId);
                                }
                            }
                            if (!isAScreenshareStream) {
                                currentPeer.isWebcamOn = false;
                            }
                        } else {
                            currentPeer.isMicOn = false;
                        }
                        store.dispatch(stateActions.setPeersInRoom(this.peers));
                    }
                }
            };

            let peerExists = false;

            for (let i = 0; i < this.peers.length; i++) {
                if (this.peers[i].socketId === id) {
                    peerExists = true;
                }
            }
            //when the peer joins the room
            if (!peerExists) {
                console.log('peer doesnt exist');
                let newPeer = new Peer(id);
                if (this.streamIsScreenshare(stream.id)) {
                    newPeer.addStream('screenshare', stream);
                } else {
                    newPeer.addStream('webcam', stream);
                }
                this.peers.push(newPeer);
                const audio = new Audio(joinSound);
                audio.play();
            } else {
                console.log('peer does exist');
                //when the peer modifies their tracks while in the call
                for (let i = 0; i < this.peers.length; i++) {
                    if (this.peers[i].socketId === id) {
                        if (!this.peers[i].has(stream.id)) {
                            if (this.streamIsScreenshare(stream.id)) {
                                console.log('ontrack adding screenshare');
                                this.peers[i].addStream('screenshare', stream);
                            } else {
                                //replace stream
                                console.log('ontrack adding webcam');
                                if (this.peers[i].getWebcamStream()) {
                                    console.log('attach tracks');
                                    this.peers[i].attachTracks('webcam', stream);
                                } else {
                                    console.log('add stream');
                                    this.peers[i].addStream('webcam', stream);
                                }
                            }
                        }
                    }
                }
            }
            store.dispatch(stateActions.setPeersInRoom(this.peers));
        };

        this.peerConnections[socketId].onnegotiationneeded = async (event) => {
            let socketId = event.currentTarget.connectionWith;
            await this.getLocalOffer(socketId);
        };

        this.peerConnections[socketId].ondatachannel = async (event) => {
            console.log(event);

            const receiveChannel = event.channel;
            receiveChannel.onmessage = this.handleReceiveMessage;
            receiveChannel.onopen = this.handleReceiveChannelStatusChange;
            receiveChannel.onclose = this.handleReceiveChannelStatusChange;

            this.dataChannels.push({
                type: 'receive',
                socketId: event.target.connectionWith,
                channel: receiveChannel,
            });

            console.log(this.dataChannels);
        };
    }

    handleReceiveMessage(event) {
        const data = event.data;
        console.log(event);

        var array = new Int16Array(data);
        console.log();
    }

    handleReceiveChannelStatusChange(status) {
        console.log('Receiving status changed');
        console.log(status);
    }

    streamIsScreenshare(streamId) {
        for (let i = 0; i < this.screenSharing.length; i++) {
            if (this.screenSharing[i] === streamId) {
                return true;
            }
        }
        return false;
    }

    /**
     * Starts the process establishing a peer connection with a remote peer (Peer A)
     * @param {String} socketId the socketId of the remote peer
     */
    async initiateNewConnection(socketId) {
        this.peerConnections[socketId] = new RTCPeerConnection(this.configuration);
        this.attachTracks(socketId);
        this.initRTCEvents(socketId);
        await this.getLocalOffer(socketId);
    }

    /**
     * Finishes the process establishing a peer connection with a remote peer (Peer B)
     * @param {String} socketId the socketId of the remote peer
     */
    finishNewConnection(socketId, offer) {
        if (this.peerConnections[socketId]) {
            console.log('do nothing');
        } else {
            this.peerConnections[socketId] = new RTCPeerConnection(this.configuration);
            this.attachTracks(socketId);
            this.initRTCEvents(socketId);
        }
        this.peerConnections[socketId].setRemoteDescription(offer).then(async () => {
            await this.createAnswer(socketId);
        });
    }

    /**
     * Sets the peers name from their socketId
     * @param {String} name the new peer's name
     * @param {String} socketId the socketId of the peer
     */
    setPeerName(name, socketId) {
        let peerExists = false;
        for (let i = 0; i < this.peers.length; i++) {
            if (this.peers[i].socketId === socketId) {
                peerExists = true;
            }
        }
        if (!peerExists) {
            let newPeer = new Peer(socketId);
            newPeer.setName(name);
            this.peers.push(newPeer);
        } else {
            for (let i = 0; i < this.peers.length; i++) {
                if (this.peers[i].socketId === socketId) {
                    this.peers[i].name = name;
                }
            }
        }
        store.dispatch(stateActions.setPeersInRoom(this.peers));
    }

    peerStoppedScreenSharing(streamId) {
        this.screenSharing.pop(streamId);
        for (let i = 0; i < this.peers.length; i++) {
            if (this.peers[i].has(streamId)) {
                this.peers[i].removeStream(streamId);
            }
        }
        store.dispatch(stateActions.setScreenSharing(this.screenSharing));
        store.dispatch(stateActions.setPeersInRoom(this.peers));
    }

    peerConnectedToRoom(isConnected) {
        console.log('connected to the room!');
        this.isConnected = isConnected;
        const audio = new Audio(joinSound);
        audio.play();
        store.dispatch(stateActions.setConnectedToRoom(this.isConnected));
    }

    setPeerDataFromServer(peerDataFromServer) {
        for (let i = 0; i < peerDataFromServer.length; i++) {
            let curPeer = peerDataFromServer[i];
            let peerExists = false;
            for (let i = 0; i < this.peers.length; i++) {
                if (this.peers[i].socketId === curPeer.socketId) {
                    peerExists = true;
                }
            }
            if (!peerExists) {
                let newPeer = new Peer(curPeer.socketId);
                newPeer.setName(curPeer.name);
                this.peers.push(newPeer);
            }
        }
        store.dispatch(stateActions.setPeersInRoom(this.peers));
    }

    leaveRoom() {
        this.socket.emit('leave_room', {});
    }

    createDataChannel(dataChannelName) {
        let peers = Object.keys(this.peerConnections);

        for (let i = 0; i < peers.length; i++) {
            let currentSocketId = peers[i];
            console.log('creating data channel with', currentSocketId);
            const sendChannel = this.peerConnections[currentSocketId].createDataChannel(dataChannelName);
            this.dataChannels.push({
                type: 'send',
                socketId: currentSocketId,
                channel: sendChannel,
            });
        }
    }

    sendMessageAll(channel, data) {
        const channels = this.dataChannels.filter((obj) => {
            return obj.type === 'send' && obj.channel.label === channel;
        });

        for (let i = 0; i < channels.length; i++) {
            if (channels[i].channel.readyState === 'open') {
                //console.log('sent');
                channels[i].channel.send(data);
            }
        }
    }

    /**
     * Initializes the websocket events
     */
    initSocket() {
        this.socket.on('connected_to_room', async (payload) => {
            var { isConnected, peers, screenshare } = payload;
            this.peerConnectedToRoom(isConnected);
            this.setPeerDataFromServer(peers);
        });

        this.socket.on('peer_start_screen_share', async (payload) => {
            var { streamId } = payload;
            this.screenSharing.push(streamId);
            store.dispatch(stateActions.setScreenSharing(this.screenSharing));
        });

        this.socket.on('peer_stop_screen_share', async (payload) => {
            var { streamId } = payload;
        });

        this.socket.on('got_remote_offer', async (payload) => {
            var { socketId, offer } = payload;
            this.finishNewConnection(socketId, offer);
        });

        this.socket.on('peer_set_name', async (payload) => {
            var { name, socketId } = payload;
            this.setPeerName(name, socketId);
        });

        this.socket.on('got_remote_answer', async (payload) => {
            var { socketId, answer } = payload;
            this.peerConnections[socketId].setRemoteDescription(answer);
        });

        this.socket.on('create_new_connection', async (payload) => {
            this.initiateNewConnection(payload.socketId);
        });

        this.socket.on('peer_left_room', async (payload) => {
            this.removePeer(payload.socketId);
        });

        this.socket.on('got_ice_candidate', async (payload) => {
            var { candidate, socketId } = payload;
            if (candidate) {
                this.peerConnections[socketId].addIceCandidate(candidate);
            }
        });
    }
}

export { P2P };
