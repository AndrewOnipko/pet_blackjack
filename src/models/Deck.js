export class Deck {
    static drawCard() {
        const number = Math.floor(Math.random() * 13) + 1;
        if (number === 1) return 11;
        if (number > 10) return 10;
        return number;
    }
}