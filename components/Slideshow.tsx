
import React, { useState, useEffect, useCallback } from 'react';
import { ImageMetadata } from '../types';
import { CloseIcon, NextIcon, PrevIcon, PauseIcon, PlayIcon } from './icons';

interface SlideshowProps {
  images: ImageMetadata[];
  onClose: () => void;
}

const Slideshow: React.FC<SlideshowProps> = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      goToNext();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, goToNext]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'ArrowLeft') goToPrev();
        if (e.key === 'Escape') onClose();
        if (e.key === ' ') {
            e.preventDefault();
            setIsPaused(p => !p);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  const currentImage = images[currentIndex];

  const handleControlClick = (e: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center text-white"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center animate-zoom-in"
        onClick={e => e.stopPropagation()}
      >
        {currentImage && (
            <div className="relative animate-fade-in">
                {currentImage.type === 'video' ? (
                  <video 
                    key={currentImage.id}
                    src={currentImage.image_url} 
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    autoPlay 
                    muted
                    loop
                  />
                ) : (
                  <img 
                    src={currentImage.image_url} 
                    alt={currentImage.title} 
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                  />
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white rounded-b-lg pointer-events-none">
                    <h2 className="text-3xl font-bold">{currentImage.title}</h2>
                    <p className="mt-2 text-base text-gray-300 max-w-prose">{currentImage.description}</p>
                </div>
            </div>
        )}
      </div>

      <div className="absolute top-4 right-4 flex items-center space-x-4 z-10">
        <button 
          onClick={(e) => handleControlClick(e, () => setIsPaused(!isPaused))} 
          className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
        >
            {isPaused ? <PlayIcon className="w-8 h-8" /> : <PauseIcon className="w-8 h-8" />}
        </button>
        <button 
          onClick={(e) => handleControlClick(e, onClose)} 
          className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
        >
          <CloseIcon className="w-8 h-8" />
        </button>
      </div>
      
      <button 
        onClick={(e) => handleControlClick(e, goToPrev)} 
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors z-10"
      >
        <PrevIcon className="w-8 h-8" />
      </button>
      <button 
        onClick={(e) => handleControlClick(e, goToNext)} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors z-10"
      >
        <NextIcon className="w-8 h-8" />
      </button>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
        .animate-zoom-in {
            animation: zoom-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
};

export default Slideshow;
