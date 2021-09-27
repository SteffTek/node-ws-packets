export = Client;
/**
 * Packet Manager Class
 */
declare class Client {
    /**
     * Create a new Manager instance
     * @param {object} ws websocket client
     * @param {object} options options
     */
    constructor(ws: object, { log }?: object);
    /**
     * Manager Public Vars
     */
    log: any;
    ws: any;
    /**
     * Packets
     */
    packets: {};
    /**
     * Callbacks
     */
    callbacks: {
        onConnect: any[];
        onDisconnect: any[];
    };
    /**
     * PACKET REGISTERING
     */
    /**
     * Registers a packet
     * @param {object} packet packet
     * @returns {object} packet client
     */
    addPacket(packet: object): object;
    /**
     * Removes a packet
     * @param {object} packet packet
     * @returns {object} packet client
     */
    removePacket(packet: object): object;
    /**
     * Handle incomming packets
     * @param {object} ws websocket client
     * @param {object} received received data
     * @returns
     */
    handle(received: object): void;
    /**
     * Encoding & Decoding
     */
    /**
     * Get JSON from packet
     * @param {packet} packet packet
     * @returns packet json
     */
    encode(packet: any): any;
    /**
     * Returns packet from packet data
     * @param {object} packetData
     */
    decode(packetData: object): any;
    /**
     * Utils
     */
    /**
     * Add Callback to new Connection, executed on new connection
     * @param {function} _function callback function
     */
    onConnect(_function: Function): Client;
    /**
     * Add Callback to connection close
     * @param {function} _function callback function
     */
    onDisconnect(_function: Function): Client;
}
