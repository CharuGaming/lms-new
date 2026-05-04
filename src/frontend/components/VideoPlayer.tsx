'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, Loader2, ShieldAlert, Settings, Check } from 'lucide-react';
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
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [resolvedVideoId, setResolvedVideoId] = useState<string | null>(directVideoId || null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [durationSecs, setDurationSecs] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [volume, setVolume] = useState(100);
  const [tokenError, setTokenError] = useState(false);
  const [resolving, setResolving] = useState(!!token && !directVideoId);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-hide controls after inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setQualityOpen(false);
        setShowVolumeSlider(false);
      }, 3000);
    }
  }, [isPlaying]);

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
      container.innerHTML = '';
      container.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerElementId, {
        videoId: resolvedVideoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,       // No native controls
          disablekb: 1,      // No keyboard shortcuts
          fs: 0,             // No native fullscreen button
          iv_load_policy: 3,  // No annotations
          modestbranding: 1,  // Minimal branding
          rel: 0,            // No related videos
          showinfo: 0,       // No title/uploader info
          autohide: 1,       // Auto-hide controls
          cc_load_policy: 0, // No captions by default
          playsinline: 1,    // Inline on mobile
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            const dur = event.target.getDuration();
            setDuration(formatTime(dur));
            setDurationSecs(dur);
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {  // Playing
              setIsPlaying(true);
              setHasStarted(true);
              setIsEnded(false);
            }
            if (event.data === 2) {  // Paused
              setIsPlaying(false);
            }
            if (event.data === 0) {  // Ended
              setIsPlaying(false);
              setIsEnded(true);
              if (onComplete) onComplete();
            }
          },
          onPlaybackQualityChange: (event: any) => {
            setCurrentQuality(event.data);
          }
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
          setDurationSecs(total);
          setDuration(formatTime(total));
        }
        // Update buffered progress
        if (playerRef.current.getVideoLoadedFraction) {
          setBuffered(playerRef.current.getVideoLoadedFraction() * 100);
        }
      }
    }, 250);

    return () => {
      clearInterval(interval);
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [resolvedVideoId, resolving]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const seekTo = (percentage / 100) * playerRef.current.getDuration();
    playerRef.current.seekTo(seekTo, true);
    setProgress(percentage);
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

  const setQuality = (q: string) => {
    if (!playerRef.current) return;
    try {
      playerRef.current.setPlaybackQuality(q);
      setCurrentQuality(q);
      setQualityOpen(false);
    } catch (e) {
      console.warn('Set playback quality not supported/failed');
    }
  };

  const handleReplay = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.playVideo();
    setIsEnded(false);
  };

  const qualityLabel = (q: string) => {
    switch (q) {
      case 'hd2160': return '4K';
      case 'hd1440': return '1440p';
      case 'hd1080': return '1080p';
      case 'hd720': return '720p';
      case 'large': return '480p';
      case 'medium': return '360p';
      case 'small': return '240p';
      case 'tiny': return '144p';
      default: return 'Auto';
    }
  };

  const qualityLabelFull = (q: string) => {
    switch (q) {
      case 'hd2160': return '2160p (4K)';
      case 'hd1440': return '1440p (QHD)';
      case 'hd1080': return '1080p (Full HD)';
      case 'hd720': return '720p (HD)';
      case 'large': return '480p';
      case 'medium': return '360p';
      case 'small': return '240p';
      case 'tiny': return '144p';
      default: return 'Auto';
    }
  };

  // Resolve error UI
  if (tokenError) {
    return (
      <div className="relative w-full aspect-video bg-[var(--card-bg)] rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-red-500/20">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4 opacity-40" />
        <h4 className="text-lg font-bold text-red-500 mb-1">Access Problem</h4>
        <p className="text-xs text-[var(--text-muted)] max-w-sm">
          We couldn&apos;t secure access to this video. Your session might be expired or the video has been moved.
        </p>
        <button 
           onClick={() => window.location.reload()}
           className="mt-6 px-5 py-2.5 rounded-xl bg-[var(--primary-light)] border border-[var(--primary)]/10 text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary-light)]/80 transition-all"
        >
          Try Refreshing Page
        </button>
      </div>
    );
  }

  // Handle Simulated Videos (Dev Mode)
  if (resolvedVideoId?.startsWith('sim_')) {
    return (
      <div className="relative w-full aspect-video bg-[var(--card-bg)] rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-[var(--card-border)]">
        <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center mb-6">
          <Play size={32} className="text-[var(--primary)] ml-1" />
        </div>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Simulated Video</span>
          </div>
          <h4 className="text-xl font-bold text-[var(--foreground)]">Preview Mode Only</h4>
          <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed mx-auto">
            YouTube API keys aren&apos;t configured. This video is <b className="text-[var(--foreground)]">Simulated ({resolvedVideoId})</b> and cannot be played via real YouTube Iframe.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            {onComplete && (
               <button 
                  onClick={onComplete}
                  className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--primary)]/20"
               >
                 Mark Lesson as Completed
               </button>
            )}
            <p className="text-[9px] text-[var(--text-muted)] opacity-50 italic">For real playback, configure YOUTUBE_CLIENT_ID etc in .env</p>
          </div>
        </div>
      </div>
    );
  }

  // Resolving state
  if (resolving) {
    return (
      <div className="relative w-full aspect-video bg-[var(--card-bg)] rounded-2xl flex items-center justify-center border border-[var(--card-border)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Securing video access…</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black overflow-hidden group rounded-2xl select-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
          setQualityOpen(false);
          setShowVolumeSlider(false);
        }
      }}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {/* 
        YouTube iframe container — aggressively oversized and centered.
        We scale it larger than the container and use overflow:hidden on the parent
        to crop out YouTube's native top bar (title/channel) and bottom bar (progress/controls).
        pointer-events:none ensures all clicks go to our custom layer, not YouTube.
      */}
      <div 
        className={`absolute pointer-events-none transition-opacity duration-700 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          top: '-80px',
          left: '-10px',
          right: '-10px',
          bottom: '-80px',
        }}
      >
        <div 
          id={`yt-container-${resolvedVideoId}`} 
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* End Screen Overlay — covers YouTube's end screen completely */}
      <AnimatePresence>
        {isEnded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-[var(--background)]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
          >
             <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
               <Check className="w-10 h-10 text-green-500" />
             </div>
             <h3 className="text-2xl font-black text-[var(--foreground)] mb-2">Lesson Completed!</h3>
             <p className="text-sm text-[var(--text-muted)] max-w-xs mb-8">Great job on finishing this lesson. You can replay it or move to the next chapter.</p>
             <div className="flex items-center gap-4">
               <button 
                  onClick={handleReplay}
                  className="px-6 py-3 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--primary-light)] text-[var(--foreground)] font-bold text-sm transition-all flex items-center gap-2 border border-[var(--card-border)]"
               >
                 <RotateCcw size={16} /> Replay
               </button>
               {onComplete && (
                  <button 
                    onClick={() => {
                      setIsEnded(false);
                      onComplete();
                    }}
                    className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-bold text-sm transition-all shadow-lg shadow-[var(--primary)]/20 hover:brightness-110 active:scale-95"
                  >
                    Next Lesson →
                  </button>
               )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-[var(--background)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">Loading video…</span>
          </div>
        </div>
      )}

      {/* Click-to-Play / Pause Layer */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={(e) => {
          // Don't toggle if clicking on the control bar area
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect && e.clientY > rect.bottom - 80) return;
          togglePlay();
          resetHideTimer();
        }}
      >
        {/* Big play button when paused */}
        <AnimatePresence>
          {!isPlaying && isReady && !isEnded && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-2xl shadow-[var(--primary)]/40 hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =============== CUSTOM CONTROL BAR =============== */}
      <motion.div 
        initial={false}
        animate={{ 
          opacity: showControls || !isPlaying ? 1 : 0, 
          y: showControls || !isPlaying ? 0 : 20 
        }}
        transition={{ duration: 0.25 }}
        className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
        
        <div className="relative px-4 pb-4 pt-16">
          {/* Progress Bar */}
          <div 
            className="relative w-full h-1 bg-white/15 rounded-full mb-4 cursor-pointer group/progress"
            onClick={handleSeek}
          >
            {/* Buffered */}
            <div 
              className="absolute top-0 left-0 h-full bg-white/20 rounded-full transition-all"
              style={{ width: `${buffered}%` }}
            />
            {/* Played */}
            <div 
              className="absolute top-0 left-0 h-full bg-[var(--primary)] rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            >
              {/* Scrubber dot */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[var(--primary)] border-2 border-white shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
            {/* Larger invisible hit area */}
            <div className="absolute -top-2 -bottom-2 left-0 right-0" />
          </div>

          <div className="flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-3">
              <button 
                onClick={togglePlay} 
                className="text-white hover:text-[var(--primary)] transition-colors p-1"
              >
                {isPlaying 
                  ? <Pause className="w-5 h-5 fill-white" /> 
                  : <Play className="w-5 h-5 fill-white" />
                }
              </button>

              {/* Volume */}
              <div 
                className="flex items-center gap-1 relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button onClick={toggleMute} className="text-white hover:text-[var(--primary)] transition-colors p-1">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${showVolumeSlider ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume}
                    onChange={handleVolume}
                    className="w-20 h-1 accent-[var(--primary)] cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                </div>
              </div>

              {/* Time display */}
              <div className="text-[13px] font-medium text-white/70 tabular-nums ml-1">
                {currentTime} <span className="opacity-30 mx-0.5">/</span> {duration}
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Quality selector */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setQualityOpen(!qualityOpen);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    qualityOpen 
                      ? 'bg-[var(--primary)] text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Settings size={13} />
                  <span>{qualityLabel(currentQuality)}</span>
                </button>
                
                <AnimatePresence>
                  {qualityOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full right-0 mb-3 w-40 rounded-xl bg-[#111] border border-white/10 shadow-2xl z-50 overflow-hidden py-1"
                    >
                      <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 border-b border-white/5">Quality</p>
                      {['auto', 'hd1080', 'hd720', 'large', 'medium', 'small'].map((q) => (
                        <button
                          key={q}
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuality(q);
                          }}
                          className={`w-full text-left px-3 py-2 text-[11px] font-semibold transition-colors flex items-center justify-between ${
                            currentQuality === q 
                              ? 'text-[var(--primary)] bg-[var(--primary)]/5' 
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>{qualityLabelFull(q)}</span>
                          {currentQuality === q && <Check size={12} className="text-[var(--primary)]" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Replay */}
              <button 
                onClick={handleReplay} 
                className="text-white/60 hover:text-white transition-colors p-1"
                title="Replay"
              >
                <RotateCcw className="w-4.5 h-4.5" />
              </button>

              {/* Fullscreen */}
              <button 
                onClick={toggleFullscreen} 
                className="text-white/60 hover:text-white transition-colors p-1"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-4.5 h-4.5" /> : <Maximize className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* =============== TOP BAR — lesson title =============== */}
      <motion.div 
        initial={false}
        animate={{ opacity: showControls || !isPlaying ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="relative px-5 py-4">
          <h4 className="text-white/90 font-bold text-sm truncate">{title || "Lesson Video"}</h4>
        </div>
      </motion.div>
    </div>
  );
}
