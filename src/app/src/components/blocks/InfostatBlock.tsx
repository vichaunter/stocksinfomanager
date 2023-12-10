import { Flex, Group, Paper, Text, ThemeIcon } from "@mantine/core";
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";
import { FC } from "react";

type Props = {
  title: string;
  value: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
};
const InfostatBlock: FC<Props> = ({
  title,
  value,
  previousValue,
  prefix,
  suffix,
}) => {
  const diff = previousValue ? (value * 100) / previousValue - 100 : null;
  const DiffIcon = diff && diff > 0 ? IconArrowUpRight : IconArrowDownRight;

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
        {diff && (
          <ThemeIcon
            color="gray"
            variant="light"
            style={{
              color:
                diff > 0
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
      {diff && (
        <Flex c="dimmed" fz="sm" mt="md" align={"baseline"}>
          <Text component="span" c={diff > 0 ? "teal" : "red"} fw={700}>
            {diff.toFixed(2)}%
          </Text>{" "}
          {previousValue && (
            <Text fz="xs" ml={10}>
              {prefix} {(value - previousValue).toFixed(2)}
            </Text>
          )}
        </Flex>
      )}
    </Paper>
  );
};

export default InfostatBlock;
