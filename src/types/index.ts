
export type GameMode = 'classic' | 'endless' | 'challenge';

export interface Snack {
  id: string;
  type: 'chips' | 'cookie' | 'cracker' | 'premium' | 'rare';
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
  { type: 'chips', points: 10, imageUrl: '/game-assets/products/product-1.png', imageHint: 'Bag of Company Chips', width: 150, height: 150 },
  { type: 'cookie', points: 10, imageUrl: '/game-assets/products/product-2.png', imageHint: 'Company Cookie', width: 150, height: 150 },
  { type: 'cracker', points: 10, imageUrl: '/game-assets/products/product-3.png', imageHint: 'Box of Company Crackers', width: 150, height: 150 },
  { type: 'premium', points: 25, imageUrl: '/game-assets/products/product-4.png', imageHint: 'Company Premium Snack', width: 150, height: 150 },
  { type: 'rare', points: 50, imageUrl: '/game-assets/products/product-5.png', imageHint: 'Company Rare Treat', width: 150, height: 150 },
  { type: 'cookie', points: 50, imageUrl: '/game-assets/products/product-6.png', imageHint: 'Company Rare Treat', width: 150, height: 150 },
  { type: 'cracker', points: 50, imageUrl: '/game-assets/products/product-7.png', imageHint: 'Company Rare Treat', width: 150, height: 150 },
  { type: 'chips', points: 50, imageUrl: '/game-assets/products/product-8.png', imageHint: 'Company Rare Treat', width: 150, height: 150 },
  { type: 'chips', points: 50, imageUrl: '/game-assets/products/product-9.png', imageHint: 'Company Rare Treat', width: 150, height: 150 },
  { type: 'premium', points: 50, imageUrl: '/game-assets/products/product-10.png', imageHint: 'Company Rare Treat', width: 150, height: 150 },
];
