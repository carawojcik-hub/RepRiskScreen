import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControlLabel,
  FormGroup,
  Grid,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const DEFAULT_TERMS = [
  "Litigation",
  "Financial Crime",
  "Regulatory Action",
  "Sanctions",
  "Fraud",
];

const ENTITIES = [
  {
    id: 1,
    name: "Sunset Holdings LLC",
    type: "Borrower",
    source: "Borrower profile",
    searchStatus: "Complete",
    riskLevel: "Low",
    priorScreening: "No",
    priorDeals: [
      {
        dealName: "Riverside Towers Refinance",
        closeDate: "2019-06-15",
        screeningDate: "2019-05-30",
        outcomeSummary: "2 findings (1 false positive)",
      },
      {
        dealName: "Harborview Portfolio Acquisition",
        closeDate: "2021-11-02",
        screeningDate: "2021-10-20",
        outcomeSummary: "1 finding (0 false positives)",
      },
    ],
  },
  {
    id: 2,
    name: "Sunset Villas",
    type: "Property",
    source: "Property data",
    searchStatus: "In Progress",
    riskLevel: "Medium",
    priorScreening: "No",
    priorDeals: [],
  },
  {
    id: 3,
    name: "Horizon Management Group",
    type: "Management Company",
    source: "Org chart",
    searchStatus: "Complete",
    riskLevel: "Low",
    priorScreening: "Yes",
    priorDeals: [
      {
        dealName: "Lakeside MHC Portfolio",
        closeDate: "2018-09-01",
        screeningDate: "2018-08-15",
        outcomeSummary: "1 finding (1 false positive)",
      },
    ],
  },
  {
    id: 4,
    name: "Blue Harbor Capital",
    type: "Seller",
    source: "Transaction data",
    searchStatus: "Complete",
    riskLevel: "High",
    priorScreening: "No",
    priorDeals: [],
  },
  {
    id: 5,
    name: "Oakview Partners LP",
    type: "Sponsor",
    source: "Deal parties",
    searchStatus: "Complete",
    riskLevel: "Low",
    priorScreening: "Yes",
    priorDeals: [
      {
        dealName: "Maple Grove Recapitalization",
        closeDate: "2020-03-15",
        screeningDate: "2020-02-28",
        outcomeSummary: "0 findings",
      },
    ],
  },
  {
    id: 6,
    name: "Lakeside Apartments",
    type: "Property",
    source: "Property data",
    searchStatus: "Complete",
    riskLevel: "Medium",
    priorScreening: "No",
    priorDeals: [],
  },
  {
    id: 7,
    name: "Harborstone Equity Fund II",
    type: "Equity Partner",
    source: "Deal parties",
    searchStatus: "Complete",
    riskLevel: "High",
    priorScreening: "No",
    priorDeals: [
      {
        dealName: "Harborview Portfolio Acquisition",
        closeDate: "2021-11-02",
        screeningDate: "2021-10-20",
        outcomeSummary: "1 finding (0 false positives)",
      },
    ],
  },
  {
    id: 8,
    name: "Crescent Property Services",
    type: "Management Company",
    source: "Org chart",
    searchStatus: "Complete",
    riskLevel: "Low",
    priorScreening: "Yes",
    priorDeals: [
      {
        dealName: "Lakeside MHC Portfolio",
        closeDate: "2018-09-01",
        screeningDate: "2018-08-15",
        outcomeSummary: "1 finding (1 false positive)",
      },
    ],
  },
  {
    id: 9,
    name: "Riverwalk Holdings LLC",
    type: "Borrower Affiliate",
    source: "Deal parties",
    searchStatus: "In Progress",
    riskLevel: "Medium",
    priorScreening: "No",
    priorDeals: [
      {
        dealName: "Riverside Towers Refinance",
        closeDate: "2019-06-15",
        screeningDate: "2019-05-30",
        outcomeSummary: "2 findings (1 false positive)",
      },
      {
        dealName: "Maple Grove Recapitalization",
        closeDate: "2020-03-15",
        screeningDate: "2020-02-28",
        outcomeSummary: "0 findings",
      },
    ],
  },
  {
    id: 10,
    name: "Northgate Capital Partners",
    type: "Co-Lender",
    source: "Deal parties",
    searchStatus: "Complete",
    riskLevel: "Low",
    priorScreening: "Yes",
    priorDeals: [
      {
        dealName: "Harborview Portfolio Acquisition",
        closeDate: "2021-11-02",
        screeningDate: "2021-10-18",
        outcomeSummary: "0 findings",
      },
    ],
  },
  {
    id: 11,
    name: "Elm Street Apartments",
    type: "Property",
    source: "Property data",
    searchStatus: "Complete",
    riskLevel: "Low",
    priorScreening: "No",
    priorDeals: [],
  },
  {
    id: 12,
    name: "Summit Ridge Ventures",
    type: "Sponsor",
    source: "Deal parties",
    searchStatus: "In Progress",
    riskLevel: "Medium",
    priorScreening: "No",
    priorDeals: [],
  },
  {
    id: 13,
    name: "Brightstone Advisory Group",
    type: "Consultant",
    source: "Deal parties",
    searchStatus: "Complete",
    riskLevel: "Low",
    priorScreening: "Yes",
    priorDeals: [],
  },
  {
    id: 14,
    name: "Seaside Holdings BV",
    type: "Offshore Affiliate",
    source: "Deal parties",
    searchStatus: "Complete",
    riskLevel: "High",
    priorScreening: "No",
    priorDeals: [
      {
        dealName: "Riverside Towers Refinance",
        closeDate: "2019-06-15",
        screeningDate: "2019-05-28",
        outcomeSummary: "1 finding (0 false positives)",
      },
    ],
  },
  {
    id: 15,
    name: "Maple Grove Residences",
    type: "Property",
    source: "Property data",
    searchStatus: "Complete",
    riskLevel: "Low",
    priorScreening: "Yes",
    priorDeals: [],
  },
  {
    id: 16,
    name: "Cornerstone Real Estate Partners",
    type: "Sponsor",
    source: "Deal parties",
    searchStatus: "Complete",
    riskLevel: "Medium",
    priorScreening: "No",
    priorDeals: [],
  },
];

const FINDINGS_BY_ENTITY = {
  "Sunset Villas": [
    {
      id: "sv-1",
      summary: "Noise complaints filed by neighboring community association (2023).",
      title: "Noise complaints filed by neighboring community association",
      category: "Regulatory",
      source: "Google",
      url: "https://example.com/sunset-villas-finding-1",
    },
    {
      id: "sv-2",
      summary: "Code enforcement inspection related to parking allocation.",
      title: "Code enforcement inspection related to parking allocation",
      category: "Regulatory",
      source: "News PDF",
      url: "https://example.com/sunset-villas-finding-2",
    },
  ],
  "Blue Harbor Capital": [
    {
      id: "bhc-1",
      summary: "Former executive named in SEC inquiry.",
      title: "Former executive named in SEC inquiry",
      category: "Litigation",
      source: "Lexis Nexis Bridger Insight",
      url: "https://example.com/blue-harbor-finding-1",
    },
    {
      id: "bhc-2",
      summary: "Media coverage of prior fund wind-down.",
      title: "Media coverage of prior fund wind-down",
      category: "Regulatory",
      source: "Google",
      url: "https://example.com/blue-harbor-finding-2",
    },
  ],
};

const RISK_COLOR = {
  Low: "success",
  Medium: "warning",
  High: "error",
};

function DealScreeningPage({ onBackToPipeline }) {
  const [status, setStatus] = useState("Not Started");
  const [lastRun, setLastRun] = useState("");
  const [newEntitiesDetected, setNewEntitiesDetected] = useState(true);
  const [customTerms, setCustomTerms] = useState([]);
  const [currentTerm, setCurrentTerm] = useState("");
  const [lastRunTerms, setLastRunTerms] = useState([...DEFAULT_TERMS]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [criteriaExpanded, setCriteriaExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  const [importedEntityIds, setImportedEntityIds] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedDealNames, setSelectedDealNames] = useState([]);
  const [bulkImportedDealNames, setBulkImportedDealNames] = useState([]);
  const [findingNotes, setFindingNotes] = useState({});
  const [noteSavedHintKey, setNoteSavedHintKey] = useState(null);
  const timeoutRef = useRef(null);
  const noteSavedTimeoutRef = useRef(null);

  const getFindingNoteKey = (entityId, findingId) => `${entityId}:${findingId}`;

  const handleFindingNoteChange = (entityId, findingId, value) => {
    setFindingNotes((prev) => ({
      ...prev,
      [getFindingNoteKey(entityId, findingId)]: value,
    }));
  };

  const handleFindingNoteBlur = (entityId, findingId) => {
    const key = getFindingNoteKey(entityId, findingId);
    if (noteSavedTimeoutRef.current) clearTimeout(noteSavedTimeoutRef.current);
    setNoteSavedHintKey(key);
    noteSavedTimeoutRef.current = setTimeout(() => setNoteSavedHintKey(null), 2000);
  };

  const entityHasNotes = useMemo(() => {
    const map = {};
    Object.keys(findingNotes).forEach((key) => {
      const [entityId] = key.split(":");
      if (entityId) map[entityId] = true;
    });
    return map;
  }, [findingNotes]);

  const allPriorDeals = useMemo(() => {
    const flat = ENTITIES.flatMap((entity) => entity.priorDeals || []);
    const byName = new Map();
    flat.forEach((deal) => {
      if (!byName.has(deal.dealName)) {
        byName.set(deal.dealName, {
          dealName: deal.dealName,
          closeDate: deal.closeDate,
          screeningDate: deal.screeningDate,
          outcomeSummary: deal.outcomeSummary,
        });
      }
    });
    return Array.from(byName.values()).sort(
      (a, b) => (b.screeningDate || "").localeCompare(a.screeningDate || "")
    );
  }, []);

  const SECTION_IDS = ["deal-summary", "entities", "search-criteria"];

  const handleAddTerm = () => {
    const trimmed = currentTerm.trim();
    if (!trimmed) return;
    if (
      customTerms.some(
        (term) => term.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setCurrentTerm("");
      return;
    }
    setCustomTerms((prev) => [...prev, trimmed]);
    setCurrentTerm("");
  };

  const handleRemoveTerm = (termToRemove) => {
    setCustomTerms((prev) => prev.filter((term) => term !== termToRemove));
  };

  const handleRowClick = (entity) => {
    setSelectedEntity(entity);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleImportPriorFindings = (entity) => {
    if (importedEntityIds.includes(entity.id)) return;
    setImportedEntityIds((prev) => [...prev, entity.id]);
    setSnackbarMessage(`Imported prior findings for ${entity.name}`);
    setSnackbarOpen(true);
  };

  const handleOpenBulkDialog = () => {
    setBulkDialogOpen(true);
    setSelectedDealNames(
      bulkImportedDealNames.length > 0
        ? [...bulkImportedDealNames]
        : allPriorDeals.map((d) => d.dealName)
    );
  };

  const handleBulkDialogClose = () => {
    setBulkDialogOpen(false);
  };

  const handleBulkDealToggle = (dealName) => {
    setSelectedDealNames((prev) =>
      prev.includes(dealName)
        ? prev.filter((n) => n !== dealName)
        : [...prev, dealName]
    );
  };

  const handleBulkImportSelected = () => {
    setBulkImportedDealNames(selectedDealNames);
    const entityIds = ENTITIES.filter((entity) =>
      (entity.priorDeals || []).some((pd) => selectedDealNames.includes(pd.dealName))
    ).map((e) => e.id);
    setImportedEntityIds(entityIds);
    setSnackbarMessage(`Imported findings from ${selectedDealNames.length} prior deals`);
    setSnackbarOpen(true);
    setBulkDialogOpen(false);
  };

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
    const id = SECTION_IDS[newValue];
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFlaggedToggle = (event) => {
    setShowOnlyFlagged(event.target.checked);
    setPage(0);
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRunClick = () => {
    if (status === "Running") return;

    setStatus("Running");
    setNewEntitiesDetected(true);
    setLastRunTerms([...DEFAULT_TERMS, ...customTerms]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setStatus("Completed");
      setLastRun(new Date().toLocaleString());
      setNewEntitiesDetected(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const filteredEntities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return ENTITIES.filter((entity) => {
      const matchesQuery = query
        ? entity.name.toLowerCase().includes(query)
        : true;
      const matchesFlagged = showOnlyFlagged
        ? entity.riskLevel === "Medium" || entity.riskLevel === "High"
        : true;

      return matchesQuery && matchesFlagged;
    });
  }, [searchQuery, showOnlyFlagged]);

  const pagedEntities = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredEntities.slice(start, end);
  }, [filteredEntities, page, rowsPerPage]);

  return (
    <Box sx={{ overflowX: "hidden", maxWidth: "100%", minWidth: 0 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Reputation Risk Screening
      </Typography>

      <Box
        sx={{
          position: "sticky",
          top: "64px",
          zIndex: (theme) => theme.zIndex.appBar - 1,
          bgcolor: (theme) => theme.palette.background.default,
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Deal Summary" />
          <Tab label="Associated Entities" />
          <Tab label="Search Criteria" />
        </Tabs>
      </Box>

      <Box id="deal-summary" sx={{ mb: 3, scrollMarginTop: "140px" }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Deal Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Deal Name
              </Typography>
              <Typography variant="subtitle1">
                Sunset Villas Acquisition
              </Typography>
            </Grid>
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
          </Grid>
        </Paper>
      </Box>

      <Box id="entities" sx={{ mb: 3, scrollMarginTop: "140px" }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Typography variant="h6">Associated Entities</Typography>
              <Chip
                label={
                  status === "Not Started"
                    ? "Not yet run"
                    : status === "Running"
                    ? "Running"
                    : "Completed"
                }
                color={
                  status === "Not Started"
                    ? "default"
                    : status === "Completed"
                    ? "success"
                    : "warning"
                }
                size="small"
                variant={status === "Not Started" ? "outlined" : "filled"}
              />
              {bulkImportedDealNames.length > 0 && (
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleOpenBulkDialog}
                  sx={{ cursor: "pointer" }}
                >
                  Manage imports
                </Link>
              )}
            </Box>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button
                variant="contained"
                onClick={handleRunClick}
                disabled={status === "Running"}
              >
                {status === "Not Started" ? "Run Screening" : "Re-Run Screening"}
              </Button>
              {allPriorDeals.length > 0 && (
                <Button variant="outlined" onClick={handleOpenBulkDialog}>
                  Bulk import prior findings
                </Button>
              )}
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Coverage: Google · News · Web · LexisNexis Bridger Insight · Sanctions/Watchlists
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Criteria: {DEFAULT_TERMS.length} default · {customTerms.length} custom
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                setActiveTab(2);
                setCriteriaExpanded(true);
                setTimeout(() => {
                  document.getElementById("search-criteria")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 0);
              }}
              sx={{ cursor: "pointer" }}
            >
              View/Edit criteria
            </Link>
          </Box>

          {status !== "Not Started" && newEntitiesDetected && (
            <Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
              New entities detected since last screening
            </Typography>
          )}

          <Box
            sx={{
              mb: 1,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
            }}
          >
          <TextField
            label="Search entities"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ maxWidth: 320 }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", sm: "row" },
              alignItems: "center",
              justifyContent: { xs: "space-between", sm: "flex-end" },
              gap: 2,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={showOnlyFlagged}
                  onChange={handleFlaggedToggle}
                />
              }
              label="Show only flagged"
            />
            <Typography variant="caption" color="text.secondary">
              {`Showing ${filteredEntities.length} of ${ENTITIES.length} entities`}
            </Typography>
          </Box>
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ tableLayout: "fixed", width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell>Entity Name</TableCell>
                <TableCell>Entity Type</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Search Status</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Prior Screening</TableCell>
                <TableCell>Prior deal history</TableCell>
                <TableCell>Findings</TableCell>
                <TableCell>UW Notes</TableCell>
                <TableCell sx={{ width: 100 }}>Imported</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedEntities.map((entity) => (
                <TableRow
                  key={entity.id}
                  hover
                  onClick={() => handleRowClick(entity)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 240,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {entity.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{entity.type}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 200,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {entity.source ?? "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {status === "Not Started" ? (
                      <Chip label="Not run" size="small" color="default" variant="outlined" />
                    ) : status === "Running" ? (
                      <Chip label="Running" size="small" color="warning" />
                    ) : (
                      <Chip
                        label={entity.searchStatus}
                        color={
                          entity.searchStatus === "Complete" ? "success" : "warning"
                        }
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={entity.riskLevel}
                      color={RISK_COLOR[entity.riskLevel]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{entity.priorScreening}</TableCell>
                  <TableCell>
                    {(!entity.priorDeals || entity.priorDeals.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                    {entity.priorDeals && entity.priorDeals.length === 1 && (
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {entity.priorDeals[0].dealName}
                      </Typography>
                    )}
                    {entity.priorDeals && entity.priorDeals.length > 1 && (
                      <>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {entity.priorDeals[0].dealName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {`(+${entity.priorDeals.length - 1} more)`}
                        </Typography>
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {(FINDINGS_BY_ENTITY[entity.name]?.length ?? 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {entityHasNotes[String(entity.id)] ? (
                      <Chip label="Notes" size="small" color="info" variant="outlined" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {importedEntityIds.includes(entity.id) ? (
                      <Chip label="Imported" size="small" color="info" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRowClick(entity);
                      }}
                      endIcon={
                        <ArrowForwardIosIcon
                          fontSize="inherit"
                        />
                      }
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredEntities.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
        />
        </Paper>
      </Box>

      <Box id="search-criteria" sx={{ mb: 3, scrollMarginTop: "140px" }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Search Criteria
          </Typography>
          <Accordion
            expanded={criteriaExpanded}
            onChange={(_, expanded) => setCriteriaExpanded(expanded)}
            disableGutters
            sx={{
              boxShadow: "none",
              "&::before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="search-criteria-content"
              id="search-criteria-header"
              sx={{
                px: 0,
                "& .MuiAccordionSummary-content": {
                  margin: 0,
                },
                "& .MuiAccordionSummary-content.Mui-expanded": {
                  margin: 0,
                },
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {`Search Criteria${
                  customTerms.length > 0
                    ? ` (${customTerms.length} custom)`
                    : ""
                }`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1 }}
                >
                  Default Terms
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                  {DEFAULT_TERMS.map((term) => (
                    <Chip
                      key={term}
                      label={term}
                      variant="outlined"
                      color="primary"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1 }}
                >
                  Custom Terms
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  sx={{ mb: 1.5 }}
                >
                  <TextField
                    label="Add Custom Search Term"
                    size="small"
                    value={currentTerm}
                    onChange={(event) => setCurrentTerm(event.target.value)}
                    sx={{ maxWidth: 320 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTerm}
                    sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                  >
                    Add
                  </Button>
                </Stack>
                {customTerms.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    rowGap={1}
                  >
                    {customTerms.map((term) => (
                      <Chip
                        key={term}
                        label={term}
                        size="small"
                        onDelete={() => handleRemoveTerm(term)}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 380 }, p: 3 },
        }}
      >
        {selectedEntity && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {selectedEntity.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedEntity.type} · Reputation findings
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Entity History
            </Typography>
            {(!selectedEntity.priorDeals || selectedEntity.priorDeals.length === 0) ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No prior screening history found for this entity.
              </Typography>
            ) : (
              <>
                <List dense disablePadding sx={{ mb: 1 }}>
                  {selectedEntity.priorDeals.map((deal) => (
                    <ListItem key={deal.dealName} disablePadding sx={{ py: 0.25 }}>
                      <ListItemText
                        primary={deal.dealName}
                        secondary={`${deal.closeDate} · ${deal.screeningDate} · ${deal.outcomeSummary}`}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleImportPriorFindings(selectedEntity)}
                  disabled={importedEntityIds.includes(selectedEntity.id)}
                  sx={{ mb: 2 }}
                >
                  Import prior findings
                </Button>
              </>
            )}

            {["Medium", "High"].includes(selectedEntity.riskLevel) &&
            FINDINGS_BY_ENTITY[selectedEntity.name] ? (
              <Stack spacing={2} sx={{ mb: 3 }}>
                {FINDINGS_BY_ENTITY[selectedEntity.name].map((finding, index) => {
                  const findingId = finding.id ?? `finding-${index}`;
                  const noteKey = getFindingNoteKey(selectedEntity.id, findingId);
                  const isImported = importedEntityIds.includes(selectedEntity.id);
                  const sourceLabel = isImported
                    ? `Prior deal · ${finding.source}`
                    : finding.source;
                  return (
                  <Paper key={findingId} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {finding.summary ?? finding.title}
                      {isImported && (
                        <Chip
                          label="Imported"
                          size="small"
                          color="info"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip
                        label={finding.category}
                        size="small"
                        color={
                          finding.category === "Litigation"
                            ? "error"
                            : finding.category === "Criminal"
                            ? "warning"
                            : "info"
                        }
                      />
                      <Chip
                        label={sourceLabel}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                    <Box sx={{ mb: 1 }}>
                      <Link
                        href={finding.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                      >
                        View Source
                      </Link>
                    </Box>
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={<Switch size="small" />}
                        label="Mark as False Positive"
                      />
                      <TextField
                        label="UW note (shared across deals)"
                        helperText="Add context for future underwriting reviews."
                        multiline
                        minRows={2}
                        size="small"
                        fullWidth
                        value={findingNotes[noteKey] ?? ""}
                        onChange={(e) =>
                          handleFindingNoteChange(selectedEntity.id, findingId, e.target.value)
                        }
                        onBlur={() => handleFindingNoteBlur(selectedEntity.id, findingId)}
                      />
                      {noteSavedHintKey === noteKey && (
                        <Typography variant="caption" color="success.main">
                          Saved
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                  );
                })}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No additional findings available for this entity.
              </Typography>
            )}

            <Box sx={{ mt: "auto" }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleDrawerClose}
              >
                Close
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      <Dialog open={bulkDialogOpen} onClose={handleBulkDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Import prior findings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select prior deals to import findings from. Entities with screening history in those deals will show imported findings.
          </Typography>
          <FormGroup>
            <List dense disablePadding>
              {allPriorDeals.map((deal) => (
                <ListItem key={deal.dealName} disablePadding>
                  <ListItemButton
                    dense
                    onClick={() => handleBulkDealToggle(deal.dealName)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedDealNames.includes(deal.dealName)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={deal.dealName}
                      secondary={`${deal.screeningDate || ""} · ${deal.outcomeSummary || ""}`}
                      primaryTypographyProps={{ variant: "body2" }}
                      secondaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkImportSelected}>
            Import selected
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Paper elevation={1} sx={{ p: 1.5 }}>
          <Typography variant="body2">{snackbarMessage}</Typography>
        </Paper>
      </Snackbar>
    </Box>
  );
}

export default DealScreeningPage;

