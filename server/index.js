const WebSocket = require('ws');
const url = require('url');

const PORT = process.env.PORT || 3001;

// Map to store board rooms
// Structure: { [boardName]: { clients: Set<WebSocket>, text: string } }
const boards = new Map();

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws, req) => {
  // Parse query parameters from URL
  const queryObj = url.parse(req.url, true).query;
  const boardName = queryObj.board;

  // Close connection if no board parameter provided
  if (!boardName) {
    ws.send(JSON.stringify({ type: 'error', message: 'No board parameter provided' }));
    ws.close();
    return;
  }

  // Get or create board room
  if (!boards.has(boardName)) {
    boards.set(boardName, { clients: new Set(), text: '' });
  }

  const room = boards.get(boardName);

  // Check if board is full (5 client limit)
  if (room.clients.size >= 5) {
    ws.send(JSON.stringify({ type: 'error', message: 'Board full (5/5)' }));
    ws.close();
    return;
  }

  // Add client to room
  room.clients.add(ws);
  console.log(`[${boardName}] +1 (${room.clients.size}/5)`);

  // Notify all clients in room that someone connected
  const connectMessage = {
    type: 'connected',
    count: room.clients.size,
    max: 5
  };
  room.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(connectMessage));
    }
  });

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      if (message.type === 'text') {
        // Update room text
        room.text = message.text;

        // Broadcast to all OTHER clients (not sender)
        const textMessage = {
          type: 'text',
          text: message.text
        };
        room.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(textMessage));
          }
        });
      }
    } catch (error) {
      console.error(`[${boardName}] Message parse error:`, error.message);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    room.clients.delete(ws);
    console.log(`[${boardName}] -1 (${room.clients.size}/5)`);

    // Notify remaining clients
    if (room.clients.size > 0) {
      const disconnectMessage = {
        type: 'connected',
        count: room.clients.size,
        max: 5
      };
      room.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(disconnectMessage));
        }
      });
    } else {
      // Delete room if empty
      boards.delete(boardName);
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`[${boardName}] WebSocket error:`, error.message);
  });
});

console.log(`Board WS server on port ${PORT}`);
