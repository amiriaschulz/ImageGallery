import React, { useState, useEffect, useMemo } from "react";
import { ImageMetadata } from "../types";
import { CloseIcon, ShareIcon, CopyIcon, DownloadIcon } from "./icons";

interface MediaModalProps {
  image: ImageMetadata;
  onClose: () => void;
  allImages: ImageMetadata[];
  onSelectAnother: (image: ImageMetadata) => void;
}

const MediaModal: React.FC<MediaModalProps> = ({
  image,
  onClose,
  allImages,
  onSelectAnother,
}) => {
  const [shareText, setShareText] = useState("Share");
  const [copyText, setCopyText] = useState("Copy");

  const relatedImages = useMemo(() => {
    const matches = allImages.filter(
      (item) =>
        item.id !== image.id &&
        item.tags.some((tag) => image.tags.includes(tag))
    );
    // Shuffle the matches array
    for (let i = matches.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [matches[i], matches[j]] = [matches[j], matches[i]];
    }
    return matches.slice(0, 4);
  }, [allImages, image]);

  const hasRelatedImages = relatedImages.length > 0;

  const [activeTab, setActiveTab] = useState<"related" | "sources">(
    hasRelatedImages ? "related" : "sources"
  );

  useEffect(() => {
    // Reset button texts and active tab when image changes
    setShareText("Share");
    setCopyText("Copy");
    setActiveTab(hasRelatedImages ? "related" : "sources");
  }, [image, hasRelatedImages]);

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?image_id=${image.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShareText("Copied!");
        setTimeout(() => setShareText("Share"), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
        setShareText("Failed");
        setTimeout(() => setShareText("Share"), 2000);
      });
  };

  const handleCopy = async () => {
    if (image.type === "video") {
      setCopyText("N/A for video");
      setTimeout(() => setCopyText("Copy"), 2000);
      return;
    }
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopyText("Copied!");
    } catch (err) {
      console.error("Failed to copy image: ", err);
      setCopyText("Failed");
    } finally {
      setTimeout(() => setCopyText("Copy"), 2000);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      const extension =
        image.type === "video" ? "mp4" : blob.type.split("/")[1] || "jpg";
      const fileName = `${image.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.${extension}`;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download file:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] animate-zoom-in"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900 text-white rounded-lg shadow-2xl w-11/12 max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full bg-black flex-shrink-0 flex items-center justify-center">
          {image.type === "video" ? (
            <video
              src={image.image_url}
              className="max-w-full max-h-[60vh] object-contain"
              controls
              autoPlay
              loop
              key={image.id}
            />
          ) : (
            <img
              src={image.image_url}
              alt={image.title}
              className="max-w-full max-h-[60vh] object-contain"
            />
          )}
        </div>

        <div className="w-full p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="flex justify-between items-start mb-4 gap-4">
            <h2 className="text-2xl font-bold">{image.title}</h2>
            <div className="flex-shrink-0 flex items-center gap-2">
              {image.type === "image" && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md text-sm transition-colors"
                >
                  <CopyIcon className="w-4 h-4" />
                  {copyText}
                </button>
              )}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md text-sm transition-colors"
              >
                <DownloadIcon className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md text-sm transition-colors"
              >
                <ShareIcon className="w-4 h-4" />
                {shareText}
              </button>
            </div>
          </div>

          <p className="text-gray-300 mb-6">{image.description}</p>

          <div className="w-full">
            {/* Tab Headers */}
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {hasRelatedImages && (
                  <button
                    onClick={() => setActiveTab("related")}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "related"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                    }`}
                  >
                    Related Items
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("sources")}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "sources"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                  }`}
                >
                  Data Sources
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="pt-6">
              {activeTab === "related" && hasRelatedImages && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {relatedImages.map((related) => (
                    <div
                      key={related.id}
                      className="cursor-pointer group"
                      onClick={() => onSelectAnother(related)}
                    >
                      <img
                        src={related.thumbnail || related.image_url}
                        alt={related.title}
                        className="w-full h-24 object-cover rounded-md group-hover:opacity-80 transition-opacity"
                      />
                      <p className="text-xs mt-1 text-gray-300 truncate">
                        {related.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "sources" && (
                <div className="flex items-center gap-6">
                  <a
                    href={image.data}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Raw Data
                  </a>
                  <a
                    href={image.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Source Link
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/30 rounded-full p-1"
      >
        <CloseIcon className="w-8 h-8" />
      </button>
      <style>{`
        @keyframes zoom-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-zoom-in {
            animation: zoom-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
};

export default MediaModal;
