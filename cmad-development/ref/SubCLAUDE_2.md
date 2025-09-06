# Network Handlers - VEMASS Communication Layer

## Directory Purpose
The `network/` directory implements all network communication protocols for the VEMASS District Server. It handles real-time device monitoring (MQTT), asynchronous task processing (RabbitMQ), web client updates (Socket.io), direct device control (TCP), and external system integration (VAlert). This layer forms the nervous system of the emergency notification platform.

## Architecture Overview

### Communication Flow
```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Devices   │────▶│    MQTT     │────▶│ Event Handler│
│  (VE6025)   │     │   Broker    │     │              │
└─────────────┘     └─────────────┘     └──────────────┘
                            │                    │
                            ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│Web Clients  │◀────│ Socket.io   │◀────│  RabbitMQ    │
│   (React)   │     │   Server    │     │   Queues     │
└─────────────┘     └─────────────┘     └──────────────┘
                            │                    │
                            ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   VAlert    │◀────│TCP Handler  │     │ API Worker   │
│   System    │     │             │     │              │
└─────────────┘     └─────────────┘     └──────────────┘
```

### Protocol Summary
- **MQTT**: Device status monitoring and health metrics
- **RabbitMQ**: Asynchronous inter-service messaging
- **Socket.io**: Real-time web client communication
- **TCP**: Direct device control and VAlert integration
- **HTTP/HTTPS**: External API integrations

## Handler Catalog

### mqttHandler.ts
**Purpose**: MQTT broker client for device monitoring
**Connection**:
```typescript
mqtt.connect(`mqtt://${MQTT_HOST}:${MQTT_PORT}`, {
  clientId: 'node-server',
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000
})
```
**Subscriptions**:
- `#`: Wildcard subscription to all topics
- Topic format: `/{districtId}/{campusId}/{subject}`
**Message Types**:
- **TLI (Traffic Light Interface)**: Campus connection status
  - Online/offline status changes
  - Triggers campus status updates
  - Creates notifications
- **statusMonitor**: Device health monitoring
  - 801 protocol events
  - Health metrics collection
  - Error reporting
**Key Features**:
- Automatic reconnection
- Status change detection
- Event triggering for automation
- Notification generation
- Database status updates

### rabbitHandler.ts
**Purpose**: RabbitMQ client for asynchronous messaging
**Connection**:
```typescript
amqp.connect(RABBITMQ_URL, {
  heartbeat: 30,
  reconnectTimeInSeconds: 5
})
```
**Queues**:
- `campus-connection-report`: Campus connectivity updates
- `playlist-updates`: Playlist synchronization
- `campus-playlists-removed`: Playlist deletion events
- `notification-updates`: User notifications
- `event-triggered-playlist`: Automated playlist activation
- `event-triggered-tcp`: Automated TCP commands
**Message Flow**:
1. Consume messages from queues
2. Parse JSON payloads
3. Execute appropriate handlers
4. Acknowledge message processing
**Optimization Features**:
- Non-persistent messages for performance
- Batch processing (2.5 second intervals)
- Connection pooling
- Automatic reconnection
- Heartbeat monitoring

### socketHandler.ts
**Purpose**: Socket.io server for real-time web communication
**Authentication**:
```typescript
socket.on('authenticate', async (data) => {
  const token = await validateJWT(data.token);
  if (token.success) {
    socket.join('auth');
    socket.userId = token.user.id;
  }
})
```
**Event Categories**:

#### Alert Management
- `sendCapMsg`: Send CAP message to campuses (requires admin/security role)
- `sendInstantCapMsg`: Immediate alert broadcast (requires admin/security role)
- `cancelCapMsg`: Cancel active alert (NO ROLE CHECK - SECURITY BUG!)
- `fetchAllActiveCaps`: Get active alerts (NO ROLE CHECK - SECURITY BUG!)
- `startCapMsgCountdown`: Alert countdown timer

#### Quick Page (QP)
- `getCodeAndChannels`: Retrieve QP configuration
- `sendQPTxt`: Send text-based quick page
- `sendQPTTS`: Send TTS quick page
- `sendQPTTSAndTxt`: Combined QP broadcast

#### System Operations
- `triggerEvent`: Manual event execution
- `removeDeviceInfo`: Clear device data
- `removeUnreadNotifications`: Mark notifications read
- `campusQPTest`: Quick page testing

**Security Features**:
- JWT validation
- Role-based access (admin, security)
- License feature checking
- User session tracking

**CRITICAL SECURITY GAPS** (as of 2025-08-11):
- `fetchAllActiveCaps` (line 152): NO ROLE CHECK - any authenticated user can view active alerts
- `cancelCapMsg` (line 225): NO ROLE CHECK - any authenticated user can cancel alerts (CRITICAL!)
- Both operations should require `admin` or `security` roles (or `messageTrigger:2` in new system)

### socketBroadcaster.ts
**Purpose**: Centralized Socket.io event broadcasting
**Broadcast Events**:
- `newNotification`: Single notification
- `addManyNotifications`: Batch notifications
- `newReview`: Review item created
- `updateCampus`: Campus status change
- `updateManyCampuses`: Batch campus updates
- `reviewItemRemoved`: Task completion
- `deviceMonitorPairing`: Device pairing status
- `valertMonitor`: VAlert system status
**Usage Pattern**:
```typescript
SocketBroadcaster.emit('eventName', data, targetUserId?);
```
**Features**:
- Singleton pattern
- Room-based broadcasting
- User-specific messaging
- Batch update support

### tcpHandler.ts
**Purpose**: Raw TCP socket communication with devices
**Functions**:
- `createTcpServer()`: Listen for device connections
- `sendTcpMessage()`: Send commands to devices
- `handleDeviceConnection()`: Process incoming connections
**Protocol Implementation**:
- Binary protocol handling
- Command/response pattern
- Connection timeout management
- Error recovery
**Use Cases**:
- Direct device control
- Legacy protocol support
- Quick page delivery
- Status queries

### valertSocketHandler.ts
**Purpose**: Integration with external VAlert system
**Connection Management**:
```typescript
// Persistent TCP connection
const socket = new net.Socket();
socket.connect(VALERT_PORT, VALERT_HOST);
```
**Features**:
- Automatic reconnection (10 second intervals)
- Message queuing during disconnection
- Alert forwarding
- Status synchronization
- Error logging
**Message Types**:
- Alert activation
- Alert cancellation
- Status updates
- System health

### eventHandler.ts
**Purpose**: Process automation triggers from network events
**Trigger Sources**:
- MQTT status changes
- RabbitMQ event messages
- Manual Socket.io triggers
**Actions**:
- Activate playlists
- Send TCP commands
- Phone notifications
- Multi-campus operations
**Processing Flow**:
1. Receive trigger event
2. Query matching automation rules
3. Execute configured actions
4. Log execution results

### campusStatusHandler.ts
**Purpose**: Manage campus connection state
**Responsibilities**:
- Process MQTT status updates
- Update database records
- Trigger status notifications
- Broadcast Socket.io updates
**Status Types**:
- Connected/Disconnected
- Last seen timestamp
- Connection quality
- Error states

### playlistHandler.ts
**Purpose**: Playlist synchronization coordination
**Operations**:
- Process playlist updates
- Trigger device synchronization
- Handle playlist removal
- Manage activation queues
**Integration**:
- RabbitMQ queue consumer
- API Worker communication
- Database updates
- Socket.io notifications

### qpHandler.ts
**Purpose**: Quick Page message processing
**Features**:
- Text-to-speech conversion
- Audio file generation
- Multi-campus targeting
- Priority handling
**Message Types**:
- Text only
- TTS only
- Combined text and TTS
- Test messages

### priorityHandler.ts
**Purpose**: Priority message queue management
**Functionality**:
- Message prioritization
- Queue ordering
- Delivery confirmation
- Retry logic
**Priority Levels**:
- Emergency (highest)
- Alert
- Normal
- Low (lowest)

### SMHandler.ts
**Purpose**: Status monitoring protocol implementation
**Protocol Details**:
- 801 status messages
- Health metric parsing
- Error detection
- Performance monitoring
**Metrics Collected**:
- Temperature
- Voltage levels
- Network statistics
- Hardware status

### mqttDelayHandler.ts
**Purpose**: MQTT message delay and retry logic
**Features**:
- Message buffering
- Delayed delivery
- Retry on failure
- Exponential backoff
**Use Cases**:
- Network congestion handling
- Rate limiting
- Reliable delivery

## Message Formats

### MQTT Messages
```typescript
// Status update
{
  topic: "/1/123/TLI",
  payload: {
    status: "online",
    timestamp: "2024-01-01T00:00:00Z"
  }
}

// Health metrics
{
  topic: "/1/123/statusMonitor",
  payload: {
    temperature: 45.5,
    voltage: 12.1,
    uptime: 86400
  }
}
```

### RabbitMQ Messages
```typescript
// Playlist update
{
  campusId: 123,
  playlistId: 456,
  action: "activate",
  priority: "high"
}

// Notification
{
  userId: 789,
  message: "Campus 123 disconnected",
  type: "warning"
}
```

### Socket.io Events
```typescript
// Client to server
socket.emit('sendCapMsg', {
  campusIds: [1, 2, 3],
  message: "Emergency alert",
  priority: "urgent"
});

// Server to client
io.to('auth').emit('updateCampus', {
  campusId: 123,
  status: "connected",
  lastSeen: new Date()
});
```

## Error Handling

### Connection Recovery
```typescript
// MQTT reconnection
client.on('error', (err) => {
  logger.error('MQTT error:', err);
  // Automatic reconnection handled by client
});

// RabbitMQ reconnection
connection.on('error', (err) => {
  logger.error('RabbitMQ error:', err);
  setTimeout(connectRabbitMQ, 5000);
});
```

### Message Processing
```typescript
try {
  const data = JSON.parse(message.content.toString());
  await processMessage(data);
  channel.ack(message);
} catch (error) {
  logger.error('Message processing failed:', error);
  channel.nack(message, false, false); // Don't requeue
}
```

## Performance Considerations

### Connection Pooling
- Reuse TCP connections
- Maintain persistent MQTT client
- Single RabbitMQ connection
- Socket.io connection management

### Message Batching
```typescript
// Batch campus updates
const batchProcessor = {
  updates: [],
  timer: null,
  
  add(update) {
    this.updates.push(update);
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 2500);
    }
  },
  
  flush() {
    if (this.updates.length > 0) {
      SocketBroadcaster.emit('updateManyCampuses', this.updates);
      this.updates = [];
    }
    this.timer = null;
  }
};
```

### Queue Management
- Non-persistent messages for performance
- Priority queues for urgent messages
- Dead letter exchanges for failures
- TTL for time-sensitive messages

## Security Measures

### Authentication
- JWT validation for Socket.io
- API token validation for devices
- Certificate-based MQTT (when enabled)
- Role-based access control

### Message Validation
```typescript
// Validate incoming messages
if (!isValidCampusId(data.campusId)) {
  throw new Error('Invalid campus ID');
}

if (!hasPermission(user, 'send-alert')) {
  throw new Error('Insufficient permissions');
}
```

### Network Security
- TLS/SSL for production
- Message encryption for sensitive data
- Rate limiting
- Connection throttling

## Monitoring and Logging

### Health Checks
```typescript
// Service health endpoint
app.get('/health/network', (req, res) => {
  res.json({
    mqtt: mqttClient.connected,
    rabbitmq: rabbitConnection?.connection?.stream?.writable,
    socketio: io.engine.clientsCount,
    valert: valertSocket.readyState === 'open'
  });
});
```

### Metrics Collection
- Connection count
- Message throughput
- Error rates
- Latency measurements

### Log Categories
- Connection events
- Message processing
- Error conditions
- Performance metrics

## Integration Guidelines

### Adding New Message Types
1. Define message schema
2. Add queue/topic configuration
3. Implement handler function
4. Add error handling
5. Update documentation

### Protocol Selection
- **MQTT**: Device status, health metrics
- **RabbitMQ**: Async operations, worker tasks
- **Socket.io**: Real-time UI updates
- **TCP**: Direct device control
- **HTTP**: External API calls

### Best Practices
- Always validate messages
- Implement retry logic
- Use appropriate timeouts
- Log all errors
- Monitor connection health
- Handle graceful shutdown

## Testing Approach

### Unit Tests
- Mock network connections
- Test message parsing
- Verify error handling
- Check retry logic

### Integration Tests
- Use test brokers
- Verify end-to-end flow
- Test failure scenarios
- Load testing

### Debugging Tools
- MQTT Explorer for MQTT
- RabbitMQ Management UI
- Socket.io Admin UI
- Wireshark for TCP
- Network logs

## Common Issues

### Connection Problems
- Check firewall rules
- Verify broker configuration
- Review credentials
- Check network connectivity

### Message Loss
- Enable persistent messages
- Implement acknowledgments
- Add retry mechanisms
- Monitor dead letter queues

### Performance Issues
- Review message volume
- Check connection limits
- Optimize batch sizes
- Add connection pooling