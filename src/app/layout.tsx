import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AudioHandler from '@/components/AudioHandler';

export const metadata: Metadata = {
  title: 'Zimba Snack Catcher',
  description: 'Catch falling snacks in augmented reality!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <audio id="background-music" src="/music.mp3" loop style={{ display: 'none' }} />
        <AudioHandler />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
