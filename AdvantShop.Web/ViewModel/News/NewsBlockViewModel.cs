using System.Collections.Generic;
using AdvantShop.CMS;
using AdvantShop.News;

namespace AdvantShop.ViewModel.News
{
    public class NewsBlockViewModel
    {
        public List<AdvantShop.News.NewsItem> Items { get; set; }
        public bool HideDate { get; set; }
    }
}