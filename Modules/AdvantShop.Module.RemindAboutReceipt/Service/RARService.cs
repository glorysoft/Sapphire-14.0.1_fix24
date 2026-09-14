
using AdvantShop.Core.Modules;
using AdvantShop.Module.RemindAboutReceipt.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace AdvantShop.Module.RemindAboutReceipt.Service
{
    public class RarService
    {
        private static RarClient GetRarClientFromReader(SqlDataReader reader)
        {
            return new RarClient
            {
                Id = ModulesRepository.ConvertTo<int>(reader, "Id"),
                Email = ModulesRepository.ConvertTo<string>(reader, "Email"),
                ProductId = ModulesRepository.ConvertTo<int>(reader, "ProductId"),
                ProductOfferId = ModulesRepository.ConvertTo<string>(reader, "ProductOfferId"),
                SendNotification = ModulesRepository.ConvertTo<bool>(reader, "SendNotification"),
                LeadId = ModulesRepository.ConvertTo<int?>(reader, "LeadId")
            };
        }

        public static List<RarClient> GetRarClients()
        {
            return ModulesRepository.ModuleExecuteReadList<RarClient>(
                "SELECT * FROM [Module].[RemindAboutReceiptClients]",
                CommandType.Text,
                GetRarClientFromReader);
        }

        public static RarClient GetRarClient(int id)
        {
            return ModulesRepository.ModuleExecuteReadOne<RarClient>(
                "SELECT * FROM [Module].[RemindAboutReceiptClients] WHERE [Id] = @Id",
                CommandType.Text,
                GetRarClientFromReader,
                new SqlParameter("@Id", id));
        }

        public static RarClient GetRarClient(string email)
        {
            return ModulesRepository.ModuleExecuteReadOne<RarClient>(
                "SELECT * FROM [Module].[RemindAboutReceiptClients] WHERE [Email] = @Email",
                CommandType.Text,
                GetRarClientFromReader,
                new SqlParameter("@Email", email));
        }

        public static RarClient GetRarClient(string email, int productId, string productOfferId)
        {
            return ModulesRepository.ModuleExecuteReadOne<RarClient>(
                "SELECT * FROM [Module].[RemindAboutReceiptClients] WHERE [Email] = @Email AND [ProductId] = @ProductId AND [ProductOfferId] = @ProductOfferId",
                CommandType.Text,
                GetRarClientFromReader,
                new SqlParameter("@Email", email),
                new SqlParameter("@ProductId", productId),
                new SqlParameter("@ProductOfferId", productOfferId));
        }

        public static int AddRarClient(RarClient client)
        {
            return ModulesRepository.ModuleExecuteScalar<int>(
                "INSERT INTO [Module].[RemindAboutReceiptClients] ([Email], [ProductId], [ProductOfferId], [SendNotification], [LeadId]) VALUES (@Email, @ProductId, @ProductOfferId, @SendNotification, @LeadId); SELECT SCOPE_IDENTITY();",
                CommandType.Text,
                new SqlParameter("@Email", client.Email),
                new SqlParameter("@ProductId", client.ProductId),
                new SqlParameter("@ProductOfferId", client.ProductOfferId),
                new SqlParameter("@SendNotification", client.SendNotification),
                new SqlParameter("@LeadId", client.LeadId ?? (object)DBNull.Value));
        }
        
        public static void UpdateRarClient(RarClient client)
        {
            ModulesRepository.ModuleExecuteNonQuery(
                "UPDATE [Module].[RemindAboutReceiptClients] SET [Email] = @Email, [ProductId] = @ProductId, [ProductOfferId] = @ProductOfferId, [SendNotification] = @SendNotification, [LeadId] = @LeadId WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", client.Id),
                new SqlParameter("@Email", client.Email),
                new SqlParameter("@ProductId", client.ProductId),
                new SqlParameter("@ProductOfferId", client.ProductOfferId),
                new SqlParameter("@SendNotification", client.SendNotification),
                new SqlParameter("@LeadId", client.LeadId ?? (object)DBNull.Value));
        }

        public static void DeleteRarClient(int id)
        {
            ModulesRepository.ModuleExecuteNonQuery(
                "DELETE FROM [Module].[RemindAboutReceiptClients] WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", id));
        }
    }
}
