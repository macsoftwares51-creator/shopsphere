const AUTH_API = "https://shopsphere-backend-wr5o.onrender.com/auth";
const authStage = document.getElementById("authStage");
const preloaderCard = document.getElementById("preloaderCard");
const loginForm = document.getElementById("loginForm");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authSwitch = document.getElementById("authSwitch");
const authSwitchText = document.getElementById("authSwitchText");
const submitAuth = document.getElementById("submitAuth");
const authMessage = document.getElementById("authMessage");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const loaderDuration = 2300;
let isLoginMode = false;

function animateLoader(startTime) {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / loaderDuration, 1);
    const growProgress = Math.min(progress / 0.62, 1);
    const easedGrow = 1 - Math.pow(1 - growProgress, 3);
    const targetWidth = authStage?.clientWidth || 340;
    const targetHeight = loginForm?.scrollHeight || 470;
    const width = 84 + ((targetWidth - 84) * easedGrow);
    const height = 84 + ((targetHeight - 84) * easedGrow);
    const flipProgress = progress <= 0.62 ? 0 : (progress - 0.62) / 0.38;
    const rotation = Math.min(flipProgress, 1) * 180;
    const fadeProgress = Math.max(0, (progress - 0.88) / 0.12);

    if (preloaderCard) {
        preloaderCard.style.width = `${width}px`;
        preloaderCard.style.height = `${height}px`;
        preloaderCard.style.transform = `translate(-50%, -50%) rotateY(${rotation}deg)`;
        preloaderCard.style.opacity = String(1 - fadeProgress);
    }

    if (progress < 1) return setTimeout(() => animateLoader(startTime), 16);
    if (authStage) authStage.classList.add("revealed");
    if (loginForm) {
        loginForm.style.transition = "none";
        loginForm.style.opacity = "1";
        loginForm.style.transform = "rotateY(0deg) scale(1)";
        loginForm.style.pointerEvents = "all";
    }
}

function setMessage(message = "") {
    if (authMessage) authMessage.textContent = message;
}

function setMode(loginMode) {
    isLoginMode = loginMode;
    authTitle.textContent = loginMode ? "Welcome back" : "Create your account";
    authSubtitle.textContent = loginMode ? "Sign in securely to continue shopping." : "Secure checkout, saved details, and order updates.";
    nameInput.hidden = loginMode;
    nameInput.required = !loginMode;
    confirmPasswordInput.hidden = loginMode;
    confirmPasswordInput.required = !loginMode;
    passwordInput.autocomplete = loginMode ? "current-password" : "new-password";
    submitAuth.textContent = loginMode ? "Sign in" : "Create account";
    authSwitchText.textContent = loginMode ? "New to ShopSphere?" : "Already have an account?";
    authSwitch.textContent = loginMode ? "Create account" : "Sign in";
    setMessage("");
}

async function csrfToken() {
    const response = await fetch(`${AUTH_API}/csrf`, { credentials: "include" });
    if (!response.ok) throw new Error("Unable to start a secure session.");
    const data = await response.json();
    return data.csrfToken;
}

async function submitAuthForm(event) {
    event.preventDefault();
    setMessage("");
    if (!authForm.reportValidity()) return;
    if (!isLoginMode && passwordInput.value !== confirmPasswordInput.value) {
        setMessage("Passwords do not match.");
        return;
    }

    submitAuth.disabled = true;
    submitAuth.textContent = isLoginMode ? "Signing in..." : "Creating account...";
    try {
        const csrf = await csrfToken();
        const response = await fetch(`${AUTH_API}/${isLoginMode ? "login" : "register"}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
            body: JSON.stringify({ name: nameInput.value.trim(), email: emailInput.value.trim(), password: passwordInput.value })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Unable to authenticate.");
        localStorage.setItem("user", JSON.stringify({ ...data.user, type: "account" }));
        window.location.href = "home.html";
    } catch (error) {
        setMessage(error.message || "Unable to authenticate right now.");
        submitAuth.disabled = false;
        submitAuth.textContent = isLoginMode ? "Sign in" : "Create account";
    }
}

function continueGuest() {
    localStorage.setItem("user", JSON.stringify({ name: "Guest", type: "guest" }));
    window.location.href = "home.html";
}

setTimeout(() => animateLoader(performance.now()), 0);
setMode(false);
authForm.addEventListener("submit", submitAuthForm);
authSwitch.addEventListener("click", () => setMode(!isLoginMode));
document.getElementById("guestAccess").addEventListener("click", continueGuest);
