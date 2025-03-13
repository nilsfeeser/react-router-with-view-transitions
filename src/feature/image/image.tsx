import {useContext, useEffect, useState} from "react";
import {TransitionContext} from "../page-transition.tsx";
import {useImageCache} from "../image-cache.tsx";
import "./image.css";

export const Image = ({src, alt, className}: { src: string; alt?: string; className?: string }) => {
    const {isTransitioning} = useContext(TransitionContext);
    const {cache, addImageToCache} = useImageCache();
    const [loaded, setLoaded] = useState(cache.get(src) || false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!loaded || isTransitioning) return;
        setVisible(true);
    }, [loaded, isTransitioning]);

    useEffect(() => {
        if (!cache.has(src)) return;
        setLoaded(true);
    }, [src, cache]);

    const onLoad = (src: string) => {
        setLoaded(true);
        addImageToCache(src);
    }

    return (
        <div className={`image ${className} ${visible ? "loaded" : ""}`}>
            <img
                src={src}
                alt={alt}
                onLoad={() => {
                    onLoad(src);
                }}
                className={`fade-in-image`}
            />
        </div>
    );
};
