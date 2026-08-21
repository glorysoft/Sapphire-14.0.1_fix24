using System;
using AdvantShop.Core.Services.Landing;
using Newtonsoft.Json;

namespace AdvantShop.App.Landing.Models
{
    public class LpOfferPrice : IConvertibleBlockModel
    {
        [JsonProperty("value")]
        public float? Value { get; set; }
        
        [JsonProperty("selected")] 
        public bool Selected { get; set; }
        
        [JsonProperty("productId")] 
        public int? ProductId { get; set; }
        
        [JsonProperty("offerId")] 
        public int? OfferId { get; set; }

        public IConvertibleBlockModel ConvertToType(Type type)
        {
            throw new NotImplementedException();
        }

        public IConvertibleBlockModel ConvertFromType(object obj, Type type)
        {
            throw new NotImplementedException();
        }

        public bool IsNull()
        {
            throw new NotImplementedException();
        }
    }
}