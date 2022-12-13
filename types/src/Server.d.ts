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
    constructor(wss: object, { log, keepAlive, keepAliveTimeout, keepAliveInterval }?: object);
    /**
     * Manager Public Vars
     */
    log: any;
    wss: any;
    keepAlive: any;
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
        onInvalid: any[];
    };
    /**
     * Create Keep Alive Timer
     */
    __keepAliveManager: IKeepAliveManager;
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
     * Handle incoming packets
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
     * The callback type for connection handling
     * @callback onConnectCallback
     * @param {object} websocketConnection
     */
    /**
     * Add Callback to new Connection, executed on new connection
     * @param {onConnectCallback} _function callback function
     * @returns {Server} server object
     */
    onConnect(_function: (websocketConnection: object) => any): Server;
    /**
     * The callback type for disconnection handling
     * @callback onDisconnectCallback
     * @param {object} websocketConnection
     * @param {object} event
     */
    /**
     * Add Callback to connection close
     * @param {onDisconnectCallback} _function callback function
     * @returns {Server} server object
     */
    onDisconnect(_function: (websocketConnection: object, event: object) => any): Server;
    /**
     * The callback type for error handling
     * @callback onErrorCallback
     * @param {object} websocketConnection
     * @param {object} error
     */
    /**
     * Add Callback to connection error
     * @param {onErrorCallback} _function callback function
     * @returns {Server} server object
     */
    onError(_function: (websocketConnection: object, error: object) => any): Server;
    /**
     * The callback type for invalid packet handling
     * @callback onInvalidCallback
     * @param {object} websocketConnection
     * @param {object} packet
     */
    /**
     * Add Callback to invalid packet error
     * @param {onInvalidCallback} _function callback function
     * @returns {Server} server object
     */
    onInvalid(_function: (websocketConnection: object, packet: object) => any): Server;
}
import IKeepAliveManager = require("./KeepAlive/IKeepAliveManager.js");
