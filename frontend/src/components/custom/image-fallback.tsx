"use-client";

import Image from "next/image";
import { useEffect, useState } from "react";

export interface ImageComponent {
  src?: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
}
export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  priority,
  loading,
  className,
}: ImageComponent) {
  // `https://placehold.co/600x400?text=Image+Not+Found`
  const FALLBACK_IMAGE = "/Cek_Emmy-logo-clean.png";
  const [currentSrc, setCurrentSrc] = useState(src ?? FALLBACK_IMAGE);

  useEffect(() => {
    async function setImage(src: string) {
      setCurrentSrc(src);
    }
    if (src && src !== "") {
      setImage(src);
    }
  }, [src]);

  return (
    <Image
      src={currentSrc}
      alt={alt ?? "image-preview"}
      loading={loading}
      className={className}
      width={width}
      priority={priority}
      height={height}
      onError={() => {
        if (currentSrc !== FALLBACK_IMAGE) {
          setCurrentSrc(FALLBACK_IMAGE);
        }
      }}
    />
  );
}
