import React, { useState, useRef, useEffect } from 'react';
import { ImageState, ImageMetadata } from '../types';
import { VideoPlayIcon } from './icons';

// Helper function to calculate distance between two points
const getDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }): number => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
};

// Helper function to calculate angle between two points in degrees
const getAngle = (p1: { x: number, y: number }, p2: { x: number, y: number }): number => {
  return Math.atan2(p1.y - p2.y, p1.x - p2.x) * 180 / Math.PI;
};

interface PostcardProps {
  image: ImageState;
  onSelect: () => void;
  bringToFront: () => void;
  onHover: (image: ImageMetadata | null) => void;
}

const Postcard: React.FC<PostcardProps> = ({ image, onSelect, bringToFront, onHover }) => {
  const [transform, setTransform] = useState(image.transform);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const activePointers = useRef(new Map<number, { x: number, y: number }>());
  const gestureInfo = useRef({
      initialDistance: 0,
      initialAngle: 0,
      initialTransform: { ...image.transform }
  });
  const dragInfo = useRef({
      startX: 0,
      startY: 0,
      elementX: 0,
      elementY: 0,
      moved: false,
  });

  useEffect(() => {
    // Sync transform from props, which updates on shuffle
    setTransform(image.transform);
  }, [image.transform]);
  
  useEffect(() => {
    // Lazy loading images
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.src = image.thumbnail || image.image_url;
          img.onload = () => {
            setIsLoaded(true);
          };
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load images 200px before they enter the viewport
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(cardRef.current);
      }
    };
  }, [image.image_url, image.thumbnail]);


  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    bringToFront();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragInfo.current.moved = false;

    if (activePointers.current.size === 1) {
      // Start of a drag
      const pointer = Array.from(activePointers.current.values())[0];
      dragInfo.current.startX = pointer.x;
      dragInfo.current.startY = pointer.y;
      dragInfo.current.elementX = transform.x;
      dragInfo.current.elementY = transform.y;
    } else if (activePointers.current.size === 2) {
      // Start of a pinch/rotate gesture
      const pointers = Array.from(activePointers.current.values());
      gestureInfo.current.initialDistance = getDistance(pointers[0], pointers[1]);
      gestureInfo.current.initialAngle = getAngle(pointers[0], pointers[1]);
      gestureInfo.current.initialTransform = { ...transform };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activePointers.current.has(e.pointerId)) return;
    
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (!dragInfo.current.moved) {
        // Simple threshold to detect movement and prevent firing click on small drags
        const pointer = Array.from(activePointers.current.values())[0];
        const initialX = activePointers.current.size === 1 ? dragInfo.current.startX : 0;
        const initialY = activePointers.current.size === 1 ? dragInfo.current.startY : 0;
        if (Math.hypot(pointer.x - initialX, pointer.y - initialY) > 5) {
            dragInfo.current.moved = true;
        }
    }
    
    if (activePointers.current.size === 1) {
      // Dragging
      const pointer = Array.from(activePointers.current.values())[0];
      const dx = pointer.x - dragInfo.current.startX;
      const dy = pointer.y - dragInfo.current.startY;
      setTransform(t => ({
          ...t,
          x: dragInfo.current.elementX + dx,
          y: dragInfo.current.elementY + dy,
      }));
    } else if (activePointers.current.size === 2) {
      // Pinching/Rotating
      const pointers = Array.from(activePointers.current.values());
      const currentDistance = getDistance(pointers[0], pointers[1]);
      const currentAngle = getAngle(pointers[0], pointers[1]);
      
      const newScale = gestureInfo.current.initialTransform.scale * (currentDistance / gestureInfo.current.initialDistance);
      const newRot = gestureInfo.current.initialTransform.rot + (currentAngle - gestureInfo.current.initialAngle);
      
      setTransform(t => ({
          ...t,
          scale: Math.max(0.5, Math.min(newScale, 2.5)), // Clamp scale
          rot: newRot,
      }));
    }
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    activePointers.current.delete(e.pointerId);

    if (!dragInfo.current.moved) {
      onSelect();
    }
    
    // If a multi-touch gesture ends, reset drag info for the remaining finger
    if (activePointers.current.size === 1) {
      const pointer = Array.from(activePointers.current.values())[0];
      dragInfo.current.startX = pointer.x;
      dragInfo.current.startY = pointer.y;
      dragInfo.current.elementX = transform.x;
      dragInfo.current.elementY = transform.y;
    }
  };

  return (
    <div
      ref={cardRef}
      className="absolute group cursor-pointer touch-none"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rot}deg) scale(${transform.scale})`,
        zIndex: transform.z,
        transition: 'transform 0.5s ease-in-out',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={() => onHover(image)}
      onPointerLeave={() => onHover(null)}
    >
      <div className="relative bg-white p-3 pb-8 rounded-md shadow-2xl transition-transform duration-200 ease-in-out group-hover:scale-105">
        <div className="relative">
            {isLoaded ? (
                <img 
                    src={image.thumbnail || image.image_url} 
                    alt={image.title} 
                    className="block max-w-[300px] max-h-[300px] w-auto h-auto select-none rounded-sm" 
                    draggable={false}
                />
            ) : (
                <div className="w-[300px] h-[225px] flex items-center justify-center bg-gray-200 rounded-sm">
                    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-gray-400"></div>
                </div>
            )}
            {isLoaded && image.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-sm">
                    <VideoPlayIcon className="w-16 h-16 text-white opacity-80" />
                </div>
            )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {image.title}
        </div>
      </div>
    </div>
  );
};

export default Postcard;