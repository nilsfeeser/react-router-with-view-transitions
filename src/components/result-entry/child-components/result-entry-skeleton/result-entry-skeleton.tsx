export type ResultEntrySkeletonProps = { loading: boolean; position: number; didDisappear: boolean };

export const ResultEntrySkeleton = ({ loading, position, didDisappear }: ResultEntrySkeletonProps) => {
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
