/**
 * Utility functions for Google Calendar & iCal integration
 */

// Helper to convert date ("YYYY-MM-DD") and slot ("HH:MM") into Date object
export function parseSlotToDate(dateStr, slotStr) {
  if (!dateStr || !slotStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = slotStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

// Format Date object to Google Calendar ISO string without dashes/colons (e.g. 20260625T090000Z)
function formatToGCalIso(date) {
  return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
}

/**
 * Generate 1-click Google Calendar Event Creation URL
 */
export function generateGoogleCalendarUrl({ title, description, dateStr, slotStr, meetLink }) {
  const startDate = parseSlotToDate(dateStr, slotStr);
  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // 45-minute session

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'ProDecide Consultation Session',
    details: `${description || ''}\n\nJoin Video Call (Google Meet): ${meetLink || ''}`,
    location: meetLink || 'Google Meet',
    dates: `${formatToGCalIso(startDate)}/${formatToGCalIso(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate and trigger download of an .ics (iCalendar) file
 */
export function downloadIcsFile({ title, description, dateStr, slotStr, meetLink }) {
  const startDate = parseSlotToDate(dateStr, slotStr);
  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);

  const startIso = formatToGCalIso(startDate);
  const endIso = formatToGCalIso(endDate);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ProDecide//Consultation Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:pd-booking-${Date.now()}@prodecide.com`,
    `DTSTAMP:${formatToGCalIso(new Date())}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${title || 'ProDecide Consultation Session'}`,
    `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}\\n\\nJoin Video Call: ${meetLink || ''}`,
    `LOCATION:${meetLink || 'Google Meet'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `prodecide-consultation-${dateStr}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
