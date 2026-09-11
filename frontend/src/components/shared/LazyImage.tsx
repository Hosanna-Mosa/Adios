import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  fallbackSrc?: string;
}

export function LazyImage({
  src,
  alt,
  className,
  wrapperClassName,
  fallbackSrc,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const resolvedSrc = errored && fallbackSrc ? fallbackSrc : src;

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {!loaded && (
        <div
          className={cn(
            "absolute inset-0 animate-pulse bg-primary/10",
            className,
          )}
        />
      )}
      <motion.img
        src={resolvedSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (fallbackSrc && !errored) setErrored(true);
          else setLoaded(true);
        }}
      />
    </div>
  );
}
