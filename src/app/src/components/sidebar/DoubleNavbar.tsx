import { Flex, Title, Tooltip, UnstyledButton, rem } from "@mantine/core";
import {
  IconCalendarStats,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconGauge,
  IconHome2,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  Link,
  matchPath,
  useLocation,
  useRouteLoaderData,
} from "react-router-dom";
import { routes } from "../../router/Router";
import classes from "./DoubleNavbar.module.css";

const mainLinksMockdata = [
  { icon: IconHome2, label: "Home" },
  { icon: IconGauge, label: "Dashboard" },
  { icon: IconDeviceDesktopAnalytics, label: "Analytics" },
  { icon: IconCalendarStats, label: "Releases" },
  { icon: IconUser, label: "Account" },
  { icon: IconFingerprint, label: "Security" },
  { icon: IconSettings, label: "Settings" },
];

function DoubleNavbar() {
  let { pathname } = useLocation();
  const [active, setActive] = useState("Releases");

  const mainLinks = mainLinksMockdata.map((link) => (
    <Tooltip
      label={link.label}
      position="right"
      withArrow
      transitionProps={{ duration: 0 }}
      key={link.label}
    >
      <UnstyledButton
        onClick={() => setActive(link.label)}
        className={classes.mainLink}
        data-active={link.label === active || undefined}
      >
        <link.icon style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  ));

  const links = routes.map((link) => {
    const Icon = link.icon;
    return (
      <Link
        className={classes.link}
        data-active={matchPath(link.path, pathname) || undefined}
        to={link.path}
        key={link.path}
      >
        <Flex justify={"left"} align={"center"} gap={5}>
          <Flex justify={"left"} align={"center"} gap={5}>
            {Icon && <Icon size={16} />}
          </Flex>
          <div>{link.label}</div>
        </Flex>
      </Link>
    );
  });

  return (
    <nav className={classes.navbar}>
      <div className={classes.wrapper}>
        {/* <div className={classes.aside}>
          <div className={classes.logo}>logo</div>
          {mainLinks}
        </div> */}
        <div className={classes.main}>
          <Title order={4} className={classes.title}>
            {active}
          </Title>

          {links}
        </div>
      </div>
    </nav>
  );
}

export default DoubleNavbar;
