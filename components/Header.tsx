
import React from 'react';
import { SearchIcon, PlayIcon, ShuffleIcon } from './icons';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  onPlayClick: () => void;
  onShuffleClick: () => void;
  tags: string[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  onPlayClick,
  onShuffleClick,
  tags,
  activeTag,
  onSelectTag,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
      {/* Left Group */}
      <div className="flex-shrink-0 flex items-center gap-4 pointer-events-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-gray-800 bg-opacity-70 text-white placeholder-gray-400 border border-gray-600 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon className="w-5 h-5" />
          </div>
        </div>
        <button
          onClick={onShuffleClick}
          className="bg-gray-800 bg-opacity-70 text-white rounded-full p-2.5 shadow-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Shuffle Postcards"
        >
          <ShuffleIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Center Group - Filters */}
      {tags.length > 0 && (
        <div className="flex-1 flex justify-center items-center pointer-events-auto px-4">
          <div className="p-1.5 bg-gray-800 bg-opacity-70 rounded-full shadow-lg flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => onSelectTag(null)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                activeTag === null
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeTag === tag
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Right Group */}
      <div className="flex-shrink-0 pointer-events-auto">
        <button
          onClick={onPlayClick}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          aria-label="Start Slideshow"
        >
          <PlayIcon className="w-8 h-8" />
        </button>
      </div>
    </header>
  );
};

export default Header;
