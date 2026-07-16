import { useState, useEffect } from 'react';

export interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean;       // < 640px
  isTablet: boolean;       // >= 640px && < 1024px
  isCompactPos: boolean;   // < 960px (used by POS screen to switch to floating bottom drawer)
  isDesktop: boolean;      // >= 1024px
}

export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      width,
      height,
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1024,
      isCompactPos: width < 960,
      isDesktop: width >= 1024
    };
  });

  useEffect(() => {
    let timeoutId: any = null;

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setViewport({
          width,
          height,
          isMobile: width < 640,
          isTablet: width >= 640 && width < 1024,
          isCompactPos: width < 960,
          isDesktop: width >= 1024
        });
      }, 50); // 50ms throttle for smooth responsive transitions
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return viewport;
}
