using AdvantShop.Catalog;
using AdvantShop.Web.Admin.Models.Catalog.Categories;

namespace AdvantShop.Web.Admin.Handlers.Catalog.WarehouseGroups
{
    internal sealed class DeleteWarehouseGroupPicture
    {
        private readonly int _pictureId;

        public DeleteWarehouseGroupPicture(int pictureId)
        {
            _pictureId = pictureId;
        }

        public UploadPictureResult Execute()
        {
            var photo = PhotoService.GetPhoto(_pictureId);

            if (photo == null)
                return new UploadPictureResult { Error = "Невозможно удалить изображение по умолчанию" };
            
            PhotoService.DeletePhotoByPhotoId(photo.PhotoId, photo.Type);

            var nophoto = string.Empty;

            switch (photo.Type)
            {
                case PhotoType.WarehouseGroupPhoto:
                    nophoto = "../images/nophoto_middle.png";
                    break;

                case PhotoType.WarehouseGroupLogo:
                    nophoto = "../images/nophoto_middle.png";
                    break;
            }

            return new UploadPictureResult() { Result = true, Picture = nophoto };
        }
    }
}
