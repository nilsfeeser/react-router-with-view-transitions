# Technische Implementierung: Direkteinsprünge

## Problemstellung

Bei Direkteinsprüngen auf Unterseiten (z.B. direkt auf Seite 3) funktioniert der Browser-Back-Button nicht wie erwartet, da die vorherigen Seiten nicht im Browser-History-Stack vorhanden sind.

## Lösungskonzept

Bei einem Direkteinstieg werden die logisch vorangestellten Seiten automatisch durchlaufen, um den korrekten History-Stack aufzubauen.

### Beispiel

Direkteinstieg auf Seite 3:

1. Einsprung auf Seite 3
2. Automatischer Aufruf von Seite 1
3. Automatischer Aufruf von Seite 2
4. Anzeige von Seite 3

## Technische Implementierung

### 1. History-Stack-Management

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

### 2. Direkteinstieg-Handler

```typescript
const handleDirectEntry = async (currentPath: string) => {
  const currentPage = PAGE_CONFIG.find((page) => matchPath(currentPath, page.path));

  if (!currentPage) return;

  // Finde alle Seiten, die vor der aktuellen Seite liegen
  const previousPages = PAGE_CONFIG.filter((page) => page.order < currentPage.order);

  // Durchlaufe die vorherigen Seiten
  for (const page of previousPages) {
    await navigate(page.path, { replace: true });
  }

  // Navigiere zur Zielseite
  await navigate(currentPath, { replace: true });
};
```

### 3. Integration in App.tsx

```typescript
const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    // Prüfe, ob es sich um einen Direkteinstieg handelt
    const isDirectEntry = !document.referrer;

    if (isDirectEntry) {
      handleDirectEntry(location.pathname);
    }
  }, [location]);

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

## Wichtige Aspekte

### Performance

- Die Navigationen werden mit `replace: true` durchgeführt, um den History-Stack nicht unnötig zu belasten
- Die Übergänge zwischen den Seiten sollten schnell und flüssig sein

### Benutzerfreundlichkeit

- Der Benutzer sollte die Zwischenseiten nicht wahrnehmen
- Die Transitions sollten dezent und schnell sein

### Edge Cases

- Behandlung von fehlgeschlagenen Navigationen
- Korrekte Behandlung von dynamischen Routen (z.B. `/page3/:productId`)
- Berücksichtigung von Query-Parametern

## Nächste Schritte

1. Implementierung der `handleDirectEntry`-Funktion
2. Integration in die bestehende Router-Konfiguration
3. Tests für verschiedene Einsprung-Szenarien
4. Performance-Optimierung der Navigationen
