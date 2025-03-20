# Page Transition Implementation

## Overview

The Page Transition feature provides smooth, native-like transitions between pages in the application using the View Transitions API. It supports both push and pop transitions, creating a fluid navigation experience similar to native mobile applications.

## Problem Statement

Traditional web applications lack smooth transitions between pages, which can make navigation feel abrupt and disconnected. This creates a less polished user experience compared to native applications, where transitions are a fundamental part of the navigation flow.

## Solution

The Page Transition feature implements a comprehensive transition system that:

1. Provides smooth animations between pages
2. Supports different transition types (push/pop)
3. Handles view transitions using the View Transitions API
4. Falls back gracefully when the API is not supported
5. Manages transition states and timing

## Technical Implementation

### Transition Context

The feature uses React Context to manage transition state across components:

```typescript
interface TransitionContextType {
  setTransition: (transition: "push" | "pop") => void;
  transition: "push" | "pop";
  isTransitioning: boolean;
  setIsTransitioning: (isTransitioning: boolean) => void;
}
```

### Transition Provider

The TransitionProvider component manages the transition state and provides it to child components:

```typescript
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
```

### Transition Styles

The feature defines CSS animations for push and pop transition types:

```typescript
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
```

### TransitioningLink Component

The TransitioningLink component handles the transition logic when navigating:

```typescript
export const TransitioningLink = ({ to: toProp, transition, children, ...props }: TransitioningLinkProps) => {
  const { setTransition, setIsTransitioning } = useContext(TransitionContext);
  const navigate = useNavigate();
  const viewTransitionSupported = Boolean(document.startViewTransition);

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
    <Link to={to} {...props} onClick={handleNavigation}>
      {children}
    </Link>
  );
};
```

### Transition State Hook

A custom hook provides access to transition state:

```typescript
export const usePageTransitionState = () => {
  const { isTransitioning } = useContext(TransitionContext);
  const [pageTransitionDidComplete, setPageTransitionDidComplete] = useState(false);

  useEffect(() => {
    if (isTransitioning || pageTransitionDidComplete) return;
    setPageTransitionDidComplete(true);
  }, [isTransitioning, pageTransitionDidComplete]);

  return { pageTransitionDidComplete, isTransitioning };
};
```

## Usage

The feature is used through the TransitioningLink component:

```typescript
<TransitioningLink to="/page2" transition="push" className="button">
  Weiter
</TransitioningLink>

<TransitioningLink to="-1" transition="pop" className="button">
  Zurück
</TransitioningLink>
```

## Benefits

1. **Native-like Experience**: Provides smooth transitions similar to native applications
2. **Flexible Transitions**: Supports different transition types (push/pop)
3. **Progressive Enhancement**: Falls back gracefully when View Transitions API is not supported
4. **State Management**: Handles transition states and timing automatically

## Considerations

1. **Browser Support**: The feature relies on the View Transitions API, which is not supported in all browsers
