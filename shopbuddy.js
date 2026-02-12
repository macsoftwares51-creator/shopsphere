document.addEventListener("DOMContentLoaded", function () {

  const buddy = document.createElement("img");
  buddy.src = "m.png";
  buddy.id = "shopBuddy";

  document.body.appendChild(buddy);

  let roaming = true;

  function randomPosition() {
    const x = Math.random() * (window.innerWidth - 120);
    const y = Math.random() * (window.innerHeight - 120);

    buddy.style.left = x + "px";
    buddy.style.top = y + "px";
  }

  function roam() {
    if (!roaming) return;

    buddy.style.transition = "left 3s linear, top 3s linear";
    randomPosition();

    setTimeout(roam, 4000);
  }

  document.addEventListener("click", function (e) {

    roaming = false;

    buddy.style.transition = "left 0.6s ease, top 0.6s ease, transform 0.3s ease";
    buddy.style.left = e.clientX + "px";
    buddy.style.top = e.clientY + "px";

    buddy.style.transform = "scale(1.2)";

    setTimeout(() => {
      buddy.style.transform = "scale(1)";
    }, 300);

    setTimeout(() => {
      roaming = true;
      roam();
    }, 1200);
  });

  randomPosition();
  setTimeout(roam, 2000);
});
