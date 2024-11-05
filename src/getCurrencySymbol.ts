export const getCurrencySymbol = (currency: string) => {
    const symbol: { [key: string]:string } = { USD: "$", EUR: "€", PLN: "zł" };
    return symbol[currency] || "$";
  }