import {useContext, useEffect, useState} from "react";
import {TransitionContext} from "../page-transition.tsx";
import "./image.css";

interface ImageProps {
    src: string;
    alt?: string;
    className?: string;
    onLoaded?: (src: string) => void;
}

export const Image = ({src, alt, className}: ImageProps) => {
    const {isTransitioning} = useContext(TransitionContext);
    //const {cache, addImageToCache} = useImageCache();
    const [loaded, setLoaded] = useState(/*cache.get(src) || */false);
    const [visible, setVisible] = useState(false);
    console.log('loaded', loaded)

    useEffect(() => {
        if (!loaded || isTransitioning) return;
        setVisible(true);
    }, [loaded, isTransitioning]);

    const onLoad = () => {
        setLoaded(true);
    }

    return (
        <div className={`image ${className} ${visible ? "loaded" : ""}`}>
            <img
                src={src}
                alt={alt}
                onLoad={onLoad}
                className={`fade-in-image`}
            />
        </div>
    );
};
