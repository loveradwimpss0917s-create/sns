import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";

const fieldClass =
  "w-full rounded-lg border border-ink/10 bg-white/70 px-3 py-2 text-sm outline-none placeholder:text-ink/30 focus:border-ember/60 dark:border-cream/10 dark:bg-white/5 dark:placeholder:text-cream/30";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${fieldClass} ${className}`} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={`${fieldClass} ${className}`} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = "", ...props }, ref) {
    return <select ref={ref} className={`${fieldClass} ${className}`} {...props} />;
  },
);

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="text-ink/60 dark:text-cream/60 mb-1 block text-xs font-medium">
      {children}
    </label>
  );
}
