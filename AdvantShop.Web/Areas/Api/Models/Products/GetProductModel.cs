namespace AdvantShop.Areas.Api.Models.Products
{
    public sealed class GetProductModel
    {
        public int? ColorId { get; set; }
        public int? SizeId { get; set; }
        public bool? LoadWidgets { get; set; }
    }
}