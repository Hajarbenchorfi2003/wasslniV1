"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { translate } from "@/lib/utils";
import MenuIcon from "../MenuIcon";

const SingleIconMenu = ({ index, activeIndex, item, locationName, trans }) => {
  const { icon, title, href } = item;
  
  // Debug: Vérifiez l'icône reçue
  console.log("Icon received:", icon);

  const iconContent = (
    <div className="flex items-center justify-center">
      <MenuIcon 
        icon={icon} 
        className={cn("w-6 h-6", {
          "text-primary": href ? locationName === href : activeIndex === index,
          "text-default-500 dark:text-default-400": href ? locationName !== href : activeIndex !== index
        })}
      />
    </div>
  );

  const containerClasses = cn(
    "h-12 w-12 mx-auto rounded-md transition-all duration-300 flex items-center justify-center",
    {
      "bg-primary/10 dark:bg-primary/20": href 
        ? locationName === href 
        : activeIndex === index,
      "hover:bg-primary/10": true
    }
  );

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          {href ? (
            <Link href={href} className={containerClasses}>
              {iconContent}
            </Link>
          ) : (
            <button className={containerClasses}>
              {iconContent}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side="right" className="capitalize">
          {translate(title, trans)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SingleIconMenu;