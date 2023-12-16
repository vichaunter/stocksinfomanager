import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export const cleanNumber = (str: string): number => {
  if (typeof str === "number") return str;
  return parseFloat(str.replace(/[^0-9\.\%\- ]/g, ""));
};

export const parseDate = (str: string): Dayjs => {
  return dayjs(str, [
    "DD/MM/YYYY HH:mm:ss",
    "MMM DD, YYYY",
    "DD MMM YYYY",
    "YYYY-MM-DD",
  ]);
};

export const formatDate = (date: string | Dayjs): string => {
  const isDateString = typeof date === "string";
  let dayjsDate: Dayjs;
  if (isDateString) {
    dayjsDate = parseDate(date as string);
  } else {
    dayjsDate = date;
  }

  return dayjsDate.format();
};

export function getPercentColor(percentage: number, median: number) {
  const difference = Math.abs(percentage - median);

  const normalizedDifference = difference / median;

  const red = Math.min(255, Math.round(255 * normalizedDifference * 2));
  const green = Math.min(255, Math.round(255 * (1 - normalizedDifference) * 2));
  const blue = 0;

  return `rgba(${red}, ${green}, ${blue}, 0.5)`;
}

export const logLine = (message: any) => console.log("=====", message, "=====");

export const sleep = (ms: number = 2000): Promise<boolean> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
