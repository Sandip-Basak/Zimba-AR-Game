'use client';

import { useState } from 'react';
import type { GameMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GameCore from '@/components/game/GameCore';
import { Trophy, Zap, InfinityIcon, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function GamePage() {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  if (!selectedMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
        <Button asChild variant="outline" className="absolute top-4 left-4">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">Select Game Mode</CardTitle>
            <CardDescription>Choose how you want to play Snack Catcher!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setSelectedMode('classic')}
              className="w-full text-lg py-6 justify-start bg-secondary text-secondary-foreground hover:bg-secondary/90"
              variant="secondary"
            >
              <Zap className="mr-3 h-6 w-6 text-accent" />
              Classic Mode <span className="ml-auto text-sm opacity-75">(60 Second)</span>
            </Button>
            <Button
              onClick={() => setSelectedMode('endless')}
              className="w-full text-lg py-6 justify-start bg-secondary text-secondary-foreground hover:bg-secondary/90"
              variant="secondary"
            >
              <InfinityIcon className="mr-3 h-6 w-6 text-accent" />
              Endless Mode <span className="ml-auto text-sm opacity-75">(3 Lives)</span>
            </Button>
            {/* <Button
              onClick={() => setSelectedMode('challenge')}
              className="w-full text-lg py-6 justify-start bg-secondary text-secondary-foreground hover:bg-secondary/90"
              variant="secondary"
            >
              <Trophy className="mr-3 h-6 w-6 text-accent" />
              Challenge Mode <span className="ml-auto text-sm opacity-75">(Special Tasks)</span>
            </Button> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <GameCore mode={selectedMode} />;
}
