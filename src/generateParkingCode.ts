export const generateParkingCode = (): string => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const randomLetters = letters.charAt(Math.floor(Math.random() * letters.length));
    const randomNumbers = Array.from({length: 2}, () => numbers.charAt(Math.floor(Math.random() * numbers.length))).join("");
    
    return randomLetters + randomNumbers;
}