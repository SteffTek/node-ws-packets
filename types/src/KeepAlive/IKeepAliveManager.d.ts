export = IKeepALiveManager;
declare class IKeepALiveManager {
    constructor(packetManager: any, { keepAliveTimeout, keepAliveInterval }?: {
        keepAliveTimeout?: number;
        keepAliveInterval?: number;
    });
    __keepAliveTimeout: number;
    __keepAliveInterval: number;
    /**
     * Send Keep Alive Packet on Server
     * @param {object} wsClient WebSocket Client Object on Server
     */
    onConnect(wsClient: object): void;
    /**
     * Stop Sending Keep Alive Packets
     * @param {object} wsClient WebSocket Client Object on Server
     */
    onDisconnect(wsClient: object): void;
    /**
     * Send a Ping Packet to a specific client
     * @param {object} wsClient WebSocket Client Object on Server
     */
    sendPing(wsClient: object): void;
    /**
     * After receiving a ping, wait the interval timer and send a new one
     * @param {object} wsClient WebSocket Client Object on Server
     */
    receivePing(wsClient: object): void;
}
