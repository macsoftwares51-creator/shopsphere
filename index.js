let isOn = false;

        function toggleLamp() {
            isOn = !isOn;
            
            // Animation for the string pull
            const string = document.getElementById("string");
            string.style.transform = "translateY(10px)";
            setTimeout(() => string.style.transform = "translateY(0)", 100);

            // Hide the hint after first click
            document.getElementById("hint").style.display = "none";

            // Update Body state
            document.body.setAttribute("data-on", isOn);

            const loginForm = document.getElementById("loginForm");

            if (isOn) {
                loginForm.classList.add("active");
                // GSAP background transition
                gsap.to("body", { backgroundColor: "#1c1f24", duration: 0.6 });
            } else {
                loginForm.classList.remove("active");
                // GSAP background transition back
                gsap.to("body", { backgroundColor: "#121417", duration: 0.6 });
            }
        }

        /* --- LOGIC FROM YOUR PREVIOUS CODE --- */
        function createAccount() {
            const name = document.getElementById("name").value.trim();
            if (!name) return alert("Please enter your name");
            
            localStorage.setItem("user", JSON.stringify({ name: name, type: "account" }));
            window.location.href = "home.html";
        }

        function continueGuest() {
            localStorage.setItem("user", JSON.stringify({ name: "Guest", type: "guest" }));
            window.location.href = "home.html";
        }
