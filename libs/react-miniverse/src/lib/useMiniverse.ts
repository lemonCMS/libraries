import {useEffect, useState} from 'react';
import {Observable} from "rxjs";

export const useMiniverse = <T=any>(resource: Observable<any>, defaultValue?: any):T => {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    const sub = resource.subscribe((result) => {
      setState(result);
    });

    return () => {
      sub.unsubscribe();
    }
  }, [])

  return state;
}
