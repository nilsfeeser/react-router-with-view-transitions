import React, {createContext, MouseEvent, ReactNode, useContext, useState} from "react";
import {Link, useNavigate} from "react-router-dom";

interface TransitionContextType {
    setTransition: (transition: "push" | "pop") => void;
    transition: "push" | "pop";
}

const TransitionContext = createContext<TransitionContextType>(
    {} as TransitionContextType
);

export function TransitionProvider({children}: { children: ReactNode }) {
    const [transition, setTransition] = useState<"push" | "pop">('push');

    return (
        <TransitionContext.Provider value={{transition, setTransition}}>
            <TransitionStyles/>
            {children}
        </TransitionContext.Provider>
    );
}

const TransitionStyles = () => {
    const {transition} = useContext(TransitionContext);

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

    const transitionStyles: string = TRANSITION_STYLES[transition] || '';

    return <style>{transitionStyles}</style>;
};

type TransitioningLinkProps = {
    to: string;
    transition: "push" | "pop";
    children: ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const PageTransition = ({to, transition, children, ...props}: TransitioningLinkProps) => {
    const {setTransition} = useContext(TransitionContext);
    const navigate = useNavigate();
    const viewTransitionSupported = Boolean(document.startViewTransition);

    const handleNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        setTransition(transition);

        if (to === '-1') {
            // -1 is equivalent to hitting the back button;
            // @see: https://reactrouter.com/6.28.1/hooks/use-navigate#usenavigate
            to = -1;
        }

        if (viewTransitionSupported) {
            document.startViewTransition(() => {
                navigate(to);
                window.scrollTo(0, 0);
            });
            return;
        }
        navigate(to);
    };

    return (
        <Link to={to} {...props} onClick={handleNavigation}>
            {children}
        </Link>
    );
};