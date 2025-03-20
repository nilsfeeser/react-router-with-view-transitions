# Deep-Link History Stack Implementation

## Problem Statement

When users access a deep-linked page directly (e.g., directly accessing `/page3/123`), the applications back button doesn't work as expected because the previous pages aren't present in the browser's history stack. This creates a poor user experience as users can't navigate back through the application's logical flow.

## Solution

The Deep-Link History Stack feature automatically builds the correct history stack by:

1. Detecting direct entry to a page
2. Identifying the logical sequence of pages that should precede the current page (in a next iteration this may )
3. Programmatically navigating through these pages to build the history stack
4. Finally showing the intended destination page

## Technical Implementation

### Page Configuration

The application defines a page configuration that specifies the logical order of pages:

```typescript
interface PageConfig {
  path: string;
  order: number;
}

const PAGE_CONFIG: PageConfig[] = [
  { path: "/page1", order: 1 },
  { path: "/page2", order: 2 },
  { path: "/page3/:productId", order: 3 },
];
```

### Direct Entry Detection

The feature uses the browser's history state to detect direct entry:

```typescript
const isDirectEntry = history.state.idx === 0;
```

### History Stack Building

When a direct entry is detected, the feature:

1. Finds the current page in the configuration
2. Identifies all pages that should precede it based on their order
3. Programmatically navigates through these pages
4. Finally navigates to the intended destination

```typescript
const handleDirectEntry = async (currentPath: string, navigate: any) => {
  const currentPage = PAGE_CONFIG.find((page) => matchPath(page.path, currentPath));
  if (!currentPage) return;

  const previousPages = PAGE_CONFIG.filter((page) => page.order < currentPage.order);
  const originalPath = currentPath;

  for (const page of previousPages) {
    await navigate(page.path);
  }

  await navigate(originalPath);
};
```

### Integration

The feature is integrated into the application through a custom hook:

```typescript
export const useDeeplinkHistoryStack = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isDirectEntry = history.state.idx === 0;
    if (!isDirectEntry) return;

    handleDirectEntry(location.pathname, navigate);
  }, []);
};
```

## Usage

The feature is automatically enabled in the application's layout component:

```typescript
const Layout = () => {
  useDeeplinkHistoryStack();
  return (
    <div>
      <TransitionProvider>
        <ImageCacheProvider>
          <Outlet />
        </ImageCacheProvider>
      </TransitionProvider>
    </div>
  );
};
```

## Benefits

1. **Improved User Experience**: Users can use the browser's back button naturally, even when accessing deep-linked pages
2. **Consistent Navigation**: The application maintains a logical navigation flow regardless of entry point
3. **Seamless Integration**: The feature works automatically without requiring user intervention

## Considerations

1. **Performance**: The feature performs multiple navigations to build the history stack
2. **Edge Cases**: The implementation handles dynamic routes (e.g., `/page3/:productId`) through the `matchPath` function
3. **Debugging**: The feature includes logging through a custom console implementation for easier debugging
4. **History-API**: The sole usage of the history API is a little less reliable than the user-journey-walkthrough - solving the requirements with the history api alone leads to undesired browser-hints making it more obvious to the user that the history has been altered

## Problems

1. **Native Browser Back Buttons**: The native browser back button functionality is completely detached from the window history. Therefore, the native browser back button always behaves according to the user's intention and cannot be manipulated
