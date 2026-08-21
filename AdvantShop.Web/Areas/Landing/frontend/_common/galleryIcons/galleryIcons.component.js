import galleryIconsTemplate from './galleryIcons.html';
(function (ng) {
    

    ng.module('galleryIcons').component('galleryIcons', {
        controller: 'GalleryIconsCtrl',
        templateUrl: galleryIconsTemplate,
        bindings: {
            onSelect: '&',
        },
    });
})(window.angular);
