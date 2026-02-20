import { useState } from "react";
import {
  Badge,
  Box,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FactCheckIcon from "@mui/icons-material/FactCheck";

const getPendingScreeningCount = (entities) => {
  if (!entities || !entities.length) return 0;
  return entities.filter((e) => {
    const s = (e.searchStatus || "").trim().toLowerCase();
    return s === "not yet run";
  }).length;
};

const navItems = [
  { label: "Overview", icon: <DashboardIcon /> },
  { label: "Properties", icon: <BusinessIcon /> },
  { label: "Screening", icon: <FactCheckIcon /> },
  { label: "Risk Flags", icon: <WarningAmberIcon /> },
  { label: "Reports", icon: <AssessmentIcon /> },
];

const DEAL_ROWS = [
  { key: "borrower", label: "Borrower" },
  { key: "loanAmount", label: "Loan Amount" },
  { key: "stage", label: "Stage" },
  { key: "region", label: "Region" },
];

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;

function Sidebar({
  collapsed = false,
  onToggleSidebar,
  selectedPage,
  setSelectedPage,
  onNavigatePipeline,
  dealContext,
  entities = [],
}) {
  const [dealContextExpanded, setDealContextExpanded] = useState(false);
  const pendingScreeningCount = getPendingScreeningCount(entities);

  const handleBackToPipeline = () => {
    if (onNavigatePipeline) onNavigatePipeline();
    else setSelectedPage("Overview");
  };

  return (
    <Box
      sx={(theme) => ({
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        transition: "width 0.25s ease",
        flexShrink: 0,
        boxSizing: "border-box",
        borderRight: 1,
        borderColor: "divider",
        bgcolor: theme.palette.drawer.main,
        color: theme.palette.drawer.contrastText,
        display: "flex",
        flexDirection: "column",
        "& .MuiListItemButton-root": {
          color: theme.palette.drawer.contrastText,
        },
        "& .MuiListItemIcon-root": {
          color: theme.palette.drawer.contrastText,
          minWidth: collapsed ? 0 : 56,
          justifyContent: "center",
        },
        "& .MuiListItemButton-root.Mui-selected": {
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.contrastText,
          },
        },
      })}
    >
      <Box
        sx={{
          px: 1,
          py: 1,
          overflow: "visible",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            overflow: "visible",
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              component="span"
              variant="body2"
              sx={{ color: "primary.contrastText", fontWeight: 700 }}
            >
              MF
            </Typography>
          </Box>
          {!collapsed && (
            <Box sx={{ minWidth: 0, flex: 1, px: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                noWrap
                sx={{ color: "inherit", lineHeight: 1.2 }}
              >
                Meridian Finance
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ color: "inherit", opacity: 0.7, lineHeight: 1.2 }}
              >
                Multifamily Platform
              </Typography>
            </Box>
          )}
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
            <IconButton
              size="small"
              onClick={onToggleSidebar}
              sx={{
                ml: 0.5,
                width: 40,
                height: 40,
                flex: "0 0 auto",
                color: "common.white",
              }}
            >
              {collapsed ? (
                <ChevronRightIcon sx={{ color: "common.white" }} />
              ) : (
                <ChevronLeftIcon sx={{ color: "common.white" }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Divider sx={{ borderColor: "divider" }} />
      <Box sx={{ overflow: "auto", overflowX: "hidden", pt: 1.5, flex: 1, minHeight: 0 }}>
        <List component="nav" disablePadding>
          <Tooltip title="Back to Pipeline" placement="right">
            <ListItemButton onClick={handleBackToPipeline} sx={{ py: 1 }}>
              <ListItemIcon sx={{ color: "text.secondary" }}>
                <ArrowBackIcon />
              </ListItemIcon>
              <ListItemText
                primary="Back to Pipeline"
                primaryTypographyProps={{ variant: "body2" }}
                sx={{
                  opacity: collapsed ? 0 : 1,
                  width: collapsed ? 0 : "auto",
                  overflow: "hidden",
                  minWidth: 0,
                  transition: (theme) =>
                    theme.transitions.create(["opacity", "width"], {
                      duration: theme.transitions.duration.short,
                    }),
                }}
              />
            </ListItemButton>
          </Tooltip>
        </List>
        <Divider sx={{ borderColor: "divider" }} />
        {!collapsed && (
          <>
            <Typography
              variant="overline"
              sx={{
                px: 2,
                pt: 1.5,
                pb: 0.5,
                color: "rgba(255,255,255,0.6)",
                letterSpacing: 1.2,
              }}
            >
              Workspace
            </Typography>
            <ListItemButton
              onClick={() => setDealContextExpanded((prev) => !prev)}
              sx={{ py: 1 }}
            >
              <ListItemText
                primary={dealContext?.dealName ?? "—"}
                primaryTypographyProps={{
                  variant: "body2",
                  noWrap: true,
                  sx: {
                    color: "common.white",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  },
                }}
                sx={{ flex: 1, minWidth: 0 }}
              />
              <ListItemIcon sx={{ minWidth: 0 }}>
                {dealContextExpanded ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </ListItemIcon>
            </ListItemButton>
            <Collapse in={dealContextExpanded}>
              <Box
                sx={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  mx: 2,
                  mb: 2,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: "rgba(255,255,255,0.6)",
                    letterSpacing: 1.2,
                  }}
                >
                  Deal
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "common.white", display: "block", mt: 0.5 }}
                >
                  {dealContext?.dealName ?? "—"}
                </Typography>
                {DEAL_ROWS.map(({ key, label }) => (
                  <Box key={key} sx={{ mt: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.6)", display: "block" }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "common.white" }}
                    >
                      {dealContext?.[key] ?? "—"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
            <Divider sx={{ borderColor: "divider" }} />
          </>
        )}
        {collapsed && <Divider sx={{ borderColor: "divider" }} />}
        <List component="nav" disablePadding>
          {navItems.map((item) => {
            const isScreening = item.label === "Screening";
            return (
            <Tooltip key={item.label} title={item.label} placement="right">
              <ListItemButton
                selected={selectedPage === item.label}
                onClick={() => setSelectedPage(item.label)}
              >
                <ListItemIcon>
                  {isScreening ? (
                    <Badge
                      badgeContent={
                        pendingScreeningCount > 9
                          ? "9+"
                          : pendingScreeningCount
                      }
                      color="error"
                      overlap="circular"
                      invisible={pendingScreeningCount === 0}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    opacity: collapsed ? 0 : 1,
                    width: collapsed ? 0 : "auto",
                    overflow: "hidden",
                    minWidth: 0,
                    transition: (theme) =>
                      theme.transitions.create(["opacity", "width"], {
                        duration: theme.transitions.duration.short,
                      }),
                  }}
                />
              </ListItemButton>
            </Tooltip>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}

export default Sidebar;
