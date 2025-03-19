import { forwardRef } from "react";
import { Image } from "../../feature/image/image.tsx";
import "./result-entry-content-view.css";

export type ResultEntryContentViewProps = {
  loading: boolean;
  position: number;
  displayName: string;
  usps: string[];
  imageUrl: string;
  selected?: boolean;
  price: number;
  priceInfo: string;
  grade: string;
};

export const ResultEntryContentView = forwardRef<HTMLDivElement, ResultEntryContentViewProps>((props, ref) => {
  const { displayName, usps, price, priceInfo, imageUrl, position, loading, grade, selected } = props;
  const displayPrice = price ? price.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) : "";

  return (
    <div
      ref={ref}
      className={`product-view-component ${loading ? "loading" : ""}`}
      style={{ backgroundColor: selected ? "#ddd" : "transparent" }}>
      <h5>➔ Item Nr {position}</h5>
      <div className="product-view">
        <div>
          <em style={{ height: "40px" }}>
            {imageUrl && <Image src={imageUrl} alt="Product" className="logo fade-in-image" />}
          </em>
          <em className="display-name">{displayName}</em>
          {usps.map((usp, index) => (
            <em className="usp" key={index}>
              {usp}
            </em>
          ))}
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
