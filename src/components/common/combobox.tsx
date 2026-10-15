import { Check, ChevronsUpDown, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { strings } from '@/constants/strings';
import { cn } from '@/lib/cn';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

interface BaseProps {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-invalid'?: boolean;
}

interface SingleProps extends BaseProps {
  value: string | null;
  onChange: (value: string | null) => void;
  /** Allow clearing the selection. */
  clearable?: boolean;
  /** Rendered at the bottom of the dropdown list (e.g. “Add contractor”). */
  listFooter?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Searchable single-select combobox for reference fields. */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = strings.common.search,
  searchPlaceholder = strings.common.search,
  emptyText = strings.common.noResults,
  disabled,
  clearable = true,
  listFooter,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  className,
  id,
  'aria-invalid': ariaInvalid,
}: SingleProps) {
  const [openUncontrolled, setOpenUncontrolled] = useState(false);
  const open = openProp ?? openUncontrolled;
  const setOpen = onOpenChangeProp ?? setOpenUncontrolled;
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'aria-[invalid=true]:border-destructive',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <span className="flex items-center gap-1">
            {clearable && selected && !disabled && (
              <X
                className="size-4 opacity-60 hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange(null);
                }}
              />
            )}
            <ChevronsUpDown className="size-4 opacity-50" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => {
                    onChange(option.value === value ? (clearable ? null : value) : option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'size-4',
                      option.value === value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {listFooter ? (
              <div className="border-t border-border p-1">{listFooter}</div>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface MultiProps extends BaseProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/** Searchable multi-select combobox (e.g. salespeople). */
export function MultiCombobox({
  options,
  value,
  onChange,
  placeholder = strings.common.search,
  searchPlaceholder = strings.common.search,
  emptyText = strings.common.noResults,
  disabled,
  className,
  id,
  'aria-invalid': ariaInvalid,
}: MultiProps) {
  const [open, setOpen] = useState(false);
  const selected = options.filter((option) => value.includes(option.value));

  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            'flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive',
            className,
          )}
        >
          <span className="flex flex-1 flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((option) => (
                <Badge key={option.value} variant="secondary" className="gap-1">
                  {option.label}
                  <X
                    className="size-3 opacity-60 hover:opacity-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggle(option.value);
                    }}
                  />
                </Badge>
              ))
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => toggle(option.value)}
                >
                  <Check
                    className={cn(
                      'size-4',
                      value.includes(option.value) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="flex-1 truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
