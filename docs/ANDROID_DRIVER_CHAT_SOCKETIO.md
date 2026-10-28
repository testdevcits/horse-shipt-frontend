# Android customer–shipper chat (Socket.IO)

This guide covers the shipment chat between a customer and a shipper. It does not describe driver chat.

## URLs and authentication

Set `BASE_URL` to the backend origin plus `/api`, for example:

- Hosted dev: `https://horse-shipt.vercel.app/api`
- Android emulator with backend running on the development computer: `http://10.0.2.2:5000/api`
- Physical Android device: `http://<development-computer-LAN-IP>:5000/api`

Connect Socket.IO to the backend origin without `/api`; its path is `/socket.io`. The backend supports polling and WebSocket transports. Local Android HTTP may require cleartext traffic in debug builds; use HTTPS for hosted deployments.

Authenticate each user with the corresponding login endpoint and use that role's bearer token for every REST request:

- Customer: `POST {BASE_URL}/customer/login`
- Shipper: `POST {BASE_URL}/shipper/login`

Use the actual login route configured by the app if its authentication screen has a different endpoint. The customer chat routes use `customerAuth`; the shipper routes use `shipperAuth`.

## Conversation flow

1. Load the chat list:
   - Customer: `GET {BASE_URL}/customer/chat/shippers`
   - Shipper: `GET {BASE_URL}/shipper/chat/customers`

   Send `Authorization: Bearer <token>`. Both return `{ "success": true, "data": [...] }`. Each item identifies the other participant and includes `shipmentId`, shipment code/status, quote status when applicable, and `isChatLocked`.

2. Select an item and open its shipment conversation:

   ```http
   POST {BASE_URL}/customer/chat/room
   Authorization: Bearer <customer-or-shipper-token>
   Content-Type: application/json

   {"shipmentId":"<shipment-id>"}
   ```

   Shippers use `/shipper/chat/room` instead. The response has `room`, `roomId`, and shipment details. The server creates or returns the room shared by this customer, shipper, and shipment. A shipper's quote permits the corresponding shipment chat before assignment.

3. Fetch history with `GET {BASE_URL}/{customer|shipper}/chat/rooms/{roomId}/messages`, using the same role token. The response is `{ "success": true, "messages": [...] }`; messages are ordered oldest first.

4. Connect Socket.IO and join the room after the authenticated room request succeeds:

   ```json
   {"roomId":"<room-id>"}
   ```

   Emit this as `horse_shipt:join_chat_room`, then listen for `receiveMessage` and append incoming message objects.

5. Send a text message using `POST {BASE_URL}/{customer|shipper}/chat/rooms/{roomId}/messages` with JSON `{ "message": "Hello" }`. The response is `{ "success": true, "data": <message> }`. The server saves it and broadcasts `receiveMessage` to the room, including back to the sender. Add the REST result immediately and de-duplicate socket deliveries by message `_id`.

6. For an image, use the same POST endpoint as `multipart/form-data`, with an optional `message` text field and the image file field named `image`. The response and socket event include the saved `media` item. The backend also accepts PDF uploads through this field. A request must contain text, an image, or a PDF.

The room must be rejoined after a Socket.IO reconnect. Refetch history when opening/resuming a conversation or when reconnecting if needed to recover missed events.

## Socket.IO events

| Direction | Event | Payload | Purpose |
|---|---|---|---|
| Android → server | `horse_shipt:join_chat_room` | `{ "roomId": "..." }` | Join the room after REST has authorized and returned it. |
| Server → Android | `receiveMessage` | Message object | Deliver a new saved message to room members. |

Message objects contain `chatRoom`, `senderId`, `senderRole` (`customer` or `shipper`), `message`, `media`, `isRead`, and timestamps. The event has no acknowledgement. Room joining itself does not verify the bearer token, so only join a room ID returned by the authenticated room endpoint. Continue using authenticated REST requests for listing, opening, loading, and sending.

## Kotlin Socket.IO example

Dependency (Socket.IO Java client):

```gradle
implementation("io.socket:socket.io-client:<current-compatible-version>")
```

Connect and join the room:

```kotlin
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject

val socketUrl = "https://horse-shipt.vercel.app" // origin only, no /api
val options = IO.Options.builder()
    .setPath("/socket.io")
    .setTransports(arrayOf("websocket", "polling"))
    .setReconnection(true)
    .build()

val socket: Socket = IO.socket(socketUrl, options)

socket.on(Socket.EVENT_CONNECT) {
    socket.emit(
        "horse_shipt:join_chat_room",
        JSONObject().put("roomId", roomId)
    )
}

socket.on("receiveMessage") { args ->
    val message = args.firstOrNull() as? JSONObject ?: return@on
    val messageId = message.optString("_id")
    // Dispatch to the UI thread; append only if messageId is not already shown.
}

socket.connect()
```

On leaving the chat or signing out, remove listeners and disconnect:

```kotlin
socket.off("receiveMessage")
socket.disconnect()
socket.close()
```

On reconnect, `EVENT_CONNECT` runs again and rejoins the current room. Send the bearer token on REST requests; room membership is not an authorization substitute.

## REST request examples

Customer or shipper room creation (choose the role-specific path):

```http
POST /api/customer/chat/room
Authorization: Bearer <customer-token>
Content-Type: application/json

{"shipmentId":"<shipment-id>"}
```

Send text:

```http
POST /api/shipper/chat/rooms/<room-id>/messages
Authorization: Bearer <shipper-token>
Content-Type: application/json

{"message":"The pickup is confirmed."}
```

Customer uses `/api/customer/...`; shipper uses `/api/shipper/...`. Chat is unavailable until a shipper has quoted the shipment, and becomes locked after shipment completion. Check HTTP status and `success` before updating the UI.
