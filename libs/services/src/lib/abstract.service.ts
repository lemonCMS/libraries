import {catchError, defer, Observable, of} from 'rxjs';
import {ApiService} from './api.service';
import {Miniverse} from "react-miniverse";

export abstract class AbstractService {

  protected constructor(
    protected api: ApiService,
    protected store: Miniverse
  ) {

  }

  public getBaseUrl(resource?: string, id?: string | number, action?: string): string {
    const domain: string = this.getHost();
    if (domain) {
      if (id && action) {
        return `${domain}/${resource}/${id}/${action}`;
      }

      if (id) {
        return `${domain}/${resource}/${id}`;
      }

      return `${domain}/${resource}`;
    }

    throw new Error(`BaseUrl not set for service ${this.constructor.name}`);
  }

  public abstract getHost(): string;

  public abstract getNamespace(): string;

  protected cache<T>({key, resource, id, action, options, data}: CacheProps): Observable<T> {
    return this.store.fetch(
      this.getNamespace(),
      key,
      defer(() =>
        this.api.get(this.getBaseUrl(resource, id, action), {params: data}).pipe(catchError(() => of(null)))
      ),
      options
    );
  }
}

export interface CacheProps {
  key: string;
  resource: string;
  id?: string | number;
  action?: string;
  options?: any;
  data?: any;
}
