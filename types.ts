
export interface ImageMetadata {
  id: string;
  title: string;
  image_url: string;
  data: string;
  source: string;
  description: string;
  type: 'image' | 'video';
  thumbnail?: string;
  tags: string[];
}

export interface TransformState {
  x: number;
  y: number;
  rot: number;
  scale: number;
  z: number;
}

export interface ImageState extends ImageMetadata {
  transform: TransformState;
}