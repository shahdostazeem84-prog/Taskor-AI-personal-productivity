import { TaskItem } from '../types';

export function exportTasksToICS(tasks: TaskItem[], calendarTitle = 'Taskora Tasks') {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const formatDateToICS = (dateStr?: string | null, timeStr?: string | null) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());

    let hour = '09';
    let min = '00';
    if (timeStr) {
      const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2] ? match[2] : '00';
        const meridian = match[3]?.toUpperCase();
        if (meridian === 'PM' && h < 12) h += 12;
        if (meridian === 'AM' && h === 12) h = 0;
        hour = pad(h);
        min = pad(parseInt(m, 10));
      }
    }
    return `${year}${month}${day}T${hour}${min}00`;
  };

  const nowICS = formatDateToICS();

  const events = tasks.map(task => {
    const start = formatDateToICS(task.dueDate, task.dueTime);
    const summary = task.title.replace(/[,;]/g, ' ');
    const desc = (task.description || '').replace(/\n/g, '\\n');
    return [
      'BEGIN:VEVENT',
      `UID:taskora-${task.id}@taskora.app`,
      `DTSTAMP:${nowICS}Z`,
      `DTSTART:${start}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${desc} [Priority: ${task.priority.toUpperCase()}]`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Taskora//AI Productivity Assistant//EN',
    `X-WR-CALNAME:${calendarTitle}`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `taskora-schedule-${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTasksToCSV(tasks: TaskItem[]) {
  const headers = ['Title', 'Priority', 'Category', 'Due Date', 'Due Time', 'Status', 'Estimated Min', 'Description'];
  const rows = tasks.map(t => [
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.priority,
    t.category,
    t.dueDate || '',
    t.dueTime || '',
    t.completed ? 'Completed' : 'Pending',
    t.estimatedMinutes || '',
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `taskora-tasks-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
