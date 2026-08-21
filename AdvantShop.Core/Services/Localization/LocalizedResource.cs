namespace AdvantShop.Core.Services.Localization
{
    public class LocalizedResource
    {
        public int Id { get; set; }

        public string LanguageCode { get; set; }

        public string ResourceKey { get; set; }

        public string ResourceValue { get; set; }
    }
}