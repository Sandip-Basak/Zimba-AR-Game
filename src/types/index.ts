
export type GameMode = 'classic' | 'endless' | 'challenge';

export interface Snack {
  id: string;
  type: 'chips' | 'cookie' | 'cracker' | 'premium' | 'rare' | 'bomb';
  x: number;
  y: number;
  points: number;
  imageUrl: string;
  imageHint: string;
  width: number;
  height: number;
}

export interface GameState {
  score: number;
  lives: number;
  timeLeft: number; // in seconds
  streaks: number;
  gameStatus: 'initial' | 'tutorial' | 'playing' | 'paused' | 'gameOver';
  activeSnacks: Snack[];
  basketPosition: { x: number; y: number };
  gameMode: GameMode | null;
}

export const SNACK_TYPES: Omit<Snack, 'id' | 'x' | 'y' >[] = [
  { type: 'chips', points: 10, imageUrl: '/game-assets/products/product-1.png', imageHint: 'Bag of Company Chips', width: 90, height: 90 },
  { type: 'cookie', points: 10, imageUrl: '/game-assets/products/product-2.png', imageHint: 'Company Cookie', width: 90, height: 90 },
  { type: 'bomb', points: -20, imageUrl: '/game-assets/products/bomb.png', imageHint: 'Do not catch me', width: 90, height: 90 },
  { type: 'cracker', points: 10, imageUrl: '/game-assets/products/product-3.png', imageHint: 'Box of Company Crackers', width: 90, height: 90 },
  { type: 'premium', points: 25, imageUrl: '/game-assets/products/product-4.png', imageHint: 'Company Premium Snack', width: 170, height: 170 },
  { type: 'rare', points: 50, imageUrl: '/game-assets/products/tiger.png', imageHint: 'Company Rare Treat', width: 90, height: 90 },
  { type: 'cookie', points: 25, imageUrl: '/game-assets/products/product-6.png', imageHint: 'Company Treat', width: 90, height: 90 },
  { type: 'cracker', points: 10, imageUrl: '/game-assets/products/product-7.png', imageHint: 'Company Treat', width: 90, height: 90 },
  { type: 'bomb', points: -20, imageUrl: '/game-assets/products/bomb.png', imageHint: 'Do not catch me', width: 90, height: 90 },
  { type: 'chips', points: 25, imageUrl: '/game-assets/products/product-8.png', imageHint: 'Company Treat', width: 90, height: 90 },
  { type: 'chips', points: 10, imageUrl: '/game-assets/products/product-9.png', imageHint: 'Company Treat', width: 90, height: 90 },
  { type: 'premium', points: 10, imageUrl: '/game-assets/products/product-5.png', imageHint: 'Company Treat', width: 170, height: 170 },
  { type: 'premium', points: 10, imageUrl: '/game-assets/products/product-10.png', imageHint: 'Company Treat', width: 90, height: 90 },
  { type: 'bomb', points: -20, imageUrl: '/game-assets/products/bomb.png', imageHint: 'Do not catch me', width: 90, height: 90 },
];
