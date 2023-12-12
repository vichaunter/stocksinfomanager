import { Flex, Input, InputLabel } from "@mantine/core";
import dayjs from "dayjs";
import useBrokers from "../../hooks/useBrokers";

const BrokersFilesUploader = ({}) => {
  const { updateData } = useBrokers();

  return (
    <Flex justify={"space-between"}>
      <InputLabel>
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
      <InputLabel>
        Revolut (csv):
        <Input type="file" onChange={(e) => updateData("revolut", e)} />
      </InputLabel>
    </Flex>
  );
};

export default BrokersFilesUploader;
