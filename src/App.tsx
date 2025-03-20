import { scan } from "react-scan";
import { useState, useMemo, useEffect } from "react";
import "./app.css";
import { Outlet, useParams, createBrowserRouter, RouterProvider } from "react-router-dom";
import { TransitionProvider, TransitioningLink } from "./feature/page-transition.tsx";
import { ImageCacheProvider, useImageCache } from "./feature/image-cache.tsx";
import { BottomSheet } from "./feature/bottom-sheet/bottom-sheet.tsx";
import { Image } from "./feature/image/image.tsx";
import { ResultEntry } from "./components/result-entry/result-entry.tsx";
import { fakeFetchProducts, emptyProduct, Product } from "./service/product-service.ts";
import { ResizingElement } from "./feature/resizing-element/resizing-element.tsx";
import { usePageTransitionState } from "./feature/page-transition.tsx";
import { useDeeplinkHistoryStack } from "./feature/deeplink-history-stack.ts";
import console from "./feature/console.ts";

scan({ enabled: false });
window.console = console;

const Layout = () => {
  useDeeplinkHistoryStack();

  return (
    <div>
      <TransitionProvider>
        <ImageCacheProvider>
          <Outlet />
        </ImageCacheProvider>
      </TransitionProvider>
    </div>
  );
};

const Page1 = () => {
  const { clearCachedImages } = useImageCache();
  const [hasProductCache, setHasProductCache] = useState(localStorage.getItem("products") !== null);
  const clearProductCache = () => {
    localStorage.removeItem("products");
    setHasProductCache(false);
    clearCachedImages();
  };

  return (
    <div className="page page1">
      <h1>Page1</h1>
      <p>
        <strong>Some text you can not select as this is also the default behaviour on native apps.</strong>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
      </p>
      <TransitioningLink to="/page2" transition="push" className="button">
        weiter
      </TransitioningLink>

      <button
        type={"button"}
        className={`button ${!hasProductCache ? "button-disabled" : ""}`}
        disabled={!hasProductCache}
        onClick={clearProductCache}>
        clear caches
      </button>
    </div>
  );
};

const Page2 = () => {
  const { isTransitioning } = usePageTransitionState();
  const emptyProducts = Array.from({ length: 3 }, () => emptyProduct);
  const initialProducts = localStorage.getItem("products")
    ? JSON.parse(localStorage.getItem("products") || "")
    : emptyProducts;
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const initializeProducts = () => {
    fakeFetchProducts().then((newProducts) => {
      localStorage.setItem("products", JSON.stringify(newProducts));
      setProducts(newProducts);
    });
  };

  const refetchProducts = () => {
    localStorage.removeItem("products");
    setProducts(emptyProducts);
    initializeProducts();
  };

  useEffect(() => {
    if (localStorage.getItem("products")) return;
    initializeProducts();
  }, []);

  useEffect(() => {
    if (isTransitioning) return;
    setProducts((products) => {
      const newProducts = products.map((p) => ({ ...p, selected: null }));
      localStorage.setItem("products", JSON.stringify(newProducts));
      return newProducts;
    });
  }, [isTransitioning]);

  const onProductClick = (product: Product) => {
    setProducts((products) => {
      const newProducts = products.map((p) => ({ ...p, selected: p.position === product.position }));
      localStorage.setItem("products", JSON.stringify(newProducts));
      return newProducts;
    });
  };

  return (
    <div className="page page2">
      <h1>Page2</h1>
      <div className="row">
        <TransitioningLink to="-1" transition="pop" className="button">
          zurück
        </TransitioningLink>

        <hr />

        <button type="button" className="button" onClick={refetchProducts}>
          Reload
        </button>
      </div>

      <ul>
        {products.map((product, index) => (
          <li key={index} onClick={() => onProductClick(product)}>
            <TransitioningLink to={`/page3/${product.position}`} transition="push">
              <ResultEntry resultEntryContentViewProps={product} />
            </TransitioningLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Page3 = () => {
  const { productId } = useParams<{ productId: string }>();
  const { pageTransitionDidComplete } = usePageTransitionState();
  const [isOpen, setIsOpen] = useState(false);

  const loremIpsum = useMemo(() => {
    return Array.from({ length: 500 }, () => Math.random().toString(36).substring(2, 7)).join(" ");
  }, []);

  const openSheet = () => {
    setIsOpen(true);
  };

  const dismissBottomSheet = () => {
    setIsOpen(false);
  };

  return (
    <div className="page page3">
      <h1>Detailpage Product {productId}</h1>
      <Image
        src={`https://picsum.photos/id/${productId}/640/320`}
        className="product fade-in-image"
        forceFadeIn={true}
      />

      <ResizingElement>
        {pageTransitionDidComplete && (
          <>
            <div className="row">
              <TransitioningLink to="-1" transition="pop" className="button">
                zurück
              </TransitioningLink>
              <button type="button" className="button" onClick={openSheet}>
                Bottom-Sheet
              </button>
              <button type={"button"} className={"button button-disabled"}>
                Weiter
              </button>
            </div>
          </>
        )}
      </ResizingElement>

      <p>
        ↳ If you do not know the size of a suspended loaded component, you should avoid layout shifts by animating the
        appearing elements.
      </p>

      <h1>This page should be scrollable so here is some product describing text</h1>
      <p>{loremIpsum.split(" ").slice(0, 300).join(" ")}</p>

      <button type="button" className="button" onClick={openSheet}>
        Show Bottom-Sheet
      </button>

      <Image src={`https://picsum.photos/id/${Number(productId) + 1}/640/320`} className="product last-child" />

      <BottomSheet isOpen={isOpen} onDismiss={dismissBottomSheet}>
        <h2>Some Headline</h2>
        <Image src={`https://picsum.photos/id/${Number(productId) + 2}/640/320`} className="product" />
        <p>{loremIpsum.split(" ").slice(0, 100).join(" ")}</p>
        <div className="row">
          <button className={"button"} onClick={dismissBottomSheet}>
            Schließen
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Page1 /> },
      { path: "page1", element: <Page1 /> },
      { path: "page2", element: <Page2 /> },
      { path: "page3/:productId", element: <Page3 /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
