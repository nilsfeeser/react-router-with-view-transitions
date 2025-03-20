import React, { createContext, MouseEvent, ReactNode, useContext, useEffect, useState } from "react";
import { Link, useNavigate, type To } from "react-router-dom";

interface TransitionContextType {
  setTransition: (transition: "push" | "pop") => void;
  transition: "push" | "pop";
  isTransitioning: boolean;
  setIsTransitioning: (isTransitioning: boolean) => void;
}

export const TransitionContext = createContext<TransitionContextType>({} as TransitionContextType);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [transition, setTransition] = useState<"push" | "pop">("push");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  return (
    <TransitionContext.Provider value={{ transition, setTransition, isTransitioning, setIsTransitioning }}>
      <TransitionStyles />
      {children}
    </TransitionContext.Provider>
  );
}

export const usePageTransitionState = () => {
  const { isTransitioning } = useContext(TransitionContext);
  const [pageTransitionDidComplete, setPageTransitionDidComplete] = useState(false);
  useEffect(() => {
    if (isTransitioning || pageTransitionDidComplete) return;
    setPageTransitionDidComplete(true);
  }, [isTransitioning, pageTransitionDidComplete, setPageTransitionDidComplete]);
  return { pageTransitionDidComplete, isTransitioning };
};

const TransitionStyles = () => {
  const { transition } = useContext(TransitionContext);

  const speed = 350;
  const animationDelay = 20;

  const TRANSITION_STYLES: Record<"push" | "pop", string> = {
    push: `
      ::view-transition-old(root) {
        animation: ${speed}ms ease both push-move-out-left; 
        animation-delay: ${animationDelay}ms;
      }
      ::view-transition-new(root) {
        animation: ${speed}ms ease both push-move-in-from-right;
        animation-delay: ${animationDelay}ms;
      }
    `,
    pop: `
      ::view-transition-old(root) {
        animation: ${speed}ms ease both pop-move-out-right;
        animation-delay: ${animationDelay}ms;
        z-index: 2;
      }
      ::view-transition-new(root) {
        animation: ${speed}ms ease both pop-move-in-from-left;
        animation-delay: ${animationDelay}ms;
        z-index: 1;
      }
    `,
  };
  const transitionStyles: string = TRANSITION_STYLES[transition] || "";
  return <style>{transitionStyles}</style>;
};

type TransitioningLinkProps = {
  to: string;
  transition: "push" | "pop";
  children: ReactNode;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;
export const TransitioningLink = ({
  to: toProp,
  transition,
  children,
  className,
  ...props
}: TransitioningLinkProps) => {
  const { setTransition, setIsTransitioning } = useContext(TransitionContext);
  const navigate = useNavigate();
  const viewTransitionSupported = Boolean(document.startViewTransition);
  const [isPressed, setIsPressed] = useState(false);
  // -1 is equivalent to hitting the back button;
  // @see: https://reactrouter.com/6.28.1/hooks/use-navigate#usenavigate
  const to = toProp === "-1" ? (-1 as To) : toProp;

  const onLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setIsPressed(true);
    handleNavigation(event);
    setTimeout(() => {
      setIsPressed(false);
    }, 150);
  };

  const handleNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!viewTransitionSupported) {
      navigate(to);
      return;
    }

    setTransition(transition);
    setIsTransitioning(true);

    const viewTransition = document.startViewTransition(() => {
      navigate(to);
      window.scrollTo(0, 0);
    });
    viewTransition.finished.finally(() => {
      setIsTransitioning(false);
    });
  };

  return (
    <Link
      to={to}
      className={`${className ? className : ""} ${isPressed ? "pressed" : ""}`}
      {...props}
      onClick={onLinkClick}>
      {children}
    </Link>
  );
};
