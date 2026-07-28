import React, { forwardRef } from "react";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-md cursor-pointer transition-colors duration-150 no-underline whitespace-nowrap focus-visible:none";
// focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rosy-copper-500

const VARIANTS = {
  primary:
    "bg-rosy-copper-600 text-white border-rosy-copper-500 hover:bg-rosy-copper-700 active:bg-rosy-copper-800 disabled:bg-rosy-copper-600 disabled:text-white disabled:opacity-60 disabled:cursor-not-allowed",
  secondary:
    "bg-rosy-copper-100 text-black border-rosy-copper-200 hover:bg-rosy-copper-200 active:bg-rosy-copper-300 disabled:bg-rosy-copper-600 disabled:text-white disabled:opacity-60 disabled:cursor-not-allowed",
  tertiary:
    "bg-white text-rosy-copper-600 border-2 border-rosy-copper-600 hover:bg-rosy-copper-50 active:bg-rosy-copper-100 disabled:bg-rosy-copper-600 disabled:text-rosy-copper-600 disabled:opacity-60 disabled:cursor-not-allowed",
  ghost: "bg-transparent text-gray-800 border-transparent hover:bg-black/5",
  danger: "bg-red-700 text-white border-red-700 hover:bg-red-800",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const BaseBtn = forwardRef(function Button(
  {
    as: Component = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon = null,
    iconPosition = "left",
    children,
    className = "",
    type = "button",
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <Component
      ref={ref}
      type={Component === "button" ? type : undefined}
      disabled={Component === "button" ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      className={[
        BASE_CLASSES,
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        isDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "",
        className, // consumer overrides — see note below
      ].join(" ")}
      {...rest}
    >
      {loading && <Spinner />}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </Component>
  );
});

export default BaseBtn;

/* ------------------------------------------------------------------ */
/* Usage examples                                                     */
/* ------------------------------------------------------------------ */

export function ButtonExamples() {
  const [saving, setSaving] = React.useState(false);

  return (
    <div className="flex flex-row gap-4 items-center justify-start w-full h-full ">
      <BaseBtn variant="primary">Find a Restaurant</BaseBtn>
      <BaseBtn variant="secondary">Cancel</BaseBtn>
      <BaseBtn variant="tertiary">Tertiary</BaseBtn>
      <BaseBtn variant="ghost">Learn more</BaseBtn>
      <BaseBtn variant="danger">Delete account</BaseBtn>

      <BaseBtn size="sm">Small</BaseBtn>
      <BaseBtn size="lg">Large</BaseBtn>

      <BaseBtn loading={saving} onClick={() => setSaving((s) => !s)}>
        {saving ? "Saving..." : "Save"}
      </BaseBtn>

      <BaseBtn disabled>Disabled</BaseBtn>

      {/* Renders as an <a>, styled identically to the BaseBtn */}
      <BaseBtn as="a" href="#restaurants" variant="primary">
        Browse Restaurants
      </BaseBtn>
    </div>
  );
}
