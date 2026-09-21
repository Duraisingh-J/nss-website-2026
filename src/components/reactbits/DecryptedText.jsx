import React, { useState, useEffect, useRef, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

/**
 * DecryptedText — React Bits cybernetic / editorial scramble text reveal.
 *
 * Props:
 *  text           {string} Target text
 *  speed          {number} Interval in ms between character ticks (default: 35)
 *  maxIterations  {number} Number of scramble cycles per character (default: 8)
 *  triggerOnHover {boolean} Retrigger scramble on mouse hover
 *  className      {string}
 */
export default function DecryptedText({
  text = "",
  speed = 35,
  maxIterations = 8,
  triggerOnHover = false,
  className = "",
  animateOnMount = true,
}) {
  const [displayText, setDisplayText] = useState(animateOnMount ? "" : text);
  const [isHovered, setIsHovered] = useState(false);
  const isScramblingRef = useRef(false);

  const startScramble = useCallback(() => {
    if (isScramblingRef.current || !text) return;
    isScramblingRef.current = true;

    let iteration = 0;
    const targetLength = text.length;

    const interval = setInterval(() => {
      setDisplayText(() => {
        return text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration / maxIterations) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");
      });

      iteration += 1;

      if (iteration > targetLength * maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        isScramblingRef.current = false;
      }
    }, speed);
  }, [text, maxIterations, speed]);

  useEffect(() => {
    if (animateOnMount) {
      startScramble();
    } else {
      setDisplayText(text);
    }
  }, [text, animateOnMount, startScramble]);

  const handleMouseEnter = () => {
    if (triggerOnHover && !isHovered) {
      setIsHovered(true);
      startScramble();
    }
  };

  const handleMouseLeave = () => {
    if (triggerOnHover) {
      setIsHovered(false);
    }
  };

  return (
    <span
      className={`inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayText || text}
    </span>
  );
}
