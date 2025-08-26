// server.js
const signalR = require("@microsoft/signalr");
const axios = require("axios");
const fs = require("fs");
const WebSocket = require("ws");

const runServerName = "myswift.amberit.com.bd";
const baseHubUrl = "https://myswift.amberit.com.bd:44379/trafficHub";
const logFile = "traffic.log";

fs.writeFileSync(logFile, "=== Traffic Log Started ===\n", "utf8");

const wss = new WebSocket.Server({ port: 4000 });
console.log("[WS] WebSocket server running on ws://localhost:4000");

function log(message, ws = null) {
    const time = new Date().toLocaleString();
    const fullMessage = `[${time}] ${message}`;
    console.log(fullMessage);
    fs.appendFileSync(logFile, fullMessage + "\n", "utf8");

    if (ws) {
        ws.send(JSON.stringify({ type: "log", message: fullMessage }));
    }
}

function formatSpeed(bytesPerSec) {
    if (bytesPerSec >= 1024 * 1024) {
        return (bytesPerSec / (1024 * 1024)).toFixed(2) + " Mbps";
    } else if (bytesPerSec >= 1024) {
        return (bytesPerSec / 1024).toFixed(2) + " Kbps";
    }
    return bytesPerSec + " bps";
}

async function startConnection(cid, ws) {
    log(`[INFO] Starting connection for CID: ${cid}`, ws);

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseHubUrl}?cid=${cid}`)
        .withAutomaticReconnect()
        .build();

    connection.on("traffics", (traffic) => {
        try {
            const data = JSON.parse(traffic);
            const timestamp = new Date(data.Timestamp).toLocaleTimeString();
            // Rx, Tx is in the context of isp
            const logMsg = `Upload: ${formatSpeed(data.Rx)} | Download: ${formatSpeed(data.Tx)} | Time: ${timestamp}`;

            log("[TRAFFIC] " + logMsg, ws);
            ws.send(JSON.stringify({ type: "traffic", ...data }));
        } catch (err) {
            log("[ERROR] Failed to parse traffic: " + err.message, ws);
        }
    });

    connection.on("traffic_finished", async (avgTraffic) => {
        log("[TRAFFIC_FINISHED] " + JSON.stringify(avgTraffic), ws);
        log("[SIGNALR] Restarting connection after traffic finished...", ws);

        await connection.stop();
        setTimeout(() => startConnection(cid, ws), 3000);
    });

    async function requestTrafficData(connectionId) {
        try {
            const payload = { connectionId, cid, runServerName };
            await axios.post(
                "https://myswift.amberit.com.bd/Sales/RealtimeTraffic.aspx/RequestTrafficData",
                payload,
                { headers: { "Content-Type": "application/json", "Origin": "https://myswift.amberit.com.bd" } }
            );
            log("[REQUEST_TRAFFIC_DATA] Sent successfully", ws);
        } catch (err) {
            log("[REQUEST_TRAFFIC_DATA] Error: " + err.message, ws);
        }
    }

    connection.start()
        .then(async () => {
            log("[SIGNALR] Connected! Connection ID: " + connection.connectionId, ws);
            await requestTrafficData(connection.connectionId);
        })
        .catch(err => log("[SIGNALR] Connection error: " + err, ws));
}

// Each frontend connection controls its own CID
wss.on("connection", (ws) => {
    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg.toString());
            if (data.type === "start" && data.cid) {
                startConnection(data.cid, ws);
            }
        } catch (err) {
            log("[WS ERROR] " + err.message, ws);
        }
    });
});
