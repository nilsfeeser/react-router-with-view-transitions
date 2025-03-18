import {useRef, useEffect} from "react";
import './resizing-element.css';

export const ResizingElement = ({children, ...props}: {
    children: React.ReactNode
} & React.HTMLAttributes<HTMLElement>) => {
    const contentElementRef = useRef<HTMLDivElement>(null);

    const updateHeight = () => {
        if (!contentElementRef.current) {
            return;
        }
        const element = contentElementRef.current;
        const height = element.scrollHeight;
        element.style.height = `${height}px`;


        if (children === '') {
            return;
        }

        element.classList.add('visible');
    };

    useEffect(() => {
        updateHeight();
    }, [children, contentElementRef.current]);

    return <div className="resizing-element" {...props} ref={contentElementRef}>{children}</div>;
};