import {BehaviorSubject, catchError, defer, Observable, shareReplay, Subscriber, switchMap, tap} from "rxjs";
import {deepEqual} from "fast-equals";

export interface OptionsInterface {
  refresh?: boolean;
  complete?: boolean;
  params?: {
    [key: string]: any;
  };
}

export class Miniverse {
  private hydrated = false;
  private hot: Map<string, BehaviorSubject<any>> = new Map<string, BehaviorSubject<any>>();
  private params: Map<string, any> = new Map<string, any>();
  private static instance: Miniverse;

  public static getInstance(): Miniverse {
    if (typeof window === 'undefined') {
      // Serverside.
      return new Miniverse();
    }

    if (!Miniverse.instance) {
      Miniverse.instance = new Miniverse();
    }

    return Miniverse.instance;
  }

  /**
   * Get the latest value for a given resource
   *
   * @param namespace
   * @param key
   */
  public getStatic(namespace: string, key: string): any {
    const nsKey = this.getKey(namespace, key);

    if (this.hot.has(nsKey)) {
      return this.hot.get(nsKey)?.value;
    }

    return null;
  }

  /**
   * Complete all Subjects and clear data
   *
   * This should be used when running server side
   */
  public close() {
    console.log('CLOSE');
    Array.from(this.hot.values()).forEach((obs: BehaviorSubject<any>) => {
      obs.complete();
    })

    this.params = new Map<string, any>();
    this.hot = new Map<string, any>();
    this.hydrated = false;

    Miniverse.instance = new Miniverse();
  }

  /**
   * Clear params for given resource to fetch fresh from a fresh copy
   *
   * @param namespace
   * @param key
   */
  public clear(namespace: string, key: string): void {
    console.log('CLEAR');
    const nsKey = this.getKey(namespace, key);
    const obs = this.hot.get(nsKey);
    if (obs) {
      obs.complete();
      this.hot.delete(nsKey);
    }

    if (!this.params.has(nsKey)) {
      return;
    }

    this.params.delete(nsKey);
  }

  private getBehaviorSubject<T>(namespace: string, key?: string, value?: T): BehaviorSubject<T> {
    const nsKey = key ? this.getKey(namespace, key) : namespace;
    let subject = this.hot.get(nsKey);

    if (!subject) {
      subject = new BehaviorSubject<any>(value || null);
      this.hot.set(nsKey, subject);

      return subject;
    }

    if (value) {
      subject.next(value)
    }

    subject.pipe(shareReplay(2));

    return subject;
  }

  /**
   * Subscribe to a given resource
   *
   * @param namespace
   * @param key
   */
  public watch<T = any>(namespace: string, key: string): Observable<T> {
    return this.getBehaviorSubject<T>(namespace, key).asObservable();
  }

  /**
   * Fetch and cache the resource.
   *
   * @param namespace
   * @param key
   * @param resource
   * @param options
   */
  public fetch<T = any>(namespace: string, key: string, resource: Observable<any>, options?: OptionsInterface): Observable<T> {
    const refresh = this.shouldRefresh(namespace, key, options);
    const nsKey = this.getKey(namespace, key);
    const subject = this.getBehaviorSubject<T>(namespace, key);

    if (options?.params) {
      this.params.set(nsKey, {...options?.params});
    } else {
      this.params.delete(nsKey);
    }

    if (options?.complete && refresh) {
      return this.deferLoad(namespace, key, resource, options);
    }

    if (subject?.value === null) {
      return this.deferLoad(namespace, key, resource, options);
    }

    if (refresh) {
       this.load(namespace, key, resource).subscribe();
    }

    if(options?.complete) {
      return new Observable((subscriber => {
        subscriber.next(subject.value)
        subscriber.complete();
      }));
    }

    return subject.asObservable();
  }

  /**
   * Should the resource be fetched from the server or should we give the hot value
   *
   * @param namespace
   * @param key
   * @param options
   * @private
   */
  private shouldRefresh(namespace: string, key: string, options?: OptionsInterface): boolean {
    const nsKey = this.getKey(namespace, key);

    if (!this.hot.has(nsKey)) {
      return false;
    }

    if (options) {
      const {refresh} = options;
      if (refresh) {
        return true;
      }
    }

    if (!options?.params && !this.params.get(nsKey)) {
      return false;
    }

    return !deepEqual(options?.params, this.params.get(nsKey));
  }

  /**
   * Defer the loading of the resource until there is a subscriber
   *
   * @param namespace
   * @param key
   * @param resource
   * @param options
   * @private
   */
  private deferLoad<T>(namespace: string, key: string, resource: Observable<any>, options?: OptionsInterface): Observable<T> {
    if (options?.complete) {
      return defer(() => {
        return new Observable<any>((subscriber) => {
          this.load<T>(namespace, key, resource, subscriber).subscribe();
        });
      });
    }

    return defer(() => {
      return new Observable<any>((subscriber) => {
        this.load<T>(namespace, key, resource, subscriber).subscribe();
      }).pipe(
        switchMap(() => {
          return this.getBehaviorSubject<T>(namespace, key).asObservable();
        })
      );
    });
  }

  /**
   * Subscribe to the given resource and emit its value
   *
   * @param namespace
   * @param key
   * @param resource
   * @param subscriber
   * @private
   */
  private load<T = any>(namespace: string, key: string, resource: Observable<T>, subscriber?: Subscriber<any>): Observable<T> {
    const nsKey = this.getKey(namespace, key);
    if (this.hot.get(nsKey)?.closed) {
      this.hot.delete(nsKey);
    }

    return resource
      .pipe(
        tap((value) => {
          this.getBehaviorSubject<T>(namespace, key, value);
          subscriber?.next(value);
          subscriber?.complete();
        }),
        catchError((err) => {
          this.getBehaviorSubject<T>(namespace, key);
          subscriber?.next(null);
          subscriber?.complete();
          return err;
        })
      ) as Observable<T>;
  }

  /**
   * Hydrate the data, creating observables and fill them
   *
   * @param data
   */
  public hydrate(data: { [key: string]: any }): void {
    if (this.hydrated) {
      return;
    }

    Object.keys(data).forEach((key: string) => {
      const {value, params} = data[key];
      this.getBehaviorSubject(key).next(value);
      this.params.set(key, params);
    });

    this.hydrated = true;
  }

  /**
   * Export all data to be used for rehydration
   */
  public export() {
    const x = Array.from(this.hot.keys())
      .map((key) => {
        return {
          key,
          value: this.hot.get(key)?.value,
          params: this.params.get(key)
        }
      }).reduce((prev: { [index: string]: any }, {key, value, params}) => {
        prev[key as string] = {value, params};
        return prev;
      }, {});

    return x;
  }

  private getKey(namespace: string, key: string): string {
    return `${namespace}|${key}`;
  }
}


