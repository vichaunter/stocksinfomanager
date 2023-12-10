import dayjs, { Dayjs } from "dayjs";
import getSystemLocale from "system-locale";
import pc from "picocolors";
import dev from "./dev";

getSystemLocale().then((locale) => {
  dev.log(pc.bgYellow(`Locale system loaded: ${locale}`));
  dayjs.locale(locale);
});

export const ucFirst = (str: string) =>
  str.slice(0, 1).toUpperCase() + str.slice(1);

export const lcFirst = (str: string) =>
  str.slice(0, 1).toLowerCase() + str.slice(1);

export const ucFirstAll = (str: string) =>
  str
    .split(" ")
    .map((s) => ucFirst(s))
    .join(" ");

export const camelizeText = (str: string) => {
  return lcFirst(
    ucFirstAll(str.replace(/[^a-zA-Z ]/, "")).replace(/[^a-zA-Z]/g, "")
  );
};

export const cleanNumber = (str: string): number => {
  return parseFloat(str.replace(/[^0-9\.\%\- ]/g, ""));
};

export const parseDate = (str: string): Dayjs =>
  dayjs(str, ["MMM DD, YYYY", "DD MMM YYYY", "YYYY-MM-DD"]);

export const formatDate = (date: string | Dayjs, format?): string => {
  const isDateString = typeof date === "string";
  let dayjsDate: Dayjs;
  if (isDateString) {
    dayjsDate = parseDate(date as string);
  } else {
    dayjsDate = date;
  }

  return dayjsDate.format();
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getDividendPercentage = (price, dividend) => {
  return (dividend / price) * 100;
};

export const sortObjByKeys = (obj: Record<string, any>) => {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((k) => {
      sorted[k] = obj[k];
    });

  return sorted;
};

export const findMode = (arr: number[]): number => {
  if (arr.length === 0) return 0;

  const counter: Record<string, number> = {};
  arr.forEach((n) => {
    counter[n] = (counter[n] ?? 0) + 1;
  });

  const sorted = Object.entries(counter)
    .map(([k, v]) => ({ value: k, frequency: v }))
    .sort((a, b) => b.frequency - a.frequency);

  if (sorted.length === sorted.reduce((tot, v) => tot + v.frequency, 0)) {
    return 0;
  }
  return Number(sorted?.[0]?.value) ?? 0;
};

export const getDividendYearPayments = (
  dates: Date[]
): Record<number, number> => {
  const countPerYear = {};

  for (const date of dates) {
    const year = date.getFullYear();
    countPerYear[year] = (countPerYear[year] ?? 0) + 1;
  }

  return countPerYear;
};

export const getDividendFrequency = (dates: Date[]): number => {
  const countPerYear = getDividendYearPayments(dates);

  let frequency = 0; //0 means no dividends

  frequency = Math.floor(findMode(Object.values(countPerYear)));

  return frequency;
};
