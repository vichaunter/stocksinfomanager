import { Flex, Input, InputLabel, Paper } from "@mantine/core";
import useBrokersExtract from "../../hooks/useBrokers";
import dayjs from "dayjs";

const PortfolioEditor = ({}) => {
  const { updateData } = useBrokersExtract();

  return (
    <>
      <h2>Upload data</h2>
      <Paper withBorder p="md" radius="md">
        <Flex justify={"space-between"}>
          <InputLabel p={"md"}>
            Etoro (
            <a
              target="_blank"
              href={`https://www.etoro.com/documents/accountstatement/2009-01-01/${dayjs(
                new Date()
              ).format("YYYY-MM-DD")}`}
            >
              xlsx
            </a>
            ):
            <Input type="file" onChange={(e) => updateData("etoro", e)} />
          </InputLabel>
          <InputLabel p="md">
            Revolut (csv):
            <Input type="file" onChange={(e) => updateData("revolut", e)} />
          </InputLabel>
        </Flex>
      </Paper>
    </>
  );
};

export default PortfolioEditor;
