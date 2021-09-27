/**
 * Imports
 */
const { Packet } = require("../Packets");

/**
 * Ping Packet
 */
class Ping extends Packet {
    constructor(payload) {

        /*
            Create Model
            Used to check data types
        */
        const model = {
            timestamp: Number
        }

        /*
            Init Packet
        */
        super("Ping", payload, model);
    }

    /**
     * Handle packet
     * @param {object} ws websocket connection 
     */
    handle(ws) {
        console.log(this);
    }
}

module.exports = Ping;