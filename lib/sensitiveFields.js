// Shared constants for sensitive data field types and labels.
// This file is safe to import from both client and server components.

export const SENSITIVE_FIELD_TYPES = [
  'CARD_NUMBER',
  'CARD_HOLDER',
  'CARD_EXPIRY',
  'CVV',
  'PASSPORT',
  'GOVT_ID',
  'SENSITIVE_NOTE',
];

export const SENSITIVE_FIELD_LABELS = {
  CARD_NUMBER: 'Card Number',
  CARD_HOLDER: 'Card Holder Name',
  CARD_EXPIRY: 'Card Expiry',
  CVV: 'CVV',
  PASSPORT: 'Passport Number',
  GOVT_ID: 'Government ID',
  SENSITIVE_NOTE: 'Sensitive Note',
};
