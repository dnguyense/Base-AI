import { useState, useEffect, useRef, useCallback } from 'react';

interface UseImageLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

interface UseImageLazyLoadingReturn {
  imgRef: React.RefObject<HTMLImageElement | null>;
  src: string | undefined;
  isLoaded: boolean;
  isInView: boolean;
  error: boolean;
}

export const useImageLazyLoading = (
  imageSrc: string,
  options: UseImageLazyLoadingOptions = {}
): UseImageLazyLoadingReturn => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    fallbackSrc,
    onLoad,
    onError
  } = options;

  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [src, setSrc] = useState<string | undefined>();

  // Intersection Observer to detect when image enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    const currentImg = imgRef.current;
    if (currentImg) {
      observer.observe(currentImg);
    }

    return () => {
      if (currentImg) {
        observer.unobserve(currentImg);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  // Load image when in view
  useEffect(() => {
    if (isInView && !src) {
      const img = new Image();
      
      img.onload = () => {
        setSrc(imageSrc);
        setIsLoaded(true);
        setError(false);
        onLoad?.();
      };
      
      img.onerror = () => {
        setError(true);
        if (fallbackSrc) {
          setSrc(fallbackSrc);
        }
        onError?.();
      };
      
      img.src = imageSrc;
    }
  }, [isInView, imageSrc, src, fallbackSrc, onLoad, onError]);

  return {
    imgRef,
    src,
    isLoaded,
    isInView,
    error
  };
};

// Component wrapper for easy usage
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  alt: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  fallbackSrc,
  threshold,
  rootMargin,
  onLoad,
  onError,
  className = '',
  alt,
  ...props
}) => {
  const { imgRef, src: lazySrc, isLoaded, error } = useImageLazyLoading(src, {
    threshold,
    rootMargin,
    fallbackSrc,
    onLoad,
    onError
  });

  return (
    <img
      ref={imgRef}
      src={lazySrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      {...props}
    />
  );
};