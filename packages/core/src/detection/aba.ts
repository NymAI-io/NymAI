/**
 * Validates an ABA routing number using the checksum algorithm.
 * The ABA routing number is a 9-digit number used to identify banks in the US.
 *
 * Checksum algorithm:
 * 3*(d1 + d4 + d7) + 7*(d2 + d5 + d8) + 1*(d3 + d6 + d9) must be divisible by 10
 */
export function abaRoutingCheck(value: string): boolean {
  const digits = value.replace(/\D/g, '');

  if (digits.length !== 9) {
    return false;
  }

  const d = digits.split('').map(Number);

  const checksum = 3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + 1 * (d[2] + d[5] + d[8]);

  if (checksum === 0) {
    return false;
  }

  return checksum % 10 === 0;
}
