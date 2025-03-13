import {scan} from "react-scan";
import {useState, useMemo} from 'react';
import './style.css';
import {
    Outlet,
    useParams,
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';
import {TransitionProvider, TransitioningLink} from "./feature/page-transition.tsx";
import {ImageCacheProvider} from "./feature/image-cache.tsx";
import {BottomSheet} from "./feature/bottom-sheet/bottom-sheet.tsx";
import {Image} from "./feature/image/image.tsx";

scan({enabled: true});

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
                        <TransitioningLink to={`/page3/${index}`} transition="push">
                            <h5>➔ Item Nr {index + 1}</h5>
                            <DummyProductView/>
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
            <h1>Page3</h1>
            <Image src={`https://picsum.photos/id/${productId}/640/320`} className="product"/>

            <TransitioningLink to="-1" transition="pop" className="button">
                zurück
            </TransitioningLink>

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

const DummyProductView = () => {
    return (
        <div className="dummy-product-view">
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
