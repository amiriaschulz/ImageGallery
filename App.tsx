import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ImageState, ImageMetadata } from "./types";
import Header from "./components/Header";
import Postcard from "./components/Postcard";
import MediaModal from "./components/ImageModal";
import Slideshow from "./components/Slideshow";
import LoadingSpinner from "./components/LoadingSpinner";

const PlaceholderLogo: React.FC = () => (
  <div
    className="absolute bottom-4 left-4 z-0 opacity-50 pointer-events-none"
    style={{ width: "200px" }}
  >
    <img
      src="logo.png"
      className="w-48 h-auto"
      style={{ filter: "drop-shadow(0 0 8px #0008)" }}
      draggable={false}
    />
  </div>
);

const TOP_OFFSET = 100; // Safe area height in pixels for the header

const App: React.FC = () => {
  const [images, setImages] = useState<ImageState[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(
    null
  );
  const [isSlideshowActive, setSlideshowActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredImageUrl, setHoveredImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch("./images.json")
      .then((res) => res.json())
      .then((imagesData: ImageMetadata[]) => {
        const initializedImages = imagesData.map((img, index) => ({
          ...img,
          transform: {
            x: Math.random() * (window.innerWidth - 350),
            y:
              TOP_OFFSET +
              Math.random() * (window.innerHeight - 350 - TOP_OFFSET),
            rot: Math.random() * 40 - 20,
            scale: Math.random() * 0.2 + 0.8,
            z: index,
          },
        }));
        setImages(initializedImages);
      })
      .catch((error) => console.error("Failed to load images data:", error))
      .finally(() => {
        setTimeout(() => setIsLoading(false), 500);
      });
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const params = new URLSearchParams(window.location.search);
    const imageId = params.get("image_id");
    if (imageId && images.length > 0) {
      const imageToSelect = images.find((img) => img.id === imageId);
      if (imageToSelect) {
        setSelectedImage(imageToSelect);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, isLoading]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    images.forEach((img) => img.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [images]);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const matchesSearch =
        !searchQuery ||
        img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = !activeTag || img.tags.includes(activeTag);

      return matchesSearch && matchesTag;
    });
  }, [images, searchQuery, activeTag]);

  const handleBringToFront = useCallback((imageId: string) => {
    setImages((prevImages) => {
      if (prevImages.length === 0) return prevImages;
      const maxZ = Math.max(...prevImages.map((img) => img.transform.z));
      return prevImages.map((img) =>
        img.id === imageId
          ? { ...img, transform: { ...img.transform, z: maxZ + 1 } }
          : img
      );
    });
  }, []);

  const handleShuffle = useCallback(() => {
    setImages((currentImages) =>
      currentImages.map((img) => ({
        ...img,
        transform: {
          ...img.transform,
          x: Math.random() * (window.innerWidth - 350),
          y:
            TOP_OFFSET +
            Math.random() * (window.innerHeight - 350 - TOP_OFFSET),
          rot: Math.random() * 40 - 20,
        },
      }))
    );
  }, []);

  const handleHover = useCallback((image: ImageMetadata | null) => {
    setHoveredImageUrl(image ? image.thumbnail || image.image_url : null);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900 text-white font-sans">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: hoveredImageUrl ? `url(${hoveredImageUrl})` : "none",
          opacity: hoveredImageUrl ? 0.1 : 0,
          filter: "blur(20px)",
        }}
      />

      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <Header
            onSearchChange={setSearchQuery}
            onPlayClick={() => setSlideshowActive(true)}
            onShuffleClick={handleShuffle}
            tags={allTags}
            activeTag={activeTag}
            onSelectTag={setActiveTag}
          />

          <main className="w-full h-full">
            {filteredImages.map((image) => (
              <Postcard
                key={image.id}
                image={image}
                onSelect={() => setSelectedImage(image)}
                bringToFront={() => handleBringToFront(image.id)}
                onHover={handleHover}
              />
            ))}
          </main>

          <div className="absolute bottom-4 left-4 z-0 text-gray-800 opacity-50 pointer-events-none">
            <PlaceholderLogo />
          </div>

          <div className="absolute bottom-4 right-4 z-0 max-w-sm text-right text-xs text-gray-500 pointer-events-none">
            <p>
              Disclaimer: Images are for viewing purposes only. Do not
              redistribute, copy, or use without permission.
            </p>
            <p>
              <b>Amiria Schulz, Australia, 2025.</b>
            </p>
          </div>

          {selectedImage && (
            <MediaModal
              image={selectedImage}
              onClose={() => setSelectedImage(null)}
              allImages={images}
              onSelectAnother={setSelectedImage}
            />
          )}

          {isSlideshowActive && (
            <Slideshow
              images={images}
              onClose={() => setSlideshowActive(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
