'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Loader2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  /** Encrypted token (secure mode) — preferred */
  token?: string;
  /** Direct videoId (legacy / admin preview) */
  videoId?: string;
  onComplete?: () => void;
  title?: string;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function VideoPlayer({ token, videoId: directVideoId, onComplete, title }: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [resolvedVideoId, setResolvedVideoId] = useState<string | null>(directVideoId || null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [tokenError, setTokenError] = useState(false);
  const [resolving, setResolving] = useState(!!token && !directVideoId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Resolve token to videoId (secure mode)
  useEffect(() => {
    if (directVideoId) {
      setResolvedVideoId(directVideoId);
      setResolving(false);
      return;
    }

    if (!token) return;

    setResolving(true);
    fetch('/api/videos/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Token expired or invalid');
        return res.json();
      })
      .then(data => {
        if (data.videoId) {
          setResolvedVideoId(data.videoId);
        } else {
          setTokenError(true);
        }
      })
      .catch(() => {
        setTokenError(true);
      })
      .finally(() => {
        setResolving(false);
      });
  }, [token, directVideoId]);

  // Step 2: Initialize YouTube player once videoId is resolved
  useEffect(() => {
    if (!resolvedVideoId || resolving) return;

    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    }

    function initPlayer() {
      const playerElementId = `youtube-player-${resolvedVideoId}-${Date.now()}`;
      const container = document.getElementById(`yt-container-${resolvedVideoId}`);
      if (!container) return;

      // Create inner div for player 
      const playerDiv = document.createElement('div');
      playerDiv.id = playerElementId;
      playerDiv.className = 'w-full h-full';
      container.innerHTML = '';
      container.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerElementId, {
        videoId: resolvedVideoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            setDuration(formatTime(event.target.getDuration()));
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setIsPlaying(true);
              setHasStarted(true);
            }
            if (event.data === 2 || event.data === 0) setIsPlaying(false);
            if (event.data === 0 && onComplete) {
              onComplete();
            }
          },
        },
      });
    }

    // Progress Interval
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        if (total > 0) {
          setProgress((current / total) * 100);
          setCurrentTime(formatTime(current));
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [resolvedVideoId, resolving]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const seekTo = (parseFloat(e.target.value) / 100) * playerRef.current.getDuration();
    playerRef.current.seekTo(seekTo, true);
    setProgress(parseFloat(e.target.value));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const vol = parseInt(e.target.value);
    playerRef.current.setVolume(vol);
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  // Resolve error UI
  if (tokenError) {
    return (
      <div className="relative w-full aspect-video bg-[#0a0a1a] rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-red-500/10">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4 opacity-40" />
        <h4 className="text-lg font-bold text-red-100 mb-1">Access Problem</h4>
        <p className="text-xs text-[#a1a1aa] max-w-sm">
          We couldn't secure access to this video. Your session might be expired or the video has been moved.
        </p>
        <button 
           onClick={() => window.location.reload()}
           className="mt-6 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
        >
          Try Refreshing Page
        </button>
      </div>
    );
  }

  // Handle Simulated Videos (Dev Mode)
  if (resolvedVideoId?.startsWith('sim_')) {
    return (
      <div className="relative w-full aspect-video bg-[#0a0a1a] rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-white/5">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Play size={32} className="text-white/20 ml-1" />
        </div>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Simulated Video</span>
          </div>
          <h4 className="text-xl font-bold text-white/90">Preview Mode Only</h4>
          <p className="text-xs text-[#a1a1aa] max-w-xs leading-relaxed mx-auto">
            YouTube API keys aren't configured. This video is <b className="text-white">Simulated ({resolvedVideoId})</b> and cannot be played via real YouTube Iframe.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            {onComplete && (
               <button 
                  onClick={onComplete}
                  className="px-6 py-3 rounded-xl bg-[var(--accent)] text-[#0a0a1a] font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--accent)]/20"
               >
                 Mark Lesson as Completed
               </button>
            )}
            <p className="text-[9px] opacity-20 italic">For real playback, configure YOUTUBE_CLIENT_ID etc in .env</p>
          </div>
        </div>
      </div>
    );
  }

  // Resolving state
  if (resolving) {
    return (
      <div className="relative w-full aspect-video bg-[#0a0a1a] rounded-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Securing video access…</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black overflow-hidden group rounded-2xl"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* The Actual Video */}
      <div className={`absolute inset-0 pointer-events-none scale-115 transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
        <div id={`yt-container-${resolvedVideoId}`} className="w-full h-full" />
      </div>

      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#0a0a1a]">
          <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin" />
        </div>
      )}

      {/* Custom UI Interaction Layer */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
      >
        <AnimatePresence>
          {!isPlaying && isReady && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center bg-black/20"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-2xl shadow-[var(--accent)]/50">
                <Play className="w-8 h-8 text-[#0a0a1a] fill-[#0a0a1a] ml-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <motion.div 
        initial={false}
        animate={{ opacity: showControls || !isPlaying ? 1 : 0, y: showControls || !isPlaying ? 0 : 20 }}
        className="absolute bottom-0 left-0 right-0 z-20 pb-6 px-6 pt-12 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-auto"
      >
        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-6 cursor-pointer overflow-hidden group-hover:h-2 transition-all">
          <div 
            className="absolute top-0 left-0 h-full bg-[var(--accent)] transition-all"
            style={{ width: `${progress}%` }}
          />
          <input 
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:text-[var(--accent)] transition-colors">
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
            </button>
            <div className="flex items-center gap-4 group/vol relative">
              <button onClick={toggleMute} className="text-white hover:text-[var(--accent)] transition-colors">
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <div className="w-0 group-hover/vol:w-24 overflow-hidden transition-all duration-300 flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={handleVolume}
                  className="w-24 accent-[var(--accent)] cursor-pointer"
                />
              </div>
            </div>
            <div className="text-sm font-medium text-white/80 tabular-nums">
              {currentTime} <span className="opacity-40 mx-1">/</span> {duration}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                playerRef.current.seekTo(0);
                playerRef.current.playVideo();
              }} 
              className="text-white opacity-60 hover:opacity-100 transition-opacity"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={toggleFullscreen} className="text-white opacity-60 hover:opacity-100 transition-opacity">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Top Branding Bar */}
      <motion.div 
        animate={{ opacity: showControls || !isPlaying ? 1 : 0 }}
        className="absolute top-0 left-0 right-0 p-6 pt-8 z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
      >
        <h4 className="text-white/90 font-bold text-lg">{title || "Lesson Video"}</h4>
      </motion.div>
    </div>
  );
}
