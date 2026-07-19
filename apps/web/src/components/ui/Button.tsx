import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-ink text-cream hover:bg-ink/90 dark:bg-cream dark:text-ink dark:hover:bg-cream/90",
  secondary: "bg-moss/10 text-moss hover:bg-moss/20 dark:bg-cream/10 dark:text-cream",
  ghost: "bg-transparent hover:bg-ink/5 dark:hover:bg-cream/10",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ className = "", variant = "primary", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
});
