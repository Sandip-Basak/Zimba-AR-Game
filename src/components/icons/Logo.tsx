
import Image from 'next/image';

const Logo = ({ width = 300, height = 100 }: { width?: number; height?: number }) => {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/game-assets/logos/logo.png"
        alt="Company Logo"
        width={width}
        height={height}
        data-ai-hint="company logo"
        className="rounded-md"
      />
    </div>
  );
};

export default Logo;
