import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/icons/Logo';
import { ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-6">
            <Logo />
          </div>
          <CardTitle className="text-4xl font-headline text-primary">Snack Catcher</CardTitle>
          <CardDescription className="text-lg">
            Get ready to catch delicious snacks in augmented reality!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-primary">How to Play:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Say cheese when the camera starts.</li>
              <li>Wave your hand like a snack ninja to move your virtual basket and catch the tasty treats raining down.</li>
              <li>Catch more, score more! Build crazy streaks to rack up bonus points.</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
          Get ready to turn your screen into a snack storm. Can you handle the crunch?
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full text-lg py-6">
            <Link href="/game">
              Start the Game
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Allenby Food and Beverages Pvt. Ltd.</p>
        <p>All rights reserved.</p>
        <p>Powered by <a href="https://qubitone.in/" className="no-underline" target="_blank">QubitOne</a></p>
      </footer>
    </div>
  );
}
