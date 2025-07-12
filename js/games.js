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
  let startX = -itemWidth * totalItems;
  
  gsap.set(track, { x: startX });
  
  // --- PERBAIKAN UTAMA DI SINI ---
  const draggable = Draggable.create(track, {
    type: "x",
    // 1. Inertia yang lebih tinggi untuk momentum yang lebih kuat
    inertia: 20, // Meningkatkan nilai dari default
    
    // 2. Edge Resistance yang lebih rendah agar lebih mudah digeser dari tepi
    edgeResistance: 0.25, // Mengurangi dari 0.75
    
    // 3. Snap yang lebih halus (opsional, tapi bisa dicoba)
    snap: {
      x: function(endValue) {
        // Snap hanya ketika kecepatan rendah, agar tidak terasa kaku
        if (Math.abs(this.getVelocity()) < 500) {
          return Math.round(endValue / itemWidth) * itemWidth;
        }
        return endValue; // Jika masih cepat, biarkan bergerak bebas
      }
    },
    
    // 4. Kontrol momentum saat dilepas dengan lebih baik
    onDragEnd: function() {
      // 'this' di sini merujuk ke instance Draggable
      // Jika kecepatan drag cukup tinggi, biarkan GSAP menangani momentumnya
      // Jika tidak, langsung panggil highlightCenterItem
      if (Math.abs(this.getVelocity()) > 100) {
        // Gunakan throwProps untuk efek melambat yang natural
        gsap.to(track, {
          x: this.endX, // Target akhir
          ease: "power2.out",
          duration: 1.5, // Durasi animasi melambat
          overwrite: true,
          onComplete: highlightCenterItem
        });
      } else {
        highlightCenterItem();
      }
    },
    
    // Panggil fungsi 3D effect saat bergerak
    onDrag: update3DEffects,
    onThrowUpdate: update3DEffects
  })[0];
  
  function wrapIfNeeded() {
    const x = draggable.x;
    const minX = -itemWidth * (totalItems * 2);
    const maxX = 0;
    
    // Infinite wrap ke kanan
    if (x > maxX) {
      draggable.x = x - itemWidth * totalItems;
    }
    
    // Infinite wrap ke kiri
    if (x < minX) {
      draggable.x = x + itemWidth * totalItems;
    }
  }
  
  function update3DEffects() {
    const centerX = window.innerWidth / 2;
    let closest = null;
    let closestDistance = Infinity;
    
    allItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(centerX - itemCenter);
      
      // Hitung efek 3D berdasarkan jarak dari tengah
      const distanceRatio = Math.min(1, distance / (window.innerWidth / 3)); // Batasi efek maksimal
      const rotateY = distanceRatio * 40 * (itemCenter < centerX ? 1 : -1);
      const translateZ = -distanceRatio * 100;
      const scale = 1 - distanceRatio * 0.3;
      
      gsap.to(item, {
        rotationY: rotateY,
        z: translateZ,
        scale: scale,
        opacity: 1 - distanceRatio * 0.7,
        duration: 0.3, // Durasi lebih cepat untuk responsivitas
        ease: "power2.out"
      });
      
      if (distance < closestDistance) {
        closest = item;
        closestDistance = distance;
      }
    });
    
    // Pastikan item active hanya satu
    allItems.forEach(item => {
      item.classList.remove("active");
      if (item === closest) {
        item.classList.add("active");
      }
    });
  }
  
  function highlightCenterItem() {
    // Pemanggilan ulang untuk memastikan posisi akhir tepat
    update3DEffects();
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
  highlightCenterItem();
});