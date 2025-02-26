import {useState, useEffect} from 'react';
import './style.css';
import {
    Outlet,
    useParams,
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';
import {useImageCache} from "./feature/image-cache.tsx";
import {TransitionProvider, TransitioningLink} from "./feature/page-transition.tsx";
import {ImageCacheProvider} from "./feature/image-cache.tsx";

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
                </strong>{' '}
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
    const Navigation = () => (
        <div className="row">
            <TransitioningLink to="-1" transition="pop" className="button">
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
                {Array.from({length: 70}, (_, index) => (
                    <li key={index}>
                        <TransitioningLink
                            to={`/page3/${index}`}
                            transition="push"
                        >
                            <h5>➔ Item Nr {index + 1}</h5>
                            <DummyProductView></DummyProductView>
                        </TransitioningLink>
                    </li>
                ))}
            </ul>

            {Navigation()}
        </div>
    );
};

const Page3 = () => {
    const {productId} = useParams<{ productId: string }>();
    return (
        <div className="page page3">
            <h1>Page3</h1>
            <Image src={`https://picsum.photos/id/${productId}/640/320`} className="product"/>

            <TransitioningLink to="-1" transition="pop" className="button">
                zurück
            </TransitioningLink>
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

const Image = ({src, alt, className}: { src: string; alt?: string; className?: string }) => {
    console.log("Image Rendered: should not be rendered twice if image is cached");

    const {cache, addImageToCache} = useImageCache();
    const [loaded, setLoaded] = useState(cache.get(src) || false);

    useEffect(() => {
        if (cache.has(src)) {
            setLoaded(true);
        }
    }, [src, cache]);

    const onLoad = (src: string) => {
        setLoaded(true);
        addImageToCache(src);
    }

    return (
        <div className={className}>
            <img
                src={src}
                alt={alt}
                onLoad={() => onLoad(src)}
                className={`fade-in-image ${loaded ? "loaded" : ""}`}
            />
        </div>
    );
};

const DummyProductView = () => {
    return (
        <div className="product-shimmer-view">
            <div>
                <em></em>
                <em></em>
                <em></em>
                <em></em>
                <em></em>
                <em></em>
            </div>
            <div>
                <em></em>
                <em></em>
                <em></em>
                <span></span>
                <span></span>
                <em></em>
            </div>
        </div>
    );
};
