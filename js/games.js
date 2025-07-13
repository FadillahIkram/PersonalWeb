window.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(Draggable);

  const track = document.querySelector(".carousel-track");
  const items = Array.from(track.children);
  const itemWidth = items[0].offsetWidth + 32; // width + gap
  const totalItems = items.length;

  // Clone item untuk efek loop
  for (let i = 0; i < totalItems * 2; i++) {
    const cloneBefore = items[i % totalItems].cloneNode(true);
    const cloneAfter = items[i % totalItems].cloneNode(true);
    track.insertBefore(cloneBefore, track.firstChild); // kiri
    track.appendChild(cloneAfter); // kanan
  }

  const allItems = Array.from(track.children);
  const totalClones = totalItems * 2;
  const initialOffset = -itemWidth * totalClones;
  gsap.set(track, { x: initialOffset });

  let dragStartX = 0;
  let dragStartTime = 0;

  const draggable = Draggable.create(track, {
    type: "x",
    inertia: false,
    edgeResistance: 0.2,
    onDragStart: () => {
      gsap.killTweensOf(track);
      dragStartX = draggable.x;
      dragStartTime = Date.now();
    },
    onDrag: () => {
      wrapIfNeeded();
      update3DEffects();
    },
    onDragEnd: handleDragEnd
  })[0];

  function wrapIfNeeded() {
    const totalRange = itemWidth * totalItems;
    let x = draggable.x;

    // Jika terlalu kanan (drag ke kiri jauh)
    if (x > initialOffset + totalRange) {
      const newX = x - totalRange;
      gsap.set(track, { x: newX });
      draggable.update();
    }

    // Jika terlalu kiri (drag ke kanan jauh)
    else if (x < initialOffset - totalRange) {
      const newX = x + totalRange;
      gsap.set(track, { x: newX });
      draggable.update();
    }
  }

  function handleDragEnd() {
    const dragEndX = draggable.x;
    const dragEndTime = Date.now();

    const dragDistance = dragEndX - dragStartX;
    const dragDuration = dragEndTime - dragStartTime;
    const dragSpeed = dragDistance / dragDuration;

    const relativeX = initialOffset - dragEndX;
    const currentIndex = Math.round(relativeX / itemWidth);

    let direction = 0;
    if (Math.abs(dragDistance) > itemWidth / 4 || Math.abs(dragSpeed) > 0.4) {
      direction = dragDistance < 0 ? 1 : -1;
    }

    const targetIndex = currentIndex + direction;
    const targetX = initialOffset - (targetIndex * itemWidth);

    gsap.to(track, {
      x: targetX,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        wrapIfNeeded();
        update3DEffects();
      },
      onComplete: highlightCenterItem
    });
  }

  function update3DEffects() {
    const centerX = window.innerWidth / 2;

    allItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(centerX - itemCenter);

      const distanceRatio = Math.min(1, distance / (window.innerWidth / 3));
      const rotateY = distanceRatio * 40 * (itemCenter < centerX ? 1 : -1);
      const scale = 1 - distanceRatio * 0.3;

      gsap.to(item, {
        rotationY: rotateY,
        scale: scale,
        opacity: 1 - distanceRatio * 0.6,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  }

  function highlightCenterItem() {
    const centerX = window.innerWidth / 2;
    let closest = null;
    let closestDistance = Infinity;

    allItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(centerX - itemCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = item;
      }
    });

    allItems.forEach(item => item.classList.remove("active"));
    if (closest) closest.classList.add("active");
  }

  // Klik → buka link game
  track.addEventListener("click", e => {
    const item = e.target.closest(".carousel-item");
    if (item && item.classList.contains("active")) {
      const link = item.getAttribute("data-link");
      if (link) {
        window.location.href = link;
      }
    }
  });

  // Resize → update ulang
  window.addEventListener("resize", () => {
    draggable.update();
    update3DEffects();
  });

  update3DEffects();
});
