import React, { useEffect, useRef, useState } from "react";
import "./index.css";

const CONFIG = {
  // CHANGE ONLY THESE TWO VALUES WHEN NEEDED.
  targetDateTime: "2026-09-24T01:27:00+05:30",
  mainWebsiteUrl: "https://localhost:3000//src//nss",

  organization: "NATIONAL SERVICE SCHEME",
  campus: "Anna University • MIT Campus",
  motto: "NOT ME, BUT YOU",

  title: "NATIONAL SERVICE SCHEME",
  description:
    "National Service Scheme is a student-led movement built around community service, social responsibility and meaningful action. Every volunteer, activity and story contributes to a larger purpose.",

  eventLabel: "NSS SPECIAL EVENT",
  videoPath: "/video/nss-intro.mp4",
};

function getTimeLeft(target) {
  const difference = target.getTime() - Date.now();

  if (difference <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor(difference / 1000);

  return {
    total: difference,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

export default function App() {
  const [targetDateTime, setTargetDateTime] = useState(CONFIG.targetDateTime);
  const [timeLeft, setTimeLeft] = useState(() =>
    getTimeLeft(new Date(CONFIG.targetDateTime))
  );
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);

  // Countdown always calculates from the target timestamp and current time.
  useEffect(() => {
    const update = () => {
      setTimeLeft(getTimeLeft(new Date(targetDateTime)));
    };

    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [targetDateTime]);

  const countdownFinished = timeLeft.total === 0;

  const beginExperience = () => {
    setShowVideo(true);
  };

  const handleVideoEnded = () => {
    setTimeout(() => {
      window.location.href = CONFIG.mainWebsiteUrl;
    }, 4000);
  };

  const handleVideoError = () => {
    // If the video cannot load, do not silently redirect.
    console.error("NSS intro video could not be loaded.");
  };

  // When the video view is active, start it after the element mounts.
  useEffect(() => {
    if (!showVideo || !videoRef.current) return;

    const video = videoRef.current;
    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch((error) => {
        console.error("Video playback was blocked:", error);
      });
    }
  }, [showVideo]);

  // Re-read the target from this single config value after a Vite hot reload.
  // This makes changing CONFIG.targetDateTime in development straightforward.
  useEffect(() => {
    setTargetDateTime(CONFIG.targetDateTime);
  }, []);

  if (showVideo) {
    return (
      <main className="video-screen">
        <video
          ref={videoRef}
          className="intro-video"
          src={CONFIG.videoPath}
          playsInline
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          aria-label="NSS introduction"
        />
        <div className="video-vignette" />
      </main>
    );
  }

  return (
    <main className="launch-page">
      <div className="launch-background" />
      <div className="launch-grid" />
      <div className="launch-glow launch-glow-one" />
      <div className="launch-glow launch-glow-two" />

      <header className="topbar">
        <div className="brand">
          <img src="/images/NSS_logo.png" alt="NSS emblem" />
        </div>
        <div className="topbar-heading">
          <h1 className="topbar-title">{CONFIG.organization}</h1>
          <p className="topbar-subtitle">
            MADRAS INSTITUTE OF TECHNOLOGY, ANNA UNIVERSITY
          </p>
        </div>
        <div className="mit-logo-placeholder">
          <img
            src="/images/Madras_Institute_of_Technology_logo.png"
            alt="Madras Institute of Technology logo"
          />
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1 className="event-title">
            <span>INAUGURATION CEREMONY</span>
            <span>OF</span>
            <span>NATIONAL SERVICE SCHEME</span>
          </h1>
          <div className="accent-line" />
        </div>

        <section className="motto-section">
          <p className="motto-heading">OUR MOTTO</p>
          <p className="motto-quote">“Not Me But You”</p>
          <div className="motto-lines">
            <span>SELFLESS SERVICE</span>
            <span>STRONGER COMMUNITIES</span>
            <span>BRIGHTER INDIA</span>
          </div>
        </section>

        <div className="countdown-holder">
            <aside className="countdown-panel" aria-live="polite">
              <p className="countdown-label">
                {countdownFinished
                  ? "THE MOMENT HAS ARRIVED"
                  : "COUNTDOWN FOR THE LAUNCH"}
              </p>

              {!countdownFinished ? (
                <div className="countdown">
                  <div className="time-block">
                    <strong>{timeLeft.days}</strong>
                    <span>DAYS</span>
                  </div>
                  <div className="separator">:</div>
                  <div className="time-block">
                    <strong>{pad(timeLeft.hours)}</strong>
                    <span>HOURS</span>
                  </div>
                  <div className="separator">:</div>
                  <div className="time-block">
                    <strong>{pad(timeLeft.minutes)}</strong>
                    <span>MINUTES</span>
                  </div>
                  <div className="separator">:</div>
                  <div className="time-block">
                    <strong>{pad(timeLeft.seconds)}</strong>
                    <span>SECONDS</span>
                  </div>
                </div>
              ) : (
                <div className="countdown-zero">00 : 00 : 00 : 00</div>
              )}
            </aside>

            {countdownFinished && (
              <div className="launch-ready">
                <button
                  type="button"
                  className="launch-button"
                  onClick={beginExperience}
                >
                  LAUNCH
                </button>
              </div>
            )}
        </div>
      </section>

      <footer className="footer">TOGETHER FOR A BRIGHTER TOMORROW</footer>
    </main>
  );
}
