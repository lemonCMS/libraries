import {Card, CardContent, Typography} from "@mui/material";
import Services from "../../services";
import {useMiniverse} from "react-miniverse";

export function ServerSide({catFact: _catFact}: {catFact: {fact: string}}) {
  const {placeholder} = Services.getInstance();
  const catFact = useMiniverse(placeholder.getCatFact(), _catFact);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Serverside cat fact
        </Typography>

        <Typography variant="body2" gutterBottom>
          Should show the same cat fact as the servside block. When javascript is disabled there SHOULD be a catfact.
        </Typography>

        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {catFact?.fact || 'loading...'}
        </Typography>
      </CardContent>
    </Card>
  );
}
