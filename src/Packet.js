/**
 * Imports
 */
const {Validator, DetailedValue} = require("node-data-validator");

/**
 * Packet Class
 */
class Packet {

    /**
     * Init new Packet Class
     * @param {string} name packet name for identification
     * @param {object} payload packet payload from sender
     * @param {object} model packet model to validate (With Node-Data-Validator)
     */
    constructor(name, payload = {}, model = {}) {

        /**
         * Set vars
         */
        this.name = name;
        this.payload = payload;
        this.model = model;

        /**
         * Check Validitity
         */
        this.isValid = this.validate();
    }

    /**
     * Handle Packet
     * @param {object} ws websocket client connection
     */
    handle(ws) {}

    /**
     * Checks if the payload is valid
     * @returns {boolean} is the received payload valid
     */
    validate() {
        return Validator(this.payload, this.model);
    }

    /**
     * Creates json from class
     * @returns {object} packet data
     */
    json() {
        return this;
    }
}

/**
 * Export Packet Class
 */
module.exports = Packet;