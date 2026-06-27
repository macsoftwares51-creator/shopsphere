document.addEventListener("DOMContentLoaded", function () {

  const buddy = document.createElement("img");
  buddy.src = "m.png";
  buddy.id = "shopBuddy";

  // ==========================================
  // FORCE CONSTRAINTS TO FIX THE ZOOMING SCREENS:
  // ==========================================
  buddy.style.position = "fixed";   // Keeps it floating over screens without breaking structure
  buddy.style.zIndex = "9999";      // Keeps it accessible
  buddy.style.pointerEvents = "auto"; 
  buddy.style.maxWidth = "60px";    // Prevents it from rendering too large on mobile displays
  buddy.style.maxHeight = "60px";   
  buddy.style.objectFit = "contain";
  // ==========================================

  document.body.appendChild(buddy);

  let roaming = true;

  function randomPosition() {
    // Keep it safely inside the viewport dimensions using tighter margins (subtracting 70px)
    const x = Math.random() * (window.innerWidth - 70);
    const y = Math.random() * (window.innerHeight - 70);

    buddy.style.left = x + "px";
    buddy.style.top = y + "px";
  }

  function roam() {
    if (!roaming) return;
    buddy.style.transition = "left 3s linear, top 3s linear";
    randomPosition();
  }

  // Trigger positions cleanly
  randomPosition();
  setInterval(roam, 3000);
});
