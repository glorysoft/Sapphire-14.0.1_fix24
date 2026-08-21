namespace AdvantShop.Images.ImageConvertor
{
    public static class ImageConvertorStateManager
    {
        private static readonly object SyncObject = new object();
        private static bool _isRun = false;
        
        public static bool IsRun
        {
            get => _isRun;
            set
            {
                lock (SyncObject)
                {
                    _isRun = value;
                }
            }
        }
    }
}