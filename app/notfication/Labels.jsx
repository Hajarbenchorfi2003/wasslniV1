import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Labels({ items, isCollapsed }) {
  return (
    <div
      className={cn("mx-4", {
        "mx-1  text-center space-y-2 py-2": isCollapsed,
      })}
    >
      {items?.map((item, index) => (
        <React.Fragment key={`label-x-${index}`}>
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={item.onClick}
                  className="flex-none h-3.5 w-3.5 mx-auto rounded-full"
                  style={{ backgroundColor: `var(--${item.color})` }}
                ></button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="flex items-center gap-4 capitalize"
              >
                <div className="flex-1 text-sm font-medium text-primary-foreground capitalize">
                  {item.label}
                </div>
                <div className="flex-none text-sm font-medium text-primary-foreground">
                  {item.total}
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={item.onClick}
              className="flex items-center gap-1.5 py-2 cursor-pointer w-full"
            >
              <div
                className="flex-none h-2 w-2 rounded-full"
                style={{ backgroundColor: `var(--${item.color})` }}
              ></div>
              <div className="flex-1 text-sm font-medium text-default-600 capitalize">
                {item.label}
              </div>
              <div className="flex-none text-sm font-medium text-default-600">
                {item.total}
              </div>
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
} 