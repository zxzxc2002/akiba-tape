import React, { useState, useEffect } from 'react';
import { StoryContent } from '../types';

interface RetroScreenProps {
  content: StoryContent;
  trackNumber: number;
  page: number;
  onPageChange: (newPage: number) => void;
}

const RetroScreen: React.FC<RetroScreenProps> = ({ content, trackNumber, page, onPageChange }) => {
  // Internal state removed, using props instead

  const hasNext = page < content.text.length - 1;
  const hasPrev = page > 0;

  return (
    <div className="w-full h-full bg-[#000084] border-4 border-gray-400 p-2 shadow-2xl font-mono text-white relative overflow-hidden flex flex-col">
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>

      {/* Header Bar */}
      <div className="bg-gray-300 text-black px-2 py-1 flex justify-between items-center mb-4 uppercase text-sm font-bold border-b-2 border-black flex-shrink-0">
        <span>KOREAN-TEL NET</span>
        <span>
          {content.title ? content.title : `TRACK: ${trackNumber < 10 ? `0${trackNumber}` : trackNumber}`}
        </span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 text-[24px] leading-relaxed whitespace-pre-wrap relative z-20 font-medium overflow-y-auto">
        {content.text[page]}

        <div className="mt-8 animate-pulse">_</div>
      </div>

      {/* Footer / Navigation */}
      {/* Footer / Navigation */}
      <div className="mt-auto border-t border-white pt-2 flex justify-between items-center text-sm z-20 relative flex-shrink-0 gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={!hasPrev}
          className={`flex-1 py-2 bg-gray-300 text-black font-bold uppercase hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-center transition-colors`}
        >
          &lt; PREV
        </button>

        <div className="px-4 font-bold whitespace-nowrap">
          {page + 1} / {content.text.length}
        </div>

        <button
          onClick={() => onPageChange(Math.min(content.text.length - 1, page + 1))}
          disabled={!hasNext}
          className={`flex-1 py-2 bg-gray-300 text-black font-bold uppercase hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-center transition-colors`}
        >
          NEXT &gt;
        </button>
      </div>
    </div>
  );
};

export default React.memo(RetroScreen);
