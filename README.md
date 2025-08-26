# AmberIT Live Traffic Monitor

AmberIT Live Traffic Monitor is a Node.js application that connects to AmberIT's SignalR traffic hub, fetches real-time traffic data for a given CID, and displays it live in a web dashboard. The backend uses WebSockets to push traffic data to the frontend, which visualizes it using Chart.js.

## Features

- Real-time traffic monitoring for AmberIT users
- WebSocket server for live updates
- Interactive web dashboard with traffic charts and logs
- Logs all traffic events to a file

## Requirements

- Node.js (v16 or newer recommended)
- npm (Node Package Manager)

## Installation

1. **Clone the repository:**
   ```sh
   git clone [<your-repo-url>](https://github.com/ahmfuad/LiveTraffic-AmberIT.git)
   cd LiveTraffic-AmberIT
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

   Or, if you prefer using Python's pip (for reference, see `requirements.txt` below).

## Running the Application

1. **Start the backend server:**
   ```sh
   node app.js
   ```

   This will start a WebSocket server on `ws://localhost:4000` and begin logging to `traffic.log`.

2. **Open the frontend dashboard:**
   - Open `public/index.html` in your web browser.
   - Enter your CID when prompted.

3. **View logs and traffic:**
   - The dashboard will display live traffic charts and logs.
   - All events are also logged to `traffic.log`.

## Project Structure

```
.gitignore
app.js              # Main backend server (WebSocket + SignalR)
package.json        # Node.js dependencies and scripts
traffic.log         # Log file (auto-generated)
public/
  index.html        # Frontend dashboard (Chart.js)
```

## Dependencies

- [express](https://www.npmjs.com/package/express)
- [@microsoft/signalr](https://www.npmjs.com/package/@microsoft/signalr)
- [axios](https://www.npmjs.com/package/axios)
- [ws](https://www.npmjs.com/package/ws)
- [cors](https://www.npmjs.com/package/cors)

> **Note:** This project is Node.js-based. Use `npm install` as shown above.

> **Request:** Report if you encounter any issues.

---

## License

ISC
