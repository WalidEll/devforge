import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
        secondary: "border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
        outline: "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200",
        warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
        destructive: "border-transparent bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
        success: "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
