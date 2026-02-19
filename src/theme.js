import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1a365d",
    },
    background: {
      default: "#f5f7fa",
    },
    drawer: {
      main: "#1f2937",
      contrastText: "#f9fafb",
    },
  },
});

export default theme;
