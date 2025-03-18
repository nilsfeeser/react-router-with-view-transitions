import './product-view.css';
import {useEffect, useState, forwardRef} from 'react';


export type ProductViewProps = {
    loading: boolean;
    position: number;
    imageUrl: string;
    displayName: string;
    usps: string[];
    price: number;
    priceInfo: string;
    grade: string;
}

export const ProductView = forwardRef<HTMLDivElement, ProductViewProps>((props, ref) => {
    const {displayName, usps, price, priceInfo, imageUrl, position, loading, grade} = props;

    const displayPrice = price ? price.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'}) : '';

    const [imageLoaded, setImageLoaded] = useState(false);

    function loadImage(src: string) {
        const imageElement = document.createElement('img');
        imageElement.src = src;
        imageElement.onload = () => {
            setImageLoaded(true);
        };
    }

    useEffect(() => {
        loadImage(imageUrl);
    }, [imageUrl]);

    return (
        <div ref={ref} className={`product-view-component ${loading ? 'loading' : ''}`}>
            <h5>➔ Item Nr {position}</h5>
            <div className="product-view">
                <div>
                    <em style={{height: '40px'}}>{imageUrl && imageLoaded && <img src={imageUrl} alt="Product"/>}</em>
                    <em className="display-name">{displayName}</em>
                    {usps.map((usp, index) => (<em className="usp" key={index}>{usp}</em>))}
                </div>
                <div>
                    <em className="price">{displayPrice}</em>
                    <em>{priceInfo}</em>
                    <em className="grade">{grade}</em>
                </div>
            </div>
        </div>
    );
});


