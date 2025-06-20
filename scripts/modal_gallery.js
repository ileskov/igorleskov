var images = [
    "images/image1.webp", "images/image2.webp", "images/image3.webp", "images/image4.webp", 
    "images/image5.webp", "images/image6.webp", "images/image7.webp", "images/image8.webp", 
    "images/image9.webp", "images/image10.webp", "images/image11.webp", "images/image12.webp", 
    "images/image13.webp", "images/image14.webp", "images/image15.webp"
];

var currentImageIndex = 0;

function openModal(imageSrc) {
    var modal = document.getElementById("myModal");
    var modalImg = document.getElementById("modalImg");

    // Устанавливаем текущий индекс изображения
    currentImageIndex = images.indexOf(imageSrc);
    if (currentImageIndex === -1) currentImageIndex = 0;

    modal.style.display = "flex";
    modalImg.src = images[currentImageIndex];

    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
}

function closeModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    document.body.classList.remove("modal-open");
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateModalImage();
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateModalImage();
}

function updateModalImage() {
    var modalImg = document.getElementById("modalImg");
    modalImg.src = images[currentImageIndex];
}

document.getElementById("modalImg").addEventListener("click", function(event) {
    event.stopPropagation(); // Чтобы клик не закрывал модал
    nextImage();
});

function closeModalOnClick(event) {
    var modal = document.getElementById("myModal");
    if (event.target === modal) {
        closeModal();
    }
}

document.getElementById("myModal").addEventListener("click", closeModalOnClick);
