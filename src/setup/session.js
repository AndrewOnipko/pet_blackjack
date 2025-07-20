import { Player } from "../models/Player.js";
import { UI } from "../ui/UI.js";
import { BlackjackGame } from "../core/BlackjackGame.js";

export function initSession() {
    const name = document.getElementById("name-input").value.trim();
    const chips = parseInt(document.getElementById("chips-input").value, 10);

    if (!name || isNaN(chips) || chips <= 0) {
        alert("Please enter a valid name and starting amount.");
        return;
    }

    localStorage.setItem("playerName", name);
    localStorage.setItem("playerChips", chips.toString());

    document.getElementById("setup-section").style.display = "none";
    document.getElementById("game-section").style.display = "block";

    const player = new Player(name);
    const ui = new UI();
    const game = new BlackjackGame(player, ui);

    ui.updatePlayerInfo(player);

    document.getElementById("deal-btn").addEventListener("click", () => game.start());
    document.getElementById("hit-btn").addEventListener("click", () => game.drawNewCard());
    document.getElementById("stand-btn").addEventListener("click", () => game.stand());
    document.getElementById("restart-btn").addEventListener("click", () => game.restartGame());
}