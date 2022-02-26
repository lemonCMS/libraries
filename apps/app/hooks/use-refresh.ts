import {useEffect, useState} from "react";

export default function useRefresh(): [boolean, () => void] {
  const [shouldRefresh, setState] = useState<boolean>(false);

  useEffect(() => {
    if (shouldRefresh) {
      setState(false);
    }

  }, [shouldRefresh])

  const refresh = () => {
    setState(true);
  }

  return [shouldRefresh, refresh];
}
