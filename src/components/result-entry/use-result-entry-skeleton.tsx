import React from "react";
import { RefObject, useEffect, useState } from "react";
import { ResultEntryContentViewProps } from "./child-components/result-entry-content-view/result-entry-content-view";
import { ResultEntrySkeleton } from "./child-components/result-entry-skeleton/result-entry-skeleton";

const useResultEntrySkeleton = (
  loading: boolean,
  resultEntryElementRef: RefObject<HTMLDivElement | null>,
  resultEntryContentViewElementRef: RefObject<HTMLDivElement | null>,
): {
  resetSkeleton: (loading: boolean) => void;
  optionalSkeleton: (resultEntryContentViewProps: ResultEntryContentViewProps) => React.ReactElement | null;
} => {
  const [needsSkeleton, setNeedsSkeleton] = useState(loading);
  const [didSkeletonDisappear, setDidSkeletonDisappear] = useState(false);

  useEffect(() => {
    if (!needsSkeleton || !resultEntryElementRef.current || !resultEntryContentViewElementRef.current) return;

    const resultEntryElement = resultEntryElementRef.current;

    resultEntryElement.style.height = resultEntryElement.scrollHeight + "px";

    if (loading) return;

    const onTransitionEnd = () => {
      resultEntryElement.setAttribute("style", "");
      resultEntryElement.removeEventListener("transitionend", onTransitionEnd);
      setDidSkeletonDisappear(true);
    };

    resultEntryElement.addEventListener("transitionend", onTransitionEnd);

    return () => {
      resultEntryElement.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [loading, needsSkeleton, resultEntryElementRef, resultEntryContentViewElementRef]);

  function resetSkeleton(loading: boolean) {
    setNeedsSkeleton(loading);
    setDidSkeletonDisappear(false);
  }

  const optionalSkeleton = (resultEntryContentViewProps: ResultEntryContentViewProps): React.ReactElement | null => {
    if (!needsSkeleton) return null;
    return <ResultEntrySkeleton {...resultEntryContentViewProps} didDisappear={didSkeletonDisappear} />;
  };

  return { resetSkeleton, optionalSkeleton };
};

export default useResultEntrySkeleton;
