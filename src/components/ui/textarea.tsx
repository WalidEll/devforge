"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[96px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs outline-none transition-colors placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
