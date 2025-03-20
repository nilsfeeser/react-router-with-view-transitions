import { useEffect, useState } from "react";
import { usePageTransitionState } from "../page-transition.tsx";
import { useImageCache } from "../image-cache.tsx";
import "./image.css";

interface ImageProps {
  src: string;
  alt?: string;
  className?: string;
  onLoaded?: (src: string) => void;
  forceFadeIn?: boolean;
}

/*
 * Image component that loads an image from a URL and caches its loading state
 * Loading state is cached so that it can be reused when the same image is loaded again
 * in that case the image is just not animated
 *
 * a cummon use case is to fade in the image once it is leaded the first time and show it
 * without the fade in effect when navigating back to the page. In that case the image is
 * displayed without an unnecessary and irriating animation.
 */
export const Image = ({ src, alt, className, forceFadeIn }: ImageProps) => {
  const { isTransitioning } = usePageTransitionState();
  const { cache, addImageToCache } = useImageCache();
  const [loaded, setLoaded] = useState(forceFadeIn === true ? false : cache.get(src) || false);
  const [visible, setVisible] = useState(forceFadeIn === true ? false : cache.get(src) || false);

  useEffect(() => {
    if (!loaded || isTransitioning) return;
    setVisible(true);
  }, [loaded, isTransitioning]);

  const onLoad = () => {
    setLoaded(true);
    addImageToCache(src);
  };

  return (
    <div className={`image ${className} ${visible ? "loaded" : ""}`}>
      <img src={src} alt={alt} onLoad={onLoad} />
    </div>
  );
};
