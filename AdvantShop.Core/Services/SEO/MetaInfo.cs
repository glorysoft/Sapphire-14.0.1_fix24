//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using AdvantShop.Core.Common.Extensions;

namespace AdvantShop.SEO
{
    public class MetaInfo : ICloneable
    {
        public int MetaId { get; private set; }
        public int ObjId { get; private set; }
        public MetaType Type { get; private set; }
        public string Title { get; private set; }
        public string MetaKeywords { get; private set; }
        public string MetaDescription { get; private set; }
        public string H1 { get; private set; }
        public bool IsDefaultMeta { get; private set; }

        public MetaInfo()
        {
        }

        public MetaInfo(string str)
        {
            Title = str;
            MetaDescription = str;
            MetaKeywords = str;
            H1 = str;
        }

        public MetaInfo(int metaId, 
                        int objId, 
                        MetaType type, 
                        string title, 
                        string metaKeywords, 
                        string metaDescription, 
                        string h1)
        {
            MetaId = metaId;
            ObjId = objId;
            Type = type;
            Title = title;
            MetaKeywords = metaKeywords;
            MetaDescription = metaDescription;
            H1 = h1;
        }

        public MetaInfo(int metaId, 
                        int objId, 
                        MetaType type, 
                        string title, 
                        string metaKeywords, 
                        string metaDescription,
                        string h1, 
                        bool isDefaultMeta) : this(metaId, objId, type, title, metaKeywords, metaDescription, h1)
        {
            IsDefaultMeta = isDefaultMeta;
        }
        
        public MetaInfo(MetaInfo meta)
        {
            MetaId = meta.MetaId;
            ObjId = meta.ObjId;
            Type = meta.Type;
            Title = meta.Title;
            MetaKeywords = meta.MetaKeywords;
            MetaDescription = meta.MetaDescription;
            H1 = meta.H1;
            IsDefaultMeta = meta.IsDefaultMeta;
        }

        public bool IsNotEmpty()
        {
            return !Title.IsNullOrEmpty()
                   || !MetaKeywords.IsNullOrEmpty()
                   || !MetaDescription.IsNullOrEmpty()
                   || !H1.IsNullOrEmpty();
        }

        public object Clone()
        {
            // we dont need deep clone here
            return this.MemberwiseClone();
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = MetaId;
                hashCode = (hashCode * 31) ^ ObjId;
                hashCode = (hashCode * 31) ^ (int)Type;
                hashCode = (hashCode * 31) ^ (Title != null ? Title.GetHashCode() : 0);
                hashCode = (hashCode * 31) ^ (MetaKeywords != null ? MetaKeywords.GetHashCode() : 0);
                hashCode = (hashCode * 31) ^ (MetaDescription != null ? MetaDescription.GetHashCode() : 0);
                hashCode = (hashCode * 31) ^ (H1 != null ? H1.GetHashCode() : 0);
                hashCode = (hashCode * 31) ^ IsDefaultMeta.GetHashCode();
                return hashCode;
            }
        }
    }
}
