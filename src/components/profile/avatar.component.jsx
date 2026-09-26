/* eslint-disable @next/next/no-img-element --
   Profile photos are arbitrary user-supplied URLs; next/image only allows
   hosts listed in next.config, so a plain <img> is used on purpose. */

const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

/** A user's photo, or their initial when there's no photo. */
export default function Avatar({ name, photoURL, size = "md", className = "" }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F0EDE7] font-semibold text-[#514C47] ${SIZES[size]} ${className}`}
    >
      {photoURL ? (
        <img
          src={photoURL}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        initial
      )}
    </span>
  );
}
