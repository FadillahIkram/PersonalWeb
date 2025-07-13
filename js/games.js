window.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(Draggable);
  const track = document.querySelector(".carousel-track");
  const items = Array.from(track.children);
  const itemWidth = items[0].offsetWidth + 32; // padding + margin/gap
  const totalItems = items.length;

  // Clone untuk infinite effect
  for (let i = 0; i < totalItems; i++) {
    const cloneBefore = items[i].cloneNode(true);
    const cloneAfter = items[i].cloneNode(true);
    track.insertBefore(cloneBefore, track.firstChild);
    track.appendChild(cloneAfter);
  }
  
  const allItems = Array.from(track.children);
  const fullLength = allItems.length;
  
  // Hitung posisi awal agar item pertama (yang asli) di tengah
  const initialOffset = -(itemWidth * totalItems);
  gsap.set(track, { x: initialOffset });

  const draggable = Draggable.create(track, {
    type: "x",
    // Matikan inertia dan edgeResistance agar kita punya kendali penuh
    inertia: 0, 
    edgeResistance: 0.2,
    onDragStart: () => {
      gsap.killTweensOf(track);
    },
    onDrag: update3DEffects,
    onDragEnd: handleDragEnd
  })[0];

  function handleDragEnd() {
  const centerX = window.innerWidth / 2;
  let closestItem = null;
  let closestDistance = Infinity;

  allItems.forEach(item => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const distance = Math.abs(centerX - itemCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item;
    }
  });

  if (closestItem) {
    const rect = closestItem.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const shift = itemCenter - centerX;

    // Hitung posisi sekarang
    const currentX = gsap.getProperty(track, "x");
    const targetX = currentX - shift;

    gsap.to(track, {
      x: targetX,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: update3DEffects,
      onComplete: () => {
        allItems.forEach(item => item.classList.remove("active"));
        closestItem.classList.add("active");
      }
    });
  }
}


  function update3DEffects() {
    const centerX = window.innerWidth / 2;
    allItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(centerX - itemCenter);
      
      // Hitung efek 3D berdasarkan jarak dari tengah
      const distanceRatio = Math.min(1, distance / (window.innerWidth / 3));
      const rotateY = distanceRatio * 40 * (itemCenter < centerX ? 1 : -1);
      const translateZ = -distanceRatio * 100;
      const scale = 1 - distanceRatio * 0.3;
      
      gsap.to(item, {
        rotationY: rotateY,
        z: translateZ,
        scale: scale,
        opacity: 1 - distanceRatio * 0.7,
        duration: 0.2,
        ease: "power2.out"
      });
    });
  }

  // Klik untuk membuka game
  track.addEventListener("click", e => {
    const item = e.target.closest(".carousel-item");
    if (item && item.classList.contains("active")) {
      const link = item.getAttribute("data-link");
      if (link) {
        window.location.href = link;
      }
    }
  });

  // Update saat resize
  window.addEventListener("resize", () => {
    draggable.update();
    update3DEffects();
  });

  // Inisialisasi
  update3DEffects();
});