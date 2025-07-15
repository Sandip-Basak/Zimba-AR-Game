'use client';

import { Button } from '@/components/ui/button';
import { Twitter, Facebook, Share2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonsProps {
  score: number;
  gameMode: string;
}

export default function SocialShareButtons({ score, gameMode }: SocialShareButtonsProps) {
  const { toast } = useToast();
  const shareText = `I scored ${score} in Zimba Snack Catcher (${gameMode} mode)! Can you beat my score? #ZimbaSnackCatcher`;

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.origin); // Or specific game URL
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(shareText)}`;
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: 'Snack Catcher Score!',
            text: shareText,
            url: window.location.origin,
          }).then(() => {
            toast({ title: "Shared successfully!"});
          }).catch(console.error);
          return;
        } else {
          navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
          toast({ title: "Link copied to clipboard!", description: "Native sharing not available." });
          return;
        }
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    toast({ title: `Shared on ${platform} (simulated)` });
  };

  return (
    <div className="flex justify-center space-x-3 mt-4">
      {/* <Button variant="outline" size="icon" onClick={() => handleShare('twitter')} aria-label="Share on Twitter">
        <Twitter className="h-5 w-5 text-blue-400" />
      </Button> */}
      <Button variant="outline" size="icon" onClick={() => handleShare('facebook')} aria-label="Share on Facebook">
        <Facebook className="h-5 w-5 text-blue-600" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => handleShare('native')} aria-label="Share">
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
