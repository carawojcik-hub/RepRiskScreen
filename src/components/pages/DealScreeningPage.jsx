import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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

const DEFAULT_TERMS = [
  "Litigation",
  "Financial Crime",
  "Regulatory Action",
  "Sanctions",
  "Fraud",
];

const FINDINGS_BY_ENTITY = {
  "Blue Harbor Management Group": [
    {
      id: "bhmg-flsa-1",
      headline:
        "DOL settles wage theft claims against property management company",
      oneSentenceSummary:
        "Settlement of FLSA claims against the property manager could signal operational and compliance weaknesses that may affect sponsor reputation and future HUD/compliance reviews for the asset.",
      sourceLabel: "Department of Labor",
      sourceUrl: "https://example.com/dol-settlement-bhmg",
      publishedDate: "2024-10-12",
      severity: "Medium",
      tags: ["Litigation", "Labor", "Reputational"],
    },
  ],
};

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getEntityKey(entity) {
  if (entity?.id != null && typeof entity.id === "string") return entity.id;
  if (entity?.entityId != null) return entity.entityId;
  return slugify(entity?.name);
}

const KEY_SUNSET_HOLDINGS = "sunset-holdings-llc";
const KEY_BLUE_HARBOR = "blue-harbor-management-group";

/** Prior findings by entity key (getEntityKey). Used for "Import prior findings" in drawer. */
const PRIOR_FINDINGS_BY_ENTITY = {
  [KEY_SUNSET_HOLDINGS]: [
    {
      id: "pf-001",
      sourceDeal: "Riverside Towers Refinance",
      date: "2019-05-30",
      type: "Adverse Media",
      severity: "Medium",
      title: "Civil litigation referenced in local coverage",
      snippet: "Mentions related to contractor dispute; no enforcement action found.",
      url: "https://example.com/article",
    },
    {
      id: "pf-002",
      sourceDeal: "Riverside Towers Refinance",
      date: "2019-05-30",
      type: "Sanctions/Watchlists",
      severity: "Low",
      title: "Name match review logged",
      snippet: "Potential match cleared as false positive after analyst review.",
      url: null,
      isFalsePositive: true,
    },
    {
      id: "pf-003",
      sourceDeal: "Harborview Portfolio Acquisition",
      date: "2021-10-20",
      type: "Regulatory",
      severity: "Low",
      title: "Business registration discrepancy",
      snippet: "Minor filing inconsistency corrected in subsequent records.",
      url: null,
    },
  ],
  [KEY_BLUE_HARBOR]: [
    {
      id: "pf-bh-001",
      sourceDeal: "Lakeside MHC Portfolio",
      date: "2018-08-15",
      type: "Sanctions/Watchlists",
      severity: "Low",
      title: "Name match review logged",
      snippet: "Potential match cleared as false positive after analyst review.",
      url: null,
      isFalsePositive: true,
    },
  ],
};

const RISK_COLOR = {
  Low: "success",
  Medium: "warning",
  High: "error",
};

const linkSx = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "primary.main",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
  "&:hover": { opacity: 0.85 },
  "&:visited": { color: "primary.main" },
};

function DealScreeningPage({ onBackToPipeline, entities = [], setEntities, setSelectedPage }) {
  const [status, setStatus] = useState("Not Started");
  const [lastRun, setLastRun] = useState("");
  const [lastRunAt, setLastRunAt] = useState(null);
  const [customTerms, setCustomTerms] = useState([]);
  const [currentTerm, setCurrentTerm] = useState("");
  const [lastRunTerms, setLastRunTerms] = useState([...DEFAULT_TERMS]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  const [importedEntityIds, setImportedEntityIds] = useState([]);
  const [importedFindingsByEntityId, setImportedFindingsByEntityId] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedDealNames, setSelectedDealNames] = useState([]);
  const [bulkImportedDealNames, setBulkImportedDealNames] = useState([]);
  const [uwNotesByFinding, setUwNotesByFinding] = useState({});
  const [falsePositiveByFinding, setFalsePositiveByFinding] = useState({});
  const [noteSavedHintFindingId, setNoteSavedHintFindingId] = useState(null);
  const timeoutRef = useRef(null);
  const debounceSaveRef = useRef(null);
  const clearSavedHintRef = useRef(null);

  const handleUwNoteChange = (findingId, value) => {
    setUwNotesByFinding((prev) => ({ ...prev, [findingId]: value }));
    if (debounceSaveRef.current) clearTimeout(debounceSaveRef.current);
    if (clearSavedHintRef.current) clearTimeout(clearSavedHintRef.current);
    debounceSaveRef.current = setTimeout(() => {
      setNoteSavedHintFindingId(findingId);
      clearSavedHintRef.current = setTimeout(
        () => setNoteSavedHintFindingId(null),
        1500
      );
    }, 500);
  };

  const handleFalsePositiveChange = (findingId, checked) => {
    setFalsePositiveByFinding((prev) => ({ ...prev, [findingId]: !!checked }));
  };

  const entityHasNotes = useMemo(() => {
    const map = {};
    Object.entries(FINDINGS_BY_ENTITY).forEach(([entityName, findings]) => {
      const hasNote = (findings || []).some(
        (f) => (uwNotesByFinding[f.id] || "").trim().length > 0
      );
      if (hasNote) {
        const entity = entities.find((e) => e.name === entityName);
        if (entity) map[String(entity.id)] = true;
      }
    });
    return map;
  }, [uwNotesByFinding, entities]);

  const allPriorDeals = useMemo(() => {
    const flat = entities.flatMap((entity) => entity.priorDeals || []);
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
  }, [entities]);

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
    const key = getEntityKey(entity);
    const prior = PRIOR_FINDINGS_BY_ENTITY[key] || [];
    if (!prior.length) return;
    setImportedFindingsByEntityId((prev) => {
      const existing = prev[key] || [];
      const merged = [...existing];
      prior.forEach((f) => {
        if (!merged.some((x) => x.id === f.id)) merged.push(f);
      });
      return { ...prev, [key]: merged };
    });
    setImportedEntityIds((prev) => (prev.includes(key) ? prev : [...prev, key]));
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
    const entitiesToImport = entities.filter((entity) =>
      (entity.priorDeals || []).some((pd) => selectedDealNames.includes(pd.dealName))
    );
    const keys = entitiesToImport.map((e) => getEntityKey(e));
    setImportedEntityIds(keys);
    setImportedFindingsByEntityId((prev) => {
      let next = { ...prev };
      entitiesToImport.forEach((entity) => {
        const key = getEntityKey(entity);
        const prior = PRIOR_FINDINGS_BY_ENTITY[key] || [];
        if (prior.length === 0) return;
        const existing = next[key] || [];
        const merged = [...existing];
        prior.forEach((f) => {
          if (!merged.some((x) => x.id === f.id)) merged.push(f);
        });
        next = { ...next, [key]: merged };
      });
      return next;
    });
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
    setLastRunTerms([...DEFAULT_TERMS, ...customTerms]);

    if (setEntities) {
      setEntities((prev) =>
        prev.map((e) => ({
          ...e,
          searchStatus:
            (e.searchStatus || "").toLowerCase().includes("complete")
              ? e.searchStatus
              : "In Progress",
        }))
      );
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const completedAt = new Date().toISOString();
      setStatus("Completed");
      setLastRun(new Date().toLocaleString());
      setLastRunAt(completedAt);
      if (setEntities) {
        setEntities((prev) =>
          prev.map((e) => ({ ...e, searchStatus: "Complete" }))
        );
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (debounceSaveRef.current) clearTimeout(debounceSaveRef.current);
      if (clearSavedHintRef.current) clearTimeout(clearSavedHintRef.current);
    };
  }, []);

  const filteredEntities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return entities.filter((entity) => {
      const matchesQuery = query
        ? entity.name.toLowerCase().includes(query)
        : true;
      const matchesFlagged = showOnlyFlagged
        ? entity.riskLevel === "Medium" || entity.riskLevel === "High"
        : true;

      return matchesQuery && matchesFlagged;
    });
  }, [entities, searchQuery, showOnlyFlagged]);

  const pagedEntities = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredEntities.slice(start, end);
  }, [filteredEntities, page, rowsPerPage]);

  const isNewBorrowerIntake = (e) =>
    e.source === "Borrower intake" &&
    lastRunAt != null &&
    new Date(e.createdAt).getTime() > new Date(lastRunAt).getTime();

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
              mb: 1,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
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
                  sx={linkSx}
                >
                  Manage imports
                </Link>
              )}
            </Stack>
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

          {setSelectedPage && (
            <Box sx={{ mt: 0.5, mb: 1 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setSelectedPage("Borrower")}
                sx={linkSx}
              >
                View borrower details
              </Link>
            </Box>
          )}

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
                setTimeout(() => {
                  document.getElementById("search-criteria")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 0);
              }}
              sx={linkSx}
            >
              View/Edit criteria
            </Link>
          </Box>


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
              {`Showing ${filteredEntities.length} of ${entities.length} entities`}
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
                    <Stack direction="row" alignItems="center" gap={1} sx={{ maxWidth: 280 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          minWidth: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {entity.name}
                      </Typography>
                      {isNewBorrowerIntake(entity) && (
                        <Chip label="New" size="small" color="info" variant="outlined" />
                      )}
                    </Stack>
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
                      {((importedFindingsByEntityId[getEntityKey(entity)] || []).length)}
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
                    {((importedFindingsByEntityId[getEntityKey(entity)] || []).length > 0 || importedEntityIds.includes(getEntityKey(entity))) ? (
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
                {(() => {
                  const key = getEntityKey(selectedEntity);
                  const priorAvailable = PRIOR_FINDINGS_BY_ENTITY[key] || [];
                  const imported = importedFindingsByEntityId[key] || [];
                  return (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleImportPriorFindings(selectedEntity)}
                      disabled={priorAvailable.length === 0 || imported.length > 0}
                      sx={{ mb: 2 }}
                    >
                      {imported.length > 0 ? "Imported" : "Import prior findings"}
                    </Button>
                  );
                })()}
              </>
            )}

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Findings
            </Typography>
            {(() => {
              const key = getEntityKey(selectedEntity);
              const imported = importedFindingsByEntityId[key] || [];
              const priorAvailable = PRIOR_FINDINGS_BY_ENTITY[key] || [];
              return (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Key: {key} · Prior: {priorAvailable.length} · Imported: {imported.length}
                  </Typography>
                  {imported.length > 0 ? (
                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                      {imported.map((finding) => (
                    <Paper
                      key={finding.id}
                      variant="outlined"
                      sx={{ p: 1.5, width: "100%", boxSizing: "border-box" }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                        {finding.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                        {finding.type} · {finding.severity} · {finding.sourceDeal} · {finding.date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                        {finding.snippet}
                      </Typography>
                      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                        {finding.url && (
                          <Link
                            href={finding.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={linkSx}
                          >
                            Open source
                          </Link>
                        )}
                        {finding.isFalsePositive && (
                          <Chip label="False positive" size="small" color="default" variant="outlined" />
                        )}
                      </Stack>
                    </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      No additional findings available for this entity.
                    </Typography>
                  )}
                </>
              );
            })()}

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

