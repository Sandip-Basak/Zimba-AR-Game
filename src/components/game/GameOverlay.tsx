'use client';

import type { GameMode, GameState } from '@/types';
import { Button } from '@/components/ui/button';
import { Pause, Play, Zap } from 'lucide-react';

interface GameOverlayProps {
  score: number;
  timeLeft: number;
  lives: number;
  streaks: number;
  gameMode: GameMode;
  isPaused: boolean;
  onPauseToggle: () => void;
}

export default function GameOverlay({
  score,
  timeLeft,
  lives,
  streaks,
  gameMode,
  isPaused,
  onPauseToggle,
}: GameOverlayProps) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start text-foreground pointer-events-none">
      <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg shadow-md">
        <div className="text-2xl font-bold">Score: {score}</div>
        {streaks > 1 && (
          <div className="text-sm text-black font-semibold flex items-center">
            <Zap className="w-4 h-4 mr-1" /> {streaks}x Streak!
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onPauseToggle}
        className="bg-card/80 backdrop-blur-sm hover:bg-card pointer-events-auto"
        aria-label={isPaused ? "Resume game" : "Pause game"}
      >
        {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
      </Button>

      <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg shadow-md text-right">
        {gameMode === 'classic' && <div className="text-xl font-semibold">Time: {timeLeft}s</div>}
        {gameMode === 'endless' && <div className="text-xl font-semibold">Lives: {lives} ❤️</div>}
        {gameMode === 'challenge' && <div className="text-xl font-semibold">Challenge Mode</div>}
      </div>
    </div>
  );
}
