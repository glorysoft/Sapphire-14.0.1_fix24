using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using AdvantShop.Diagnostics;

namespace AdvantShop.Core.Common.Extensions
{
    public static class ObjectFlattener
{
    public static Dictionary<string, string> ToFlatDictionary(this object obj)
    {
        if (obj == null) throw new ArgumentNullException(nameof(obj));

        try
        {
            var dict = new Dictionary<string, string>();
            FlattenObject(obj, dict, prefix: null);
            return dict;
        }
        catch (Exception ex)
        {
            Debug.Log.Error(ex);
        }

        return null;
    }

    private static void FlattenObject(object obj, Dictionary<string, string> dict, string prefix)
    {
        if (obj == null)
            return;

        var type = obj.GetType();

        // Если примитивный тип или строка
        if (IsSimple(type))
        {
            dict[prefix ?? "Value"] = obj.ToString();
            return;
        }

        if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(KeyValuePair<,>))
        {
            var propKey = type.GetProperty("Key");
            var propValue = type.GetProperty("Value");

            if (propKey != null && propValue != null)
            {
                var propKeyValue = propKey.GetValue(obj);
                var propValueValue = propValue.GetValue(obj);
                
                var key = propKeyValue != null ? propKeyValue.ToString() : $"{prefix}.{propKey.Name}";
                var value = propValueValue?.ToString();

                key = !dict.ContainsKey(key) ? key : $"{prefix}.{propKey.Name}";
                
                dict[key] = value;
                return;
            }
        }

        // Если коллекция
        if (typeof(IEnumerable).IsAssignableFrom(type) && type != typeof(string))
        {
            var i = 0;
            foreach (var item in (IEnumerable)obj)
            {
                FlattenObject(item, dict, $"{prefix}[{i}]");
                i++;
            }
            return;
        }

        // Если сложный объект (класс)
        foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!prop.CanRead) continue;

            var value = prop.GetValue(obj);
            var key = string.IsNullOrEmpty(prefix) ? prop.Name : $"{prefix}.{prop.Name}";

            if (value == null)
            {
                dict[key] = string.Empty;
            }
            else if (IsSimple(prop.PropertyType))
            {
                dict[key] = value.ToString();
            }
            else
            {
                FlattenObject(value, dict, key);
            }
        }
    }

    private static bool IsSimple(Type type)
    {
        return type.IsPrimitive
               || type.IsEnum
               || type == typeof(string)
               || type == typeof(decimal)
               || type == typeof(DateTime)
               || type == typeof(Guid)
               || type == typeof(DateTimeOffset)
               || type == typeof(TimeSpan);
    }
}
}