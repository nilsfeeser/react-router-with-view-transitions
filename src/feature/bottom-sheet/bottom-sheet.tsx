import React, { ReactNode, useRef, useEffect } from "react";
import "./bottom-sheet.css";

const useBackgroundTapToDismiss = (backgroundElementRef: React.RefObject<HTMLElement | null>, dismiss: () => void) => {
  useEffect(() => {
    if (!backgroundElementRef.current) return;

    const backgroundElement = backgroundElementRef.current;
    const pointerStart: { x: undefined | number; y: undefined | number } = { x: undefined, y: undefined };

    registerEventListener(backgroundElement);

    function handlePointerDown(event: PointerEvent) {
      event.preventDefault();
      event.stopPropagation();
      pointerStart.x = event.clientX;
      pointerStart.y = event.clientY;
    }

    function handlePointerMove(event: Event) {
      event.preventDefault();
      event.stopPropagation();
    }

    function handlePointerUp(event: PointerEvent) {
      if (pointerStart.x === undefined || pointerStart.y === undefined) return;
      const pointerEnd = { x: event.clientX, y: event.clientY };
      const pointerDelta = {
        x: Math.abs(pointerEnd.x - pointerStart.x || 0),
        y: Math.abs(pointerEnd.y - pointerStart.y || 0),
      };
      const didMove = pointerDelta.x > 5 || pointerDelta.y > 5;
      if (didMove) {
        return;
      }
      dismiss();
    }

    function registerEventListener(target: HTMLElement) {
      target.addEventListener("pointerdown", handlePointerDown, { passive: false });
      ["mousemove", "touchmove"].forEach((eventName) => {
        target.addEventListener(eventName, handlePointerMove, { passive: false });
      });
      target.addEventListener("pointerup", handlePointerUp);
    }

    function unregisterEventListener(target: HTMLElement) {
      target.removeEventListener("pointerdown", handlePointerDown);
      ["mousemove", "touchmove"].forEach((eventName) => {
        target.removeEventListener(eventName, handlePointerMove);
      });
      target.removeEventListener("pointerup", handlePointerUp);
    }

    return () => {
      unregisterEventListener(backgroundElement);
    };
  }, [backgroundElementRef, dismiss]);
};

const usePreventBackgroundScrolling = (
  needsDisabledScrolling: boolean,
  scrollableContentElementRef: React.RefObject<HTMLElement | null>,
) => {
  // disable scrolling. this can cause momentum scrolling
  // when dragging the bottom sheet down
  useEffect(() => {
    if (needsDisabledScrolling) disableScroll();
    if (!needsDisabledScrolling) enableScroll();
  }, [needsDisabledScrolling]);

  // prevent momentum scrolling on end of a fast touch move
  useEffect(() => {
    if (needsDisabledScrolling) {
      window.addEventListener("pointermove", preventScrolling, { passive: false });
    } else {
      window.removeEventListener("pointermove", preventScrolling);
    }

    return () => {
      window.removeEventListener("pointermove", preventScrolling);
    };
  }, [needsDisabledScrolling]);

  // allow scrolling on the actual content element
  useEffect(() => {
    if (!scrollableContentElementRef.current) return;
    const scrollableContentElement = scrollableContentElementRef.current;
    scrollableContentElement.addEventListener("pointermove", stopPropagation);

    return () => {
      scrollableContentElement.removeEventListener("pointermove", stopPropagation);
    };
  }, [scrollableContentElementRef]);

  function disableScroll() {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;
  }

  function enableScroll() {
    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
  }

  function stopPropagation(event: PointerEvent) {
    event.stopPropagation();
  }

  function preventScrolling(event: PointerEvent) {
    event.preventDefault();
  }
};

const useDragToDismiss = (
  componentElementRef: React.RefObject<HTMLDivElement | null>,
  containerElementRef: React.RefObject<HTMLDivElement | null>,
  backgroundElementRef: React.RefObject<HTMLDivElement | null>,
  contentElementRef: React.RefObject<HTMLDivElement | null>,
  elasticElementRef: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean,
  dismiss: () => void,
  options: { dismissDistance?: number; elasticDrag?: boolean } = {},
): boolean => {
  const pointerStartY = useRef(0);
  const isUserInteracting = useRef(false);
  const isDragging = useRef(false);

  useEffect(() => {
    if (
      !isOpen ||
      !containerElementRef.current ||
      !backgroundElementRef.current ||
      !componentElementRef.current ||
      !elasticElementRef.current ||
      !contentElementRef.current
    )
      return;

    const settings = { ...{ dismissDistance: 80, elasticDrag: false }, ...options };

    const componentElement: HTMLDivElement = componentElementRef.current;
    const contentElement: HTMLDivElement = contentElementRef.current;
    const containerElement: HTMLDivElement = containerElementRef.current;
    const backgroundElement: HTMLDivElement = backgroundElementRef.current;
    const elasticElement: HTMLDivElement = elasticElementRef.current;

    let moveDistance = 0; // used to determine if the user dragged the element far enough to dismiss it
    let moveDirection: "none" | "up" | "down" = "none";
    let pointerPreviousY = 0; // used to determine the direction of the move
    let isScrollingContent = false;
    pointerStartY.current = 0;
    isDragging.current = false;
    const containerHeight = containerElement.clientHeight;
    let scrollTopAtPointerDown = 0;

    const on = function (
      node: Node,
      selector: string | null,
      eventName: string,
      callback: Function,
      options?: AddEventListenerOptions | undefined,
    ) {
      const eventListener = function (event: Event) {
        let { target } = event;

        if (selector === null) {
          callback.call(null, event, target);
          return;
        }

        while (target !== null) {
          if (target instanceof HTMLElement && target.matches(selector)) {
            callback.call(null, event, target);
            break;
          }
          target = (target as HTMLElement).parentElement;
        }
      };

      node.addEventListener(eventName, eventListener, options);

      return { node, eventName, listener: eventListener, options };
    };

    const listenerRegistry = new Set<{
      node: Node;
      eventName: string;
      listener: EventListener;
      options: AddEventListenerOptions | undefined;
    }>();

    const eventHandler = {
      registerEventHandler: (target: HTMLElement, selector: string) => {
        // we add the starting eventlistener right on the handle but the move and end listener on the documnet
        // this way we can ensure that we can still drag the element even if the pointer leaves the handle
        ["mousedown", "touchstart"].forEach((eventName) => {
          listenerRegistry.add(on(target, selector, eventName, eventHandler.handlePointerDown));
        });
        ["mousemove", "touchmove"].forEach((eventName) => {
          listenerRegistry.add(on(target, selector, eventName, eventHandler.handlePointerMove));
        });

        ["mouseup", "touchend"].forEach((eventName) => {
          listenerRegistry.add(on(document, selector, eventName, eventHandler.handlePointerUp));
        });
      },
      unregisterEventHandler: () => {
        listenerRegistry.forEach((listener) => {
          listener.node.removeEventListener(listener.eventName, listener.listener, listener.options);
        });
      },
      handlePointerDown: (event: Event, target?: HTMLElement) => {
        const isScrollableTarget = target instanceof HTMLElement && target.scrollHeight > target.clientHeight;
        scrollTopAtPointerDown = contentElement.scrollTop;

        const clientY =
          event instanceof TouchEvent ? event.touches[0].clientY : event instanceof MouseEvent ? event.clientY : 0;

        if (isScrollableTarget) {
          pointerPreviousY = clientY;
          return;
        }
        // prevents momentum scrolling
        event.preventDefault();

        dragging.startDrag(clientY);
      },
      handlePointerMove: (event: Event, target?: HTMLElement) => {
        event.stopPropagation();

        const clientY =
          event instanceof TouchEvent ? event.touches[0].clientY : event instanceof MouseEvent ? event.clientY : 0;

        const moveDirection = clientY >= pointerPreviousY ? "down" : "up";
        const isScrollableTarget = target instanceof HTMLElement && target.scrollHeight > target.clientHeight;

        if (isDragging.current) {
          dragging.moveDrag(clientY);
          event.preventDefault();
          return;
        }

        if (!isScrollingContent && isScrollableTarget && moveDirection === "down" && scrollTopAtPointerDown === 0) {
          dragging.startDrag(clientY);
        } else {
          isScrollingContent = true;
          return;
        }

        event.stopPropagation();
        event.preventDefault();
      },
      handlePointerUp: () => {
        isScrollingContent = false;
        if (!isDragging.current) return;
        dragging.endDrag();
        if (moveDistance <= settings.dismissDistance || moveDirection === "up") return;
        dismiss();
      },
    };

    const dragging = {
      startDrag: (pointerY: number) => {
        isDragging.current = true;
        componentElement.classList.add("is-user-interacting");
        isUserInteracting.current = true;
        moveDistance = 0;
        pointerStartY.current = pointerY;
        dragging.updateBackgroundOpacity(moveDistance);
      },
      moveDrag: (clientY: number) => {
        if (settings.elasticDrag) dragging.elasticDrag(clientY);
        moveDistance = Math.max(0, clientY - pointerStartY.current);
        moveDirection = clientY > pointerPreviousY ? "down" : "up";
        pointerPreviousY = clientY;
        containerElement.style.transform = `translateY(${moveDistance}px)`;
        dragging.updateBackgroundOpacity(moveDistance);
      },
      endDrag: () => {
        isDragging.current = false;
        componentElement.classList.remove("is-user-interacting");
        isUserInteracting.current = false;
        pointerPreviousY = 0;
        backgroundElement.style.opacity = "";
        elasticElement.setAttribute("style", "");
        containerElement.setAttribute("style", "");
      },
      elasticDrag: (clientY: number) => {
        let moveDistance = clientY - pointerStartY.current;
        if (moveDistance < 0) {
          moveDistance /= 14;
          elasticElement.style.height = `${-moveDistance}px`;
          containerElement.style.maxHeight = `${containerHeight - moveDistance}px`;
        }
      },
      updateBackgroundOpacity: (moveDistance: number) => {
        const opacity = Math.max(0.3, 1 - moveDistance / containerElement.clientHeight);
        if (opacity === 1) {
          backgroundElement.style.opacity = "";
          return;
        }
        backgroundElement.style.opacity = `${opacity}`;
      },
    };

    eventHandler.registerEventHandler(componentElement, ".bottom-sheet-handle, .bottom-sheet-content");

    return () => {
      eventHandler.unregisterEventHandler();
    };
  }, [
    isOpen,
    dismiss,
    containerElementRef,
    backgroundElementRef,
    contentElementRef.current,
    componentElementRef,
    elasticElementRef,
    options,
  ]);

  return isUserInteracting.current;
};

type BottomSheetProps = { isOpen: boolean; onDismiss: () => void; children: ReactNode; ctaChildren?: ReactNode };

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onDismiss, children, ctaChildren }) => {
  const componentElementRef = useRef<HTMLDivElement>(null);
  const containerElementRef = useRef<HTMLDivElement>(null);
  const backgroundElementRef = useRef<HTMLDivElement>(null);
  const contentElementRef = useRef<HTMLDivElement>(null);
  const elasticElementRef = useRef<HTMLDivElement>(null);

  useBackgroundTapToDismiss(backgroundElementRef, onDismiss);

  const isUserInteracting = useDragToDismiss(
    componentElementRef,
    containerElementRef,
    backgroundElementRef,
    contentElementRef,
    elasticElementRef,
    isOpen,
    onDismiss,
    { elasticDrag: true },
  );

  usePreventBackgroundScrolling(isOpen, contentElementRef);

  useEffect(() => {
    if (isOpen && contentElementRef) {
      contentElementRef.current?.scrollTo(0, 0);
    }
  }, [isOpen]);

  // TODO: remove component from DOM when closing animation is finished

  return (
    <div
      className={`bottom-sheet-component ${isOpen ? "open" : ""} ${isUserInteracting ? "is-user-interacting" : ""}`}
      ref={componentElementRef}>
      <div className="bottom-sheet-background" ref={backgroundElementRef} />
      <div className={`bottom-sheet-container`} ref={containerElementRef}>
        <div className="bottom-sheet-handle" />
        <div className="bottom-sheet-elastic-element" ref={elasticElementRef} />
        <div className="bottom-sheet-content" ref={contentElementRef}>
          {children}
        </div>
        {ctaChildren && <div className="bottom-sheet-cta">{ctaChildren}</div>}
      </div>
    </div>
  );
};
