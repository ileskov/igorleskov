function loadImage(img, src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = src;
        image.onload = () => {
            img.src = src;
            img.removeAttribute("data-src");
            resolve(img);
        };
        image.onerror = () => {
            reject(new Error("Ошибка загрузки изображения: " + src));
        };
    });
}

function loadEagerAndViewportImages(images) {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const preloadMargin = 800; // 800px ниже экрана
    const promises = [];

    images.forEach(img => {
        const src = img.dataset.src;
        const loadingType = img.getAttribute("loading") || "lazy";
        const rect = img.getBoundingClientRect();

        const shouldLoadNow = (
            loadingType === "eager" ||
            rect.top < viewportHeight + preloadMargin
        );

        if (shouldLoadNow && src) {
            promises.push(loadImage(img, src));
        }
    });

    return Promise.all(promises);
}

function lazyLoadRemainingImages(images) {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                if (src) {
                    loadImage(img, src).catch(console.error);
                    obs.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: "200px",
        threshold: 0.1
    });

    images.forEach(img => {
        if (img.dataset.src && !img.src) {
            observer.observe(img);
        }
    });
}

function optimizeImageLoading() {
    const images = Array.from(document.querySelectorAll('img[loading]'));

    loadEagerAndViewportImages(images)
        .then(() => {
            console.log("Быстрые изображения загружены");
            lazyLoadRemainingImages(images);
        })
        .catch(error => console.error("Ошибка загрузки:", error));
}

window.addEventListener("load", optimizeImageLoading);
