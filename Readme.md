
[![Discord](https://img.shields.io/discord/803319138260090910?color=%237289DA&label=Discord)](https://discord.gg/Qgv8DSMYM3) 
![License](https://img.shields.io/github/license/SteffTek/node-ws-packets) 
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/stefftek/node-ws-packets)](https://github.com/SteffTek/node-ws-packets) 
[![GitHub issues](https://img.shields.io/github/issues/stefftek/node-ws-packets)](https://github.com/SteffTek/node-ws-packets/issues) 
![Build](https://img.shields.io/github/workflow/status/SteffTek/node-ws-packets/Node.js%20Package)

# node-ws-packets
**A packet-based javascript websocket communitcation.**

# About
To simplify and streamline the process of handling, sending and receiving data, node-ws-packets was created. It's useful for live communitaction between multiple clients, like in browser games.

Packets are validated with [Node Data Validator](https://www.npmjs.com/package/node-data-validator). If a packet fails validation (model and payload fail to compare) the packet will be **dropped**!

There are 2 main components to this module. The handlers (Client or Server) and the packets. Packets are created from a base packet class that handels validation and some base functionality. The handlers handle incomming packets and execute them, if the payload data matches the local defined model. The Model is **not** transmitted over the network.

The server handler also handels client id generation for identification of clients. The uuid module is used for this id generation.

# Installation
NodeJS Installation
```
npm i node-ws-packets
```

# Browser Support
For browser support we pre-packed the Client.js and Packet.js. You can import the file below into your html project and use it like you would in a node environment.
**Note:** The Server is not available in this script. Further - you can use the module with webpack and we recommend to do so.
```html
<script src="https://unpkg.com/node-ws-packets@latest/Browser.js" type="text/javascript"></script>
```

# Usage
### Import
with Common JS
```js
/* Import Classes */
const { Packet, Server, Client } = require("node-ws-packets");
```
**or** - TypeScript Import
```js
/* Import Classes */
import { Packet, Server, Client } from "node-ws-packets";
```

## Using the Module
### Creating server instance
```js
/*
    IMPORTS
*/
const { Server } = require("node-ws-packets");

/*
    Create Server
*/
// Active WebSocketServer needed.
const serverManager = new Server(wss, {log: true});

/*
    Add Packets
*/
serverManager.addPacket(new Ping());

/*
    Add Events
*/

// Executed on every client that connects
serverManager.onConnect((ws) => {
    // Send Test Packet after client connected
    ws.sendPacket(new Ping({timestamp: Date.now()}));
});

// Executed on every client that disconnects
serverManager.onDisconnect((ws, event) => {
    console.log("server", "Client has disconnected!");
});

// Executed on every error that a client encounters
serverManager.onError((ws, error) => {
    console.log(ws.id, error);
});

/*
    Broadcast Packets to all connected clients
*/
serverManager.broadcast(/*Packet*/);
```

### Creating client instance
```js
/*
    IMPORTS
*/
const { Client } = require("node-ws-packets");

/*
    Client
*/
// Active Web Socket Connection needed.
const clientManager = new Client(ws);

/*
    Add Packets
*/
clientManager.addPacket(new Ping());

/*
    Add Events
*/

// Executed on client connection
clientManager.onConnect((ws) => {
    // Same as Server Manager
});

// Executed on client disconnect
clientManager.onDisconnect((ws, event) => {
    // Same as Server Manager
});

// Executed on client error
serverManager.onError((ws, error) => {
    // Same as Server Manager
});

```

### Wrapper Function
`ws.sendPacket(new Packet)` is a wrapper for sending packets directrly from the WebSocket connection. It is implemented on client and server WebSocket connections. Using `ws.send` can break the sending and receiving of packets.

### Creating a packet
```js
/*
    IMPORTS
*/
const { Packet } = require("node-ws-packets");

/*
    Create Packet
*/
class Ping extends Packet {
    constructor(payload) {

        /*
            Create Model
            Used to check data types
            [Dependency Package node-data-validator used]
        */
        const model = {
            timestamp: Number
        }

        /*
            Init Packet
        */
        super("Ping", payload, model);
    }

    /**
     * Handle packet
     * @param {object} ws websocket connection
     */
    handle(ws) {
        console.log(this.payload);
    }
}
```

### Options
A Server or Client can accept the following options.
| Option   | Type    | Description                           | Values            | Default |
|----------|---------|---------------------------------------|-------------------|---------|
| log      | boolean | Should the Module auto-log to console?| `true` or `false` | `false`  |
| reportBroken | boolean | Should the Module report broken packets that are invald | `true` or `false` | `false`  |


### Packet
A packet is always structured in the same way.
```js
PacketName {
  name: 'PacketName',
  payload: { PacketData },
  model: { PacketModel },
  isValid: true,
  sender: SenderID
}
```

### IDs
IDs are generated by the server for each client. You can get the id of an client with `ws.id`. It is recommended to implement a handshake protocol with this id and save it on the client locally.

### Request Parameters
WebSocket Connections can carry additional parameters in the query. These parameters are passed on to the WebSocket Client object and can be accessed with `ws.req.query`. These are auto generated from the url string in `ws.req.url`.

`ws.req` contains the whole request object.

### About OnConnect
If you want to create a client manager, you can hook in the user id on the `onConnect` callback on the server side. With the aforementioned `ws.id` you can initiate a new client instance on your client manager.
