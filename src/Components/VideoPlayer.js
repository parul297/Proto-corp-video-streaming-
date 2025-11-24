import React, { useRef, useEffect, useState } from "react";
import Hls from "hls.js";

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
      });

      return () => hls.destroy();
    }

    if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
      });
    }
  }, [src]);

  const togglePlay = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log("Playback error:", error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    if (videoRef.current) {
      const newVolume = parseFloat(e.target.value);
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen error:", error);
    }
  };

  const handleProgressClick = (e) => {
    if (!videoRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: "800px",
      margin: "20px auto",
      backgroundColor: "#000",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
    }}
    onMouseEnter={() => setShowControls(true)}
    onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        width="100%"
        style={{
          display: "block",
          backgroundColor: "#000",
          cursor: "pointer"
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        muted={volume === 0}
      />
      
      {/* Loading Spinner */}
      {isLoading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
          fontSize: "48px"
        }}>
          ⏳
        </div>
      )}
      
      {/* Custom Controls */}
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))",
        padding: "20px 16px 16px",
        transition: "opacity 0.3s ease",
        opacity: showControls ? 1 : 0,
        pointerEvents: showControls ? "all" : "none"
      }}>
        {/* Progress Bar */}
        <div 
          style={{
            width: "100%",
            height: "6px",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            borderRadius: "3px",
            marginBottom: "16px",
            cursor: "pointer",
            position: "relative"
          }}
          onClick={handleProgressClick}
        >
          <div style={{
            width: `${duration ? (currentTime / duration) * 100 : 0}%`,
            height: "100%",
            backgroundColor: "#ff4444",
            borderRadius: "3px",
            transition: "width 0.1s ease"
          }} />
          <div style={{
            position: "absolute",
            left: `${duration ? (currentTime / duration) * 100 : 0}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "12px",
            height: "12px",
            backgroundColor: "#ff4444",
            borderRadius: "50%",
            opacity: showControls ? 1 : 0,
            transition: "opacity 0.3s ease"
          }} />
        </div>

        {/* Controls Row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px"
        }}>
          {/* Left Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={togglePlay}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                transition: "background-color 0.2s ease",
                minWidth: "32px"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
              onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
              disabled={isLoading}
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>

            {/* Volume Control */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "white", fontSize: "16px", minWidth: "20px" }}>
                {volume === 0 ? "🔇" : volume < 0.5 ? "🔈" : "🔊"}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  width: "80px",
                  height: "4px",
                  borderRadius: "2px",
                  background: "rgba(255, 255, 255, 0.3)",
                  outline: "none",
                  cursor: "pointer"
                }}
              />
            </div>

            {/* Time Display */}
            <span style={{
              color: "white",
              fontSize: "14px",
              fontFamily: "monospace",
              minWidth: "100px"
            }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div>
            <button
              onClick={toggleFullscreen}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "background-color 0.2s ease"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
              onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
            >
              ⛶
            </button>
          </div>
        </div>
      </div>

      {/* Play/Pause Center Button */}
      {!isPlaying && showControls && (
        <button
          onClick={togglePlay}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.7)",
            border: "none",
            borderRadius: "50%",
            width: "80px",
            height: "80px",
            fontSize: "32px",
            color: "white",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            opacity: isLoading ? 0 : 1
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(255, 68, 68, 0.8)";
            e.target.style.transform = "translate(-50%, -50%) scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(0, 0, 0, 0.7)";
            e.target.style.transform = "translate(-50%, -50%) scale(1)";
          }}
          disabled={isLoading}
        >
          ▶
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;