import { Box, Collapse, Flex, Paper } from "@mantine/core";
import BrokersForm from "../../components/forms/BrokersForm";
import FakeTickerForm from "../../components/forms/FakeTickerForm";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

const PortfolioEditor = ({}) => {
  const [opened, { toggle }] = useDisclosure(true);

  const ChevronIcon = opened ? IconChevronUp : IconChevronDown;
  return (
    <>
      <Paper withBorder p="md" pt={0} pb={opened ? "md" : 0} radius="md">
        <Flex
          justify="space-between"
          onClick={toggle}
          style={{ cursor: "pointer" }}
          align="center"
        >
          <h3>Data upload/edit form</h3> <ChevronIcon />
        </Flex>
        <Collapse in={opened}>
          <h4>Add Fake Ticker</h4>
          <FakeTickerForm />
          <h4>Upload brokers data</h4>
          <BrokersForm />
        </Collapse>
      </Paper>
    </>
  );
};

export default PortfolioEditor;
