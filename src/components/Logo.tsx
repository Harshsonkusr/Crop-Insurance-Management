import React, { useState } from 'react';
import { Sprout } from 'lucide-react';

interface LogoProps {
  className?: string;
  variant?: 'navbar' | 'sidebar' | 'icon' | 'hd' | 'default';
  size?: 'sm' | 'md' | 'lg'; // For backward compatibility
  iconOnly?: boolean; // For backward compatibility
  showText?: boolean; // For backward compatibility (deprecated - logo includes text)
  fallback?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '',
  variant = 'default',
  size = 'md',
  iconOnly = false,
  showText = false, // Deprecated
  fallback = true
}) => {
  const [imageError, setImageError] = useState(false);

  // Determine which variant to use
  let actualVariant = variant;
  if (variant === 'default') {
    actualVariant = iconOnly ? 'icon' : 'sidebar';
  }

  // Logo configuration for different variants - Even smaller sizes
  const logoConfig: Record<string, { src: string; width: string; height: string; className: string }> = {
    navbar: {
      src: '/claim-easy-logo-navbar.png',
      width: '50px', // Even smaller - reduced from 70px
      height: 'auto',
      className: 'logo-navbar'
    },
    sidebar: {
      src: '/claim-easy-logo-sidebar.png',
      width: '45px', // Even smaller - reduced from 65px
      height: 'auto',
      className: 'logo-sidebar'
    },
    icon: {
      src: '/claim-easy-logo-navbar.png', // Fallback to navbar version if icon version doesn't exist
      width: '20px', // Even smaller - reduced from 24px
      height: '20px', // Even smaller - reduced from 24px
      className: 'logo-icon'
    },
    hd: {
      src: '/claim-easy-logo-hd.png',
      width: '400px', // Even smaller - reduced from 600px
      height: 'auto',
      className: 'logo-hd'
    },
    default: {
      src: '/claim-easy-logo.png', // Fallback to original
      width: '45px', // Even smaller - reduced from 65px
      height: 'auto',
      className: 'logo-default'
    }
  };

  // Fallback to default if variant doesn't exist
  const config = logoConfig[actualVariant] || logoConfig.default;

  // Try to load the variant-specific image, fallback to default
  const [currentSrc, setCurrentSrc] = useState(config.src);

  const handleImageError = () => {
    if (currentSrc !== '/claim-easy-logo.png') {
      // Try fallback to default logo
      setCurrentSrc('/claim-easy-logo.png');
    } else {
      console.error('Failed to load logo:', config.src);
      setImageError(true);
    }
  };

  if (imageError && !fallback) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {!imageError ? (
        <img
          src={currentSrc}
          alt="ClaimEasy Logo"
          className={`block max-w-full h-auto object-contain transition-all duration-300 ease-out hover:scale-105 ${config.className}`}
          style={{
            width: config.width === 'auto' ? 'auto' : config.width,
            height: config.height === 'auto' ? 'auto' : config.height,
            display: 'block',
            imageRendering: 'crisp-edges',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            filter: 'contrast(1.1) brightness(1.05)',
          }}
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <div className="flex items-center gap-2">
          <Sprout className="h-8 w-8 text-green-600" />
          {showText && (
            <span className="text-xl font-bold text-gray-900">ClaimEasy</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;

