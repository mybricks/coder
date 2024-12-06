import { useRef, useEffect, type DependencyList } from "react";

const useTimeout = (
  callback: () => void,
  delay?: number,
  deps?: DependencyList
) => {
  const savedCallback = useRef<() => void>();
  const timerId = useRef<NodeJS.Timeout>();
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    const tick = () => savedCallback.current?.();
    if (!delay) return tick();
    timerId.current = setTimeout(tick, delay);
    return () => clearTimeout(timerId.current);
  }, [deps]);
};
export { useTimeout };
