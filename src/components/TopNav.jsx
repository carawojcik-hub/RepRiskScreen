import { AppBar, Toolbar, Typography } from "@mui/material";

const APP_BAR_HEIGHT = 64;

function TopNav({ title = "Multifamily Portfolio Dashboard" }) {
  return (
    <AppBar position="sticky" sx={{ width: "100%" }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="h1">
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopNav;
export { APP_BAR_HEIGHT };
