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
const pm = new Server(wss, {log: true, keepAlive: true});
// Add Connection Handler to each new client
pm.onConnect((ws) => {
    // Send Test Packet
    ws.sendPacket(new Ping({timestamp: Date.now()}));
    wss.close();
});
// Add Disconnection Handler to each new client
pm.onDisconnect((ws, event) => {
    console.log("server", "Client has disconnected!", event);
});
// Add Error Handler
pm.onError((ws, error) => {
    console.log(ws.id, error);
})


// Create WS Client for testing
const ws = new WebSocket("ws://localhost:8080/?test=test");

/**
 * PACKET MANAGER CLIENT
 */
const cm = new Client(ws, {log: true,keepAlive: true});
/**
 * Connection Events for client
 */
cm.onConnect((ws) => {
    console.log("client", "I have connected!");
    ws.sendPacket(new Ping({timestamp: "I am Broken!"}));
    ws.close();
});
cm.onDisconnect((ws) => {
    console.log("client", "I have disconnected!");
});


// Add Packets
const Ping = require("./example/Ping");

// Add Packet to Managers
pm.addPacket(new Ping());
cm.addPacket(new Ping());
