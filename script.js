
document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector(".gallery");
    const ZoomOutBtn = document.getElementById("zoom-out");
    const ZoomInBtn = document.getElementById("zoom-in");
    const dragLayer = document.getElementById("drag-layer");
    const totalRows = 20;
    const imagesPerRow = 60;
    const totalImages = totalRows * imagesPerRow;
    const images = [];


    let currentZoomLevel = 0;
    const zoomLevels = {
        0: { scale: 1, spread: { x: 0, y: 0 } },
        1: { scale: 2, spread: { x: 400, y: 200 } },
        2: { scale: 3.5, spread: { x: 800, y: 400 } },
        3: { scale: 5, spread: { x: 1200, y: 600 } }
    };

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function getRandomHeight(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

 
    for (let i = 0; i < totalImages; i++) {
        const img = document.createElement("div");
        img.className = "img";
        img.style.height = `${getRandomHeight(30, 40)}px`;

        const imgElement = document.createElement("img");
        const randomImageNumber = Math.floor(Math.random() * 50) + 1;
        imgElement.src = `./assets/img${randomImageNumber}.jpg`;

        imgElement.onload = function () {
            gsap.to(img, {
                opacity: 1,
                scale: 1,
                duration: 1.5,
                ease: "power1.out"
            });
        };

        img.appendChild(imgElement);
        gallery.appendChild(img);
        images.push(img);
    }


    ZoomOutBtn.addEventListener("click", () => {
        if (currentZoomLevel === 0) return;

        currentZoomLevel--;
        updateZoomState();

        const tl = gsap.timeline({
            defaults: {
                duration: 1,
                ease: "power4.inOut",
            },
        });

        images.forEach((img) => {
            const rect = img.getBoundingClientRect();
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const distX = (rect.left + rect.width / 2 - centerX) / 100;
            const distY = (rect.top + rect.height / 2 - centerY) / 100;

            gsap.to(img, {
                x: distX * zoomLevels[currentZoomLevel].spread.x,
                y: distY * zoomLevels[currentZoomLevel].spread.y,
                scale: zoomLevels[currentZoomLevel].scale,
                duration: 1.5,
                ease: "power4.inOut",
            });
        });

   
        if (currentZoomLevel === 0) {
            gsap.to(gallery, {
                x: 0,
                y: 0,
                duration: 1,
                ease: "power4.inOut",
            });
            currentX = 0;
            currentY = 0;
            targetX = 0;
            targetY = 0;
        }
    });

   
    ZoomInBtn.addEventListener("click", () => {
        if (currentZoomLevel === 3) return;

        currentZoomLevel++;
        updateZoomState();

        images.forEach((img) => {
            const rect = img.getBoundingClientRect();
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const distX = (rect.left + rect.width / 2 - centerX) / 100;
            const distY = (rect.top + rect.height / 2 - centerY) / 100;

            gsap.to(img, {
                x: distX * zoomLevels[currentZoomLevel].spread.x,
                y: distY * zoomLevels[currentZoomLevel].spread.y,
                scale: zoomLevels[currentZoomLevel].scale,
                duration: 1.5,
                ease: "power4.inOut",
            });
        });
    });

    function updateZoomState() {
    
        ZoomOutBtn.classList.toggle("active", currentZoomLevel === 0);
        ZoomInBtn.classList.toggle("active", currentZoomLevel === 3);

    
        dragLayer.style.pointerEvents = currentZoomLevel > 0 ? "auto" : "none";
    }


    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function animate() {
        if (isDragging || Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
            currentX = lerp(currentX, targetX, 0.08);
            currentY = lerp(currentY, targetY, 0.08);
            gallery.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
        requestAnimationFrame(animate);
    }
    animate();

    function handleDragStart(e) {
        if (currentZoomLevel === 0) return;
        isDragging = true;
        dragLayer.style.cursor = "grabbing";

        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;

        const transform = window.getComputedStyle(gallery).transform;
        const matrix = new DOMMatrix(transform);
        initialX = matrix.m41;
        initialY = matrix.m42;
        currentX = initialX;
        currentY = initialY;
        targetX = initialX;
        targetY = initialY;

        if (e.type.includes('mouse')) {
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
        } else {
            document.addEventListener('touchmove', handleDragMove);
            document.addEventListener('touchend', handleDragEnd);
        }
    }

    function handleDragMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const currentPositionX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const currentPositionY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;

        const deltaX = currentPositionX - startX;
        const deltaY = currentPositionY - startY;

        targetX = initialX + deltaX;
        targetY = initialY + deltaY;
    }

    function handleDragEnd() {
        isDragging = false;
        dragLayer.style.cursor = "grab";

        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
    }

    dragLayer.addEventListener('mousedown', handleDragStart);
    dragLayer.addEventListener('touchstart', handleDragStart);
});
