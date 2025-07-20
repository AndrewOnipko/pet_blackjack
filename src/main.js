import { initSession } from "./setup/session.js";

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-session-btn");
    if (startBtn) {
        startBtn.addEventListener("click", initSession);
    }

    const nameInput = document.getElementById("name-input");
    if (nameInput) nameInput.focus();
});