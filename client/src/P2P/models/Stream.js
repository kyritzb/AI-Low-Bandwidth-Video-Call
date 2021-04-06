/**
 * Response Object
 * @param {String} type "webcam" or "screenshare"
 * @param {MediaTrack} stream the MediaTrack assosiated with this stream
 */
export default class Stream {
    constructor(type, stream) {
        this.type = type
        this.stream = stream
    }
}
