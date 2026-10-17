/* eslint-disable @next/next/no-img-element -- avatars come from arbitrary storage hosts */
interface PortalAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toLocaleUpperCase("tr-TR");
}

/** Profile photo when the member uploaded one, otherwise initials on the brand gradient. */
export default function PortalAvatar({ name, avatarUrl, size = "sm", className = "" }: PortalAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${SIZES[size]} shrink-0 rounded-full object-cover ring-1 ring-black/5 ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${SIZES[size]} shrink-0 rounded-full bg-linear-to-br/srgb from-brand-500 to-brand-800 text-white font-semibold flex items-center justify-center ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
