async function login() {
    const passwordInput = document.getElementById("password");
    const errorElement = document.getElementById("error");
    const btn = document.getElementById("loginBtn");

    // Remove any accidental spaces
    const password = passwordInput.value.trim();

    if(!password) {
        errorElement.innerText = "Please enter the access code.";
        return;
    }

    // UI Feedback
    btn.innerText = "Verifying...";
    btn.disabled = true;
    errorElement.innerText = "";

    try {
        const response = await fetch("https://shopsphere-backend-wr5o.onrender.com/admin-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: password })
        });

        const data = await response.json();

        if (data.success) {
            console.log("Access Granted");
            window.location.href = "add-product.html"; 
        } else {
            errorElement.innerText = "Incorrect password. Access denied.";
            btn.innerText = "Authorize Entry";
            btn.disabled = false;
        }
    } catch (err) {
        console.error("Login error:", err);
        errorElement.innerText = "System error. Check if the server is awake.";
        btn.innerText = "Authorize Entry";
        btn.disabled = false;
    }
}

// Keypress listener to prevent form reload
document.getElementById("password").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        e.preventDefault(); 
        login();
    }
});
