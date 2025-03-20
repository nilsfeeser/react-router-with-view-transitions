import { Fragment, useEffect, useRef, useState } from "react";
import { Button } from "../../basic-ui/button/button";
import { BottomSheet } from "../../feature/bottom-sheet/bottom-sheet";
import "./resultlist-topbar.css";

/*
 * This hook is used to make a sticky element.
 * It will make the element sticky when the user scrolls past the element.
 * It will also make the element static when the user scrolls back up.
 *
 * CSS position: sticky; is does not play well on android chrome when page-transition is used.
 */
const useStickyElement = () => {
  const containerElementRef = useRef<HTMLDivElement>(null);
  const contentElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentElementRef.current || !containerElementRef.current) return;

    const handleScroll = () => {
      const contentElement = contentElementRef.current;
      const containerElement = containerElementRef.current;
      if (!contentElement || !containerElement) return;

      const stickyContentTopPosition = containerElement.offsetTop;
      const scrollPosition = window.scrollY;

      if (scrollPosition > stickyContentTopPosition) {
        contentElement.style.position = "fixed";
        contentElement.style.top = "0";
      } else {
        contentElement.style.position = "static";
        contentElement.style.top = "auto";
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [contentElementRef.current, containerElementRef.current]);

  return { contentElementRef, containerElementRef };
};

export const ResultListTopBar = ({ disabled = false }: { disabled?: boolean }) => {
  const [sortIsOpen, setSortIsOpen] = useState(false);
  const [filterIsOpen, setFilterIsOpen] = useState(false);

  const dismissSortBottomSheet = () => {
    setSortIsOpen(false);
  };

  const dismissFilterBottomSheet = () => {
    setFilterIsOpen(false);
  };

  const { contentElementRef: stickyContentRef, containerElementRef: resultlistTopbarRef } = useStickyElement();

  return (
    <div className="resultlist-topbar-component" ref={resultlistTopbarRef}>
      <div className="resultlist-topbar-sticky-content" ref={stickyContentRef}>
        <Button disabled={disabled} onClick={() => setSortIsOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50px" data-rtl-flip="true">
            <path d="M10.28 15.22a.75.75 0 0 1 0 1.06l-4.5 4.5a.8.8 0 0 1-.24.16.73.73 0 0 1-.58 0 .8.8 0 0 1-.24-.16l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3.75a.75.75 0 0 1 1.5 0v14.69l3.22-3.22a.75.75 0 0 1 1.06 0m13.5-7.5-4.5-4.5a.8.8 0 0 0-.28-.16.73.73 0 0 0-.58 0 .8.8 0 0 0-.24.16l-4.5 4.5a.75.75 0 1 0 1.06 1.06L18 5.56v14.69a.75.75 0 0 0 1.5 0V5.56l3.22 3.22a.75.75 0 0 0 1.06 0 .75.75 0 0 0 0-1.06"></path>
          </svg>
          sort
        </Button>

        <Button disabled={disabled} onClick={() => setFilterIsOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50px" data-rtl-flip="true">
            <path d="M.75 4.5h16.34a3.5 3.5 0 1 0 0-1.5H.75a.75.75 0 0 0 0 1.5M20.5 1.75a2 2 0 1 1-2 2 2 2 0 0 1 2-2m2.75 17.75H9.46a3.5 3.5 0 0 0-6.83 0H.75a.75.75 0 0 0 0 1.5h1.88a3.5 3.5 0 0 0 6.83 0h13.79a.75.75 0 0 0 0-1.5m-17.2 2.75a2 2 0 1 1 2-2 2 2 0 0 1-2 2M23.25 11h-7.84a3.49 3.49 0 0 0-6.82 0H.75a.75.75 0 0 0 0 1.5h7.84a3.49 3.49 0 0 0 6.82 0h7.84a.75.75 0 0 0 0-1.5M12 13.75a2 2 0 1 1 2-2 2 2 0 0 1-2 2"></path>
          </svg>
          filter
        </Button>

        <SortBottomSheet isOpen={sortIsOpen} onDismiss={dismissSortBottomSheet} />
        <FilterBottomSheet isOpen={filterIsOpen} onDismiss={dismissFilterBottomSheet} />
      </div>
    </div>
  );
};

const SortBottomSheet = ({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) => {
  const ctaButton = <Button onClick={onDismiss}>Apply Sorting</Button>;
  return (
    <BottomSheet isOpen={isOpen} onDismiss={onDismiss} ctaChildren={ctaButton}>
      <h2>Sort Bottom Sheet Dummy</h2>

      <ul>
        <li>
          <Button disabled={true}>Lorem ipsum</Button>
        </li>
        <li>
          <Button disabled={true}>Dolor sit amet</Button>
        </li>
        <li>
          <Button disabled={true}>Fusce nec</Button>
        </li>
      </ul>
    </BottomSheet>
  );
};

const FilterBottomSheet = ({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) => {
  const ctaButton = <Button onClick={onDismiss}>541 Ergebnisse anzeigen</Button>;
  return (
    <BottomSheet isOpen={isOpen} onDismiss={onDismiss} ctaChildren={ctaButton}>
      <h2>Filter Bottom Sheet Dummy</h2>

      <h3>Amount of results</h3>
      <div className="row filter-row">
        <Button>
          6 <span>et 50 €</span>
        </Button>
        <Button>
          20 <span>et 50 €</span>
        </Button>
        <Button>
          40 <span>et 50 €</span>
        </Button>
        <Button>
          80 <span>et 50 €</span>
        </Button>
      </div>

      {Array.from({ length: 7 }).map((_, index) => (
        <Fragment key={index}>
          <h3>Dummy Filter {Math.random().toString(36).substring(2, 15)}</h3>
          <div className="row filter-row">
            {Array.from({ length: 8 }).map((_, index) => (
              <Button key={index}>{Math.random().toString(36).substring(2, 15)}</Button>
            ))}
          </div>
        </Fragment>
      ))}
    </BottomSheet>
  );
};
