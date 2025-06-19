"use client";
import React from "react";
import { cn, isLocationMatch, translate } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import MenuIcon from "../common/menu-icon";

const NestedMenus = ({
  nestedMenus,
  nestedIndex,
  index,
  locationName,
  toggleMulti,
  multiIndex,
  trans,
}) => {
  if (!nestedMenus) return null;

  return (
    <div
      className={cn("mt-1 space-y-1", {
        hidden: nestedIndex !== index,
      })}
    >
      {nestedMenus.map((nestedItem, i) => {
        const content = (
          <div className="flex items-center gap-2">
            {nestedItem.icon && (
              <MenuIcon icon={nestedItem.icon} className="h-5 w-5" />
            )}
            <span>{translate(nestedItem.title, trans)}</span>
          </div>
        );

        if (nestedItem.child) {
          return (
            <div key={i}>
              <div
                onClick={() => toggleMulti(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  {
                    "bg-primary/10 text-primary": multiIndex === i,
                    "text-default-600 hover:bg-default-100 hover:text-default-900":
                      multiIndex !== i,
                  }
                )}
              >
                {content}
                <ChevronRight
                  className={cn("h-4 w-4 transition-transform duration-200", {
                    "rotate-90": multiIndex === i,
                  })}
                />
              </div>
              {multiIndex === i && (
                <div className="mt-1 space-y-1 pl-4">
                  {nestedItem.child.map((childItem, j) => (
                    <Link
                      key={j}
                      href={childItem.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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
                      {childItem.icon && (
                        <MenuIcon icon={childItem.icon} className="h-5 w-5" />
                      )}
                      <span>{translate(childItem.title, trans)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={i}
            href={nestedItem.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              {
                "bg-primary/10 text-primary": isLocationMatch(
                  nestedItem.href,
                  locationName
                ),
                "text-default-600 hover:bg-default-100 hover:text-default-900":
                  !isLocationMatch(nestedItem.href, locationName),
              }
            )}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
};

export default NestedMenus;
