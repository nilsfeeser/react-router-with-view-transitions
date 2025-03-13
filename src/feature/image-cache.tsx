import React, {createContext, useContext, useState} from "react";

type ImageCacheContextType = {
    cache: Map<string, boolean>;
    addImageToCache: (src: string) => void;
};

const ImageCacheContext = createContext<ImageCacheContextType | null>(null);

export const ImageCacheProvider = ({children}: { children: React.ReactNode }) => {
    const [cache] = useState(new Map<string, boolean>());
    const addImageToCache = (src: string) => {
        cache.set(src, true);
    };

    return (
        <ImageCacheContext.Provider value={{cache, addImageToCache}}>
            {children}
        </ImageCacheContext.Provider>
    );
};

export const useImageCache = () => {
    const context = useContext(ImageCacheContext);
    if (!context) {
        throw new Error("useImageCache must be used within an ImageCacheProvider");
    }
    return context;
};
