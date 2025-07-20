import { Deck } from "../models/Deck.js";

export class BlackjackGame {
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
        this.resetGame();
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
        localStorage.removeItem("playerName");
        localStorage.removeItem("playerChips");
        localStorage.removeItem("lastBet");
        this.player.resetChips();
        this.ui.updatePlayerInfo(this.player);
        this.resetGame();
        this.ui.updateMessage("Game reset. Place your bet and deal.");
        this.ui.updateCards([]);
        this.ui.updateSum(0);
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