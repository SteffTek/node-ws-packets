/**
 * Imports
 */
const Packet = require("../Packet.js");

/**
 * Create Packet
 */
module.exports = class CKeepAlivePacket extends Packet {
    constructor(payload) {
        /*
            Packet Timestamp
        */
        const model = {
            timestamp: Number
        }

        /*
            Init Packet
        */
        super("IKeepAlivePacket", payload, model);
    }

    /**
     * Handle packet
     * @param {object} ws websocket connection
     */
    handle(ws) {
        ws.sendPacket(new CKeepAlivePacket({ timestamp: this.payload.timestamp }));
    }
}