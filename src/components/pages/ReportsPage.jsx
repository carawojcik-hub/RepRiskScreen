import { Typography } from "@mui/material";

function ReportsPage() {
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Reports
      </Typography>
      <Typography color="text.secondary">
        Reports and analytics will be available here. Select a report type from the options below or schedule a new report.
      </Typography>
    </>
  );
}

export default ReportsPage;
