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
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleShare = (platform: string) => {
    // const url = encodeURIComponent(window.location.origin); // Or specific game URL
    // let shareUrl = '';

    const url = encodeURIComponent(shareUrl);
    let socialUrl = '';

    switch (platform) {
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${url}`;
        break;
      case 'facebook':
        // shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(shareText)}`;
        // Using the modern Facebook Share Dialog URL.
        // For full features, you'd replace 'YOUR_APP_ID' with a real Facebook App ID.
        const appId = '966242223397117'; // A generic public App ID, replace with your own if you have one.
        socialUrl = `https://www.facebook.com/dialog/share?app_id=${appId}&display=popup&href=${url}&quote=${encodeURIComponent(shareText)}`;
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: 'Snack Catcher Score!',
            text: shareText,
            // url: window.location.origin,
            url: shareUrl,
          }).then(() => {
            toast({ title: "Shared successfully!"});
          }).catch(console.error);
          return;
        } else {
          // navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
          navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          toast({ title: "Link copied to clipboard!", description: "Native sharing not available." });
          return;
        }
    }
    // window.open(shareUrl, '_blank', 'noopener,noreferrer');
    // toast({ title: `Shared on ${platform}` });
    window.open(socialUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast({ title: `Opening share dialog for ${platform}` });
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
