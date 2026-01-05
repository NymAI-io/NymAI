export function createMaskedPreview(text: string, start: number, end: number): string {
  const original = text.slice(start, end);
  const visibleChars = Math.min(4, Math.floor(original.length / 3));
  return '*'.repeat(original.length - visibleChars) + original.slice(-visibleChars);
}

export function getObjectTypeForApi(objectType: string): string {
  const typeMap: Record<string, string> = {
    '0-1': 'contacts',
    '0-2': 'companies',
    '0-3': 'deals',
    '0-5': 'tickets',
    CONTACT: 'contacts',
    COMPANY: 'companies',
    DEAL: 'deals',
    TICKET: 'tickets',
  };
  return typeMap[objectType] || objectType.toLowerCase() + 's';
}
