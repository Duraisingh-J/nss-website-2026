"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Award,
  Medal,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { cn } from "../../lib/utils";

const AUTO_PLAY_INTERVAL = 3800;
const ITEM_HEIGHT = 68;

const wrap = (min, max, v) => {
  const rangeSize = max - min;
  if (rangeSize <= 0) return 0;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function AchievementsCarousel({ achievements = [], onSelectAchievement }) {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Reset step whenever filtered achievements change
  useEffect(() => {
    setStep(0);
  }, [achievements]);

  // Use strictly the stored achievements — NO mock placeholders
  const displayItems = useMemo(() => {
    if (!achievements || achievements.length === 0) {
      return [];
    }

    return achievements.map((item) => {
      let icon = Award;
      if (/national/i.test(item.category || "")) icon = Trophy;
      else if (/state/i.test(item.category || "")) icon = Medal;
      else if (/unit/i.test(item.category || "")) icon = ShieldCheck;

      return {
        id: item.id,
        rawItem: item,
        label: item.title,
        category: item.category || "RECOGNITION",
        year: item.year || "2026",
        tag: item.category ? item.category.toUpperCase() : "ACCOLADE",
        icon,
        image: item.imageUrl || null,
        description: item.description || "Official milestone awarded by the National Service Scheme.",
        recipient: item.personName
          ? `${item.personName}${item.personDesignation ? ` · ${item.personDesignation}` : ""}`
          : item.unitLabel || "NSS MIT Campus",
      };
    });
  }, [achievements]);

  const count = displayItems.length;

  const currentIndex = count > 0 ? ((step % count) + count) % count : 0;
  const currentItem = displayItems[currentIndex];

  const nextStep = useCallback(() => {
    if (count > 1) {
      setStep((prev) => prev + 1);
    }
  }, [count]);

  const handleChipClick = (index) => {
    if (count <= 1) return;
    const diff = (index - currentIndex + count) % count;
    if (diff > 0) setStep((s) => s + diff);
  };

  const handleCardClick = (item) => {
    const selected = item?.rawItem || currentItem?.rawItem;
    if (selected && onSelectAchievement) {
      onSelectAchievement(selected);
    }
  };

  useEffect(() => {
    if (isPaused || count <= 1) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused, count]);

  const getCardStatus = (index) => {
    if (count === 1) return "active";
    if (count === 2) {
      if (index === currentIndex) return "active";
      return "next";
    }

    const diff = index - currentIndex;
    let normalizedDiff = diff;
    if (diff > count / 2) normalizedDiff -= count;
    if (diff < -count / 2) normalizedDiff += count;

    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  if (count === 0) {
    return null;
  }

  return (
    <section className="achievements-spotlight w-full my-6" aria-label="Achievements Showcase Carousel">
      {/* Top Header Eyebrow & Counter */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#D94B4B] animate-ping" />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#D94B4B]">
            Official Honours Spotlight
          </span>
        </div>
        <span className="text-xs text-muted font-medium font-sans">
          {currentIndex + 1} of {count} {count === 1 ? "Record" : "Records"}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-[2.2rem] lg:rounded-[3.2rem] flex flex-col lg:flex-row min-h-[580px] lg:h-[580px] border border-border/80 shadow-2xl bg-white">
        {/* Left Column: Interactive Navigation Ribbon */}
        <div className="w-full lg:w-[42%] min-h-[340px] md:min-h-[400px] lg:h-full relative z-30 flex flex-col items-start justify-center overflow-hidden px-6 md:px-12 lg:pl-12 bg-gradient-to-br from-[#0F172A] via-[#13233F] to-[#0A1628]">
          {/* Top & Bottom Soft Mask Gradients */}
          {count > 3 && (
            <>
              <div className="absolute inset-x-0 top-0 h-16 md:h-24 bg-gradient-to-b from-[#0F172A] via-[#0F172A]/90 to-transparent z-40 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-16 md:h-24 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/90 to-transparent z-40 pointer-events-none" />
            </>
          )}

          {/* Faint Background Watermark */}
          <div className="absolute -left-8 -bottom-8 opacity-5 pointer-events-none select-none text-white font-serif text-[180px] leading-none">
            NSS
          </div>

          <div className="relative w-full h-full flex flex-col justify-center items-start z-20">
            {displayItems.map((item, index) => {
              const isActive = index === currentIndex;
              const distance = index - currentIndex;
              const wrappedDistance =
                count > 1 ? wrap(-(count / 2), count / 2, distance) : 0;
              const IconComponent = item.icon || Award;

              return (
                <motion.div
                  key={item.id || index}
                  style={{
                    height: ITEM_HEIGHT,
                    width: "fit-content",
                  }}
                  animate={{
                    y: count > 1 ? wrappedDistance * ITEM_HEIGHT : 0,
                    opacity: count > 1 ? 1 - Math.abs(wrappedDistance) * 0.28 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 85,
                    damping: 20,
                    mass: 1,
                  }}
                  className={cn("flex items-center justify-start", count > 1 ? "absolute" : "relative")}
                >
                  <button
                    type="button"
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "relative flex items-center gap-3.5 px-5 md:px-7 py-3 md:py-3.5 rounded-full transition-all duration-500 text-left group border max-w-full",
                      isActive
                        ? "bg-white text-[#0F172A] border-white z-10 shadow-2xl scale-[1.03]"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white hover:bg-white/10 backdrop-blur-sm cursor-pointer"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 flex-shrink-0",
                        isActive
                          ? "bg-[#D94B4B] text-white shadow-md"
                          : "bg-white/10 text-white/50 group-hover:text-white"
                      )}
                    >
                      <IconComponent size={15} />
                    </div>

                    <div className="flex flex-col pr-1 overflow-hidden">
                      <span className="font-semibold text-xs md:text-sm tracking-tight truncate max-w-[200px] md:max-w-[240px]">
                        {item.label}
                      </span>
                      {item.category && (
                        <span
                          className={cn(
                            "text-[10px] tracking-wider uppercase font-medium truncate",
                            isActive ? "text-[#D94B4B]" : "text-white/40"
                          )}
                        >
                          {item.year ? `${item.year} · ` : ""}
                          {item.category}
                        </span>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 3D Stacked Cinematic Card Deck */}
        <div className="flex-1 min-h-[460px] md:min-h-[500px] lg:h-full relative bg-slate-50 flex items-center justify-center py-10 md:py-14 px-4 md:px-8 overflow-hidden border-t lg:border-t-0 lg:border-l border-border/40">
          <div className="relative w-full max-w-[390px] aspect-[4/5] flex items-center justify-center">
            {displayItems.map((item, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";

              return (
                <motion.div
                  key={item.id || index}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -90 : isNext ? 90 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.86 : 0.72,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.45 : 0,
                    rotate: isPrev ? -4 : isNext ? 4 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 24,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 rounded-[1.8rem] md:rounded-[2.4rem] overflow-hidden border-4 md:border-6 border-white bg-slate-900 origin-center shadow-2xl cursor-pointer group"
                  onClick={() => handleCardClick(item)}
                >
                  {/* Card Media Preview */}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.label}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-700 select-none",
                        isActive
                          ? "grayscale-0 blur-0 scale-100"
                          : "grayscale blur-[1px] brightness-75 scale-105"
                      )}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-[#D94B4B] mb-3">
                        <Trophy size={32} />
                      </div>
                      <span className="text-white/60 text-xs uppercase tracking-widest">NSS Recognition</span>
                    </div>
                  )}

                  {/* Top Header Floating Badges */}
                  <div
                    className={cn(
                      "absolute top-5 left-5 right-5 flex items-center justify-between transition-opacity duration-300 z-10",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                      <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
                        {item.tag}
                      </span>
                    </div>

                    <div className="bg-white/90 text-slate-900 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow">
                      {item.year}
                    </div>
                  </div>

                  {/* Bottom Editorial Caption Card */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="absolute inset-x-0 bottom-0 p-6 md:p-8 pt-24 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col justify-end"
                      >
                        <div className="bg-[#D94B4B] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] w-fit shadow-md mb-2.5">
                          {item.category}
                        </div>

                        <h3 className="text-white font-serif text-lg md:text-xl font-bold leading-tight drop-shadow mb-1.5 tracking-tight line-clamp-2">
                          {item.label}
                        </h3>

                        <p className="text-white/85 font-sans text-xs md:text-sm leading-relaxed drop-shadow mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[11px] text-white/70">
                          <span className="truncate max-w-[200px]">
                            {item.recipient}
                          </span>
                          <span className="flex items-center gap-1 text-[#D94B4B] font-semibold text-[11px] group-hover:translate-x-1 transition-transform">
                            View Details <ExternalLink size={12} />
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AchievementsCarousel;
