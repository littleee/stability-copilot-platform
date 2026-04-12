import { useEffect, useState } from "react";

export function useScrollTick(): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onScroll = () => setTick((value) => value + 1);
    const onResize = () => setTick((value) => value + 1);

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return tick;
}
