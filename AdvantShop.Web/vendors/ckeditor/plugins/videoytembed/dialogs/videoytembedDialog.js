/*
 *   Plugin developed by CTRL+N.
 *
 *   LICENCE: GPL, LGPL, MPL
 *   NON-COMMERCIAL PLUGIN.
 *
 *   Website: https://www.ctrplusn.net/
 *   Facebook: https://www.facebook.com/ctrlplusn.net/
 *
 */
CKEDITOR.dialog.add('videoytembedDialog', function (editor) {
    return {
        title: editor.lang.videoytembed.title,
        minWidth: 400,
        minHeight: 80,
        contents: [
            {
                id: 'tab-basic',
                label: 'Basic Settings',
                elements: [
                    {
                        type: 'text',
                        id: 'url_video',
                        label: 'Ссылка или код плеера (видео с dzen только код плеера)',
                        validate: CKEDITOR.dialog.validate.regex(/\b(youtube\.com|youtu\.be|vk\.com|vkvideo\.ru|dzen\.ru|rutube\.ru)\b/, 'Пожалуйста, введите правильный URL-адрес YouTube, ВКонтакте, dzen или RuTube.')
                    },
                    {
                        type: 'text',
                        id: 'max_height_video',
                        label: 'Максимальная высота видео',
                    },
                    {
                        type: 'text',
                        id: 'max_width_video',
                        label: 'Максимальная ширина видео',
                    }
                ]
            }
        ],
        onOk: function () {
            var dialog = this,
                maxHeight = 'none',
                maxWidth = 'none',
                div_container = new CKEDITOR.dom.element('p');

            if (dialog.getValueOf('tab-basic', 'max_height_video').length > 0) {
                maxHeight = dialog.getValueOf('tab-basic', 'max_height_video');
            }

            if (dialog.getValueOf('tab-basic', 'max_width_video').length > 0) {
                maxWidth = dialog.getValueOf('tab-basic', 'max_width_video');
            }
            div_container.$.style.maxHeight = maxHeight;
            div_container.$.style.maxWidth = maxWidth;
            div_container.$.style.aspectRatio = '16/9';


            // Auto-detect if youtube, vimeo or dailymotion url
            var url = detect(dialog.getValueOf('tab-basic', 'url_video'));

            if (url.indexOf('youtube') > 0) {
                var videoId = getYTVideoId(url);

                // Create iframe with specific url
                if (url.length > 1) {
                    var selectedElement = editor.getSelection().getStartElement();
                    if (selectedElement != null && selectedElement.$.tagName === 'IMG' && selectedElement.$.parentNode.tagName === 'IFRAME-RESPONSIVE') {
                        var iframeResponsive = selectedElement.$.parentNode;
                        var wrapper = iframeResponsive.closest('.ckeditor-yt-embed-wrap');
                        if (wrapper) {
                            wrapper.style.maxWidth = maxWidth;
                            wrapper.style.maxHeight = maxHeight;
                        }
                        if (iframeResponsive.dataset.src !== url) {
                            iframeResponsive.dataset.src = url;
                            const newImg = document.createElement('img');
                            newImg.setAttribute('src', getYTThumbnail(videoId));
                            newImg.style.maxHeight = maxHeight;
                            newImg.style.maxWidth = maxWidth;
                            selectedElement.$.replaceWith(newImg);
                        } else {
                            selectedElement.$.style.maxHeight = maxHeight;
                            selectedElement.$.style.maxWidth = maxWidth;
                        }

                    } else {
                        var iframe = new CKEDITOR.dom.element.createFromHtml('<iframe-responsive class="ckeditor-yt-embed" data-src="' + url + '"><img style="max-height: ' + maxHeight + '; max-width:' + maxWidth + ';" src="' + getYTThumbnail(videoId) + '"/></iframe-responsive>');
                        div_container.$.classList.add('ckeditor-yt-embed-wrap')
                        div_container.append(iframe);
                        editor.insertElement(div_container);
                    }
                }
            } else {
                if (url.length > 1) {
                    var selectedElement = editor.getSelection().getStartElement();
                    if (selectedElement != null && selectedElement.$.tagName === 'IMG' && selectedElement.$.parentNode.tagName === 'IFRAME-RESPONSIVE') {
                        var iframeResponsive = selectedElement.$.parentNode;
                        var wrapper = iframeResponsive.closest('.ckeditor-yt-embed-wrap');
                        if (wrapper) {
                            wrapper.style.maxWidth = maxWidth;
                            wrapper.style.maxHeight = maxHeight;
                        }
                        if (iframeResponsive.dataset.src !== url) {
                            iframeResponsive.dataset.src = url;
                            const newImg = document.createElement('img');
                            newImg.setAttribute('src', url);
                            newImg.style.maxHeight = maxHeight;
                            newImg.style.maxWidth = maxWidth;
                            selectedElement.$.replaceWith(newImg);
                        } else {
                            selectedElement.$.style.maxHeight = maxHeight;
                            selectedElement.$.style.maxWidth = maxWidth;
                        }

                    } else {
                        var iframe = new CKEDITOR.dom.element.createFromHtml('<iframe-responsive class="ckeditor-yt-embed" data-src="' + url + '"></iframe-responsive>');
                        div_container.$.classList.add('ckeditor-yt-embed-wrap')
                        div_container.append(iframe);
                        editor.insertElement(div_container);
                    }
                }
            }
        }
    };
});

// Detect platform and return video ID
function detect(url) {
    var embed_url = '';
    // full youtube url

    if (url.indexOf('youtube') > 0 || url.indexOf('youtu.be') > 0) {

        if (url.indexOf('src') > 0) {
            return getSrcFromIframe(url);
        }

        id = getYTVideoId(url);
        const splitedParams = url.split('?');
        const params = splitedParams.length > 1 ? '?' + url.split('?')[1] : '';
        if (id.indexOf('&list=') > 0) {
            return embed_url = 'https://www.youtube.com/embed/' + id + params;
        }
        return embed_url = 'https://www.youtube.com/embed/' + id + params;
    } else if (url.indexOf('vkvideo.ru') > 0 || url.indexOf('vk.com') > 0) {
        embed_url = getVKVideoString(url);
    } else if (url.indexOf('rutube.ru') > 0) {
        embed_url = getVideoString(url);
    } else if (url.indexOf('dzen.ru') > 0) {
        embed_url = getVideoString(url);
    }
    return embed_url;
}

function getYTVideoId(url) {

    if (url.indexOf('watch') > 0 || url.indexOf('embed') > 0 || url.indexOf('shorts') > 0) {
        return url.match(/(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/)[3];
    }
    return url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)[1];
}

function getVideoString(url) {
    if (url.indexOf('src') > 0) {
        return getSrcFromIframe(url);
    }

    if (url.indexOf('shorts') > 0) {
        return url.replace(/shorts/g, 'video');
    }

    return url;
}

function getVKVideoString(url) {
    if (url.indexOf('src') > 0) {
        return getSrcFromIframe(url);
    }

    if (url.indexOf('video_ext.php') > 0 || url.indexOf('/clip-') > 0) {
        return url;
    }

    const match = url.match(/video-(\d+)_(\d+)/);

    return `https://vk.com/video_ext.php?oid=-${match[1]}&id=${match[2]}&hd=2`;
}

function getSrcFromIframe(url) {

    const regex = /<iframe\s+[^>]*src="([^"]*)"[^>]*><\/iframe>/i;
    const match = url.match(regex);

    if (match && match[1]) {
        return match[1];
    }

    return url;
}

function getYTThumbnail(videoId) {
    return 'https://i.ytimg.com/vi_webp/' + videoId + '/sddefault.webp';
}
