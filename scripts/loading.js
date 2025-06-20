function loadImage(img, src) {
    return new Promise((resolve, reject) => {
        img.onload = () => {
            img.removeAttribute("data-src");
            resolve(img);
        };
        img.onerror = () => {
            reject(new Error("Ошибка загрузки изображения: " + src));
        };
        img.src = src;
    });
}

function loadEagerAndNearViewportImages(images) {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const preloadMargin = 300; // Уменьшили до 300px
    const promises = [];

    images.forEach(img => {
        const src = img.dataset.src;
        const loadingType = img.getAttribute("loading") || "lazy";
        const rect = img.getBoundingClientRect();

        const shouldLoadNow = (
            loadingType === "eager" ||
            rect.top < viewportHeight + preloadMargin
        );

        if (shouldLoadNow && src && !img.src) {
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
                if (src && !img.src) {
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
    const images = Array.from(document.querySelectorAll('img[loading][data-src]'));

    loadEagerAndNearViewportImages(images)
        .then(() => {
            lazyLoadRemainingImages(images);
        })
        .catch(console.error);
}

window.addEventListener("load", () => {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(optimizeImageLoading);
    } else {
        setTimeout(optimizeImageLoading, 200);
    }
});
