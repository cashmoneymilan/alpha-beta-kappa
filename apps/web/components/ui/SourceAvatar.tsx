"use client";

import * as React from "react";
import Image from "next/image";
import {
  getSourceAvatarUrl,
  getSourceFallback,
  type Source,
} from "@/lib/source-avatars";
import { cn } from "@/lib/utils";

interface SourceAvatarProps {
  source: Source;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-5 h-5 text-[10px]",
  md: "w-7 h-7 text-xs",
  lg: "w-9 h-9 text-sm",
};

export function SourceAvatar({ source, size = "md", className }: SourceAvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const avatarUrl = getSourceAvatarUrl(source);
  const fallback = getSourceFallback(source);

  const showImage = avatarUrl && !imgError;

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex items-center justify-center flex-shrink-0",
        sizeClasses[size],
        className
      )}
      style={!showImage ? { backgroundColor: fallback.color } : undefined}
    >
      {showImage ? (
        <Image
          src={avatarUrl}
          alt={source.name}
          width={size === "sm" ? 20 : size === "md" ? 28 : 36}
          height={size === "sm" ? 20 : size === "md" ? 28 : 36}
          className="object-cover w-full h-full"
          onError={() => setImgError(true)}
          unoptimized
        />
      ) : (
        <span className="font-semibold text-white">{fallback.initials}</span>
      )}
    </div>
  );
}
