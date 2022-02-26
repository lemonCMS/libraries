import {CustomPageContext} from "./_app";
import {lastValueFrom} from "rxjs";
import {Card, CardActionArea, CardContent, CardMedia, Typography} from "@mui/material";
import Link from 'next/link'
import {useRouter} from "next/router";
import {Refresh} from "@mui/icons-material";

export default function Test({pageProps: {user}}: any) {
  const {query} = useRouter();


  if (!user) {
    return (<div>Loading....</div>);
  }

  return (
    <Card sx={{ maxWidth: 345 }}>
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

      <Link href={`/test?id=${parseInt((query?.id as string) || '1') + 1}`} passHref>
        <a title={'Refresh random user'}>
          <Refresh />
        </a>
      </Link>
    </Card>
  );
}

Test.getInitialProps = async (ctx: CustomPageContext) => {
  const {query} = ctx;
  const user = await lastValueFrom(ctx.services.placeholder.getRandomUser({
    params: {
      id: query?.id || 1
    },
    complete: true
  }));

  return {
    user
  }
}
