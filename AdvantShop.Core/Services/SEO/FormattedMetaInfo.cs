namespace AdvantShop.SEO
{
    public sealed class FormattedMetaInfo
    {
        public string Title { get; private set; }
        public string MetaKeywords { get; private set; }
        public string MetaDescription { get; private set; }
        public string H1 { get; private set; }

        public FormattedMetaInfo(string title, string metaKeywords, string metaDescription, string h1)
        {
            Title = title;
            MetaKeywords = metaKeywords;
            MetaDescription = metaDescription;
            H1 = h1;
        }
    } 
}