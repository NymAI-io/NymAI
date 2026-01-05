export const NYMAI_API_URL = 'https://nymai-api-dnthb.ondigitalocean.app';
export const HUBSPOT_API_URL = 'https://api.hubapi.com';

export const UNDO_TIMEOUT_MS = 10000;
export const MAX_ACTIVITIES_PER_SCAN = 20;

export const ACTIVITY_CONFIG = {
  note: {
    pluralName: 'notes',
    textProperty: 'hs_note_body',
  },
  email: {
    pluralName: 'emails',
    textProperty: 'hs_email_text',
    htmlProperty: 'hs_email_html',
  },
  call: {
    pluralName: 'calls',
    textProperty: 'hs_call_body',
  },
} as const;

export const OBJECT_TYPE_MAP: Record<string, string> = {
  '0-1': 'contacts',
  '0-2': 'companies',
  '0-3': 'deals',
  '0-5': 'tickets',
  CONTACT: 'contacts',
  COMPANY: 'companies',
  DEAL: 'deals',
  TICKET: 'tickets',
};
