import { Paper, SimpleGrid, Table, Title } from "@mantine/core";
import { format } from "date-fns";
import CSVReader from "react-csv-reader";
import useEtoro from "../hooks/useEtoro";
import useRevolut from "../hooks/useRevolut";

const Converters = () => {
  const [_, revolutData, onChangeRevolut] = useRevolut();
  // const [__, etoroData, onChangeEtoro] = useEtoro();

  return <></>;
  // return (
  //   <SimpleGrid cols={{ base: 1 }}>
  //     <Paper withBorder p="md" radius="md">
  //       <Title order={4}>Dividend parser</Title>
  //       {/* <DropzoneButton onDrop={handleOnDrop} /> */}
  //       Revolut: <CSVReader onFileLoaded={onChangeRevolut} />
  //       Etoro: <input type="file" onChange={onChangeEtoro} />
  //     </Paper>
  //     <Title order={4}>Loaded: {revolutData.length > 0 && "Revolut"} </Title>
  //     <Paper withBorder p="md" radius="md">
  //       <Table>
  //         <Table.Thead>
  //           <Table.Tr>
  //             <Table.Th>Ticker</Table.Th>
  //             <Table.Th>Total</Table.Th>
  //             <Table.Th>Date</Table.Th>
  //             {/* {headers.map((h) => (
  //               <Table.Th key={h}>{h}</Table.Th>
  //             ))} */}
  //           </Table.Tr>
  //         </Table.Thead>
  //         <Table.Tbody>
  //           {revolutData.map((r) => (
  //             <Table.Tr key={`${r.ticker}-${r.date}-${r.total}`}>
  //               <Table.Td>{r.ticker}</Table.Td>
  //               <Table.Td>{r.total}</Table.Td>
  //               <Table.Td>{format(r.date, "dd/MM/yyyy")}</Table.Td>
  //             </Table.Tr>
  //           ))}
  //         </Table.Tbody>
  //       </Table>
  //     </Paper>
  //   </SimpleGrid>
  // );
};

export default Converters;
