using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Xml.Linq;
using AdvantShop.Core.Caching;

namespace AdvantShop.Core.Services.Localization
{
    public sealed class LocalizationProvider
    {
        public static LocalizationProvider Instance { get; } = new LocalizationProvider();
        
        /// <summary>
        /// Ограниченный кеш key - group
        /// </summary>
        private readonly ConcurrentDictionary<string, string> _keyToGroupCache =
            new ConcurrentDictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        /// <summary>
        /// Максимальное кол-во элементов для _keyToGroupCache
        /// </summary>
        private const int MaxKeyCacheSize = 5_000;

        /// <summary>
        /// Время кеширования словаря key - localization для группы
        /// </summary>
        private const int CacheMinutes = 30;
        
        public string CacheKeyPrefix = "Localization_";
        private string GetCacheKey(string group, string cultureName) => $"{CacheKeyPrefix}{cultureName}_{group}";
        
        /// <summary>
        /// Словарь префикс - группа
        /// </summary>
        private ConcurrentDictionary<string, string> _prefixToGroup;

        private readonly object _syncObj = new object();

        private ConcurrentDictionary<string, string> PrefixToGroup
        {
            get
            {
                if (_prefixToGroup != null) return _prefixToGroup;
                
                lock (_syncObj)
                {
                    _prefixToGroup = new ConcurrentDictionary<string, string>(
                        LoadGroupsFromConfig(), 
                        StringComparer.OrdinalIgnoreCase
                    );
                }

                return _prefixToGroup;
            }
        }

        public bool TryGetLocalization(string key, string cultureName, out string value)
        {
            value = null;

            if (string.IsNullOrEmpty(key))
                return false;

            var group = GetGroup(key);
            if (group == null)
                return false;

            var localizations = CacheManager.Get(
                GetCacheKey(group, cultureName),
                CacheMinutes,
                () => LocalizationService.LoadGroupResources(cultureName, GetPrefixes(group))
            );

            return localizations.TryGetValue(key, out value);
        }

        public void SetLocalization(string key, string value, string cultureName)
        {
            var group = GetGroup(key);
            if (group == null)
                return;

            if (CacheManager.TryGetValue(GetCacheKey(group, cultureName),
                    out ConcurrentDictionary<string, string> localizations))
            {
                if (localizations.ContainsKey(key))
                    localizations[key] = value;
            }
        }

        /// <summary>
        /// Получить группу из кеша, если не получится, то по ключу
        /// </summary>
        private string GetGroup(string key)
        {
            if (_keyToGroupCache.TryGetValue(key, out var group))
                return group;

            group = GetGroupNameByKey(key);
            if (group == null)
                return null;

            if (_keyToGroupCache.Count > MaxKeyCacheSize)
                _keyToGroupCache.Clear();

            _keyToGroupCache[key] = group;

            return group;
        }

        /// <summary>
        /// Получить группу по ключу
        /// </summary>
        private string GetGroupNameByKey(string key)
        {
            var span = key.AsSpan();

            var start = 0;
            var dotsCount = 0;

            // ищем по префиксу
            while (true)
            {
                var dot = span.Slice(start).IndexOf('.');
                if (dot < 0)
                    break;

                var length = start + dot;

                var segment = span.Slice(0, length);

                if (PrefixToGroup.TryGetValue(segment.ToString(), out var group))
                    return group;

                start = length + 1;
                ++dotsCount;
            }
            
            if (PrefixToGroup.TryGetValue(key, out var groupByKey))
                return groupByKey;
            
            if (dotsCount == 0)
                return null;
            
            if (key.Length > 100 || !IsLatinKey(span))
                return null;

            // если одна точка, то берем первый сегмент, иначе первые два
            if (dotsCount == 1)
            {
                var segment = span.Slice(0, span.IndexOf('.'));

                return
                    segment.Equals("Admin".AsSpan(), StringComparison.OrdinalIgnoreCase) ||
                    segment.Equals("Js".AsSpan(), StringComparison.OrdinalIgnoreCase)
                        ? key
                        : segment.ToString();
            }
            
            var firstDot = span.IndexOf('.');
            var secondDot = span.Slice(firstDot + 1).IndexOf('.');
            if (secondDot > 0)
            {
                var segment = span.Slice(0, firstDot + 1 + secondDot);

                if (segment.Equals("Admin.Js".AsSpan(), StringComparison.OrdinalIgnoreCase) ||
                    segment.StartsWith("Js".AsSpan(), StringComparison.OrdinalIgnoreCase))
                {
                    var len = firstDot + 1 + secondDot + 1;
                    
                    var thirdDot = span.Slice(len).IndexOf('.');
                    if (thirdDot > 0)
                        return span.Slice(0, len + thirdDot).ToString();
                }
                
                return segment.ToString();
            }

            return null;
        }
        
        private List<KeyValuePair<string, string>> LoadGroupsFromConfig()
        {
            var path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Web.LocalizationGroups.config");
            var doc = XDocument.Load(path);

            return
                doc.Root?
                    .Elements("Group")
                    .SelectMany(group =>
                    {
                        var groupName = group.Attribute("name")?.Value;

                        return group.Elements("Prefix")
                            //.OrderByDescending(x => x.Value.Length)
                            .Select(p => new KeyValuePair<string, string>(p.Value, groupName));
                    })
                    .ToList();
        }

        public List<string> GetPrefixes(string group)
        {
            var prefixes = PrefixToGroup.Where(x => x.Value == group).Select(x => x.Key).ToList();

            return prefixes.Count > 0 ? prefixes : new List<string>(1) { group };
        }
        
        private static bool IsLatinKey(ReadOnlySpan<char> span)
        {
            var len = span.Length > 8 ? 8 : span.Length; // первые 8 символов

            for (int i = 0; i < len; i++)
            {
                char c = span[i];

                var isValid = (c >= 'a' && c <= 'z') 
                              || (c >= 'A' && c <= 'Z') 
                              || (c >= '0' && c <= '9') 
                              || c == '.' 
                              || c == '_';

                if (!isValid)
                    return false;
            }

            return true;
        }
    }
}