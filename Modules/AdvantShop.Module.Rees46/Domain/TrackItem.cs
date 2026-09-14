using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Module.Rees46.Domain
{
    public class TrackItem
    {
        public int? Id { get; set; }
        public bool? Stock { get; set; }
        public int? Amount { get; set; }
        public string Price { get; set; }
        public string Name { get; set; }
        public int[] Categories { get; set; }
        public string Image { get; set; }
        public string Url { get; set; }
        public TypeEvent? Type { get; set; }
        public string RecommendedBy { get; set; }
        public string RecommendedCode { get; set; }
        public string Order { get; set; }
        public string OrderPrice { get; set; }
        public ProductRees46[] Products { get; set; }
    }

    public enum TypeEvent
    {
        [StringName("Отсутствует")]
        none,

        [StringName("Просмотр товара")]
        view,

        [StringName("Добавление товара в корзину")]
        cart,

        [StringName("Удаление товара из корзины")]
        remove_from_cart,

        [StringName("Оформление заказа")]
        purchase,
    }

    public class ProductRees46
    {
        public int Id { get; set; }
        public string Price { get; set; }
        public float Amount { get; set; }
    }

    public enum PageType
    {
        MainPage,
        CategoryTop,
        CategoryBottom,
        RelatedProduct,
        AlternativeProduct,
        Cart,
        Search
    }
}
