import { useEffect } from "react";
import { useLocation, useNavigate, matchPath } from "react-router-dom";

interface PageConfig {
  path: string;
  order: number;
}

const PAGE_CONFIG: PageConfig[] = [
  { path: "/page1", order: 1 },
  { path: "/page2", order: 2 },
  { path: "/page3/:productId", order: 3 },
];

const handleDirectEntry = async (currentPath: string, navigate: any) => {
  const currentPage = PAGE_CONFIG.find((page) => matchPath(page.path, currentPath));
  if (!currentPage) {
    console.demo(`Deeplink-History-Stack`, `ERROR - Current page not found in PAGE_CONFIG`);
    return;
  }

  const previousPages = PAGE_CONFIG.filter((page) => page.order < currentPage.order);
  const originalPath = currentPath;

  for (const page of previousPages) {
    await navigate(page.path);
    console.demo(`Deeplink-History-Stack`, `prepend location ${page.path}`);
  }

  await navigate(originalPath);

  console.demo(`Deeplink-History-Stack`, `Done - History stack has been built`, previousPages);
};

export const useDeeplinkHistoryStack = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isDirectEntry = history.state.idx === 0;

    if (!isDirectEntry) return;

    console.demo(`Deeplink-History-Stack`, `Begin - Deeplink-Entry detected: building history stack`);

    handleDirectEntry(location.pathname, navigate);
  }, []);
};
