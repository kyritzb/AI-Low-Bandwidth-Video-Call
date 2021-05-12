/**
 * DataChannel Object
 * @param {String} type
 * @param {Owner} socketId
 * @param {DataChannel} channel
 */
export default class Stream {
    constructor(type, socketId, channel) {
        this.type = type;
        this.socketId = socketId;
        this.channel = channel;
    }
}
