# react-miniverse

What is ``react-miniverse``? It is a simple state manager. It can be used to fetch data, cache the data and update all
components that are subscribed to the resource.

You can also use ``react-miniverse`` to share the state between components.

Works great with ``nextjs`` share state between the server and client.

1.8K minified or only 795bytes gzipped.

# Why did you create this?

After setting up Nextjs with redux and redux-saga i was really not looking forward creating the stores and sagas. Most
of the time a state manager is overkill for just fetching and displaying a resource and forget all about it. The work in
setting up all those stores over and over again.

I wanted something simple as in "Hey give me that data" and not having to think about the state of said data.

- Not loaded? I will load it for you and will keep updated with new data. This is very useful for remembering and
  sharing login state.
- Is loaded? I will give you what i got and will keep you updated with new data.
- Share state between Server and Client? No problem.

# Installation

npm
``npm install react-miniverse``

yarn
``yarn add react-miniverse``

## nextjs

Take a look at the example folder. The example contains loading clientside only and loading of data trough the server or
client.

### Create an AppContextProvider

Inject the services into our application. We will use context to make the services available throughout the site.

Create a file called ```AppContext.tsx```. This file contains a simple setup to create the context used throughout the
site.

### Create your service.

A service will talk to the backend and returns the response for you to use or to provide it to the StoreService The
included api service will return ONLY the ``response.data`` and not the whole response object.

```src/services/placeholder.service```

```ts
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
}

```

### Create api.service.ts

Here we bring our favorite http client and miniverse together

```ts
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


```

### Create services.ts

This file will initialize all services

```tsx
import {IncomingMessage} from 'http';
import {ApiService, PlaceholderService} from "@libraries/services";
import {Miniverse} from "react-miniverse";

class Services {

  private static instance?: Services;

  public readonly store: Miniverse;
  public readonly api: ApiService;
  public readonly placeholder: PlaceholderService;

  public constructor(_req?: IncomingMessage) {
    this.store = Miniverse.getInstance();
    this.api = new ApiService();
    this.placeholder = new PlaceholderService(this.api, this.store);
  }

  public static getInstance(req?: IncomingMessage): Services {
    if (!Services.instance) {
      Services.instance = new Services(req);
    }

    return Services.instance;
  }

  public close() {
    delete Services.instance
  }
}

export default Services;
```

### Setting up _app.tsx

Open up ``./src/pages/_app.tsx``. Here we will construct the services export data from the store and import it for the
client re-hydration.

```tsx
import App, {AppContext, AppProps} from 'next/app';
import Head from 'next/head';
import Services from "../services";
import {NextPageContext} from "next";
import {Miniverse} from "react-miniverse";
import Layout from "../components/layout/layout";

export declare type CustomAppProps =
  AppProps & {
  _store: never;
};

function CustomApp({Component, pageProps, _store}: CustomAppProps) {

  if (typeof window !== 'undefined') {
    Miniverse.getInstance().hydrate(_store);
  }

  return (
    <>
      <Head>
        <title>Welcome to </title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export declare type CustomPageContext = NextPageContext & {
  services: Services;
};

export declare type CustomAppContext = AppContext & {
  ctx: CustomPageContext;
}

CustomApp.getInitialProps = async ({Component, ctx}: CustomAppContext) => {
  ctx.services = new Services(ctx.req);

  const pageProps = await App.getInitialProps({Component, ctx} as CustomAppContext)
  const _store = ctx.services.store.export();
  ctx.req?.on('close', () => {
    ctx.services.store.close();
    ctx.services.close();
  });

  return {_store, pageProps};
};

export default CustomApp;

```

### index.tsx

Open up your ``index.tsx`` or any other page and start loading some data.

```tsx
import {CustomPageContext} from "./_app";
import {firstValueFrom, lastValueFrom, skip} from "rxjs";
import {Card, CardActionArea, CardContent, CardMedia, Typography} from "@mui/material";

export default function Index({pageProps: {user}}: any) {
  if (!user) {
    return (<div>Loading....</div>);
  }

  return (
    <Card sx={{maxWidth: 345}}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={user.avatar}
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.employment?.title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

Index.getInitialProps = async (ctx: CustomPageContext) => {
  const user = await lastValueFrom(ctx.services.placeholder.getRandomUser({
    params: {
      id: 2
    },
    complete: true
  }));

  return {
    user
  }
}
```

## Done

You are all setup. As you can see it is easy to retrieve data and stay up to date. There is much more to it so please
take a look at the sourcecode.

## Contributing

Please do, merge request are welcome.

- Update Readme add APi docs
- Create tests

Happy coding!




