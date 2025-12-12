import React, { useEffect } from 'react';
import { ABOUT_CONTENT } from '../constants';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-[90vw] h-full bg-[#000084] border-4 border-gray-400 p-2 shadow-2xl font-mono text-white relative overflow-hidden flex flex-col">
                {/* Scanline effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>

                {/* Header Bar */}
                <div className="bg-gray-300 text-black px-2 py-1 flex justify-between items-center mb-4 uppercase text-sm font-bold border-b-2 border-black flex-shrink-0 relative z-20">
                    <span>SYSTEM INFO</span>
                    <span>{ABOUT_CONTENT.title}</span>
                    <button
                        onClick={onClose}
                        className="px-2 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors border border-black"
                    >
                        X
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 text-[18px] leading-[2.1] tracking-wide whitespace-pre-wrap relative z-20 font-medium overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-[#000050]">
                    {ABOUT_CONTENT.text[0]}

                    <div className="mt-8 animate-pulse text-green-400">_</div>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
