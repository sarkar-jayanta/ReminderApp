import { validateReminder } from '../src/utils/validation';

describe('validateReminder', () => {
  it('rejects an empty title', () => {
    expect(validateReminder('  ', new Date(Date.now() + 60_000))).toBe('Please enter a reminder title.');
  });

  it('rejects a date in the past', () => {
    expect(validateReminder('Call Mom', new Date(Date.now() - 60_000))).toBe('Choose a date and time in the future.');
  });

  it('accepts a future reminder with a non-empty title', () => {
    expect(validateReminder('Call Mom', new Date(Date.now() + 60_000))).toBeNull();
  });
});
