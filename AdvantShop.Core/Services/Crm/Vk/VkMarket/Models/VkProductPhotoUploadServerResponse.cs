using Newtonsoft.Json;

namespace AdvantShop.Core.Services.Crm.Vk.VkMarket.Models
{
    public class VkProductPhotoUploadServerResponse
    {
        [JsonProperty("upload_url")]
        public string UploadUrl { get; set; }
    }
}