export const formatDateTime = (input: Date | string) => {
  const date = typeof input === 'string' ? new Date(input) : input;

  const today = new Date();
  const inputDate = new Date(date);

  const msPerDay = 1000 * 60 * 60 * 24;
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const inputDateStart = new Date(inputDate);
  inputDateStart.setHours(0, 0, 0, 0);
  const after = Math.round((inputDateStart.getTime() - todayStart.getTime()) / msPerDay);

  const dayName = inputDate.toLocaleDateString('en-US', { weekday: 'long' });

  const day = String(inputDate.getDate()).padStart(2, '0');
  const month = String(inputDate.getMonth() + 1).padStart(2, '0');

  const [hourMinute, meridiem] = inputDate
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .split(' ');

  return {
    dayOfWeek: { after, day: dayName },
    time: { hourMinute, meridiem },
    day,
    month,
  };
};
