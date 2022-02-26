import App, {AppContext, AppProps} from 'next/app';
import Head from 'next/head';
import Services from "../services";
import {NextPageContext} from "next";
import {Miniverse} from "react-miniverse";
import Layout from "../components/layout/layout";
import {CssBaseline} from "@mui/material";
import theme from "../src/theme";
import {CacheProvider, EmotionCache} from "@emotion/react";
import {ThemeProvider} from '@mui/material/styles';
import createEmotionCache from '../src/create-emotion-cache';

const clientSideEmotionCache = createEmotionCache();
export declare type CustomAppProps =
  AppProps & {
  _store: never;
  emotionCache: EmotionCache;
};
function CustomApp({Component, pageProps, _store, emotionCache = clientSideEmotionCache}: CustomAppProps) {

  if (typeof window !== 'undefined') {
    Miniverse.getInstance().hydrate(_store);
  }

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Welcome to </title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </CacheProvider>
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
