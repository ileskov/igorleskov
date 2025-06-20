function loadImage(imageUrl) {
    return new Promise(function(resolve, reject) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = function() {
            resolve(img);
        };
        img.onerror = function() {
            reject(new Error('Ошибка загрузки изображения: ' + imageUrl));
        };
    });
}

function eagerLoadImages(images) {
    return Promise.all(images.map(img => loadImage(img.src)));
}

function observeLazyImages(images) {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                if (src) {
                    loadImage(src)
                        .then(() => {
                            img.src = src;
                            img.removeAttribute("data-src");
                            obs.unobserve(img);
                        })
                        .catch(error => {
                            console.error("Ошибка ленивой загрузки:", error);
                        });
                }
            }
        });
    }, {
        rootMargin: "100px", // предварительная загрузка
        threshold: 0.1
    });

    images.forEach(img => {
        const src = img.src;
        img.dataset.src = src;
        img.src = ""; // временно убираем
        observer.observe(img);
    });
}

function processImagesWithLoadingAttribute() {
    const images = document.querySelectorAll('img[loading]');
    const eager = [];
    const lazy = [];

    images.forEach(img => {
        const mode = img.getAttribute("loading");
        if (mode === "eager") {
            eager.push(img);
        } else {
            lazy.push(img); // и auto, и lazy
        }
    });

    eagerLoadImages(eager)
        .then(() => console.log("Eager изображения загружены."))
        .catch(err => console.error("Ошибка загрузки eager изображений:", err));

    observeLazyImages(lazy);
}

window.addEventListener("load", processImagesWithLoadingAttribute);
