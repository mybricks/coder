import { useEffect, type EffectCallback, type DependencyList } from "react";
const useUpdate = (effect: EffectCallback, deps: DependencyList) => {
  useEffect(effect, deps);
};
export { useUpdate };
