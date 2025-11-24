import React, { useRef } from "react";
import VideoPlayer from "./Components/VideoPlayer"
import "./App.css";

export default function App() {
  const videoRefs = useRef([]);

  const streams = [
    "http://localhost/hls/stream1.m3u8",
    "http://localhost/hls/stream2.m3u8",
    "http://localhost/hls/stream3.m3u8",
    "http://localhost/hls/stream4.m3u8",
    "http://localhost/hls/stream5.m3u8",
    "http://localhost/hls/stream6.m3u8"
  ];

  const handleSync = () => {
    const masterTime = videoRefs.current[0]?.currentTime;

    videoRefs.current.forEach(video => {
      if (video && Math.abs(video.currentTime - masterTime) > 0.3) {
        video.currentTime = masterTime; // Adjust playback positions
      }
    });
  };

  return (
    <div className="dashboard">
      {streams.map((url, idx) => (
        <VideoPlayer
          key={idx}
          src={url}
          ref={(el) => (videoRefs.current[idx] = el)}
        />
      ))}

      <button className="syncBtn" onClick={handleSync}>
        Sync All Streams
      </button>
    </div>
  );
}
