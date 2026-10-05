using Microsoft.AspNetCore.SignalR;
using SignalRChatAPI.Models;

namespace SignalRChatAPI.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly List<ChatMessage> Messages = new();

        public async Task SendMessage(string user, string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return;

            var chatMessage = new ChatMessage
            {
                User = user,
                Message = message.Trim(),
                Timestamp = DateTime.Now,
                ConnectionId = Context.ConnectionId
            };

            Messages.Add(chatMessage);

            await Clients.All.SendAsync(
                "ReceiveMessage",
                chatMessage
            );
        }

        public async Task SendTyping(string user)
        {
            await Clients.Others.SendAsync(
                "UserTyping",
                user
            );
        }

        public async Task StopTyping(string user)
        {
            await Clients.Others.SendAsync(
                "UserStoppedTyping",
                user
            );
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync(
                "LoadMessages",
                Messages
            );

            await Clients.Others.SendAsync(
                "UserConnected",
                Context.ConnectionId
            );

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(
            Exception? exception)
        {
            await Clients.Others.SendAsync(
                "UserDisconnected",
                Context.ConnectionId
            );

            await base.OnDisconnectedAsync(exception);
        }
    }
}