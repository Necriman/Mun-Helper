/**
 * Build and download an .ics calendar file for a conference — works with
 * Google Calendar, Apple Calendar and Outlook. All-day events: DTEND is
 * exclusive per RFC 5545, hence the +1 day.
 */

const pad = (n) => String(n).padStart(2, '0');

const toIcsDate = (iso) => iso.replaceAll('-', '');

function plusOneDay(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

// Escape per RFC 5545: backslash, semicolon, comma, newline.
const esc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export function downloadConferenceIcs({ title, dateStart, dateEnd, city, description, url }) {
  if (!dateStart) return;

  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mun Helper//Conference Registry//EN',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}@munhelper`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${toIcsDate(dateStart)}`,
    `DTEND;VALUE=DATE:${plusOneDay(dateEnd ?? dateStart)}`,
    `SUMMARY:${esc(title)}`,
    city ? `LOCATION:${esc(city)}` : null,
    description ? `DESCRIPTION:${esc(description)}` : null,
    url ? `URL:${esc(url)}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
