const studyTimeZone = "Asia/Seoul";
const studyDayStartHour = 5;

function getKoreanTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: studyTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour)
  };
}

function formatDateParts(year: number, month: number, day: number) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0")
  ].join("-");
}

export function getStudyDate(date: Date = new Date()) {
  const parts = getKoreanTimeParts(date);

  if (parts.hour >= studyDayStartHour) {
    return formatDateParts(parts.year, parts.month, parts.day);
  }

  const previousDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  previousDate.setUTCDate(previousDate.getUTCDate() - 1);

  return formatDateParts(
    previousDate.getUTCFullYear(),
    previousDate.getUTCMonth() + 1,
    previousDate.getUTCDate()
  );
}

export function addDaysToStudyDate(studyDate: string, days: number) {
  const [year, month, day] = studyDate.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day));
  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return formatDateParts(
    nextDate.getUTCFullYear(),
    nextDate.getUTCMonth() + 1,
    nextDate.getUTCDate()
  );
}

export function getStudyMonth(date: Date = new Date()) {
  return getStudyDate(date).slice(0, 7);
}

export function getMonthDateRange(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const firstDate = new Date(Date.UTC(year, monthIndex - 1, 1));
  const lastDate = new Date(Date.UTC(year, monthIndex, 0));
  const days: string[] = [];

  for (
    let currentDate = new Date(firstDate);
    currentDate <= lastDate;
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  ) {
    days.push(
      formatDateParts(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth() + 1,
        currentDate.getUTCDate()
      )
    );
  }

  return {
    start: days[0],
    end: days[days.length - 1],
    days
  };
}

export function isValidStudyMonth(month: string) {
  return /^\d{4}-\d{2}$/.test(month);
}
