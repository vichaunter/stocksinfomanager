import { Container, Flex, Paper } from "@mantine/core";
import { FC } from "react";
import DoubleNavbar from "../sidebar/DoubleNavbar";
import { Outlet } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};

const Layout: FC<Props> = () => {
  return (
    <Flex>
      <DoubleNavbar />
      <Container fluid style={{ width: "100%" }}>
        <Paper style={{ height: "3.8rem" }}></Paper>
        <Outlet />
      </Container>
    </Flex>
  );
};

export default Layout;
