// Azerbaijani date utilities for proper localization

export const azerbaijaniMonths = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'İyun',
  'İyul',
  'Avqust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr'
];

export const azerbaijaniWeekDays = [
  'Bazar',
  'Bazar ertəsi',
  'Çərşənbə axşamı',
  'Çərşənbə',
  'Cümə axşamı',
  'Cümə',
  'Şənbə'
];

export const azerbaijaniShortWeekDays = [
  'Baz',
  'B.e',
  'Ç.a',
  'Çə',
  'C.a',
  'Cüm',
  'Şən'
];

export const formatAzerbaijaniDate = (date: Date): string => {
  const day = date.getDate();
  const month = azerbaijaniMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export const formatAzerbaijaniDayOfWeek = (date: Date): string => {
  return azerbaijaniWeekDays[date.getDay()];
};

export const formatAzerbaijaniShortDayOfWeek = (date: Date): string => {
  return azerbaijaniShortWeekDays[date.getDay()];
};

export const getAzerbaijaniRelativeDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return 'Bugün';
  }

  // Check if it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Dünən';
  }

  // Check if it's tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Sabah';
  }

  // Otherwise return formatted date
  return formatAzerbaijaniDate(date);
};