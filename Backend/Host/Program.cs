using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

class Program
{
    private static ConcurrentDictionary<Guid, WebSocket> connectedUsers = new ConcurrentDictionary<Guid, WebSocket>();

    static async Task Main(string[] args)
    {
        string serverAddress = "http://localhost:11000/";
        HttpListener listener = new HttpListener();
        listener.Prefixes.Add(serverAddress);
        listener.Start();

        Console.WriteLine("WebSocket server started...");
        Console.WriteLine($"Listening at {serverAddress}");

        while (true)
        {
            HttpListenerContext context = await listener.GetContextAsync();
            Console.WriteLine($"Incoming connection from {context.Request.RemoteEndPoint}");

            if (context.Request.IsWebSocketRequest)
            {
                HttpListenerWebSocketContext webSocketContext = await context.AcceptWebSocketAsync(null);
                WebSocket webSocket = webSocketContext.WebSocket;

                _ = HandleWebSocketCommunication(webSocket);
            }
            else
            {
                // Reject the connection if it's not a WebSocket request
                context.Response.StatusCode = 400; // Bad Request
                context.Response.Close();
            }
        }
    }

    // Handle communication with the WebSocket client
    static async Task HandleWebSocketCommunication(WebSocket webSocket)
    {
        Guid userId = Guid.NewGuid();
        connectedUsers[userId] = webSocket;

        try {
            while (webSocket.State == WebSocketState.Open)
            {
                byte[] buffer = new byte[1024];
                // Receive message from the client
                WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                HandleReceieveMessage(webSocket, result, buffer);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in WebSocket communication: {ex.Message}");
        }
        finally
        {
            // Close the WebSocket connection
            if (webSocket.State == WebSocketState.Open)
            {
                connectedUsers.TryRemove(userId, out WebSocket removedWebSocket);
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Connection closed", CancellationToken.None);
                Console.WriteLine($"{userId} disconnected." );
            }
        }
    }

    private static void HandleReceieveMessage(WebSocket webSocket,WebSocketReceiveResult result, Byte[] buffer) {
        string receivedMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);

        if (string.IsNullOrEmpty(receivedMessage))
        {
            return;
        }
        MessageData? messageData;
        try { messageData = JsonConvert.DeserializeObject<MessageData>(receivedMessage); }
        catch (Exception ex) {
            Console.WriteLine("received message in invalid format", ex);
            return;
        }
        if (messageData == null)
        {
            Console.WriteLine("messageData was null");
            return;
        }

        sendMessageToAllUsers(messageData, connectedUsers);
    }

    private static void sendMessageToAllUsers(MessageData messageData, ConcurrentDictionary<Guid, WebSocket> connectedUsers)
    {
        Console.WriteLine($"{messageData.User}: {messageData.Text}");
        foreach (var webSocket in connectedUsers)
        {
            _ = sendMessageToWebSocket(messageData, webSocket.Value);
        }
    }
    private static void sendMessageToAllUsers(String message, ConcurrentDictionary<Guid, WebSocket> connectedUsers)
    {
        Console.WriteLine(message);
        foreach (var webSocket in connectedUsers)
        {
            _ = sendMessageToWebSocket(message, webSocket.Value);
        }
    }

    private static async Task sendMessageToWebSocket(String message, WebSocket webSocket) {
        byte[] messageBytes = Encoding.UTF8.GetBytes(message);
        await webSocket.SendAsync(new ArraySegment<byte>(messageBytes), WebSocketMessageType.Text, true, CancellationToken.None);
    }

    private static async Task sendMessageToWebSocket(MessageData messageData, WebSocket webSocket) {
        byte[] messageBytes = Encoding.UTF8.GetBytes($"{messageData.User}: {messageData.Text}");
        await webSocket.SendAsync(new ArraySegment<byte>(messageBytes), WebSocketMessageType.Text, true, CancellationToken.None);
    }
}