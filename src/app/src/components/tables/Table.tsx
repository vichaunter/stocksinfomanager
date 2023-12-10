import { Table as MTable } from "@mantine/core";
import { FC, useState } from "react";

type Props = {
  id?: string;
  headers?: string[];
  values: Array<Array<string | boolean | number>>;
};

const Table: FC<Props> = ({ id, headers, values }) => {
  const [tid] = useState(id ?? Date.now().toString());

  const renderRow = (row: Array<string | boolean | number>) => (
    <MTable.Tr key={tid + row.join()}>
      {row.map((cell) => (
        <MTable.Td key={tid + row.join() + cell}>{cell}</MTable.Td>
      ))}
    </MTable.Tr>
  );

  return (
    <MTable>
      {headers && (
        <MTable.Thead>
          <MTable.Tr>
            {headers.map((header) => (
              <MTable.Th key={tid + header}>{header}</MTable.Th>
            ))}
          </MTable.Tr>
        </MTable.Thead>
      )}
      <MTable.Tbody>{values.map((row) => renderRow(row))}</MTable.Tbody>
    </MTable>
  );
};

export default Table;
