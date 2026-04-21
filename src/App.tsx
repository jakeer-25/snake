import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { motion } from 'motion/react';

export default function App() {
  return (
    <div className="min-h-screen relative bg-black text-[#0ff] font-sans overflow-x-hidden selection:bg-[#f0f] selection:text-black">
      
      {/* Glitch Overlay Elements */}
      <div className="static-noise"></div>
      <div className="scanline"></div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center py-12 px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center mb-12 sm:mb-16 border-b-4 border-[#f0f] pb-4 px-8 bg-black/80 inline-block glitch-container">
          <h1 
            className="text-4xl md:text-6xl font-mono text-white glitch-text mb-4" 
            data-text="SYS.OVERRIDE"
          >
            SYS.OVERRIDE
          </h1>
          <p className="mt-2 text-black font-mono text-xs max-w-sm mx-auto uppercase tracking-widest bg-[#f0f] px-2 py-1 hidden sm:block">
            &gt; AUDIO SUBROUTINES: ONLINE.
            <br/>
            &gt; BIOMASS INTERFACE: READY.
          </p>
        </div>

        {/* Layout Container */}
        <div className="w-full max-w-6xl flex flex-col xl:flex-row items-center xl:items-start justify-center gap-12 xl:gap-24 relative">
          
          {/* Game Section (Center Focus) */}
          <div className="flex-1 w-full max-w-xl flex justify-center border-4 border-[#0ff] bg-black shadow-[8px_8px_0_#f0f] p-4 relative glitch-container">
            <SnakeGame />
          </div>

          {/* Music Player Sidebar */}
          <div className="w-full max-w-sm flex shrink-0 justify-center xl:sticky xl:top-24 border-4 border-[#f0f] bg-black shadow-[-8px_8px_0_#0ff] p-4 relative glitch-container">
            <MusicPlayer />
          </div>

        </div>
      </main>
    </div>
  );
}
