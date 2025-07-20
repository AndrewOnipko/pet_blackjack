export class UI {
    constructor() {
        this.messageEl = document.getElementById("message-el");
        this.sumEl = document.getElementById("sum-el");
        this.cardsEl = document.getElementById("cards-el");
        this.playerEl = document.getElementById("player-el");
        this.betInput = document.getElementById("bet-input");
        this.setBetFromStorage();
    }

    getBetAmount() {
        const value = parseInt(this.betInput.value, 10);
        if (!isNaN(value)) {
            localStorage.setItem("lastBet", value.toString());
        }
        return value;
    }

    setBetFromStorage() {
        const saved = localStorage.getItem("lastBet");
        if (saved && !isNaN(parseInt(saved, 10))) {
            this.betInput.value = saved;
        }
    }

    updatePlayerInfo(player) {
        this.playerEl.textContent = player.displayText;
    }

    updateCards(cards) {
        this.cardsEl.innerHTML = "";
        const label = document.createElement("strong");
        label.textContent = "Cards: ";
        this.cardsEl.appendChild(label);

        cards.forEach(card => {
            const span = document.createElement("span");
            span.textContent = card;
            span.className = "card";
            this.cardsEl.appendChild(span);
        });
    }

    updateSum(sum) {
        this.sumEl.textContent = "Sum: " + sum;
    }

    updateMessage(message) {
        this.messageEl.textContent = message;
    }
}