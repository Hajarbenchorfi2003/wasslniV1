import React from "react";
import { cn } from "@/lib/utils";
import * as Icons from "@/components/svg";

const MenuIcon = ({ icon, className }) => {
  const IconComponent = Icons[icon];
  
  if (!IconComponent) {
    console.warn(`Icon "${icon}" not found`);
    return null;
  }

  return <IconComponent className={cn("h-5 w-5", className)} />;
};

export default MenuIcon; 