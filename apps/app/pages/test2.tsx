import {CustomPageContext} from "./_app";
import {lastValueFrom} from "rxjs";
import {Card, CardActionArea, CardContent, CardMedia, Typography} from "@mui/material";

export default function Test2({pageProps: {user}}: any) {
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

Test2.getInitialProps = async (ctx: CustomPageContext) => {
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
