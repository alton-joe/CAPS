export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((chunk) => chunk[0]?.toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
}
