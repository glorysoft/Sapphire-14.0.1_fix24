using System;

namespace AdvantShop.Core.Services.Bonuses.Internal.Model.Enums
{
    public enum EBonusStatus : byte
    {
        Create,
        Zero,
        Substract,
        [Obsolete("Unsupported", true)]
        RecoveryAdd,
        Removed,
    }
}
