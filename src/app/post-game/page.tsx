'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SocialShareButtons from '@/components/post-game/SocialShareButtons';
import { Award, Gift, RefreshCw } from 'lucide-react';
import Image from 'next/image';

export default function PostGamePage() {
    return (
    <Suspense fallback={<div>Loading game results...</div>}>
      <PostGameContent />
    </Suspense>
  );
}
function PostGameContent() {
  const searchParams = useSearchParams();
  const score = searchParams.get('score') || '0';
  const gameMode = searchParams.get('mode') || 'game';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Award className="h-16 w-16 text-accent" />
          </div>
          <CardTitle className="text-4xl font-headline text-primary">Game Over!</CardTitle>
          <CardDescription className="text-lg">
            You played <span className="font-semibold">{gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} mode</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-5xl font-bold text-foreground">{score}</p>
          <p className="text-lg">Your Final Score</p>
          
          <SocialShareButtons score={parseInt(score)} gameMode={gameMode} />

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-xl font-semibold mb-3 text-accent">Special Offer!</h3>
            <div className="flex flex-col items-center space-y-3 p-4 bg-muted/50 rounded-lg">
              <Image 
                src="/game-assets/logos/logo.png" 
                alt="Promotional Offer" 
                width={200} 
                height={100}
                data-ai-hint="discount coupon"
                className="rounded-md shadow-sm"
              />
              <p className="text-sm text-muted-foreground">
                Thanks for playing! Get 15% off your next snack purchase with code: <strong className="text-primary">SNACK15</strong>
              </p>
              <Button variant="outline" size="sm" className="mt-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <Gift className="mr-2 h-4 w-4" />
                Claim Your Coupon
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-3">
          <Button asChild className="w-full text-lg py-6">
            <Link href="/game">
              <RefreshCw className="mr-2 h-5 w-5" />
              Play Again
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
