import "./result-entry.css";
import { useEffect, useRef, useState } from "react";
import {
  ResultEntryContentView,
  ResultEntryContentViewProps,
} from "../result-entry-content-view/result-entry-content-view.tsx";

export type ResultEntryProps = { resultEntryContentViewProps: ResultEntryContentViewProps };

export const ResultEntry = ({ resultEntryContentViewProps }: ResultEntryProps) => {
  const resultEntryElementRef = useRef<HTMLDivElement>(null);
  const resultEntryContentViewElementRef = useRef<HTMLDivElement>(null);
  const [needsSkeleton, setNeedsSkeleton] = useState(resultEntryContentViewProps.loading);

  const [didSkeletonDisappear, setDidSkeletonDisappear] = useState(false);

  useEffect(() => {
    console.log("----> loading changed", resultEntryContentViewProps.loading, didSkeletonDisappear);
    // a cell may be reused when a different resultset is loading - for that reason we need to show a skeleton
    if (resultEntryContentViewProps.loading) setNeedsSkeleton(true);
    setDidSkeletonDisappear(false);
  }, [resultEntryContentViewProps.loading]);

  useEffect(() => {
    if (!needsSkeleton || !resultEntryElementRef.current || !resultEntryContentViewElementRef.current) return;

    const resultEntryElement = resultEntryElementRef.current;

    resultEntryElement.style.height = resultEntryElement.scrollHeight + "px";

    if (resultEntryContentViewProps.loading) return;

    const onTransitionEnd = () => {
      resultEntryElement.setAttribute("style", "");
      resultEntryElement.removeEventListener("transitionend", onTransitionEnd);
      setDidSkeletonDisappear(true);
    };

    resultEntryElement.addEventListener("transitionend", onTransitionEnd);

    return () => {
      resultEntryElement.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [resultEntryContentViewProps.loading]);

  return (
    <div className="result-entry-component" ref={resultEntryElementRef}>
      {needsSkeleton && <ProductSkeleton {...resultEntryContentViewProps} didDisappear={didSkeletonDisappear} />}
      <ResultEntryContentView ref={resultEntryContentViewElementRef} {...resultEntryContentViewProps} />
    </div>
  );
};

type ProductSkeletonProps = { loading: boolean; position: number; didDisappear: boolean };

const ProductSkeleton = ({ loading, position, didDisappear }: ProductSkeletonProps) => {
  if (didDisappear) return null;

  return (
    <div className={`dummy-product-view-component ${loading ? "loading" : ""}`}>
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
