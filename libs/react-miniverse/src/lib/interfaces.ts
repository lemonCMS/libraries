import {Observable} from "rxjs";

export interface useMiniVerseInterface {
    <T = any>(resource: Observable<T>): T
}

export interface miniverseInterface {

    close(): void;

    store(namespace: string, key: string, value: any): void;

    fetch<T = any>(namespace: string, key: string, resource: Observable<any>, options?: any): Observable<T>;

    hydrate(data: { [key: string]: any }): void;

    export(): any;
}