import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshThreshold = 80;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].pageY;
      } else {
        startY.current = -1;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === -1 || isRefreshing) return;

      const currentY = e.touches[0].pageY;
      const distance = currentY - startY.current;

      if (distance > 0 && window.scrollY === 0) {
        // Apply dampening
        const dampenedDistance = Math.min(distance * 0.4, 120);
        setPullDistance(dampenedDistance);
        
        if (dampenedDistance > 10 && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance >= refreshThreshold) {
        setIsRefreshing(true);
        setPullDistance(60);
        
        // Haptic feedback if available (Capacitor)
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }

        // Trigger refresh
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setPullDistance(0);
      }
    };

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  return (
    <div ref={containerRef} className="pull-to-refresh-container">
      <div 
        className="pull-to-refresh-indicator"
        style={{ 
          transform: `translateY(${pullDistance}px) translateX(-50%)`,
          opacity: Math.min(pullDistance / refreshThreshold, 1),
          zIndex: 2000
        }}
      >
        <div className={`refresh-icon-wrapper ${isRefreshing ? 'refreshing' : ''}`}>
          <RefreshCw 
            size={20} 
            style={{ 
              transform: isRefreshing ? 'none' : `rotate(${pullDistance * 4}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.1s linear'
            }} 
          />
        </div>
      </div>
      <div 
        className="pull-to-refresh-content"
        style={{ 
          /* No transform applied here to preserve position: fixed for child elements like modals and sidebars */
        }}
      >
        {children}
      </div>
    </div>
  );
};
