export function getSplitAmount(invoiceAmount: number, splitPercentage: number) {
  return Math.floor(invoiceAmount * (splitPercentage / 100));
}
export function getSplitAmountWithoutFee(
  invoiceAmount: number,
  splitPercentage: number
) {
  const splitAmount = getSplitAmount(invoiceAmount, splitPercentage);
  const fee = Math.ceil(splitAmount / 100);
  return splitAmount - fee;
}
