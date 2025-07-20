class Player {
    constructor(name) {
        this.name = name;
        this.chips = this.loadChips();
    }

    get displayText() {
        return `${this.name}: $${this.chips}`;
    }

    bet(amount) {
        if (this.chips >= amount) {
            this.chips -= amount;
            this.saveChips();
            return true;
        }
        return false;
    }

    win(amount) {
        this.chips += amount;
        this.saveChips();
    }

    saveChips() {
        localStorage.setItem("playerChips", this.chips.toString());
    }

    loadChips() {
        const saved = localStorage.getItem("playerChips");
        return saved !== null ? parseInt(saved, 10) : 200;
    }

    resetChips() {
        this.chips = 200;
        this.saveChips();
    }
}

class Deck {
    static drawCard() {
        const number = Math.floor(Math.random() * 13) + 1;
        if (number === 1) return 11;
        if (number > 10) return 10;
        return number;
    }
}

class UI {
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

class BlackjackGame {
    constructor(player, ui) {
        this.player = player;
        this.ui = ui;
        this.resetGame();
    }

    resetGame() {
        this.cards = [];
        this.sum = 0;

        this.dealerCards = [];
        this.dealerSum = 0;

        this.hasBlackJack = false;
        this.isAlive = false;
        this.betAmount = 0;
        this.payoutMultiplier = 1;
        this.playerStands = false;
    }

    start() {
        const userBet = this.ui.getBetAmount();
        if (!Number.isInteger(userBet) || userBet <= 0) {
            this.ui.updateMessage("Please enter a valid bet amount.");
            return;
        }

        if (!this.player.bet(userBet)) {
            this.ui.updateMessage("Not enough chips to bet that much.");
            return;
        }

        this.betAmount = userBet;
        this.payoutMultiplier = 1 + userBet / 100;

        this.resetGame(); // сбросить всё кроме ставки
        this.betAmount = userBet;
        this.isAlive = true;

        this.cards = [Deck.drawCard(), Deck.drawCard()];
        this.sum = this.cards.reduce((a, b) => a + b, 0);

        this.render();
    }

    drawNewCard() {
        if (!this.isAlive || this.hasBlackJack || this.playerStands) return;

        const card = Deck.drawCard();
        this.cards.push(card);
        this.sum += card;
        this.render();
    }

    stand() {
        if (!this.isAlive || this.hasBlackJack) return;

        this.playerStands = true;
        this.ui.updateMessage("Dealer's turn...");

        this.dealerTurn();
    }

    dealerTurn() {
        this.dealerCards = [Deck.drawCard(), Deck.drawCard()];
        this.dealerSum = this.dealerCards.reduce((a, b) => a + b, 0);

        while (this.dealerSum < 17) {
            const card = Deck.drawCard();
            this.dealerCards.push(card);
            this.dealerSum += card;
        }

        this.endGame();
    }

    endGame() {
        this.ui.updateCards(this.cards);
        this.ui.updateSum(this.sum);
        this.ui.updatePlayerInfo(this.player);

        let result = "";

        if (this.sum > 21) {
            result = "You busted! Dealer wins.";
        } else if (this.dealerSum > 21) {
            const profit = Math.floor(this.betAmount * this.payoutMultiplier);
            this.player.win(this.betAmount + profit);
            result = `Dealer busted! You win $${profit}!`;
        } else if (this.sum > this.dealerSum) {
            const profit = Math.floor(this.betAmount * this.payoutMultiplier);
            this.player.win(this.betAmount + profit);
            result = `You beat the dealer! You win $${profit}!`;
        } else if (this.sum === this.dealerSum) {
            this.player.win(this.betAmount);
            result = "Push! It's a tie. Bet returned.";
        } else {
            result = "Dealer wins. Better luck next time!";
        }

        this.isAlive = false;
        this.ui.updateMessage(result);
        this.ui.updatePlayerInfo(this.player);
    }

    restartGame() {
        localStorage.removeItem("playerChips");
        localStorage.removeItem("lastBet");
        localStorage.removeItem("playerName");

        document.getElementById("game-section").style.display = "none";
        document.getElementById("setup-section").style.display = "block";

        document.getElementById("name-input").value = "";
        document.getElementById("chips-input").value = "";
        this.ui.updateMessage("Game reset. Please start a new session.");
        this.ui.updateCards([]);
        this.ui.updateSum(0);
        this.ui.updatePlayerInfo({ name: "", chips: 0 });
    }

    render() {
        this.ui.updateCards(this.cards);
        this.ui.updateSum(this.sum);
        this.ui.updatePlayerInfo(this.player);

        if (this.sum < 21) {
            this.ui.updateMessage("Do you want to draw a new card or stand?");
        } else if (this.sum === 21) {
                const profit = Math.floor(this.betAmount * this.payoutMultiplier);
                this.player.win(this.betAmount + profit);
                this.hasBlackJack = true;
                this.isAlive = false;
                this.ui.updateMessage(`Blackjack! You win $${profit}!`);
                this.ui.updatePlayerInfo(this.player);
        } else {
            this.ui.updateMessage("Busted! You lost.");
            this.isAlive = false;
        }
    }
}

document.getElementById("start-session-btn").addEventListener("click", initSession);

function initSession() {
    const name = document.getElementById("name-input").value.trim();
    const chipsInput = document.getElementById("chips-input").value;
    const chips = parseInt(chipsInput, 10);

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

window.addEventListener("DOMContentLoaded", () => {
    const name = localStorage.getItem("playerName");
    const chips = localStorage.getItem("playerChips");

    if (name && chips) {
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
});