import { useState } from "react";
import { Box } from "@mui/material";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import OverviewPage from "./pages/OverviewPage";
import PropertiesPage from "./pages/PropertiesPage";
import RiskFlagsPage from "./pages/RiskFlagsPage";
import ReportsPage from "./pages/ReportsPage";
import DealScreeningPage from "./pages/DealScreeningPage";

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
  entities,
  setEntities,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const PageContent = PAGE_COMPONENTS[selectedPage] ?? OverviewPage;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      <Sidebar
        collapsed={collapsed}
        onToggleSidebar={() => setCollapsed((prev) => !prev)}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        onNavigatePipeline={onNavigatePipeline}
        dealContext={dealContext}
        entities={entities}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        <TopNav />
        <Box sx={{ p: 3, flex: 1, minHeight: 0, overflow: "auto" }}>
          <PageContent
            onNavigatePipeline={onNavigatePipeline}
            entities={entities}
            setEntities={setEntities}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
