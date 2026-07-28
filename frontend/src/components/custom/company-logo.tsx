import ImageWithFallback from "./image-fallback";

export default function CompanyLogo({
  logoUrl,
  className,
  loading,
  priority,
}: {
  logoUrl: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}) {
  return (
    <ImageWithFallback
      src={logoUrl ?? "/logo"}
      alt="logo-cek-emmy"
      width={50}
      height={50}
      priority={priority}
      loading={loading}
      className={className + " object-contain"}
    />
  );
}
