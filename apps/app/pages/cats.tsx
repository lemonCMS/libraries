import {Box, Button} from "@mui/material";
import {ServerSide} from "../components/cats/server-side";
import {ClientSide} from "../components/cats/client-side";
import {CustomPageContext} from "./_app";
import {lastValueFrom} from "rxjs";
import useRefresh from "../hooks/use-refresh";
import {useEffect} from "react";
import Services from "../services";
import Item from "../components/item";

function Cats({pageProps: {catFact}}: any) {
  const [shouldRefresh, refresh] = useRefresh();
  const {placeholder} = Services.getInstance();

  useEffect(() => {
    placeholder.getCatFact({
      refresh: shouldRefresh
    });
  }, [shouldRefresh])

  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        p: 1,
        m: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
      }}>
        <Item sx={{flexGrow: 1}}>
          <ServerSide catFact={catFact}/>
        </Item>
        <Item sx={{flexGrow: 1}}>
          <ClientSide/>
        </Item>
      </Box>

      <Box>
        <Button onClick={() => refresh()}>Load new cat fact</Button>
      </Box>
    </>
  );
}

Cats.getInitialProps = async (ctx: CustomPageContext) => {
  const catFact = await lastValueFrom(ctx.services.placeholder.getCatFact({complete: true}));

  return {
    catFact
  }
}

export default Cats;
