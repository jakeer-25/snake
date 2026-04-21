import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TRACKS = [
  {
    id: 1,
    title: '// PAYLOAD_1: CYBER_DRIVE',
    artist: 'SYS_ADMIN',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: '// PAYLOAD_2: NEURAL_LINK',
    artist: 'AI_0x00A',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    title: '// PAYLOAD_3: PROTOCOL_BREACH',
    artist: 'UNKNOWN_HOST',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, []);

  const playAudio = () => {
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Audio playback error:', error);
          }
        });
      }
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        playAudio();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 1);
    }
  };

  const handleEnded = () => {
    nextTrack();
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playAudio();
    }
  }, [currentTrackIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full flex flex-col gap-6 text-[#0ff]">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="flex items-center gap-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className={`w-14 h-14 border border-[#0ff] flex shrink-0 items-center justify-center ${isPlaying ? 'bg-[#f0f] text-black border-[#f0f]' : 'bg-black text-[#0ff]'}`}
          >
            <Disc3 className="w-8 h-8" />
          </motion.div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-sans text-xl truncate tracking-tight text-white uppercase">
            {currentTrack.title}
          </h3>
          <p className="font-mono text-[10px] text-[#f0f] truncate tracking-widest mt-1">
            [ SRC: {currentTrack.artist} ]
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="range"
          min={0}
          max={duration}
          value={progress}
          onChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between font-mono text-[10px] text-[#0ff]">
          <span>HEX_{formatTime(progress)}</span>
          <span>HEX_{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={toggleMute}
          className="p-2 text-[#f0f] hover:text-black hover:bg-[#f0f] transition-none border border-transparent hover:border-[#f0f]"
          title="Mute/Unmute"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={prevTrack}
            className="p-2 border border-[#0ff] bg-black text-[#0ff] hover:bg-[#0ff] hover:text-black transition-none"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          
          <button
            onClick={togglePlay}
            className="w-14 h-14 flex items-center justify-center border-2 border-[#f0f] bg-[#0ff] text-black hover:bg-[#f0f] transition-none"
          >
            {isPlaying ? (
               <Pause className="w-6 h-6 fill-current" />
            ) : (
               <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>
          
          <button
            onClick={nextTrack}
            className="p-2 border border-[#0ff] bg-black text-[#0ff] hover:bg-[#0ff] hover:text-black transition-none"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
