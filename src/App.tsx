import {scan} from "react-scan";
import {useState, useMemo, useEffect, useContext} from 'react';
import './style.css';
import {
    Outlet,
    useParams,
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';
import {TransitionProvider, TransitioningLink, TransitionContext} from "./feature/page-transition.tsx";
import {ImageCacheProvider} from "./feature/image-cache.tsx";
import {BottomSheet} from "./feature/bottom-sheet/bottom-sheet.tsx";
import {Image} from "./feature/image/image.tsx";
import {ResultEntry} from "./components/result-entry/result-entry.tsx";
import {fakeFetchProducts, emptyProduct, Product} from "./service/product-service.ts";
import {ResizingElement} from "./feature/resizing-element/resizing-element.tsx";

scan({enabled: false});

const Layout = () => {
    return (
        <div>
            <TransitionProvider>
                <ImageCacheProvider>
                    <Outlet/>
                </ImageCacheProvider>
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
                </strong>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                eirmod
            </p>
            <TransitioningLink to="/page2" transition="push" className="button">
                weiter
            </TransitioningLink>
        </div>
    );
};

const Page2 = () => {
    const emptyProducts = Array.from({length: 3}, () => emptyProduct);
    const initialProducts = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products') || '') : emptyProducts;
    const [products, setProducts] = useState<Product[]>(initialProducts);

    const initializeProducts = () => {
        fakeFetchProducts()
            .then((newProducts) => {
                localStorage.setItem('products', JSON.stringify(newProducts));
                setProducts(newProducts);
            });
    }

    const refetchProducts = () => {
        localStorage.removeItem('products');
        setProducts(emptyProducts);
        initializeProducts();
    }

    useEffect(() => {
        if (localStorage.getItem('products')) return;
        initializeProducts();
    }, []);

    return (
        <div className="page page2">
            <h1>Page2</h1>
            <div className="row">
                <TransitioningLink to="-1" transition="pop" className="button">
                    zurück
                </TransitioningLink>

                <hr/>

                <button type="button" className="button" onClick={refetchProducts}>Reload</button>
            </div>

            <ul>
                {products.map((product, index) => (
                    <li key={index}>
                        <TransitioningLink to={`/page3/${product.position}`} transition="push">
                            <ResultEntry productViewProps={product}/>
                        </TransitioningLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const Page3 = () => {
    const {productId} = useParams<{ productId: string }>();
    const {isTransitioning} = useContext(TransitionContext);

    const [isOpen, setIsOpen] = useState(false);

    const loremIpsum = useMemo(() => {
        return Array.from({length: 500}, () => Math.random().toString(36).substring(2, 7)).join(' ');
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
            <Image src={`https://picsum.photos/id/${productId}/640/320`} className="product"/>

            <ResizingElement>
                {!isTransitioning && (
                    <>
                        <div className="row">
                            <TransitioningLink to="-1" transition="pop" className="button">
                                zurück
                            </TransitioningLink>
                            <button type="button" className="button" onClick={openSheet}>
                                Bottom-Sheet
                            </button>
                            <button type={'button'} className={'button button-disabled'}>Weiter</button>
                        </div>
                    </>
                )}
            </ResizingElement>

            <p>
                ↳ If you do not know the size of a suspended loaded component, you should avoid layout shifts by
                animating the appearing elements.
            </p>

            <h1>This page should be scrollable so here is some product describing text</h1>
            <p>{loremIpsum.split(' ').slice(0, 300).join(' ')}</p>

            <button type="button" className="button" onClick={openSheet}>
                Show Bottom-Sheet
            </button>

            <Image src={`https://picsum.photos/id/${Number(productId) + 1}/640/320`}
                   className="product last-child"/>

            <BottomSheet isOpen={isOpen} onDismiss={dismissBottomSheet}>
                <h2>Some Headline</h2>
                <Image src={`https://picsum.photos/id/${Number(productId) + 2}/640/320`} className="product"/>
                <p>{loremIpsum.split(' ').slice(0, 100).join(' ')}</p>
                <div className="row">
                    <button className={'button'} onClick={dismissBottomSheet}>Schließen</button>
                </div>
            </BottomSheet>
        </div>
    );
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout/>,
        children: [
            {index: true, element: <Page1/>},
            {path: 'page1', element: <Page1/>},
            {path: 'page2', element: <Page2/>},
            {path: 'page3/:productId', element: <Page3/>},
        ],
    },
]);

export default function App() {
    return <RouterProvider router={router}/>;
}
