export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getDday(targetDate: string) {
  const today = new Date();
  const target = new Date(targetDate);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetStart = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );
  const diff = targetStart.getTime() - todayStart.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}
