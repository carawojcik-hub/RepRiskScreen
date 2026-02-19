import { AppBar, Toolbar, Typography } from "@mui/material";

const APP_BAR_HEIGHT = 64;

function TopNav({ title = "Multifamily Portfolio Dashboard", drawerWidth = 240 }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
    >
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
