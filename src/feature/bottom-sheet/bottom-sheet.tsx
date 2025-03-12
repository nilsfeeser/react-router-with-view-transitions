import React, {useState, ReactNode, useRef, useEffect} from "react";
import './bottom-sheet.css';

export const useBackgroundTapToDismiss = (backgroundElementRef: React.RefObject<HTMLElement | null>, dismiss: () => void) => {
    useEffect(() => {
        console.log('-- ', backgroundElementRef)
        const pointerStart: { x: undefined | number, y: undefined | number } = {x: undefined, y: undefined};
        if (!backgroundElementRef.current) return;

        const backgroundElement = backgroundElementRef.current
        const handlePointerDown = (event: PointerEvent) => {
            event.preventDefault();
            event.stopPropagation();
            pointerStart.x = event.clientX;
            pointerStart.y = event.clientY;
        };

        const handlePointerMove = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (pointerStart.x === undefined || pointerStart.y === undefined) return;
            const pointerEnd = {x: event.clientX, y: event.clientY};
            const pointerDelta = {
                x: Math.abs(pointerEnd.x - pointerStart.x || 0),
                y: Math.abs(pointerEnd.y - pointerStart.y || 0)
            };
            const didMove = pointerDelta.x > 5 || pointerDelta.y > 5;
            if (didMove) {
                return;
            }
            dismiss();
        };

        backgroundElement.addEventListener("pointerdown", handlePointerDown, {passive: false});
        ['mousemove', 'touchmove'].forEach(eventName => {
            backgroundElement.addEventListener(eventName, handlePointerMove, {passive: false});
        });
        backgroundElement.addEventListener("pointerup", handlePointerUp);

        return () => {
            backgroundElement.removeEventListener("pointerdown", handlePointerDown);
            ['mousemove', 'touchmove'].forEach(eventName => {
                backgroundElement.removeEventListener(eventName, handlePointerMove);
            });
            backgroundElement.removeEventListener("pointerup", handlePointerUp);
        };
    }, [backgroundElementRef.current, dismiss]);
};

const usePreventBackgroundScrolling = (disableScrolling: boolean, scrollableContentElementRef: React.RefObject<HTMLElement | null>) => {
    // disable scrolling. this can cause momentum scrolling
    // when dragging the bottom sheet down
    useEffect(() => {
        if (disableScrolling) disableScroll();
        if (!disableScrolling) enableScroll();
    }, [
        disableScrolling
    ])

    function disableScroll() {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${scrollY}px`;
    }

    function enableScroll() {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // prevent momentum scrolling on end of a fast touch move
    useEffect(() => {
        if (disableScrolling) {
            window.addEventListener('pointermove', preventScrolling, {passive: false});
        } else {
            window.removeEventListener('pointermove', preventScrolling);
        }

        return () => {
            window.removeEventListener('pointermove', preventScrolling);
        }
    }, [disableScrolling]);

    // allow scrolling on the actual content element
    useEffect(() => {
        if (!scrollableContentElementRef.current) return;
        const scrollableContentElement = scrollableContentElementRef.current;
        scrollableContentElement.addEventListener('pointermove', stopPropagation);

        return () => {
            scrollableContentElement.removeEventListener('pointermove', stopPropagation);
        }
    }, [disableScrolling, scrollableContentElementRef])

    function stopPropagation(event: PointerEvent) {
        event.stopPropagation()
    }

    function preventScrolling(event: PointerEvent) {
        event.preventDefault();
    }
}

const useDragToDismiss = (
    draggableElementRef: React.RefObject<HTMLDivElement | null>,
    isOpen: boolean,
    dismiss: () => void
): [number, (event: React.PointerEvent<HTMLDivElement>) => void, string] => {
    const [translateY, setTranslateY] = useState<number>(0);
    const pointerStartY = useRef(0);
    const containerClassName = useRef('animated');
    const isDragging = useRef(false);

    useEffect(() => {
        if (!isOpen || !draggableElementRef.current) return;

        const draggableElement: HTMLDivElement = draggableElementRef.current;

        let moveDistance = 0;
        setTranslateY(0);
        pointerStartY.current = 0;
        isDragging.current = false;

        const handlePointerDown = (event: Event) => {
            // prevents momentum scrolling
            event.preventDefault();
        }

        const handlePointerMove = (event: Event) => {
            if (!isDragging.current) return;

            const clientY =
                event instanceof TouchEvent
                    ? event.touches[0].clientY
                    : event instanceof MouseEvent
                        ? event.clientY : 0;

            moveDistance = Math.max(0, clientY - pointerStartY.current);

            setTranslateY(moveDistance);
        };

        const handlePointerUp = () => {
            isDragging.current = false;
            containerClassName.current = 'animated';
            setTranslateY(0);

            if (moveDistance <= 200) {
                pointerStartY.current = 0;
                return;
            }

            dismiss();
        };

        // we add the starting eventlistener right on the handle but the move and end listener on the documnet
        // this way we can ensure that we can still drag the element even if the pointer leaves the handle
        ['mousedown', 'touchstart'].forEach((eventName) => {
            draggableElement.addEventListener(eventName, handlePointerDown, {passive: false});
        });

        ['mousemove', 'touchmove'].forEach(event => {
            document.addEventListener(event, handlePointerMove, {passive: false});
        });

        ['mouseup', 'touchend'].forEach(event => {
            document.addEventListener(event, handlePointerUp);
        });

        return () => {
            ['mousedown', 'touchstart'].forEach(event => {
                draggableElement.removeEventListener(event, handlePointerDown);
            });
            ['mousemove', 'touchmove'].forEach(event => {
                document.removeEventListener(event, handlePointerMove);
            });
            ['mouseup', 'touchend'].forEach(event => {
                document.removeEventListener(event, handlePointerUp);
            });
        };
    }, [isOpen, dismiss, draggableElementRef]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        containerClassName.current = '';
        isDragging.current = true;
        pointerStartY.current = event.clientY;
        setTranslateY(0);
    };

    return [
        translateY,
        handlePointerDown,
        containerClassName.current
    ];
};

type BottomSheetProps = {
    isOpen: boolean;
    onDismiss: () => void;
    children: ReactNode;
};

export const BottomSheet: React.FC<BottomSheetProps> = ({isOpen, onDismiss, children}) => {
    const backgroundElementRef = useRef<HTMLDivElement>(null);
    const contentElementRef = useRef<HTMLDivElement>(null);
    const dragHandleRef = useRef<HTMLDivElement>(null);

    useBackgroundTapToDismiss(backgroundElementRef, onDismiss);
    const [translateY, handlePointerDown, transitioningClassName] = useDragToDismiss(
        dragHandleRef,
        isOpen,
        onDismiss
    );
    usePreventBackgroundScrolling(isOpen, contentElementRef);

    useEffect(() => {
        if (isOpen && contentElementRef) {
            contentElementRef.current?.scrollTo(0, 0);
        }
    }, [isOpen]);


    return (
        <div className={`bottom-sheet-component ${isOpen ? 'open' : ''}`}>
            <div
                className="bottom-sheet-background"
                ref={backgroundElementRef}
                style={{opacity: isOpen ? 0.5 : 0}}
            />

            <div className={`bottom-sheet-content ${transitioningClassName} ${isOpen ? 'open' : ''}`}
                 style={translateY ? {transform: `translateY(${translateY}px)`} : {}}>

                <div className="bottom-sheet-handle" ref={dragHandleRef} onPointerDown={handlePointerDown}/>
                <div className="bottom-sheet-content-inner" ref={contentElementRef}>
                    {children}
                </div>
            </div>
        </div>
    );
};
