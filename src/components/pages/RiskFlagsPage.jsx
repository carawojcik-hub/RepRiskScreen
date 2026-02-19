import { List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const MOCK_RISK_ITEMS = [
  "Loan-to-value above threshold (Property A)",
  "Debt service coverage ratio declining (Property B)",
  "Lease rollover concentration (Property C)",
];

function RiskFlagsPage() {
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Risk Flags
      </Typography>
      <List>
        {MOCK_RISK_ITEMS.map((item, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <WarningAmberIcon color="warning" />
            </ListItemIcon>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </>
  );
}

export default RiskFlagsPage;
