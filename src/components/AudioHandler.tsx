'use client';

import { useEffect, useRef } from 'react';

export default function AudioHandler() {
  const hasPlayed = useRef(false);

  useEffect(() => {
    const audioEl = document.getElementById('background-music') as HTMLAudioElement | null;

    if (!audioEl) {
      return;
    }

    const playAudio = () => {
      if (hasPlayed.current) return;
      audioEl.play().then(() => {
        hasPlayed.current = true;
      }).catch(error => {
        // Autoplay was prevented. We'll need a user interaction.
        console.log("Autoplay prevented. Waiting for user interaction.", error);
      });
    };

    const handleInteraction = () => {
      playAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
    
    // Try to play immediately
    playAudio();
    
    // Set up listeners for the first interaction
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return null;
}
