export function isValidEthAddress(address: string) {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
}
export function getTokenAddress(coinStore: string) {
  const match = coinStore.match(/CoinStore<([^>]+)>/);
  const innerText = match ? match[1] : "";

  return innerText;
}
