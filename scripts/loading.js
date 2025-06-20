function loadImage(imageUrl) {
    return new Promise(function(resolve, reject) {
        var img = new Image();
        img.src = imageUrl;
        img.onload = function() {
            resolve(img);
        };
        img.onerror = function() {
            reject(new Error('Ошибка загрузки изображения: ' + imageUrl));
        };
    });
}

function eagerLoadImages(imageUrls) {
    return Promise.all(imageUrls.map(loadImage));
}

function autoLoadImages(imageUrls) {
    const promises = imageUrls.map(function(imageUrl) {
        if (imageInViewport(imageUrl)) {
            return loadImage(imageUrl);
        } else {
            return null;
        }
    }).filter(Boolean); // убираем null
    return Promise.all(promises);
}

function imageInViewport(imageUrl) {
    var image = document.querySelector('img[src="' + imageUrl + '"]');
    if (!image) {
        return false; 
    }

    var imageRect = image.getBoundingClientRect();
    var viewportTop = 0;
    var viewportBottom = window.innerHeight || document.documentElement.clientHeight;

    return (imageRect.top < viewportBottom) && (imageRect.bottom > viewportTop);
}

function processImagesWithLoadingAttribute() {
    var imagesWithLoadingAttribute = document.querySelectorAll('img[loading]');
    var eager = [];
    var auto = [];
    var lazy = [];

    imagesWithLoadingAttribute.forEach(function(img) {
        var src = img.src;
        var mode = img.getAttribute('loading');

        switch (mode) {
            case 'eager':
                eager.push(src);
                break;
            case 'auto':
                auto.push(src);
                break;
            case 'lazy':
            default:
                lazy.push(src);
        }
    });

    Promise.all([
        eagerLoadImages(eager),
        autoLoadImages(auto),
        Promise.all(lazy.map(loadImage)) // заменяет удалённую lazyLoadImages
    ]).then(function(results) {
        const allLoadedImages = results.flat();
        console.log('Изображения успешно загружены:', allLoadedImages);
    }).catch(function(error) {
        console.error('Ошибка загрузки изображений:', error);
    });
}

window.onload = function() {
    processImagesWithLoadingAttribute();
};
