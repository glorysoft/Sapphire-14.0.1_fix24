using System.Collections.Generic;
using AdvantShop.Catalog;

namespace AdvantShop.CMS
{
    public sealed class ReviewOnMainPage : Review
    {
        public ProductReviewOnMainPage Product { get; set; }

        public ReviewOnMainPage(Review review)
        {
            ReviewId = review.ReviewId;
            EntityId = review.EntityId;
            ParentId = review.ParentId;
            Type = review.Type;
            CustomerId = review.CustomerId;
            Name = review.Name;
            Email = review.Email;
            Text = review.Text;
            Checked = review.Checked;
            AddDate = review.AddDate;
            Ip = review.Ip;
            ChildrenCount = review.ChildrenCount;
            PhotoName = review.PhotoName;
            LikesCount = review.LikesCount;
            DislikesCount = review.DislikesCount;
            RatioByLikes = review.RatioByLikes;
            ManagerId = review.ManagerId;
            Rating = review.Rating;
        }
    }

    public sealed class ProductReviewOnMainPage
    {
        public string Name { get; set; }
        public string UrlPath { get; set; }
        public bool Enabled { get; set; }
        public int ProductId { get; set; }
        
        public double Ratio { get; set; }
        public double? ManualRatio { get; set; }
        public int? RatioCount { get; set; }
        public int ReviewsCount { get; set; }
        
        private List<ProductPhoto> _productPhotos;
        public List<ProductPhoto> ProductPhotos => 
            _productPhotos ?? (_productPhotos = PhotoService.GetPhotos<ProductPhoto>(ProductId, PhotoType.Product));
    }
}