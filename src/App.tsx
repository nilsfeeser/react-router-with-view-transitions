import { createContext, useContext, useState } from 'react';
import './style.css';
import {
  Link,
  Outlet,
  useNavigate,
  useParams,
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
  const [transition, setTransition] = useState('');

  return (
    <TransitionContext.Provider value={{ transition, setTransition }}>
      <TransitionStyles></TransitionStyles>
      {children}
    </TransitionContext.Provider>
  );
}

const TransitionStyles = () => {
  const { transition } = useContext(TransitionContext);
  const speed = 300;
  // delaying the transition a short, imperceptible period of time, reduces flickering
  const animationDelay = 20;

  const TRANSITION_STYLES = {
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

  const transitionStyles = TRANSITION_STYLES[transition] || '';

  return <style>{transitionStyles}</style>;
};

const TransitioningLink = ({ to, transition, children, ...props }) => {
  const { setTransition } = useContext(TransitionContext);
  const navigate = useNavigate();
  const viewTransitionSupported = Boolean(document.startViewTransition);

  const handleNavigation = (event) => {
    event.preventDefault();

    setTransition(transition);

    if (to === '-1') to = -1; // is equivalent to hitting the back button; @see: https://reactrouter.com/6.28.1/hooks/use-navigate#usenavigate

    if (viewTransitionSupported) {
      document.startViewTransition(async (_) => {
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

const ProductImage = ({ src, alt }: { src: string; alt?: string }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="product">
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`fade-in-image ${loaded ? 'loaded' : ''}`}
      />
    </div>
  );
};

const Layout = () => {
  return (
    <div>
      <TransitionProvider>
        <Outlet />
      </TransitionProvider>
    </div>
  );
};

const Page1 = () => {
  return (
    <div className="page page1">
      <h1>Page1</h1>
      <p>
        <strong>
          Some text you can not select as this is also the default behaviour on
          native apps.
        </strong>{' '}
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
        eirmod
      </p>
      <TransitioningLink to="/page2" transition="push" className="button">
        weiter
      </TransitioningLink>
      {/* ^^^^^^^^^^^^^ Link with transition */}
    </div>
  );
};

const Page2 = () => {
  const Navigation = (_) => (
    <div className="row">
      <TransitioningLink to="/page1" transition="pop" className="button">
        zurück
      </TransitioningLink>

      <TransitioningLink to="/page3/0" transition="push" className="button">
        weiter
      </TransitioningLink>
    </div>
  );

  return (
    <div className="page page2">
      <h1>Page2</h1>

      {Navigation()}

      <ul>
        {Array.from({ length: 70 }, (_, index) => (
          <li>
            <TransitioningLink
              to={`/page3/${index}`}
              transition="push"
              key={index}
            >
              ➔ Item Nr {index + 1}
            </TransitioningLink>
          </li>
        ))}
      </ul>

      {Navigation()}
    </div>
  );
};

const Page3 = () => {
  const { productId } = useParams();
  return (
    <div className="page page3">
      <h1>Page3</h1>
      <ProductImage src={`https://picsum.photos/640/320?id=${productId}`} />
      <TransitioningLink to="-1" transition="pop" className="button">
        zurück
      </TransitioningLink>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Page1 /> },
      { path: 'page1', element: <Page1 /> },
      { path: 'page2', element: <Page2 /> },
      { path: 'page3/:productId', element: <Page3 /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
