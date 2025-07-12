window.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(Draggable);

  const track = document.querySelector(".carousel-track");
  const items = Array.from(track.children);
  const itemWidth = items[0].offsetWidth + 32; // padding + margin/gap
  const totalItems = items.length;

  // Clone kiri dan kanan → Infinite effect
  for (let i = 0; i < totalItems; i++) {
    const cloneBefore = items[i].cloneNode(true);
    const cloneAfter = items[i].cloneNode(true);
    track.insertBefore(cloneBefore, track.firstChild); // prepend
    track.appendChild(cloneAfter); // append
  }

  // All items update
  const allItems = Array.from(track.children);
  const fullLength = allItems.length;
  let startX = -itemWidth * totalItems;
  gsap.set(track, { x: startX });

  const draggable = Draggable.create(track, {
    type: "x",
    inertia: true,
    edgeResistance: 0.75,
    onDrag: wrapIfNeeded,
    onThrowUpdate: wrapIfNeeded,
    onDragEnd: highlightCenterItem,
  })[0];

  function wrapIfNeeded() {
    const x = this.x;
    const minX = -itemWidth * (totalItems * 2);
    const maxX = 0;

    // Infinite wrap ke kanan
    if (x > maxX) {
      this.x = x - itemWidth * totalItems;
      gsap.set(track, { x: this.x });
    }

    // Infinite wrap ke kiri
    if (x < minX) {
      this.x = x + itemWidth * totalItems;
      gsap.set(track, { x: this.x });
    }

    highlightCenterItem();
  }

  function highlightCenterItem() {
    const centerX = window.innerWidth / 2;
    let closest = null;
    let closestDistance = Infinity;

    const all = document.querySelectorAll(".carousel-item");
    all.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(centerX - itemCenter);
      if (distance < closestDistance) {
        closest = item;
        closestDistance = distance;
      }
    });

    all.forEach(item => item.classList.remove("active"));
    if (closest) closest.classList.add("active");
  }

  // Saat klik gambar aktif → redirect
  track.addEventListener("click", e => {
    const item = e.target.closest(".carousel-item");
    if (item && item.classList.contains("active")) {
      const link = item.getAttribute("data-link");
      if (link) {
        window.location.href = link; // halaman game seperti snake.html, dll
      }
    }
  });

  // Resize: update posisi dan deteksi ulang tengah
  window.addEventListener("resize", () => {
    draggable.update();
    highlightCenterItem();
  });

  // Jalankan saat awal
  highlightCenterItem();
});
