import { Box, Grid, Paper, Typography } from "@mui/material";
import SummaryCard from "../SummaryCard";

const SUMMARY_CARDS = [
  { title: "Total Properties", value: "1" },
  { title: "Active Loan Amount", value: "$45M" },
  { title: "Risk Alerts", value: "2" },
];

function OverviewPage() {
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">
          Sunset Villas Acquisition
        </Typography>

        <Typography variant="subtitle1" color="text.secondary">
          Deal Overview
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Borrower
              </Typography>
              <Typography variant="subtitle1">
                Sunset Holdings LLC
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Loan Amount
              </Typography>
              <Typography variant="subtitle1">
                $45,000,000
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Stage
              </Typography>
              <Typography variant="subtitle1">
                Underwriting
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Region
              </Typography>
              <Typography variant="subtitle1">
                Southeast
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {SUMMARY_CARDS.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <SummaryCard title={card.title} value={card.value} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default OverviewPage;
