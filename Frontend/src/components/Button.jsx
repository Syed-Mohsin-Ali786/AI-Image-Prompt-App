import classNames from "classnames";

export default function Button({
  children,
  primary,
  secondary,
  success,
  warning,
  danger,
  outline,
  rounded = true,
  disabled = false,
  className,
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center px-4 py-3 font-medium transition-transform active:scale-[0.98] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed shadow-lg";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-slate-700 hover:bg-slate-800 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-black",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
  };

  const shape = rounded ? "rounded-2xl" : "rounded-md";
  const outlines = outline ? "bg-transparent border border-white/60" : "";

  const variantClass =
    (primary && variants.primary) ||
    (secondary && variants.secondary) ||
    (success && variants.success) ||
    (warning && variants.warning) ||
    (danger && variants.danger) ||
    variants.primary;

  return (
    <button
      className={classNames(base, variantClass, shape, outlines, className)}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
