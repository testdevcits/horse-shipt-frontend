import { getChatDateLabel } from './ChatDateSeparator';
const now = new Date(2026, 9, 31, 12);
test('labels local calendar days and suppresses repeated dates', () => {
  expect(getChatDateLabel(new Date(2026, 9, 31, 1), null, now)).toBe('Today');
  expect(getChatDateLabel(new Date(2026, 9, 30, 23), null, now)).toBe('Yesterday');
  expect(getChatDateLabel(new Date(2026, 9, 29), null, now)).toBe('29 Oct 2026');
  expect(getChatDateLabel(new Date(2026, 9, 30, 23), new Date(2026, 9, 30, 1), now)).toBeNull();
  expect(getChatDateLabel('invalid', null, now)).toBeNull();
});
test('yesterday works across month and year boundaries', () => {
  expect(getChatDateLabel(new Date(2025, 11, 31, 23), null, new Date(2026, 0, 1, 1))).toBe('Yesterday');
});
