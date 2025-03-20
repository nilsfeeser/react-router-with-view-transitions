import "./result-entry.css";
import { useEffect, useRef } from "react";
import {
  ResultEntryContentView,
  ResultEntryContentViewProps,
} from "./child-components/result-entry-content-view/result-entry-content-view";
import useResultEntrySkeleton from "./use-result-entry-skeleton";

export type ResultEntryProps = { resultEntryContentViewProps: ResultEntryContentViewProps };

export const ResultEntry = ({ resultEntryContentViewProps }: ResultEntryProps) => {
  const resultEntryElementRef = useRef<HTMLDivElement>(null);
  const resultEntryContentViewElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // a cell may be reused when a different resultset is loading - for that reason we need to show a skeleton
    if (resultEntryContentViewProps.loading) resetSkeleton(true);
  }, [resultEntryContentViewProps.loading]);

  const { resetSkeleton, optionalSkeleton } = useResultEntrySkeleton(
    resultEntryContentViewProps.loading,
    resultEntryElementRef,
    resultEntryContentViewElementRef,
  );

  return (
    <div className="result-entry-component" ref={resultEntryElementRef}>
      {optionalSkeleton(resultEntryContentViewProps)}
      <ResultEntryContentView ref={resultEntryContentViewElementRef} {...resultEntryContentViewProps} />
    </div>
  );
};
