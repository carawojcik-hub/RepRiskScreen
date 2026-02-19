import { Box, Toolbar } from "@mui/material";
import TopNav, { APP_BAR_HEIGHT } from "./TopNav";
import Sidebar from "./Sidebar";
import OverviewPage from "./pages/OverviewPage";
import PropertiesPage from "./pages/PropertiesPage";
import RiskFlagsPage from "./pages/RiskFlagsPage";
import ReportsPage from "./pages/ReportsPage";
import DealScreeningPage from "./pages/DealScreeningPage";

const DRAWER_WIDTH = 240;

const PAGE_COMPONENTS = {
  Overview: OverviewPage,
  Properties: PropertiesPage,
  Screening: DealScreeningPage,
  "Risk Flags": RiskFlagsPage,
  Reports: ReportsPage,
};

const dealContext = {
  dealName: "Sunset Villas Acquisition",
  borrower: "Sunset Holdings LLC",
  loanAmount: "$45,000,000",
  stage: "Underwriting",
  region: "Southeast",
};

function DashboardLayout({
  selectedPage,
  setSelectedPage,
  onNavigatePipeline,
}) {
  const PageContent = PAGE_COMPONENTS[selectedPage] ?? OverviewPage;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <TopNav drawerWidth={DRAWER_WIDTH} />
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        onNavigatePipeline={onNavigatePipeline}
        dealContext={dealContext}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: `${APP_BAR_HEIGHT}px`,
        }}
      >
        <Toolbar />
        <PageContent onNavigatePipeline={onNavigatePipeline} />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
