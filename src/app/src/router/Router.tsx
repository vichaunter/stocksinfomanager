import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Homepage from "../pages/Homepage";
import {
  IconCalendarStats,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconGauge,
  IconHome2,
  IconSettings,
  IconUser,
  IconWallet,
  IconListNumbers,
  IconTransform,
} from "@tabler/icons-react";
import Converters from "../pages/Converters";
import Layout from "../components/layout/Layout";
import TickersPage from "../pages/TickersPage";
import TickerPage from "../pages/TickerPage";
import PortfolioPage from "../pages/PortfolioPage";

export const baseRoutes = [
  {
    label: "Home",
    path: "/",
    id: "root",
    element: <Layout />,
  },
];

const baseChildRoutes = [
  {
    id: "homepage",
    label: "Home",
    path: "",
    element: <Homepage />,
    icon: IconHome2,
  },
  {
    id: "tickers",
    label: "Tickers",
    path: "tickers",
    element: <TickersPage />,
    icon: IconListNumbers,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    path: "portfolio",
    element: <PortfolioPage />,
    icon: IconWallet,
  },
  {
    id: "ticker",
    label: "Ticker",
    path: "ticker/:symbol",
    element: <TickerPage />,
    icon: IconFingerprint,
  },
  {
    id: "converters",
    label: "Converters",
    path: "converters",
    element: <Converters />,
    icon: IconTransform,
  },
];

export const routes = [...baseChildRoutes];

export const router = createBrowserRouter(
  baseRoutes.map(({ id, path, element }) => ({
    id,
    path,
    element,
    children: baseChildRoutes.map(({ id, path, element }) => ({
      id,
      path,
      element,
    })),
  }))
);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
