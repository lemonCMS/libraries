import {ApiService} from "./api.service";
import {defer, from, Observable} from "rxjs";
import {AbstractService} from "./abstract.service";
import {Miniverse, OptionsInterface} from "react-miniverse";

export class PlaceholderService extends AbstractService {

  public get watchCat(): Observable<any> {
    return this.store.watch(
      'placeholder',
      'cat-fact');
  }

  public constructor(
    protected api: ApiService,
    protected store: Miniverse
  ) {
    super(api, store);
  }

  public getUsers(options?: any): Observable<any> {
    return this.store.fetch(
      'api',
      'entries',
      defer(() => from(this.api.get('https://jsonplaceholder.typicode.com/users'))),
      options
    );
  }

  public getPosts(options?: any): Observable<any> {
    return this.store.fetch(
      'placeholder',
      'posts',
      defer(() => from(this.api.get('https://jsonplaceholder.typicode.com/posts'))),
      options
    );
  }

  public getCatFact(options?: OptionsInterface): Observable<any> {
    return this.store.fetch(
      'placeholder',
      'cat-fact',
      defer(() => from(this.api.get('https://catfact.ninja/fact'))),
      options
    );
  }

  public getRandomUser(options?: OptionsInterface): Observable<any> {
    return this.store.fetch(
      'placeholder',
      'random-user',
      defer(() => from(this.api.get('https://random-data-api.com/api/users/random_user'))),
      options
    );
  }

  getHost(): string {
    return "";
  }

  getNamespace(): string {
    return "";
  }
}
