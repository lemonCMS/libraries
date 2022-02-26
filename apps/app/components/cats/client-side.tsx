import {Card, CardContent, Typography} from "@mui/material";
import {useMiniverse} from "react-miniverse";
import Services from "../../services";

export function ClientSide() {
  const {placeholder} = Services.getInstance();
  const catFact = useMiniverse(placeholder.getCatFact());

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Clientside cat fact
        </Typography>
        <Typography variant="body2" gutterBottom>
          Should show the same cat fact as the servside block. When javascript is disabled there should not be a cat fact. <br />
          There also should not be an client side network request in the network tab.
        </Typography>

        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {catFact?.fact || 'loading...'}
        </Typography>

      </CardContent>
    </Card>
  );
}
