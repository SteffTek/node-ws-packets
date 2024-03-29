/**
 * Imports
 */
const IKeepAliveManager = require("./KeepAlive/IKeepAliveManager.js");

/**
 * Packet Manager Class
 */
class Client {
    /**
     * Create a new Manager instance
     * @param {object} ws websocket client
     * @param {object} options options
     */
    constructor(ws, { log = false, keepAlive = false } = {}) {
        /**
         * Manager Public Vars
         */
        this.log = log;
        this.ws = ws;
        this.keepAlive = keepAlive;

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
         if(keepAlive)
         this.__keepAliveManager = new IKeepAliveManager(this, true);

        /**
         * Init Websocket Listener
         */
        const open = () => {

            // Log
            if (this.log) console.log("New connection established");

            // Attach functions for client socket
            ws.sendPacket = (packet) => {
                // Decode Packet to JSON
                const json = this.encode(packet);

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
        };

        // Add Handler
        const message = (message) => {
            // Try to decode message
            try {
                // Handle message
                this.handle(message);
            } catch (e) {
                // Log error
                if (this.log) console.error("Error on incoming message!", e);
            }
        };

        // Close Handler
        const close = (event) => {
            // Go through all onConnect functions
            this.callbacks.onDisconnect.forEach(_function => {
                _function(ws, event);
            });
        };

        // Error Handler
        const error = (error) => {
            // Go through all onError functions
            this.callbacks.onError.forEach(_function => {
                _function(ws, error);
            });
        };

        // Function wrapper for browser and node support
        (!ws.on ? ws.onopen = open : ws.on("open", open));
        (!ws.on ? ws.onclose = close : ws.on("close", close));
        (!ws.on ? ws.onmessage = message : ws.on("message", message));
        (!ws.on ? ws.onerror = error : ws.on("error", error));

        // Log readieness
        if (this.log) console.log("PacketClient initialized!");
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
    handle(received) {
        try {
            // Get JSON from received data
            let json = JSON.parse((received.data ? received.data : received));

            // Parse packet from data
            const packet = this.decode(json);

            // Check if packet is registered
            if (packet === null) {
                // Go through all onInvalid functions
                this.callbacks.onInvalid.forEach(_function => {
                    _function(this.ws, json);
                });
                return;
            }

            // Check if packet is valid
            packet.isValid = packet.validate();

            // Check validity
            if (!packet.isValid) {
                // Log broken packet
                // Go through all onInvalid functions
                this.callbacks.onInvalid.forEach(_function => {
                    _function(this.ws, packet);
                });
                return;
            }

            // Handle Packet
            packet.handle(this.ws);

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
     * The callback type for connection handling
     * @callback onConnectCallback
     * @param {object} websocketConnection
     */

    /**
     * Add Callback to new Connection, executed on new connection
     * @param {onConnectCallback} _function callback function
     * @returns {Client} client object
     */
    onConnect(_function) {
        // Add to connection listener
        this.callbacks.onConnect.push(_function);

        // Return client
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
     * @returns {Client} client object
     */
    onDisconnect(_function) {
        // Add to connection listener
        this.callbacks.onDisconnect.push(_function);

        // Return client
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
     * @returns {Client} client object
     */
    onError(_function) {
        // Add to connection listener
        this.callbacks.onError.push(_function);

        // Return client
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
     * @returns {Client} client object
     */
    onInvalid(_function) {
        // Add to connection listener
        this.callbacks.onInvalid.push(_function);

        // Return Client
        return this;
    }
}

/**
 * Exports
 */
module.exports = Client;