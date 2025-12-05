
import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useProgress, Environment, ContactShadows } from '@react-three/drei';
import CassetteModel from '../components/CassetteModel';
import LooseTape from '../components/LooseTape';
import RetroScreen from './components/RetroScreen';
import VHSOverlay from '../components/VHSOverlay';
import BackgroundVideo from './components/BackgroundVideo';
import OrbitingTapes from '../components/OrbitingTapes';
import GlitchOverlay from '../components/GlitchOverlay';
import PlayerControls from './components/PlayerControls';
import { audioService } from '../services/audioService';
import { STORY_TEXTS, TRACK_CONFIGS, TOTAL_TRACKS, ASSETS, COSMIC_CONFIG } from '../constants';
import { PlayerState } from '../types';
import '../index.css';

// Loader component for 3D assets
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-white font-mono text-xl animate-pulse whitespace-nowrap">
        LOADING MODEL... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

const App: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<number>(0); // Start at Track 0
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.STOPPED);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isTapeInserted, setIsTapeInserted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCosmicMode, setIsCosmicMode] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(0);

  // Layout State: Split screen when playing or paused
  const isLayoutSplit = (playerState === PlayerState.PLAYING || playerState === PlayerState.PAUSED) && !isCosmicMode;

  // Initialize Audio
  useEffect(() => {
    const initAudio = async () => {
      await audioService.loadAudio(ASSETS.audioFile);
      setIsAudioLoaded(true);
    };
    initAudio();
  }, []);

  const handlePlayPause = () => {
    if (!isTapeInserted) return;

    if (playerState === PlayerState.PLAYING) {
      setPlayerState(PlayerState.PAUSED);
      audioService.pause();
    } else if (playerState === PlayerState.PAUSED) {
      setPlayerState(PlayerState.PLAYING);
      audioService.resume();
    } else {
      setPlayerState(PlayerState.PLAYING);
      const config = TRACK_CONFIGS[currentTrack];
      audioService.playTrack(config);
    }
  };

  const handleStop = () => {
    if (!isTapeInserted) return;
    setPlayerState(PlayerState.STOPPED);
    audioService.stop();
  };

  const handleNextTrack = () => {
    if (!isTapeInserted) return;

    // Tracks are 0 to 11 (Total 12)
    // If current is 0..10, go to next
    // If current is 11, go to Cosmic Mode
    if (currentTrack < TOTAL_TRACKS - 1) {
      const nextTrack = currentTrack + 1;
      setCurrentTrack(nextTrack);
      setCurrentPage(0); // Reset page on track change

      if (playerState === PlayerState.PLAYING) {
        const config = TRACK_CONFIGS[nextTrack];
        audioService.playTrack(config);
      }
    } else {
      // Trigger Cosmic Mode
      setIsCosmicMode(true);
      // Play cosmic static
      audioService.playTrack(COSMIC_CONFIG);
    }
  };

  const handleRewind = () => {
    if (!isTapeInserted) return;

    setIsCosmicMode(false); // Exit cosmic mode
    setCurrentTrack(0); // Reset to Track 0
    setCurrentPage(0); // Reset page

    // Set to PAUSED so the text/image UI remains visible
    setPlayerState(PlayerState.PAUSED);
    audioService.stop(); // Stop audio (effectively paused at start)
  };

  const handleInsertTape = () => {
    setIsTapeInserted(true);
    setCurrentPage(0); // Reset page

    // Sequence: Reading -> VHS Noise -> Layout Switch -> Clear Noise
    setTimeout(() => {
      // 1. Start VHS Noise Transition (after 2s reading)
      setIsTransitioning(true);

      setTimeout(() => {
        // 2. Switch Layout / Start Playing (mid-noise)
        setPlayerState(PlayerState.PLAYING);
        const config = TRACK_CONFIGS[currentTrack];
        audioService.playTrack(config);

        setTimeout(() => {
          // 3. End VHS Noise (reveal new layout)
          setIsTransitioning(false);
        }, 800); // Noise duration after switch
      }, 500); // Time before switch (noise build-up)
    }, 2000); // Reading duration
  };

  const [imageError, setImageError] = useState(false);

  // Reset image error when track or page changes
  useEffect(() => {
    setImageError(false);
  }, [currentTrack, currentPage]);

  // Preload next image
  useEffect(() => {
    const content = STORY_TEXTS[currentTrack];
    if (content && currentPage < content.text.length - 1) {
      const nextImage = new Image();
      nextImage.src = `/image/${currentTrack}_${currentPage + 2}.png`;
    }
  }, [currentTrack, currentPage]);

  return (
    <div className="w-screen h-screen bg-[#050505] flex items-center justify-center overflow-hidden">
      {/* Mobile Frame Simulation - Removed bg-black to show video */}
      <div className="w-full max-w-[430px] h-full relative flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] border-x border-gray-800 overflow-hidden">
        <BackgroundVideo />
        <GlitchOverlay />
        {/* VHS Transition Overlay */}
        {isTransitioning && <VHSOverlay />}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col transition-all duration-1000 ease-in-out ${isLayoutSplit ? 'h-full' : 'h-full'}`}>

          {/* Split View Content (Top Half) - Only visible when playing */}
          {isLayoutSplit && (
            <div className="flex-1 flex flex-col h-full animate-fade-in z-10 bg-black/10 backdrop-blur-sm relative">

              {/* Top: Text Content (Fills remaining space) */}
              <div className="flex-1 w-full relative overflow-hidden bg-black/40 p-2">
                <RetroScreen
                  content={STORY_TEXTS[currentTrack]}
                  trackNumber={currentTrack}
                  page={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>

              {/* Bottom: Image Area (Increased Height ~38%, reduced padding for larger image) */}
              <div className="h-[38vh] w-full flex items-center justify-center p-2 bg-black/20 border-t border-white/10 pb-28">
                <div className="h-full aspect-[4/3] relative shadow-2xl rounded-lg overflow-hidden border-2 border-white/20 bg-black">
                  {!imageError ? (
                    <div className="w-full h-full overflow-hidden relative">
                      <img
                        src={`/image/${currentTrack}_${currentPage + 1}.png`}
                        alt={`Track ${currentTrack} Page ${currentPage + 1}`}
                        className="w-full h-full object-fill filter blur-[0.5px] brightness-[0.8] contrast-[1.2] sepia-[0.4]"
                        onError={() => setImageError(true)}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none bg-[length:100%_4px,3px_100%] z-10 opacity-50"></div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50 font-mono text-xs">
                      NO IMAGE
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Radio Area (Bottom Half in Split, Full Screen otherwise) - HIDDEN when split */}
          {!isLayoutSplit && (
            <div className="relative h-full flex-1 transition-all duration-1000 ease-in-out z-10">
              <Canvas camera={{ position: [0, 0, 30], fov: 45 }} shadows>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />

                <Suspense fallback={<Loader />}>
                  <Environment preset="city" />

                  <CassetteModel
                    playerState={playerState}
                    onPlayPause={handlePlayPause}
                    onRewind={handleRewind}
                    onNext={handleNextTrack}
                    isTapeInserted={isTapeInserted}
                  />

                  {isCosmicMode && <OrbitingTapes />}

                  {!isTapeInserted && (
                    <LooseTape onInsert={handleInsertTape} />
                  )}

                  <OrbitControls
                    enableZoom={true}
                    enableRotate={true}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.8}
                    minDistance={15}
                    maxDistance={60}
                  />
                </Suspense>
              </Canvas>

              {/* Instructions Overlay */}
              {!isTapeInserted && (
                <div className="absolute bottom-40 left-0 right-0 text-center pointer-events-none z-20">
                  <p className="text-white font-mono animate-pulse bg-black/50 inline-block px-4 py-2 rounded border border-white/20">
                    CLICK THE TAPE TO INSERT
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Player Controls - Always Visible at Bottom */}
        <PlayerControls
          playerState={playerState}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onRewind={handleRewind}
          onNext={handleNextTrack}
          isTapeInserted={isTapeInserted}
        />
      </div>
    </div>
  );
};

export default App;
