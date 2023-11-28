import dayjs, { Dayjs } from "dayjs";
import getSystemLocale from "system-locale";
import pc from "picocolors";

getSystemLocale().then((locale) => {
  console.log(pc.bgYellow(`Locale system loaded: ${locale}`));
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

export const cleanNumber = (str: string) => {
  return str.replace(/[^0-9\.\% ]/g, "");
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
