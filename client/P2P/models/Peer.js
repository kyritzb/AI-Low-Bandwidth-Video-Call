import Stream from './Stream.js';

export default class Peer {
    constructor(socketId) {
        this.name = '';
        this.isWebcamOn = false;
        this.isMicOn = false;
        this.socketId = socketId;
        this.isMe = socketId ? false : true;
        this.streams = [];
    }

    /**
     * Sets the name of the peer
     * @param name
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Sets if the webcam is on or off
     * @param bool
     */
    setWebcamOn(bool) {
        this.isWebcamOn = bool;
    }

    /**
     * Sets if the mic is on or off
     * @param bool
     */
    setMicOn(bool) {
        this.isMicOn = bool;
    }

    /**
     * Gets initials
     * @param name
     * @returns {String} initials of the fullname
     */
    getInitials() {
        if (this.name) {
            const parts = this.name.split(' ');
            let initials = '';
            for (let i = 0; i < parts.length; i++) {
                if (parts[i].length > 0 && parts[i] !== '') {
                    initials += parts[i][0];
                }
            }
            return initials.toUpperCase();
        } else {
            return '';
        }
    }

    /**
     * Adds a new stream to the peer
     * @param {String} type
     * @param {MediaStream} stream
     */
    addStream(type, stream) {
        let newStream = new Stream(type, stream);
        this.streams.push(newStream);
        this.checkMicAndWebcamOn();
    }

    /**
     * Checks if a peer has a specific stream
     * @param {String} streamId the id of the MediaStream
     */
    has(streamId) {
        for (let i = 0; i < this.streams.length; i++) {
            if (this.streams[i].stream.id === streamId) {
                return true;
            }
        }
        return false;
    }

    attachTracks(type, stream) {
        const tracks = stream.getTracks();

        for (let i = 0; i < tracks.length; i++) {
            let trackKind = tracks[i].kind;
            if (type === 'webcam') {
                const webcamStream = this.getWebcamStream().stream;
                this.removeTracks(trackKind, webcamStream);
                webcamStream.addTrack(tracks[i]);
            }
        }
        this.checkMicAndWebcamOn();
    }

    removeTracks(type, stream) {
        let tracks = stream.getTracks();

        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].kind === type) {
                stream.removeTrack(tracks[i]);
                console.log('removing ', tracks[i]);
            }
        }
    }

    //check if theres audio & video tracks
    checkMicAndWebcamOn() {
        if (this.getWebcamStream()) {
            const stream = this.getWebcamStream().stream;
            let tracks = stream.getTracks();
            let hasWebcamTrack = false;
            let hasMicTrack = false;

            for (let i = 0; i < tracks.length; i++) {
                if (tracks[i].kind === 'video') {
                    hasWebcamTrack = true;
                }
                if (tracks[i].kind === 'audio') {
                    hasMicTrack = true;
                }
            }

            this.isMicOn = hasMicTrack;
            this.isWebcamOn = hasWebcamTrack;
        }
    }

    /**
     * Removes a stream based on its id
     * @param {String} streamId the id of the MediaStream to remove
     */
    removeStream(type) {
        let index = -1;
        for (let i = 0; i < this.streams.length; i++) {
            if (this.streams[i].type === type) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            this.streams.splice(index, 1);
        }
    }

    /**
     * Gets the webcam MediaStream of the user
     */
    getWebcamStream() {
        for (let i = 0; i < this.streams.length; i++) {
            if (this.streams[i].type === 'webcam') {
                return this.streams[i];
            }
        }
        return null;
    }

    /**
     * Gets the screenshare MediaStream of the user
     */
    getScreenShareStream() {
        for (let i = 0; i < this.streams.length; i++) {
            if (this.streams[i].type === 'screenshare') {
                return this.streams[i];
            }
        }
        return null;
    }

    isScreensharing() {
        if (this.getScreenShareStream() != null) {
            return true;
        } else {
            return false;
        }
    }
}
