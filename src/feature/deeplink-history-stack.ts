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
  if (!currentPage) return;

  const previousPages = PAGE_CONFIG.filter((page) => page.order < currentPage.order);
  const originalPath = currentPath;

  for (const page of previousPages) {
    await navigate(page.path);
    // i want the "[Feature Deeplink-History-Stack]" to be highlighted in the console in #aa00ff
    //console.log(`\x1b[38;2;170;0;255m[Feature Deeplink-History-Stack]\x1b[0m add location ${page.path}`);

    console.log(
      `%c[Feature Deeplink-History-Stack] %cadd location ${page.path}`,
      "color: #ff00ff;",
      "color: #aa00ff; font-weight: bold",
    );
  }

  await navigate(originalPath);
};

export const useDeeplinkHistoryStack = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isDirectEntry = !document.referrer;

    if (!isDirectEntry) return;

    console.log(
      "[Feature Deeplink-History-Stack] Deeplink-Entry detected - building history stack so you can navigate back",
    );

    handleDirectEntry(location.pathname, navigate);
  }, []);
};
