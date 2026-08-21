namespace AdvantShop.Models.User
{
    public sealed class RecoveryPasswordModel
    {
        public string Email { get; set; }
        public string RecoveryCode { get; set; }
        public int? LpId { get; set; }
    }
}