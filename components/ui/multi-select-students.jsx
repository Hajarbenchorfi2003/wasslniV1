// components/ui/multi-select-students.jsx
"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react"; // Make sure X is imported
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function MultiSelectStudents({
  options, // Array of { value: student.id, label: student.fullname }
  selected, // Array of selected student IDs
  onSelectedChange, // Callback when selection changes
  placeholder = "Sélectionner des étudiants...", // Changed default for consistency
  emptyText = "Aucun étudiant trouvé.", // Changed default for consistency
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (currentValue) => {
    const isAlreadySelected = selected.includes(currentValue);
    let newSelection;

    if (isAlreadySelected) {
      newSelection = selected.filter((item) => item !== currentValue);
    } else {
      newSelection = [...selected, currentValue];
    }
    onSelectedChange(newSelection);
  };

  const getSelectedLabels = () => {
    return selected
      .map((id) => options.find((option) => option.value === id)?.label)
      .filter(Boolean); // Filter out any undefined labels if ID not found
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          // The key change is here: styling to allow badges to wrap nicely
          className="w-full justify-between h-auto min-h-[40px] flex-wrap items-center px-3 py-2"
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1 pr-6"> {/* Added pr-6 to give space for the arrow */}
              {getSelectedLabels().map((label, index) => (
                <Badge key={index} variant="secondary" className="max-w-[calc(100%-1.5rem)] overflow-hidden text-ellipsis whitespace-nowrap">
                  {label}
                  <X
                    className="ml-1 h-3 w-3 shrink-0 opacity-50 cursor-pointer hover:text-foreground" // Added shrink-0 and hover
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the popover from opening/closing
                      handleSelect(options.find(opt => opt.label === label)?.value);
                    }}
                  />
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {/* Ensure the arrow icon is always positioned correctly at the end */}
          <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Rechercher des étudiants..." /> {/* Changed placeholder */}
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label} // CommandItem uses 'value' for search
                onSelect={() => {
                  handleSelect(option.value);
                  // Optional: if you want the popover to close after single selection
                  // setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}