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
