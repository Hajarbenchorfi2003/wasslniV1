"use client";
import React from "react";
import { useSidebar, useThemeStore } from "@/store";
import { useMediaQuery } from "@/hooks/use-media-query";
import ModuleSidebar from "@/components/partials/sidebar/module";
import PopoverSidebar from "@/components/partials/sidebar/popover";
import ClassicSidebar from "@/components/partials/sidebar/classic";
import MobileSidebar from "@/components/partials/sidebar/mobile-sidebar";

import {
  DashBoard,
  Building,
  Bus,
  Users,
  Map,
  Settings,
} from "@/components/svg";

// Structure centralisée du menu admin
const adminNavigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: DashBoard,
  },
  {
    name: "Établissements",
    href: "/admin/schools",
    icon: Building,
  },
  {
    name: "Bus",
    href: "/admin/buses",
    icon: Bus,
  },
  {
    name: "Utilisateurs",
    icon: Users,
    children: [
      { name: "Chauffeurs", href: "/admin/drivers", icon: Users },
      { name: "Parents", href: "/admin/parents", icon: Users },
      { name: "Étudiants", href: "/admin/students", icon: Users },
    ],
  },
  {
    name: "Itinéraires",
    href: "/admin/routes",
    icon: Map,
  },
  {
    name: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
];

const AdminSidebar = ({ trans, navigation = [] }) => {
  const { sidebarType, collapsed } = useSidebar();
  const { layout } = useThemeStore();
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  const sidebarProps = {
    collapsed,
    trans,
    navigation,
  };

  let selectedSidebar = null;

  if (!isDesktop && (sidebarType === "popover" || sidebarType === "classic")) {
    selectedSidebar = <MobileSidebar {...sidebarProps} />;
  } else {
    const sidebarMap = {
      module: <ModuleSidebar {...sidebarProps} />,
      popover: <PopoverSidebar {...sidebarProps} />,
      classic: <ClassicSidebar {...sidebarProps} />,
    };

    selectedSidebar = sidebarMap[sidebarType] || <ModuleSidebar {...sidebarProps} />;
  }

  return <div>{selectedSidebar}</div>;
};

export default AdminSidebar;
