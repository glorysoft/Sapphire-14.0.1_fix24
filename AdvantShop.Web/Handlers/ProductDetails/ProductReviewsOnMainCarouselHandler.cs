using System.Collections.Generic;
using System.Linq;
using AdvantShop.CMS;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Customers;
using AdvantShop.ViewModel.ProductDetails;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.ProductDetails
{
    public class ProductReviewsOnMainCarouselHandler : ICommandHandler<ProductReviewsOnMainPageViewModel>
    {
        private readonly List<ReviewOnMainPage> _reviews;
        private readonly Customer _customer = CustomerContext.CurrentCustomer;
        private readonly int _countInSection;
        private readonly int _countInLine;
        private readonly bool _isCarousel;

        public ProductReviewsOnMainCarouselHandler(bool isCarousel, int count = 0)
        {
            _countInSection = TemplateSettingsProvider.Items["CountMainPageProductReviewsInSection"].TryParseInt();
            _countInLine = TemplateSettingsProvider.Items["CountMainPageProductReviewsInLine"].TryParseInt();
            _isCarousel = isCarousel;
            _reviews = ReviewService.GetTopReviewListOnMain(
                    _isCarousel ? _countInSection : count, SettingsCatalog.ReviewsSortingOnMainPage
                )
                .Where(review => review.Checked || !SettingsCatalog.ModerateReviews)
                .ToList();
        }

        public ProductReviewsOnMainPageViewModel Execute()
        {
            var valid = Validate();
            if (!valid)
                return null;
            
            return new ProductReviewsOnMainPageViewModel()
            {
                EntityType = (int)EntityType.Product,
                ModerateReviews = SettingsCatalog.ModerateReviews,
                ReviewsVoiteOnlyRegisteredUsers = SettingsCatalog.ReviewsVoiteOnlyRegisteredUsers,
                IsAdmin = _customer.IsAdmin,
                RegistredUser = _customer.RegistredUser,
                UserName = _customer.RegistredUser ? _customer.FirstName + " " + _customer.LastName : string.Empty,
                Email = _customer.EMail,
                ReviewsReadonly = true,
                HeaderText = string.Empty,
                WhoAllowReviews = SettingsDesign.WhoAllowReviews,
                Reviews = _reviews,
                DisplayImage = SettingsCatalog.DisplayReviewsImage,
                ShowVerificationCheckmarkAtAdminInReviews = SettingsDesign.ShowVerificationCheckmarkAtAdminInReviews,
                ReviewFormType = SettingsCatalog.ReviewFormType,
                CountInLine = _countInLine,
                CountInSection = _countInSection
            };
        }

        private bool Validate()
        {
            if (_customer == null)
                return false;
            if (_reviews.Count == 0)
                return false;
            if (_isCarousel && (_countInSection == 0 || _countInLine == 0))
                return false;

            return true;
        }
    }
}