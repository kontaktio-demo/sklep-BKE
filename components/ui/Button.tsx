import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  FocusEventHandler,
  MouseEventHandler,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // hover darkens (nf-red-dark): white on nf-red-hover drops below AA 4.5:1 (§10)
  primary: "bg-nf-red text-white hover:bg-nf-red-dark",
  ghost: "border border-nf-border-strong bg-transparent text-white hover:bg-white/10",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-base",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string): string {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-[4px] font-semibold transition-[background-color,transform] duration-250 ease-nf",
    // hover scale gated by prefers-reduced-motion via motion-safe
    "motion-safe:hover:scale-[1.02]",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  type,
  ...rest
}: ButtonProps) {
  const classes = buttonClasses(variant, size, className);

  if (href) {
    // anchor-compatible handlers are forwarded; button-only attrs (type, disabled...) are dropped
    const { onClick, onMouseEnter, onMouseLeave, onFocus, onBlur } = rest;
    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick as MouseEventHandler | undefined}
        onMouseEnter={onMouseEnter as MouseEventHandler | undefined}
        onMouseLeave={onMouseLeave as MouseEventHandler | undefined}
        onFocus={onFocus as FocusEventHandler | undefined}
        onBlur={onBlur as FocusEventHandler | undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} className={classes} {...rest}>
      {children}
    </button>
  );
}
