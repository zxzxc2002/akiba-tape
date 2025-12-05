import React from 'react';
import { PlayerState } from '../../types';

interface PlayerControlsProps {
  playerState: PlayerState;
  onPlayPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onNext: () => void;
  isTapeInserted: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  playerState,
  onPlayPause,
  onStop,
  onRewind,
  onNext,
  isTapeInserted,
}) => {
  // Helper for physical button styles
  const buttonBaseClass = "relative group flex flex-col items-center justify-center transition-all duration-100 ease-out active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.5)]";
  const buttonShapeClass = "rounded-md border-t border-l border-white/20 border-b-4 border-r-4 border-black/40 shadow-[0_4px_8px_rgba(0,0,0,0.5)]";

  // Specific colors for buttons
  const silverButton = "bg-gradient-to-b from-gray-300 to-gray-400";
  const redButton = "bg-gradient-to-b from-red-500 to-red-700";

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#2a2a2a] p-2 rounded-xl border-t border-white/10 border-b-4 border-black/50 shadow-2xl flex items-center gap-2 z-50 scale-110 origin-bottom">
      {/* Panel Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30 pointer-events-none rounded-xl"></div>

      {/* REWIND */}
      <button
        onClick={onRewind}
        className={`${buttonBaseClass} w-16 h-12 ${silverButton} ${buttonShapeClass}`}
        aria-label="Rewind"
      >
        <div className="flex gap-0.5">
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-r-gray-800 border-b-[6px] border-b-transparent"></div>
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-r-gray-800 border-b-[6px] border-b-transparent"></div>
        </div>
        <span className="text-[8px] font-bold text-gray-800 mt-1 tracking-tighter">REW</span>
      </button>

      {/* STOP */}
      <button
        onClick={onStop}
        className={`${buttonBaseClass} w-16 h-12 ${silverButton} ${buttonShapeClass}`}
        aria-label="Stop"
      >
        <div className="w-4 h-4 bg-gray-800 rounded-[1px]"></div>
        <span className="text-[8px] font-bold text-gray-800 mt-1 tracking-tighter">STOP</span>
      </button>

      {/* PLAY/PAUSE */}
      <button
        onClick={onPlayPause}
        className={`${buttonBaseClass} w-20 h-14 ${redButton} ${buttonShapeClass}`}
        aria-label={playerState === PlayerState.PLAYING ? "Pause" : "Play"}
      >
        {playerState === PlayerState.PLAYING ? (
          <div className="flex gap-1.5">
            <div className="w-1.5 h-5 bg-white shadow-sm"></div>
            <div className="w-1.5 h-5 bg-white shadow-sm"></div>
          </div>
        ) : (
          <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1 filter drop-shadow-sm"></div>
        )}
        <span className="text-[9px] font-bold text-white mt-1 tracking-tighter shadow-black drop-shadow-md">
          {playerState === PlayerState.PLAYING ? 'PAUSE' : 'PLAY'}
        </span>
      </button>

      {/* NEXT */}
      <button
        onClick={onNext}
        className={`${buttonBaseClass} w-16 h-12 ${silverButton} ${buttonShapeClass}`}
        aria-label="Next"
      >
        <div className="flex gap-0.5">
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-gray-800 border-b-[6px] border-b-transparent"></div>
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-gray-800 border-b-[6px] border-b-transparent"></div>
        </div>
        <span className="text-[8px] font-bold text-gray-800 mt-1 tracking-tighter">FFWD</span>
      </button>
    </div>
  );
};

export default PlayerControls;
