/**
 * Imports
 */
const { v4: uuid } = require("uuid");
const url = require("url");
const IKeepAliveManager = require("./KeepAlive/IKeepAliveManager.js");

/**
 * Packet Manager Class
 */
class Server {
    /**
     * Create a new Manager instance
     * @param {object} wss websocket server
     * @param {object} options options
     */
    constructor(wss, { log = false, keepAlive = false, keepAliveTimeout = 60, keepAliveInterval = 30 } = {}) {
        /**
         * Manager Public Vars
         */
        this.log = log;
        this.wss = wss;
        this.keepAlive = keepAlive;

        /**
         * Create ID
         */
        this.id = uuid();

        /**
         * Packets
         */
        this.packets = {
            /* NAME: PACKET OBJECT CLASS */
        }

        /**
         * Callbacks
         */
        this.callbacks = {
            onError: [],
            onConnect: [],
            onDisconnect: [],
            onInvalid: []
        }

        /**
         * Create Keep Alive Timer
         */
        this.__keepAliveManager = new IKeepAliveManager(this, false, { keepAliveTimeout, keepAliveInterval });

        /**
         * Init Websocket Listener
         */
        wss.on("connection", (ws, req) => {

            // Set Connection UUID
            ws.id = uuid();

            // Log
            if (this.log) console.log("New client connected");

            // Assign IP for easy access
            let ip = null;

            // Get IP
            if (req.headers['x-forwarded-for']) {
                ip = req.headers['x-forwarded-for'].split(/\s*,\s*/)[0]
            } else {
                ip = req.socket.remoteAddress;
            }

            // Set IP
            ws.ip = ip;

            // Set Request
            ws.req = req;

            // Get Query Params from URL
            try {
                ws.req.query = Object.assign({}, url.parse(req.url, true).query);
            } catch (e) {
                // Set empty query
                ws.req.query = {};
            }

            // Attach functions for client socket
            ws.sendPacket = (packet) => {
                // Decode Packet to JSON
                const json = this.encode(packet);

                // Append Client Ident for Identification
                json.sender = this.id;

                // Remove Model
                delete json.model;

                // Send
                if (ws.readyState === 1)
                    ws.send(JSON.stringify(json));
            }

            // Go through all onConnect functions
            this.callbacks.onConnect.forEach(_function => {
                _function(ws);
            });

            // Add Handler
            ws.on('message', (message) => {
                // Try to decode message
                try {
                    // Handle message
                    this.handle(ws, message);
                } catch (e) {
                    // Log error
                    if (this.log) console.error("Error on incoming message!", e);
                }
            });

            // Close Handler
            ws.on("close", (event) => {
                // Go through all onDisconnect functions
                this.callbacks.onDisconnect.forEach(_function => {
                    _function(ws, event);
                });
                // Clear KeepAliveTimer
                this.__keepAliveManager.onDisconnect(ws);
            });

            ws.on("error", (error) => {
                // Go through all onError functions
                this.callbacks.onError.forEach(_function => {
                    _function(ws, error);
                });
            });

            // Add KeepAlive Manager
            if (this.keepAlive) {
                this.__keepAliveManager.onConnect(ws);
            }
        });

        // Log readieness
        if (this.log) console.log("PacketServer initialized!");
    }

    /**
     * PACKET REGISTERING
     */

    /**
     * Registers a packet
     * @param {object} packet packet
     * @returns {object} packet client
     */
    addPacket(packet) {

        // Get vars out of packet class
        const packetClass = packet.constructor;
        const name = packet.name;

        // Check for Packet
        if (this.packets[name]) {
            if (this.log) console.error(`Packet '${name}' already initialized!`);
            return this;
        }

        // Add Packet Class
        this.packets[name] = packetClass;

        // Log
        if (this.log) console.log(`Packet '${name}' initialized!`);

        // Return client instance
        return this;
    }

    /**
     * Removes a packet
     * @param {object} packet packet
     * @returns {object} packet client
     */
    removePacket(packet) {

        // Get vars out of packet class
        const name = packet.name;

        // Check for Packet
        if (!this.packets[name]) {
            if (this.log) console.error(`Packet '${name}' not initialized!`);
            return this;
        }

        // Add Packet Class
        delete this.packets[name];

        // Log
        if (this.log) console.log(`Packet '${name}' removed!`);

        // Return client instance
        return this;
    }

    /**
     * Handle incoming packets
     * @param {object} ws websocket client
     * @param {object} received received data
     * @returns 
     */
    handle(ws, received) {
        try {
            // Get JSON from received data
            const json = JSON.parse(received);

            // Set Sender to ws.id; => overwrite sender from received packet (spoof)
            json.sender = ws.id;

            // Check if sender === receiver => abort
            if (json.sender === this.id) {
                return;
            }

            // Parse packet from data
            const packet = this.decode(json);

            // Check if packet is registered
            if (packet === null) {
                return;
            }

            // Check if packet is valid
            packet.isValid = packet.validate();

            // Check validity
            if (!packet.isValid) {
                // Log broken packet
                // Go through all onInvalid functions
                this.callbacks.onInvalid.forEach(_function => {
                    _function(ws, packet);
                });
                return;
            }

            // Handle packet
            packet.handle(ws);
        } catch (e) {
            // Log Error
            if (this.log) console.error("Error while handling event", e);
        }
    }

    /**
     * Encoding & Decoding
     */

    /**
     * Get JSON from packet
     * @param {packet} packet packet
     * @returns packet json
     */
    encode(packet) {
        // Return packet json data
        return packet.json();
    }

    /**
     * Returns packet from packet data
     * @param {object} packetData 
     */
    decode(packetData) {

        // Check for packet name
        if (!packetData.name) {
            return null;
        }

        // Check for packet in registered packets
        if (!this.packets[packetData.name]) {
            return null;
        }

        // Delete transmitted model, use own model for packet
        delete packetData.model;

        // Return Packet Data
        return Object.assign(new this.packets[packetData.name], packetData);
    }

    /**
     * Utils
     */

    /**
     * Broadcast packet to all clients
     * @param {packet} packet packet to broadcast
     */
    broadcast(packet) {

        // Decode Packet to JSON
        const json = this.encode(packet);

        // Append Client Ident for Identification
        json.sender = this.id;

        // Loop Clients
        this.wss.clients.forEach((client) => {

            // Check if client is ready
            if(client.readyState === 1) {
                // Send JSON
                client.send(JSON.stringify(json));
            }
        });
    }

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
    onConnect(_function) {
        // Add to connection listener
        this.callbacks.onConnect.push(_function);

        // Return Server
        return this;
    }

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
    onDisconnect(_function) {
        // Add to connection listener
        this.callbacks.onDisconnect.push(_function);

        // Return Server
        return this;
    }

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
    onError(_function) {
        // Add to connection listener
        this.callbacks.onError.push(_function);

        // Return Server
        return this;
    }

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
    onInvalid(_function) {
        // Add to connection listener
        this.callbacks.onInvalid.push(_function);

        // Return Server
        return this;
    }
}

/**
 * Exports
 */
module.exports = Server;
