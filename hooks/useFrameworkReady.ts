import { useEffect, useState } from 'react';

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simple ready state for the framework
    setIsReady(true);
  }, []);

  return isReady;
}