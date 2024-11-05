export const getCurrencySymbol = (currency: string) => {
  switch(currency) {
    case "EUR": 
      return "€";
    case "PLN":
      return "zł";
    case "USD":
      default:
        return "$";
  }
}