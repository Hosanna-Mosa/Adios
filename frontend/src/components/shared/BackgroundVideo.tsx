import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/shared/Icon";

export type VideoSource = { src: string; type: "video/mp4" | "video/webm" };

type Props = {
  /** Sources for wide screens, best format first (e.g. webm, then mp4). */
  sources: VideoSource[];
  /** Lighter sources for phones (< 768px). Falls back to `sources`. */
  mobileSources?: VideoSource[];
  /** Still frame shown while loading, and instead of the video when the
   *  visitor prefers reduced motion or has Data Saver on. */
  poster: string;
  /** Overlay drawn over the video so text on top stays readable. */
  overlayClassName?: string;
  /** Show the pause/play toggle (WCAG 2.2.2 — moving content > 5s). */
  showToggle?: boolean;
  className?: string;
};

function prefersStill(): boolean {
  if (typeof window === "undefined") return true;
  const reduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const saveData = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;
  return Boolean(reduced || saveData);
}

/**
 * Muted, looping, full-bleed background video for hero sections. Picks the
 * mobile encode on small screens, and degrades to the poster image for
 * reduced-motion / Data Saver visitors or if playback is blocked.
 */
export function BackgroundVideo({
  sources,
  mobileSources,
  poster,
  overlayClassName = "bg-black/50",
  showToggle = true,
  className = "",
}: Props) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [still] = useState(prefersStill);
  const [isMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 767px)").matches,
  );
  const [playing, setPlaying] = useState(!still);

  const activeSources = isMobile && mobileSources ? mobileSources : sources;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || still) return;
    // Some browsers ignore the autoplay attribute until muted is set as a
    // property; if playback is still refused, fall back to the poster.
    video.muted = true;
    video.play().catch(() => setPlaying(false));
  }, [still]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {still ? (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          className="hero-video h-full w-full object-cover"
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          {activeSources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}

      <div className={`absolute inset-0 ${overlayClassName}`} />

      {showToggle && !still && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? t("video.pause") : t("video.play")}
          className="absolute bottom-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Icon name={playing ? "pause" : "play_arrow"} className="text-xl" />
        </button>
      )}
    </div>
  );
}
