export = Server;
/**
 * Packet Manager Class
 */
declare class Server {
    /**
     * Create a new Manager instance
     * @param {object} wss websocket server
     * @param {object} options options
     */
    constructor(wss: object, { log, reportBroken }?: object);
    /**
     * Manager Public Vars
     */
    reportBroken: any;
    log: any;
    wss: any;
    /**
     * Create ID
     */
    id: any;
    /**
     * Packets
     */
    packets: {};
    /**
     * Callbacks
     */
    callbacks: {
        onError: any[];
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
    handle(ws: object, received: object): void;
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
     * Broadcast packet to all clients
     * @param {packet} packet packet to broadcast
     */
    broadcast(packet: any): void;
    /**
     * Add Callback to new Connection, executed on new connection
     * @param {function} _function callback function
     */
    onConnect(_function: Function): Server;
    /**
     * Add Callback to connection close
     * @param {function} _function callback function
     */
    onDisconnect(_function: Function): Server;
}
