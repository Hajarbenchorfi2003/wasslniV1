import React from "react";
import { cn, isLocationMatch, translate } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import MenuIcon from "../common/menu-icon";

const MenuItem = ({
  childItem,
  toggleNested,
  index,
  nestedIndex,
  locationName,
  trans,
}) => {
  const content = (
    <div className="flex items-center gap-2">
      {childItem.icon && (
        <MenuIcon icon={childItem.icon} className="h-5 w-5" />
      )}
      <span>{translate(childItem.title, trans)}</span>
    </div>
  );

  if (childItem.nested) {
    return (
      <div
        onClick={() => toggleNested(index)}
        className={cn(
          "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
          {
            "bg-primary/10 text-primary": nestedIndex === index,
            "text-default-600 hover:bg-default-100 hover:text-default-900":
              nestedIndex !== index,
          }
        )}
      >
        {content}
        <ChevronRight
          className={cn("h-4 w-4 transition-transform duration-200", {
            "rotate-90": nestedIndex === index,
          })}
        />
      </div>
    );
  }

  return (
    <Link
      href={childItem.href}
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
        {
          "bg-primary/10 text-primary": isLocationMatch(
            childItem.href,
            locationName
          ),
          "text-default-600 hover:bg-default-100 hover:text-default-900":
            !isLocationMatch(childItem.href, locationName),
        }
      )}
    >
      {content}
    </Link>
  );
};

export default MenuItem;
