using System;

namespace AdvantShop.Core.Common.Attributes
{
    public sealed class EnabledAttribute : Attribute, IAttribute<bool>
    {
        public EnabledAttribute(bool enabled)
        {
            Value = enabled;
        }

        public bool Value { get; }
    }
}