using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;

namespace AdvantShop.Core.Services.Security
{
    public static class AntiInjectionService
    {
        private static readonly ConcurrentDictionary<Type, TypeMetadata> Cache =
            new ConcurrentDictionary<Type, TypeMetadata>();
        
        /// <summary>
        /// Проверка есть ли вредоносный текст в string-полях объекта
        /// </summary>
        public static bool HasMaliciousText(object model, HashSet<object> visited)
        {
            if (model == null)
                return false;
            
            // защита от циклических ссылок
            if (!visited.Add(model))
                return false;
            
            if (model is string value)
                return GuardService.IsMaliciousTextAndBanByIp(value);
            
            var type = model.GetType();
            var meta = Cache.GetOrAdd(type, Build);
            
            if (meta.IsSimple)
                return false;
            
            // IEnumerable
            if (meta.IsEnumerable && model is System.Collections.IEnumerable en)
            {
                foreach (var item in en)
                    if (HasMaliciousText(item, visited))
                        return true;

                return false;
            }
            
            // string-свойства
            if (meta.StringGetters.Length > 0)
                foreach (var getter in meta.StringGetters)
                {
                    var str = getter(model);
                    if (GuardService.IsMaliciousTextAndBanByIp(str))
                        return true;
                }
            
            // вложенные объекты
            if (meta.ObjectGetters.Length > 0)
                foreach (var getter in meta.ObjectGetters)
                {
                    var nested = getter(model);
                    if (nested != null && HasMaliciousText(nested, visited))
                        return true;
                }

            return false;
        }
        
        private static TypeMetadata Build(Type type)
        {
            var meta = new TypeMetadata();

            // простые типы
            if (IsSimpleType(type))
            {
                meta.IsSimple = true;
                return meta;
            }

            // IEnumerable
            if (typeof(System.Collections.IEnumerable).IsAssignableFrom(type))
            {
                meta.IsEnumerable = true;
                return meta;
            }

            var stringGetters = new List<Func<object, string>>();
            var objectGetters = new List<Func<object, object>>();

            var objParam = Expression.Parameter(typeof(object), "obj");
            var cast = Expression.Convert(objParam, type);

            foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (!prop.CanRead)
                    continue;

                if (prop.GetIndexParameters().Length != 0)
                    continue;

                var propExpr = Expression.Property(cast, prop);

                if (prop.PropertyType == typeof(string))
                {
                    var lambda = Expression.Lambda<Func<object, string>>(propExpr, objParam).Compile();
                    stringGetters.Add(lambda);
                }
                else if (!IsSimpleType(prop.PropertyType) && !IgnoreType(prop.PropertyType))
                {
                    var box = Expression.Convert(propExpr, typeof(object));
                    var lambda = Expression.Lambda<Func<object, object>>(box, objParam).Compile();
                    objectGetters.Add(lambda);
                }
            }

            meta.StringGetters = stringGetters.ToArray();
            meta.ObjectGetters = objectGetters.ToArray();

            return meta;
        }
        
        private static bool IsSimpleType(Type type)
        {
            type = Nullable.GetUnderlyingType(type) ?? type;

            return
                type.IsPrimitive ||
                type.IsEnum ||
                type == typeof(string) ||
                type == typeof(decimal) ||
                type == typeof(DateTime) ||
                type == typeof(Guid) ||
                type == typeof(DateTimeOffset) ||
                type == typeof(TimeSpan);
        }

        private static bool IgnoreType(Type type)
        {
            return
                type == typeof(System.Type) ||
                type == typeof(List<int>) ||
                type == typeof(int[]) ||
                type == typeof(decimal[]) ||
                type.ToString().StartsWith("System.Reflection.") ||
                type.ToString().StartsWith("System.Runtime.");
        }
    }
    
    internal sealed class TypeMetadata
    {
        public Func<object, string>[] StringGetters;
        public Func<object, object>[] ObjectGetters;
        public bool IsSimple;
        public bool IsEnumerable;
    }
}