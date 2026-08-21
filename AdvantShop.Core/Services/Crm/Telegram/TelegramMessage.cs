using System;
using AdvantShop.Helpers;
using Telegram.Bot.Types;

namespace AdvantShop.Core.Services.Crm.Telegram
{
    public class TelegramMessage
    {
        public int Id { get; set; }
        public int MessageId { get; set; }
        public long FromId { get; set; }
        public long? ToId { get; set; }
        public DateTime Date { get; set; }
        public string Text { get; set; }
        public long ChatId { get; set; }
        public string Type { get; set; }
        public string BotName { get; set; }
        public int? UpdateId { get; set; }

        public TelegramMessage()
        {
        }

        public TelegramMessage(Message message, string botName, int? updateId, string photoUrl = null)
        {
            MessageId = message.MessageId;
            FromId = message.From.Id;
            ToId = null;
            Date = message.Date.ToLocalTime();
            Text = !string.IsNullOrEmpty(message.Text) ? StringHelper.HtmlEncode(message.Text) : message.Type.ToString();
            if (!string.IsNullOrEmpty(photoUrl))
            {
                Text += $"<br/><img src=\"{photoUrl}\"> style=\"max-height: 300px;\"";
            }
            ChatId = message.Chat.Id;
            Type = message.Type.ToString();
            BotName = botName;
            UpdateId = updateId;
        }
    }

    public class TelegramUserMessage : TelegramMessage
    {
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhotoUrl { get; set; }
        public Guid CustomerId { get; set; }
    }
}