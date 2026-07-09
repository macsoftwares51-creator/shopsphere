/**
 * ShopSphere Independent Theme Loader Manager
 */
const LIGHT_STYLE_ID = "shopsphere-light-css";

document.addEventListener("DOMContentLoaded", () => {
    // Check if the user had light mode active previously
    const savedTheme = localStorage.getItem("shopsphere-theme-preference");
    
    if (savedTheme === "light") {
        applyLightTheme(true);
    }
});

function toggleGlobalTheme() {
    const lightStylesheet = document.getElementById(LIGHT_STYLE_ID);
    
    if (!lightStylesheet) {
        applyLightTheme(true);
        localStorage.setItem("shopsphere-theme-preference", "light");
    } else {
        applyLightTheme(false);
        localStorage.setItem("shopsphere-theme-preference", "dark");
    }
}

function applyLightTheme(enable) {
    const iconSlot = document.querySelector("#theme-switch-btn .theme-icon-slot");
    let lightLink = document.getElementById(LIGHT_STYLE_ID);

    if (enable) {
        // If it doesn't exist yet, build the link node pointing to the separate file
        if (!lightLink) {
            lightLink = document.createElement("link");
            lightLink.id = LIGHT_STYLE_ID;
            lightLink.rel = "stylesheet";
            lightLink.href = "light-theme.css"; // Path to your independent file
            document.head.appendChild(lightLink);
        }
        if (iconSlot) iconSlot.textContent = "🌙";
    } else {
        // Remove the stylesheet reference completely to fall back to native dark CSS
        if (lightLink) {
            lightLink.remove();
        }
        if (iconSlot) iconSlot.textContent = "☀️";
    }
}
