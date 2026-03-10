import { useCallback, useEffect, useRef, useState } from 'react';

const CARD_WIDTH = 166;
const GAP = 16;

export const useGridPageSize = (rows: number) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(1);
  const observerRef = useRef<ResizeObserver | null>(null);

  const calculate = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const width = el.clientWidth;
    const newCols = Math.max(1, Math.floor((width + GAP) / (CARD_WIDTH + GAP)));
    setCols((prev) => (prev !== newCols ? newCols : prev));
  }, []);

  // Callback ref to handle late-mounting (e.g. after loading state)
  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      containerRef.current = node;
      if (node) {
        const width = node.clientWidth;
        setCols(Math.max(1, Math.floor((width + GAP) / (CARD_WIDTH + GAP))));
        observerRef.current = new ResizeObserver(calculate);
        observerRef.current.observe(node);
      }
    },
    [calculate]
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return { containerRef: setContainerRef, perPage: cols * rows, cols };
};
