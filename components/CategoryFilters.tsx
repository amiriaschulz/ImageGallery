
import React from 'react';

interface CategoryFiltersProps {
  tags: string[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({ tags, activeTag, onSelectTag }) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 p-2 bg-gray-800 bg-opacity-70 rounded-full shadow-lg flex items-center justify-center gap-2 flex-wrap">
      <button
        onClick={() => onSelectTag(null)}
        className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
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
          className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
            activeTag === tag
              ? 'bg-blue-600 text-white font-semibold'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilters;
