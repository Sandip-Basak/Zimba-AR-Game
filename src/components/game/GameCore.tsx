
'use client';

import type { GameMode, Snack, GameState, PointAnimation } from '@/types';
import { SNACK_TYPES } from '@/types';
import Image from 'next/image';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import GameOverlay from './GameOverlay';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";

const MEDIAPIPE_HANDS_VERSION = '0.4.1675469240';
const HANDS_SCRIPT_ID = 'mediapipe-hands-script';

declare global {
  interface Window {
    Hands: any;
  }
}

const GAME_AREA_WIDTH = 500; //pixels
const GAME_AREA_HEIGHT = 625; //pixels
const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 20;
const SNACK_SPAWN_INTERVAL = 1500; //ms
const GAME_LOOP_INTERVAL = 50; //ms, approx 20 FPS for simplified logic
const INITIAL_SNACK_SPEED = 8; // pixels per game loop interval
const INDEX_FINGER_TIP_LANDMARK = 8;

interface GameCoreProps {
  mode: GameMode;
}

export default function GameCore({ mode }: GameCoreProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: mode === 'endless' ? 3 : 0,
    timeLeft: mode === 'classic' ? 60 : 0,
    streaks: 0,
    gameStatus: 'initial',
    activeSnacks: [],
    basketPosition: { x: GAME_AREA_WIDTH / 2 - BASKET_WIDTH / 2, y: GAME_AREA_HEIGHT - BASKET_HEIGHT - 10 },
    gameMode: mode,
 pointAnimations: [],
  });
  const [showTutorial, setShowTutorial] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [handsModel, setHandsModel] = useState<any | null>(null);
  const [handsScriptLoaded, setHandsScriptLoaded] = useState(false);
  const [handsScriptError, setHandsScriptError] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    console.log('[GameCore] startGame function called.');
    setGameState(prev => ({
      ...prev,
      score: 0,
      lives: mode === 'endless' ? 3 : prev.lives,
      timeLeft: mode === 'classic' ? 60 : prev.timeLeft,
      streaks: 0,
      activeSnacks: [],
      gameStatus: 'playing',
    }));

    if (hasCameraPermission === true && videoRef.current && videoRef.current.paused && videoRef.current.srcObject) {
      console.log('[GameCore] In startGame: Camera permission true, video paused. Attempting to play.');
      videoRef.current.play().catch(err => {
        console.error("[GameCore] In startGame: Failed to play existing video stream:", err);
        toast({ variant: 'destructive', title: 'Video Playback Error', description: `Could not resume video: ${err.message}.` });
      });
    }
  }, [mode, toast, hasCameraPermission]);

  useEffect(() => {
    if (gameState.gameStatus === 'initial' && !showTutorial && hasCameraPermission !== null) {
      console.log(`[GameCore] Conditions met to start game post-tutorial. Camera permission: ${hasCameraPermission}.`);
      if (hasCameraPermission === true) {
        startGame();
      } else {
        console.log('[GameCore] Camera permission not granted, game will not start with AR. Starting non-AR mode.');
        setGameState(prev => ({ ...prev, gameStatus: 'playing' })); 
      }
    }
  }, [hasCameraPermission, showTutorial, gameState.gameStatus, startGame]);

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    const handsModelInstanceForCleanup = handsModel;

    return () => {
      console.log('[GameCore] General cleanup effect for video stream and Hands model running.');
      if (currentVideoRef && currentVideoRef.srcObject) {
        const stream = currentVideoRef.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        if (currentVideoRef) {
          currentVideoRef.srcObject = null;
        }
        console.log('[GameCore] Camera tracks stopped in general cleanup.');
      }
      if (handsModelInstanceForCleanup && typeof handsModelInstanceForCleanup.close === 'function') {
        handsModelInstanceForCleanup.close();
        console.log('[GameCore] Hands model closed in general cleanup.');
      } else if (handsModelInstanceForCleanup) {
        console.log('[GameCore] Hands model instance existed for cleanup but no close method found or model was not a Hands instance.');
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [handsModel]);

  useEffect(() => {
    if (!showTutorial && videoRef.current && hasCameraPermission === null) {
      console.log('[GameCore] Tutorial dismissed, videoRef available. Attempting camera setup.');
      const setupCamera = async () => {
        if (!videoRef.current) {
          console.error('[GameCore] Video ref became null during async setup in primary camera useEffect. Aborting.');
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Error',
            description: 'Video component became unavailable during setup.',
          });
          return;
        }
        try {
          console.log('[GameCore] Attempting navigator.mediaDevices.getUserMedia (useEffect based).');
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          console.log('[GameCore] getUserMedia successful (useEffect based).');

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              console.log('[GameCore] Video metadata loaded (useEffect based). Attempting to play.');
              videoRef.current?.play().catch(playError => {
                console.error("[GameCore] Error playing video (useEffect based):", playError);
                toast({ variant: 'destructive', title: 'Video Playback Error', description: `Could not start video: ${playError.message}.` });
              });
            };
            videoRef.current.onerror = (videoEventError) => {
              console.error("[GameCore] Video element error (useEffect based):", videoEventError);
              toast({ variant: 'destructive', title: 'Video Element Error', description: 'The video element encountered an error.' });
            };
            setHasCameraPermission(true);
          } else {
            console.warn("[GameCore] Video ref (videoRef.current) null when assigning stream (useEffect based), stopping tracks.");
            stream.getTracks().forEach(track => track.stop());
            setHasCameraPermission(false);
          }
        } catch (error: any) {
          console.error('[GameCore] Error during getUserMedia (useEffect based):', error.name, error.message);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied/Error',
            description: `Could not access camera: ${error.message}. Please ensure permissions are granted.`,
          });
        }
      };
      setupCamera();
    }
  }, [showTutorial, hasCameraPermission, toast]);

  const initializeHands = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn('[GameCore] Window object not defined. Cannot initialize Hands.');
      toast({ variant: 'destructive', title: 'Environment Error', description: 'Window object not found, cannot run hand tracking.' });
      setHandsScriptError(true);
      return;
    }

    if (window.Hands) {
      console.log('[GameCore] window.Hands already exists. Proceeding with initialization.');
      const hands = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_HANDS_VERSION}/${file}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const handLandmarks = results.multiHandLandmarks[0];
          const fingerTip = handLandmarks[INDEX_FINGER_TIP_LANDMARK];
          if (fingerTip && videoRef.current) {
            // Use fingerTip.x directly as it represents the physical hand's horizontal position (0=left, 1=right)
            // The video element is not mirrored, but MediaPipe gives coordinates from the unmirrored feed.
            // So, direct mapping provides intuitive control: physical hand right -> basket right.
            let newBasketX = (1 - fingerTip.x) * GAME_AREA_WIDTH - BASKET_WIDTH / 2;
            newBasketX = Math.max(0, Math.min(newBasketX, GAME_AREA_WIDTH - BASKET_WIDTH));
            setGameState(prev => ({ ...prev, basketPosition: { ...prev.basketPosition, x: newBasketX } }));
          }
        }
      });
      setHandsModel(hands);
      setHandsScriptLoaded(true);
      console.log('[GameCore] Hands model initialized using pre-existing window.Hands.');
      return;
    }

    if (document.getElementById(HANDS_SCRIPT_ID)) {
      console.log('[GameCore] MediaPipe Hands script tag already exists in DOM. Waiting for it to load/error.');
      return;
    }

    console.log('[GameCore] Dynamically loading MediaPipe Hands script from CDN...');
    const script = document.createElement('script');
    script.id = HANDS_SCRIPT_ID;
    script.src = `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_HANDS_VERSION}/hands.js`;
    script.async = true;

    script.onload = () => {
      console.log('[GameCore] MediaPipe Hands script loaded successfully from CDN.');
      setHandsScriptLoaded(true);
      setHandsScriptError(false);
      if (window.Hands) {
        console.log('[GameCore] window.Hands found after dynamic script load. Initializing Hands model...');
        const handsInstance = new window.Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_HANDS_VERSION}/${file}`,
        });
        handsInstance.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        handsInstance.onResults((results: any) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const handLandmarks = results.multiHandLandmarks[0];
            const fingerTip = handLandmarks[INDEX_FINGER_TIP_LANDMARK];
            if (fingerTip && videoRef.current) {
              let newBasketX = (1 - fingerTip.x) * GAME_AREA_WIDTH - BASKET_WIDTH / 2;
              newBasketX = Math.max(0, Math.min(newBasketX, GAME_AREA_WIDTH - BASKET_WIDTH));
              setGameState(prev => ({ ...prev, basketPosition: { ...prev.basketPosition, x: newBasketX } }));
            }
          }
        });
        setHandsModel(handsInstance);
        console.log('[GameCore] Hands model initialized and set after dynamic load.');
      } else {
        console.error('[GameCore] window.Hands NOT found even after dynamic script load. This is unexpected.');
        toast({ variant: 'destructive', title: 'Hand Tracking Critical Error', description: 'Failed to initialize hand tracking library (post-load).' });
        setHandsScriptError(true);
      }
    };

    script.onerror = () => {
      console.error('[GameCore] Failed to load MediaPipe Hands script from CDN.');
      toast({ variant: 'destructive', title: 'Hand Tracking Load Error', description: 'Could not load the hand tracking library script.' });
      setHandsScriptError(true);
      setHandsScriptLoaded(false);
    };

    document.body.appendChild(script);
  }, [toast, setHandsModel, setHandsScriptLoaded, setHandsScriptError]);

  useEffect(() => {
    if (hasCameraPermission === true && !handsModel && !handsScriptLoaded && !handsScriptError) {
      console.log('[GameCore] Camera permission is true, handsModel not set, script not loaded/errored. Calling initializeHands (to load script).');
      initializeHands();
    } else if (hasCameraPermission === true && !handsModel && handsScriptLoaded && window.Hands) {
      console.log('[GameCore] Script loaded, window.Hands available, but model not set. Re-calling initializeHands to set up model.');
      initializeHands();
    } else if (hasCameraPermission !== true) {
      console.log('[GameCore] Camera permission not true, not initializing Hands. Current status:', hasCameraPermission);
    } else if (handsModel) {
      console.log('[GameCore] Hands model already exists or script has loaded it, not re-initializing script load.');
    } else if (handsScriptError) {
      console.log('[GameCore] Hands script encountered an error, not attempting further initialization.');
    }
  }, [hasCameraPermission, handsModel, initializeHands, handsScriptLoaded, handsScriptError]);

  const processVideoFrame = useCallback(async () => {
    if (gameState.gameStatus === 'playing' && handsModel && videoRef.current && videoRef.current.readyState >= HTMLMediaElement.HAVE_METADATA) {
      try {
        if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
          await handsModel.send({ image: videoRef.current });
        }
      } catch (error) {
        console.error("[GameCore] Error sending frame to Hands model:", error);
      }
    }
    if (gameState.gameStatus === 'playing') {
      animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
    }
  }, [handsModel, gameState.gameStatus]);

  useEffect(() => {
    if (gameState.gameStatus === 'playing' && handsModel && videoRef.current && hasCameraPermission === true) {
      console.log("[GameCore] Starting hand tracking loop (processVideoFrame).");
      animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
    } else {
      if (animationFrameIdRef.current) {
        console.log("[GameCore] Stopping hand tracking loop (processVideoFrame). Status:", gameState.gameStatus, "HandsModel:", !!handsModel, "Perm:", hasCameraPermission);
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameState.gameStatus, handsModel, hasCameraPermission, processVideoFrame]);

  const spawnSnack = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;

    const randomSnackType = SNACK_TYPES[Math.floor(Math.random() * SNACK_TYPES.length)];
    const newSnack: Snack = {
      ...randomSnackType,
      id: crypto.randomUUID(),
      x: Math.random() * (GAME_AREA_WIDTH - randomSnackType.width),
      y: 0,
    };
    setGameState(prev => ({ ...prev, activeSnacks: [...prev.activeSnacks, newSnack] }));
  }, [gameState.gameStatus]);

  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const loop = setInterval(() => {
      setGameState(prev => {
        if (prev.gameStatus !== 'playing') return prev;

        let newScore = prev.score;
        let newLives = prev.lives;
        let newStreaks = prev.streaks;
        let newTimeLeft = prev.timeLeft;
 let newPointAnimations = prev.pointAnimations;

        const updatedSnacks = prev.activeSnacks.map(snack => {
          const newY = snack.y + INITIAL_SNACK_SPEED * (1 + prev.streaks * 0.1);

          if (
            newY + snack.height >= prev.basketPosition.y &&
            newY < prev.basketPosition.y + BASKET_HEIGHT &&
            snack.x + snack.width > prev.basketPosition.x &&
            snack.x < prev.basketPosition.x + BASKET_WIDTH
 ) {
 const pointsGained = snack.points * (newStreaks > 1 ? newStreaks : 1);
 newScore += pointsGained;
            newStreaks += 1;

 newPointAnimations = [...newPointAnimations, {
 id: crypto.randomUUID(),
 x: snack.x + snack.width / 2,
 y: snack.y + snack.height / 2,
 points: pointsGained,
 timestamp: Date.now(),
 }];

            if (snack.type === 'bomb') {
 newPointAnimations = [...newPointAnimations, { id: crypto.randomUUID(), x: snack.x + snack.width / 2, y: snack.y + snack.height / 2, points: -1, timestamp: Date.now() }];
              newLives -= 1;
              newStreaks = 0
            }

            return null;
          }
          if (newY > GAME_AREA_HEIGHT && snack.type !== 'bomb') {
            if (prev.gameMode === 'endless') newLives -= 1;
            newStreaks = 0;
            return null;
          }

          return { ...snack, y: newY };
        }).filter(Boolean) as Snack[];

 // Remove old point animations
 const now = Date.now();
 newPointAnimations = newPointAnimations.filter(
 (animation) => now - animation.timestamp < 1000 // Keep animations for 1 second
 );

        if (prev.gameMode === 'classic') {
          newTimeLeft = Math.max(0, prev.timeLeft - GAME_LOOP_INTERVAL / 1000);
        }

        let newGameStatus = prev.gameStatus;
        if ((prev.gameMode === 'endless' && newLives <= 0) || (prev.gameMode === 'classic' && newTimeLeft <= 0)) {
          newGameStatus = 'gameOver';
        }

        if (newGameStatus === 'gameOver' && prev.gameStatus === 'playing') {
          router.push(`/post-game?score=${newScore}&mode=${mode}`);
        }

        return {
          ...prev,
          score: newScore,
          lives: newLives,
          streaks: newStreaks,
          timeLeft: newTimeLeft,
          activeSnacks: updatedSnacks,
          gameStatus: newGameStatus,
 pointAnimations: newPointAnimations,
        };
      });
    }, GAME_LOOP_INTERVAL);

    return () => clearInterval(loop);
  }, [gameState.gameStatus, router, mode]);

  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;
    const spawner = setInterval(spawnSnack, SNACK_SPAWN_INTERVAL / (1 + gameState.streaks * 0.05));
    return () => clearInterval(spawner);
  }, [gameState.gameStatus, spawnSnack, gameState.streaks]);

  const handleTutorialSkip = () => {
    setShowTutorial(false);
  };

  const togglePause = () => {
    setGameState(prev => {
      const newGameStatus = prev.gameStatus === 'playing' ? 'paused' : 'playing';
      if (newGameStatus === 'playing' && videoRef.current && videoRef.current.paused && videoRef.current.srcObject) {
        console.log('[GameCore] Resuming game from pause, attempting to play video.');
        videoRef.current.play().catch(err => console.error("Error playing video on resume from pause:", err));
      }
      return { ...prev, gameStatus: newGameStatus };
    });
  };

  if (showTutorial) {
    return (
      <AlertDialog open={showTutorial} onOpenChange={(open) => {
        if (!open && gameState.gameStatus === 'initial') {
          handleTutorialSkip();
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            {/* <AlertDialogTitle className="font-headline text-primary">Welcome to {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode!</AlertDialogTitle> */}
            <AlertDialogTitle className="font-headline text-primary text-center">Welcome to {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode!</AlertDialogTitle>
            {/* <AlertDialogDescription className="text-left">
              {mode === 'classic' && "Catch as many snacks as you can in 60 seconds. Good luck!"}
              {mode === 'endless' && "Catch snacks and don't let them drop! You have 3 lives."}
              {mode === 'challenge' && "A special challenge awaits! (Details for challenge mode will appear here)."}
              <br /><br />
              This game uses your camera for an Augmented Reality experience! Please allow camera access when prompted.
              <br /><br />
              If AR controls are enabled, move your index finger in front of the camera to control the basket. Catch snacks to score points and build streaks!
            </AlertDialogDescription> */}
            <AlertDialogDescription asChild>
                <div className="text-center pt-4 space-y-4">
                     <p>Move your hand in front of the camera to control the basket.</p>
                     <div className="flex justify-center items-center">
                       <Image 
                         src="/swipe.gif" 
                         alt="Hand swipe gesture tutorial"
                         width={250}
                         height={150}
                         unoptimized // GIFs are not optimized by next/image by default
                       />
                     </div>
                </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* <AlertDialogAction onClick={handleTutorialSkip} className="bg-primary hover:bg-primary/90">
              Start Game!
            </AlertDialogAction> */}
            <AlertDialogAction onClick={handleTutorialSkip} className="bg-primary hover:bg-primary/90 w-full">
              Got it, Let's Play!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (gameState.gameStatus === 'gameOver') {
    return <div className="flex items-center justify-center h-screen text-2xl font-bold">Processing Game Over...</div>;
  }

  if (typeof window !== 'undefined') {
    console.log('[GameCore] Component rendering. CamPerm:', hasCameraPermission, 'GameStatus:', gameState.gameStatus, 'Tutorial:', showTutorial, 'HandsModelSet:', !!handsModel, 'ScriptLoaded:', handsScriptLoaded, 'ScriptError:', handsScriptError);
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-muted/30 relative overflow-hidden">
      <GameOverlay
        score={gameState.score}
        timeLeft={Math.ceil(gameState.timeLeft)}
        lives={gameState.lives}
        streaks={gameState.streaks}
        gameMode={mode}
        isPaused={gameState.gameStatus === 'paused'}
        onPauseToggle={togglePause}
      />

      <div
        ref={gameAreaRef}
        className="relative bg-transparent shadow-2xl rounded-lg overflow-hidden border-2 border-primary/50"
        style={{ width: GAME_AREA_WIDTH, height: GAME_AREA_HEIGHT }}
        data-ai-hint="game area"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover -z-10 transform scale-x-[-1] "
          autoPlay
          playsInline 
          muted
          data-ai-hint="camera feed background"
          onPlay={() => console.log("[GameCore] Video element onPlay event triggered.")}
          onLoadedData={() => console.log("[GameCore] Video element onLoadedData event triggered.")}
        />

        {hasCameraPermission === false && gameState.gameStatus !== 'initial' && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-indigo-100 to-purple-200 opacity-50 -z-20 flex items-center justify-center text-center p-4">
            <p className="text-lg font-semibold text-gray-700">Playing without AR background.</p>
          </div>
        )}
        {hasCameraPermission === null && !showTutorial && (
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center -z-20">
            <p className="text-white text-lg">Initializing Camera...</p>
          </div>
        )}
        {hasCameraPermission === true && !handsModel && !handsScriptError && !handsScriptLoaded && !showTutorial && (
          <div className="absolute inset-0 bg-gray-600 flex items-center justify-center -z-20">
            <p className="text-white text-lg">Loading Hand Tracking Library...</p>
          </div>
        )}
        {hasCameraPermission === true && !handsModel && handsScriptLoaded && !handsScriptError && !showTutorial && (
          <div className="absolute inset-0 bg-gray-500 flex items-center justify-center -z-20">
            <p className="text-white text-lg">Initializing Hand Tracking Model...</p>
          </div>
        )}
        {handsScriptError && !showTutorial && (
          <div className="absolute inset-0 bg-red-300 flex items-center justify-center -z-20 p-4">
            <p className="text-red-800 text-lg text-center">Error loading Hand Tracking. AR controls will be unavailable.</p>
          </div>
        )}

 {/* Point Animations */}
        {gameState.pointAnimations.map(anim => (
          <div
            key={anim.id}
            style={{
              position: 'absolute',
              left: anim.x,
              top: anim.y,
              transform: 'translate(-50%, -50%)', // Center the text
              zIndex: 10,
              color: anim.points > 0 ? 'green' : 'red',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              pointerEvents: 'none', // Prevent interaction
              animation: 'fade-out 1s forwards',
            }}
 className="fade-out-animation"
          >
            {anim.points > 0 ? `+${anim.points}` : `${anim.points}`}
          </div>
 ))}

        {(gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused') && gameState.activeSnacks.map(snack => (
          <div
            key={snack.id}
            style={{
              position: 'absolute',
              left: snack.x,
              top: snack.y,
              width: snack.width,
              height: snack.height,
              zIndex: 1,
            }}
            className="transition-transform duration-100 ease-linear"
          >
            <Image src={snack.imageUrl} alt={snack.type} width={snack.width} height={snack.height} data-ai-hint={snack.imageHint} />
          </div>
        ))}

        {(gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused') && (
          <div
            ref={basketRef}
            style={{
              position: 'absolute',
              left: gameState.basketPosition.x,
              bottom: 10,
              width: BASKET_WIDTH,
              height: BASKET_HEIGHT,
              zIndex: 2,
            }}
            className="bg-primary rounded-t-md shadow-lg border-2 border-primary-foreground/50 flex items-center justify-center text-primary-foreground font-bold"
            data-ai-hint="collection basket"
          >
            Catch!
          </div>
        )}

        {gameState.gameStatus === 'paused' && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
            <h2 className="text-4xl font-bold text-white mb-4 font-headline">Paused</h2>
            <Button onClick={togglePause} variant="secondary" size="lg">Resume Game</Button>
          </div>
        )}

        {(gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused') && hasCameraPermission === false && (
          <Alert variant="destructive" className="absolute bottom-20 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-30">
            <AlertTitle>Camera Access Issue</AlertTitle>
            <AlertDescription>
              AR features are disabled as camera access was denied or is unavailable. You can still play the game.
            </AlertDescription>
          </Alert>
        )}
      </div>
 <style jsx>{`
        @keyframes fade-out {
          0% {
            opacity: 1;
 transform: translate(-50%, -50%) translateY(0px);
          }
          100% {
            opacity: 0;
 transform: translate(-50%, -50%) translateY(-20px); /* Float up slightly */
          }
        }
 .fade-out-animation {
 animation: fade-out 1s forwards;
        }`}</style>
      {/* {(handsModel && hasCameraPermission === true && (gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused')) && (
        <div className="mt-2 text-center text-xs text-muted-foreground p-2 bg-card/70 rounded-md">
          <p>Hand tracking enabled. Move your index finger left/right to control the basket.</p>
          <p>Ensure your hand is well-lit and visible to the camera.</p>
        </div>
      )} */}
      {(!handsModel && hasCameraPermission === true && !handsScriptError && !showTutorial && gameState.gameStatus !== 'initial') && (
        <div className="mt-2 text-center text-xs text-muted-foreground p-2 bg-card/70 rounded-md">
          <p>
            {handsScriptLoaded ? "Initializing hand tracking model..." : "Loading hand tracking library..."}
            If this persists, AR controls may be unavailable.
          </p>
        </div>
      )}
      {(handsScriptError && hasCameraPermission === true && !showTutorial && gameState.gameStatus !== 'initial') && (
        <div className="mt-2 text-center text-xs text-red-700 p-2 bg-red-100 rounded-md border border-red-300">
          <p>Failed to load hand tracking library. AR controls are disabled.</p>
        </div>
      )}
    </div>
  );
}