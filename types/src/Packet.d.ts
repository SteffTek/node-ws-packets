export = Packet;
/**
 * Packet Class
 */
declare class Packet {
    /**
     * Init new Packet Class
     * @param {string} name packet name for identification
     * @param {object} payload packet payload from sender
     * @param {object} model packet model to validate (With Node-Data-Validator)
     */
    constructor(name: string, payload?: object, model?: object);
    /**
     * Set vars
     */
    name: string;
    payload: any;
    model: any;
    /**
     * Check Validitity
     */
    isValid: boolean;
    /**
     * Handle Packet
     * @param {object} ws websocket client connection
     */
    handle(ws: object): void;
    /**
     * Checks if the payload is valid
     * @returns {boolean} is the received payload valid
     */
    validate(): boolean;
    /**
     * Creates json from class
     * @returns {object} packet data
     */
    json(): object;
}
