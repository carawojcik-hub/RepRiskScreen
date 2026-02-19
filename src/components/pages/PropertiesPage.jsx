import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const MOCK_PROPERTIES = [
  {
    id: 1,
    name: "Riverside Apartments",
    city: "Austin",
    loanAmount: "$42.5M",
    occupancy: 94,
    riskStatus: "Low",
  },
  {
    id: 2,
    name: "Parkview Commons",
    city: "Denver",
    loanAmount: "$28.2M",
    occupancy: 87,
    riskStatus: "Medium",
  },
  {
    id: 3,
    name: "Summit Heights",
    city: "Phoenix",
    loanAmount: "$68.0M",
    occupancy: 91,
    riskStatus: "Low",
  },
  {
    id: 4,
    name: "Cascade Gardens",
    city: "Atlanta",
    loanAmount: "$35.8M",
    occupancy: 78,
    riskStatus: "High",
  },
  {
    id: 5,
    name: "Harbor Point Residences",
    city: "Tampa",
    loanAmount: "$52.1M",
    occupancy: 89,
    riskStatus: "Medium",
  },
];

const RISK_CHIP_COLOR = {
  Low: "success",
  Medium: "warning",
  High: "error",
};

function PropertiesPage() {
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Properties
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search properties..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Property Name</TableCell>
              <TableCell>City</TableCell>
              <TableCell align="right">Loan Amount</TableCell>
              <TableCell align="right">Occupancy %</TableCell>
              <TableCell>Risk Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_PROPERTIES.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.city}</TableCell>
                <TableCell align="right">{row.loanAmount}</TableCell>
                <TableCell align="right">{row.occupancy}%</TableCell>
                <TableCell>
                  <Chip
                    label={row.riskStatus}
                    color={RISK_CHIP_COLOR[row.riskStatus]}
                    size="small"
                    variant="filled"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default PropertiesPage;
