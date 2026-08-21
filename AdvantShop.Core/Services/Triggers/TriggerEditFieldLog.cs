using System;
using System.Collections.Generic;
using AdvantShop.Core.Common.Extensions;

namespace AdvantShop.Core.Services.Triggers
{
    internal sealed class TriggerEditFieldLog
    {
        private string FieldName { get; }
        private string OldValue { get; }
        private string NewValue { get; }
            
        public bool IsError { get; }

        public TriggerEditFieldLog(Enum type, object oldValue, object newValue)
        {
            FieldName = type.Localize();
            OldValue = oldValue?.ToString().Reduce(350);
            NewValue = newValue?.ToString().Reduce(350);
        }
            
        public TriggerEditFieldLog(string fieldName, object oldValue, object newValue)
        {
            FieldName = fieldName;
            OldValue = oldValue?.ToString().Reduce(350);
            NewValue = newValue?.ToString().Reduce(350);
        }
            
        public TriggerEditFieldLog(Enum type, string error)
        {
            FieldName = type.Localize();
            NewValue = error;
            IsError = true;
        }
            
        public TriggerEditFieldLog(string fieldName, string error)
        {
            FieldName = fieldName;
            NewValue = error;
            IsError = true;
        }

        public KeyValuePair<string, string> ToKeyValue()
        {
            return new KeyValuePair<string, string>(
                FieldName,
                OldValue.IsNotEmpty() ? $"\"{OldValue}\" - \"{NewValue}\"" : NewValue
            );
        }
    }
}