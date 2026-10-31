export const dateFormat = (value) => {
  if (!value) return "";

  const input = String(value).trim();

  // YYYY-MM-DD ko DD/MM/YYYY mein convert karo
  const ymdMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${day}/${month}/${year}`;
  }

  // Already DD/MM/YYYY ho to same return karo
  const dmyMatch = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (dmyMatch) {
    return input;
  }

  return "";
};

export const timeFormat = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "number") {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}`;
  }

  const input = String(value).trim();
  const match = input.match(/(?:T|\s|^)(\d{2}):(\d{2})/);

  if (!match) return "";

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) return "";

  return `${match[1]}:${match[2]}`;
};
