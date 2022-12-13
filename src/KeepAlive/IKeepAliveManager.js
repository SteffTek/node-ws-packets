/**
 * Imports
 */
const CKeepAlivePacket = require("./CKeepAlivePacket.js");
const SKeepAlivePacket = require("./SKeepAlivePacket.js");

/**
 * Create Manager
 * @param {object} packetManager server or client packet manager
 */
class IKeepAliveManager {
    __keepAliveTimeout;
    __keepAliveInterval;

    constructor(packetManager, isClient = false, { keepAliveTimeout = 60, keepAliveInterval = 30 } = {}) {
        // Set Vars
        this.__keepAliveTimeout = keepAliveTimeout;
        this.__keepAliveInterval = keepAliveInterval;

        /* Check If Client */
        if(isClient) {
            packetManager.addPacket(new CKeepAlivePacket());
            return;
        }

        /* Check if Server */
        //if(packetManager instanceof Server) return;

        /** Do Server Stuff */
        packetManager.addPacket(new SKeepAlivePacket());
    }

    /**
     * Send Keep Alive Packet on Server
     * @param {object} wsClient WebSocket Client Object on Server
     */
    onConnect(wsClient) {
        // Add this manager to client
        wsClient.__keepAliveManager = this;
        // Start Timer
        this.sendPing(wsClient);
    }

    /**
     * Stop Sending Keep Alive Packets
     * @param {object} wsClient WebSocket Client Object on Server
     */
    onDisconnect(wsClient) {
        // Stop Timer
        clearTimeout(wsClient.__keepAliveTimeout);
    }

    /**
     * Send a Ping Packet to a specific client
     * @param {object} wsClient WebSocket Client Object on Server
     */
    sendPing(wsClient) {
        // Send Packet and Start Timer
        wsClient.sendPacket(new SKeepAlivePacket({ timestamp: Date.now() }));
        // Start Timer
        wsClient.__keepAliveTimeout = setTimeout(() => {
            // If Timeout reached => Disconnect Client
            wsClient.terminate();
        }, this.__keepAliveTimeout * 1000 /* Seconds */);
    }

    /**
     * After receiving a ping, wait the interval timer and send a new one
     * @param {object} wsClient WebSocket Client Object on Server
     */
    receivePing(wsClient) {
        // Stop Timer
        clearTimeout(wsClient.__keepAliveTimeout);
        // Wait for interval and send new ping
        wsClient.__keepAliveTimeout = setTimeout(() => {
            this.sendPing(wsClient);
        }, keepAliveInterval * 1000 /* Seconds */);
    }
}

module.exports = IKeepAliveManager;