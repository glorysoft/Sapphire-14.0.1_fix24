using System;
using AdvantShop.FilePath;

namespace AdvantShop.Core.Services.CMS
{
    public class CarouselVideo
    {
        public int Id { get; set; }
        public int CarouselId { get; set; }
        public string VideoName { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string Description { get; set; }
        public string OriginName { get; set; }

        public string VideoSrc()
        {
            return string.IsNullOrEmpty(VideoName)
                ? string.Empty
                : VideoName.Contains("://") 
                    ? VideoName
                    : FoldersHelper.GetPath(FolderType.CarouselVideo, CarouselId + "/" + VideoName, false);
        }
    }
}