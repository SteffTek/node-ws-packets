const { Packet, Server, Client } = require("./Packets");
const {Validator, DetailedValue} = require("node-data-validator");
console.log(Packet, Server);

// Websocket
const { WebSocket, WebSocketServer } = require("ws");

// Create Websocket Server
const wss = new WebSocketServer({
    port: 8080
});

/**
 * PACKET MANAGER SERVER
 */
// Create Packet Manager
const pm = new Server(wss, {log: true});
// Add Connection Handler to each new client
pm.onConnect((ws) => {
    // Send Test Packet
    ws.sendPacket(new Ping({timestamp: Date.now()}));
});
// Add Disconnection Handler to each new client
pm.onDisconnect((ws) => {
    console.log("server", "Client has disconnected!");
});


// Create WS Client for testing
const ws = new WebSocket("ws://localhost:8080");

/**
 * PACKET MANAGER CLIENT
 */
const cm = new Client(ws, {log: true});
/**
 * Connection Events for client
 */
cm.onConnect((ws) => {
    console.log("client", "I have connected!");

    ws.sendPacket(new Ping({timestamp: Date.now()}))
});
cm.onDisconnect((ws) => {
    console.log("client", "I have disconnected!");
});


// Add Packets
const Ping = require("./example/Ping");

// Add Packet to Managers
pm.addPacket(new Ping());
//cm.addPacket(new Ping());