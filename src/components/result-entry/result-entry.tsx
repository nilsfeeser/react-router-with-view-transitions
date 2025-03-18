import './result-entry.css';
import {useEffect, useRef, useState} from 'react';
import {ProductView, ProductViewProps} from "./product-view/product-view.tsx";

export type ResultEntryProps = {
    productViewProps: ProductViewProps;
}

export const ResultEntry = ({productViewProps}: ResultEntryProps) => {
    const resultEntryElementRef = useRef<HTMLDivElement>(null);
    const productViewElementRef = useRef<HTMLDivElement>(null);
    const needsSkeleton = useRef(productViewProps.loading);

    const [didSkeletonDisappear, setDidSkeletonDisappear] = useState(false);

    useEffect(() => {
        // a cell may be reused when a different resultset is loading
        if (productViewProps.loading) needsSkeleton.current = true;
        setDidSkeletonDisappear(false);
    }, [productViewProps.loading]);

    useEffect(() => {
        if (!needsSkeleton.current || !resultEntryElementRef.current || !productViewElementRef.current) return;

        const resultEntryElement = resultEntryElementRef.current;

        resultEntryElement.style.height = resultEntryElement.scrollHeight + 'px';

        if (productViewProps.loading) return;

        const onTransitionEnd = () => {
            resultEntryElement.setAttribute('style', '');
            resultEntryElement.removeEventListener('transitionend', onTransitionEnd);
            setDidSkeletonDisappear(true);
        }

        resultEntryElement.addEventListener('transitionend', onTransitionEnd);

        return () => {
            resultEntryElement.removeEventListener('transitionend', onTransitionEnd);
        }
    }, [productViewProps.loading]);

    return (
        <div className="result-entry-component" ref={resultEntryElementRef}>
            <ProductSkeleton {...productViewProps} didDisappear={didSkeletonDisappear}/>
            <ProductView ref={productViewElementRef} {...productViewProps}/>
        </div>
    );
};

type ProductSkeletonProps = {
    loading: boolean;
    position: number;
    didDisappear: boolean;
}

const ProductSkeleton = ({loading, position, didDisappear}: ProductSkeletonProps) => {

    if (didDisappear) return null;

    return (
        <div className={`dummy-product-view-component ${loading ? 'loading' : ''}`}>
            <h5>➔ Item Nr {position}</h5>
            <div className="dummy-product-view">
                <div>
                    <em className="logo"></em>
                    <em></em>
                    <em></em>
                    <em></em>
                    <em></em>
                    <em></em>
                    <em></em>
                </div>
                <div>
                    <em className="price"></em>
                    <em></em>
                    <em className="grade"></em>
                </div>
            </div>
        </div>
    );
};