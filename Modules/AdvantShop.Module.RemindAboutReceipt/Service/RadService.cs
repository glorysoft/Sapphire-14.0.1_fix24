
using AdvantShop.Core.Modules;
using AdvantShop.Module.RemindAboutReceipt.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace AdvantShop.Module.RemindAboutReceipt.Service
{
    public class RadService
    {
        private static RadClient GetRadClientFromReader(SqlDataReader reader)
        {
            return new RadClient
            {
                Id = ModulesRepository.ConvertTo<int>(reader, "Id"),
                Email = ModulesRepository.ConvertTo<string>(reader, "Email"),
                ProductId = ModulesRepository.ConvertTo<int>(reader, "ProductId"),
                ProductOfferId = ModulesRepository.ConvertTo<string>(reader, "ProductOfferId"),
                SendNotification = ModulesRepository.ConvertTo<bool>(reader, "SendNotification"),
                OldPrice = ModulesRepository.ConvertTo<float>(reader, "OldPrice"),
                LeadId = ModulesRepository.ConvertTo<int?>(reader, "LeadId")
            };
        }

        public static List<RadClient> GetRadClients()
        {
            return ModulesRepository.ModuleExecuteReadList<RadClient>(
                "SELECT * FROM [Module].[RemindAboutDiscountClients]",
                CommandType.Text,
                GetRadClientFromReader);
        }

        public static RadClient GetRadClient(int id)
        {
            return ModulesRepository.ModuleExecuteReadOne<RadClient>(
                "SELECT * FROM [Module].[RemindAboutDiscountClients] WHERE [Id] = @Id",
                CommandType.Text,
                GetRadClientFromReader,
                new SqlParameter("@Id", id));
        }

        public static RadClient GetRadClient(string email)
        {
            return ModulesRepository.ModuleExecuteReadOne<RadClient>(
                "SELECT * FROM [Module].[RemindAboutDiscountClients] WHERE [Email] = @Email",
                CommandType.Text,
                GetRadClientFromReader,
                new SqlParameter("@Email", email));
        }

        public static RadClient GetRadClient(string email, int productId, string productOfferId)
        {
            return ModulesRepository.ModuleExecuteReadOne<RadClient>(
                "SELECT * FROM [Module].[RemindAboutDiscountClients] WHERE [Email] = @Email AND [ProductId] = @ProductId AND [ProductOfferId] = @ProductOfferId",
                CommandType.Text,
                GetRadClientFromReader,
                new SqlParameter("@Email", email),
                new SqlParameter("@ProductId", productId),
                new SqlParameter("@ProductOfferId", productOfferId));
        }

        public static int AddRadClient(RadClient client)
        {
            return ModulesRepository.ModuleExecuteScalar<int>(
                "INSERT INTO [Module].[RemindAboutDiscountClients] ([Email], [ProductId], [ProductOfferId], [OldPrice], [SendNotification], [LeadId]) VALUES (@Email, @ProductId, @ProductOfferId, @OldPrice, @SendNotification, @LeadId); SELECT SCOPE_IDENTITY();",
                CommandType.Text,
                new SqlParameter("@Email", client.Email),
                new SqlParameter("@ProductId", client.ProductId),
                new SqlParameter("@ProductOfferId", client.ProductOfferId),
                new SqlParameter("@OldPrice", client.OldPrice),
                new SqlParameter("@SendNotification", client.SendNotification),
                new SqlParameter("@LeadId", client.LeadId.HasValue && client.LeadId.Value > 0 ? client.LeadId : (object)DBNull.Value));
        }
        
        public static void UpdateRadClient(RadClient client)
        {
            ModulesRepository.ModuleExecuteNonQuery(
                "UPDATE [Module].[RemindAboutDiscountClients] SET [Email] = @Email, [ProductId] = @ProductId, [ProductOfferId] = @ProductOfferId, [OldPrice] = @OldPrice, [SendNotification] = @SendNotification, [LeadId] = @LeadId WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", client.Id),
                new SqlParameter("@Email", client.Email),
                new SqlParameter("@ProductId", client.ProductId),
                new SqlParameter("@ProductOfferId", client.ProductOfferId),
                new SqlParameter("@OldPrice", client.OldPrice),
                new SqlParameter("@SendNotification", client.SendNotification),
                new SqlParameter("@LeadId", client.LeadId.HasValue && client.LeadId.Value > 0 ? client.LeadId : (object)DBNull.Value));
        }

        public static void DeleteRadClient(int id)
        {
            ModulesRepository.ModuleExecuteNonQuery(
                "DELETE FROM [Module].[RemindAboutDiscountClients] WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", id));
        }
    }
}
