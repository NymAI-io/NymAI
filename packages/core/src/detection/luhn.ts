/**
 * Validates a credit card number using the Luhn algorithm.
 * @param value - The credit card number (can contain spaces/dashes)
 * @returns true if the number passes Luhn validation
 */
export function luhnCheck(value: string): boolean {
  const digits = value.replace(/\D/g, '');

  // Most cards are 13-19 digits
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  // Process from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}
