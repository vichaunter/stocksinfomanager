import { Flex, Group, Paper, Text, ThemeIcon } from "@mantine/core";
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";
import { FC } from "react";

type SecondLineProps = {
  isNegative: boolean;
  value: string;
  legend?: string;
};
const SecondLine: FC<SecondLineProps> = ({ isNegative, value, legend }) => {
  return (
    <Flex c="dimmed" fz="sm" mt="md" align={"baseline"}>
      <Text component="span" c={isNegative ? "red" : "teal"} fw={700}>
        {value}
      </Text>{" "}
      {legend && (
        <Text fz="xs" ml={10}>
          {legend}
        </Text>
      )}
    </Flex>
  );
};

type Props = {
  title: string;
  value: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  positive?: boolean;
  negative?: boolean;
  secondLineValue?: string | number;
  secondLineLegend?: string | number;
};
const InfostatBlock: FC<Props> = ({
  title,
  value,
  previousValue,
  prefix,
  suffix,
  positive,
  negative,
  secondLineValue,
  secondLineLegend,
}) => {
  const diff = previousValue ? (value * 100) / previousValue - 100 : 0;

  const isNegative = (negative === false && !positive) || diff < 0;
  const isPositive = positive || (diff > 0 && !isNegative);

  const DiffIcon = isPositive ? IconArrowUpRight : IconArrowDownRight;

  return (
    <Paper withBorder p="md" radius="md" key={title}>
      <Group justify="apart">
        <div>
          <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
            {title}
          </Text>
          <Text fw={700} fz="xl">
            {prefix} {value.toFixed(2)} {suffix}
          </Text>
        </div>
        {(diff || isPositive || isNegative) && (
          <ThemeIcon
            color="gray"
            variant="light"
            style={{
              color: isPositive
                ? "var(--mantine-color-teal-6)"
                : "var(--mantine-color-red-6)",
            }}
            size={38}
            radius="md"
          >
            <DiffIcon size="1.8rem" stroke={1.5} />
          </ThemeIcon>
        )}
      </Group>
      {secondLineValue ? (
        <SecondLine
          value={`${secondLineValue}`}
          legend={`${secondLineLegend || ""}`}
          isNegative={isNegative}
        />
      ) : diff ? (
        <SecondLine
          value={`${diff.toFixed(2)}%`}
          isNegative={isNegative}
          legend={
            previousValue
              ? `${prefix} ${(value - previousValue).toFixed(2)}`
              : undefined
          }
        />
      ) : null}
    </Paper>
  );
};

export default InfostatBlock;
