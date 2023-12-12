import { NumberFormatter, NumberFormatterProps } from "@mantine/core";
import { FC } from "react";

type ExtendPrefix = Omit<NumberFormatterProps, "prefix"> & {
  prefix?: string | boolean;
};

const NumberCurrency: FC<ExtendPrefix> = ({
  value,
  prefix,
  decimalScale,
  thousandSeparator,
  ...props
}) => {
  return (
    <NumberFormatter
      {...props}
      value={value}
      prefix={prefix === undefined ? "$ " : prefix ? `${prefix}` : undefined}
      decimalScale={decimalScale || 2}
      thousandSeparator={thousandSeparator === false ? false : true}
    />
  );
};

export default NumberCurrency;
