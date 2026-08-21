using AdvantShop.Catalog;
using AdvantShop.CMS;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.CMS;
using AdvantShop.Core.Services.Crm;
using AdvantShop.Core.Services.IPTelephony;
using AdvantShop.Core.SQL;
using AdvantShop.Customers;
using AdvantShop.News;
using AdvantShop.Orders;
using AdvantShop.Payment;
using AdvantShop.Shipping;
using AdvantShop.Trial;
using AdvantShop.Web.Admin.ViewModels.Settings;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.ClearDatas
{
    public class ClearDataSettingsHandler : ICommandHandler
    {
        private readonly ClearDataViewModel _model;

        public ClearDataSettingsHandler(ClearDataViewModel model)
        {
            _model = model;
        }

        public void Execute()
        {
            if (!TrialService.IsTrialEnabled) return;

            DeleteCategories();
            DeleteProducts();
            DeleteProperty();
            DeleteBrands();
            DeletePayments();
            DeleteShippings();
            DeleteNews();
            DeleteOrder();
            DeleteCrm();
            DeleteTasks();
            DeleteCustomers();
            DeleteCarousel();
            DeleteMenu();
            DeletePage();

            CategoryService.RecalculateProductsCountManual();
            CategoryService.SetCategoryHierarchicallyEnabled(0);
            CategoryService.CalculateHasProductsForAllWarehouseInAllCategories();
            CacheManager.Clean();

            TrialService.TrackEvent(TrialEvents.DeleteTestData, string.Empty);
            Track.TrackService.TrackEvent(Track.ETrackEvent.Trial_ClearData);
        }

        private void DeleteCategories()
        {
            if (!_model.DeleteCategories) return;

            foreach (var categoryId in CategoryService.GetAllCategoryIDs(true))
            {
                CategoryService.DeleteCategoryAndPhotos(categoryId);
            }
        }

        private void DeleteProducts()
        {
            if (!_model.DeleteProducts) return;

            foreach (var productId in ProductService.GetAllProductIDs(true))
            {
                ProductService.DeleteProduct(productId, false);
            }
        }

        private void DeleteProperty()
        {
            if (!_model.DeleteProperty) return;

            foreach (var property in PropertyService.GetAllProperties())
            {
                PropertyService.DeleteProperty(property.PropertyId);
            }

            foreach (var group in PropertyGroupService.GetList())
            {
                PropertyGroupService.Delete(group.PropertyGroupId);
            }

            foreach (var color in ColorService.GetAllColors())
            {
                ColorService.DeleteColor(color.ColorId);
            }

            foreach (var size in SizeService.GetAllSizes())
            {
                SizeService.DeleteSize(size.SizeId);
            }

            foreach (var tag in TagService.GetAllTags())
            {
                TagService.Delete(tag.Id);
            }
        }

        private void DeleteBrands()
        {
            if (!_model.DeleteBrands) return;

            foreach (var brandId in BrandService.GetAllBrandIDs(true))
            {
                BrandService.DeleteBrand(brandId);
            }
        }

        private void DeletePayments()
        {
            if (!_model.DeletePayments) return;

            foreach (var paymentId in PaymentService.GetAllPaymentMethodIDs())
            {
                PaymentService.DeletePaymentMethod(paymentId);
            }
        }

        private void DeleteShippings()
        {
            if (!_model.DeleteShippings) return;

            foreach (var shippingId in ShippingMethodService.GetAllShippingMethodIds())
            {
                ShippingMethodService.DeleteShippingMethod(shippingId);
            }
        }

        private void DeleteNews()
        {
            if (!_model.DeleteNews) return;

            foreach (var news in NewsService.GetNews())
            {
                NewsService.DeleteNews(news.NewsId);
            }

            foreach (var newsCategory in NewsService.GetNewsCategories())
            {
                NewsService.DeleteNewsCategory(newsCategory.NewsCategoryId);
            }
        }

        private void DeleteOrder()
        {
            if (!_model.DeleteOrder) return;

            foreach (var order in OrderService.GetAllOrders())
            {
                OrderService.DeleteOrder(order.OrderID);
            }

            SQLDataAccess2.ExecuteNonQuery("delete FROM [Order].[StatusHistory]");

            OrderService.ResetOrderID(1);

            foreach (var coupon in CouponService.GetAllCoupons())
            {
                CouponService.DeleteCoupon(coupon.CouponID);
            }
        }

        private void DeleteCrm()
        {
            if (!_model.DeleteCrm) return;

            foreach (var lead in LeadService.GetAllLeads())
            {
                LeadService.DeleteLead(lead.Id);
            }

            foreach (var call in CallService.GetAllCalls())
            {
                CallService.DeleteCall(call.Id);
            }
        }

        private void DeleteTasks()
        {
            if (!_model.DeleteTasks) return;

            foreach (var task in ManagerTaskService.GeAllTasks())
            {
                ManagerTaskService.DeleteManagerTask(task.TaskId);
            }

            foreach (var task in TaskService.GetAllTasks())
            {
                TaskService.DeleteTask(task.Id);
            }

            foreach (var task in TaskGroupService.GetAllTaskGroups())
            {
                TaskGroupService.DeleteTaskGroup(task.Id);
            }
        }

        private void DeleteCustomers()
        {
            if (!_model.DeleteCustomers) return;

            foreach (var customer in CustomerService.GetCustomers())
            {
                if (!customer.IsAdmin)
                {
                    var m = ManagerService.GetManager(customer.Id);
                    if (m != null)
                    {
                        TaskService.UnassignTaskManager(m.ManagerId);
                        TaskService.ClearTaskAppointedManager(m.ManagerId);
                    }

                    CustomerService.DeleteCustomer(customer.Id);
                }
            }
        }

        private void DeleteCarousel()
        {
            if (!_model.DeleteCarousel) return;

            foreach (var carousel in CarouselService.GetAllCarousels())
            {
                CarouselService.DeleteCarousel(carousel.CarouselId);
            }
        }

        private void DeleteMenu()
        {
            if (!_model.DeleteMenu) return;

            DeleteMenus(EMenuType.Bottom);
            DeleteMenus(EMenuType.Mobile);
            DeleteMenus(EMenuType.Top);
        }

        private void DeletePage()
        {
            if (!_model.DeletePage) return;

            foreach (var page in StaticPageService.GetAllStaticPages())
            {
                StaticPageService.DeleteStaticPage(page.ID);
            }
        }
        
        private static void DeleteMenus(EMenuType type)
        {
            foreach (var menuItem in MenuService.GetChildMenuItemsByParentId(0, type))
            {
                foreach (var menuChild in MenuService.GetChildMenuItemsByParentId(0, type))
                    MenuService.DeleteMenuItem(menuChild);

                MenuService.DeleteMenuItem(menuItem);
            }
        }
    }
}