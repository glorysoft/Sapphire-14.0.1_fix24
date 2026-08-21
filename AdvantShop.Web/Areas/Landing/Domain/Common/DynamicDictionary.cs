using System.Collections.Generic;
using System.Dynamic;

namespace AdvantShop.App.Landing.Domain.Common
{
    public sealed class DynamicDictionary : DynamicObject
    {
        private readonly Dictionary<string, object> _dict = new Dictionary<string, object>();

        public DynamicDictionary()
        {
        }
        
        public DynamicDictionary(Dictionary<string, object> dict)
        {
            _dict = dict;
        }

        public override bool TryGetMember(GetMemberBinder binder, out object result)
        {
            return _dict.TryGetValue(binder.Name, out result);
        }

        public override bool TrySetMember(SetMemberBinder binder, object value)
        {
            _dict[binder.Name] = value;
            return true;
        }

        public object this[string key]
        {
            get => _dict.TryGetValue(key, out var value) ? value : null;
            set => _dict[key] = value;
        }
    }
}