export class Player {
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