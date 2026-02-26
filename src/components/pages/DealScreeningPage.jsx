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
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
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
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

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
      snippet:
        "Mentions related to contractor dispute; no enforcement action found.",
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

function DealScreeningPage({
  onBackToPipeline,
  entities = [],
  setEntities,
  setSelectedPage,
}) {
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
  const [importedFindingsByEntityId, setImportedFindingsByEntityId] = useState(
    {}
  );
  const [runFindingsByEntityId, setRunFindingsByEntityId] = useState({});
  const [findingStateById, setFindingStateById] = useState({});
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

  const getFindingsForEntity = (entity) => {
    if (!entity) return [];
    const key = getEntityKey(entity);
    return [
      ...(runFindingsByEntityId[key] || []),
      ...(importedFindingsByEntityId[key] || []),
    ];
  };

  const notesCountByEntityKey = useMemo(() => {
    const map = {};
    const list = Array.isArray(entities) ? entities : [];
    list.forEach((entity) => {
      const key = getEntityKey(entity);
      const findings = getFindingsForEntity(entity);
      const count = findings.reduce((n, f) => {
        const note = (uwNotesByFinding[f.id] || "").trim();
        return n + (note.length > 0 ? 1 : 0);
      }, 0);
      map[key] = count;
    });
    return map;
  }, [entities, uwNotesByFinding, runFindingsByEntityId, importedFindingsByEntityId]);

  const getImportedFindingsForEntity = (entity) => {
    if (!entity) return [];
    const key = getEntityKey(entity);
    return importedFindingsByEntityId[key] || [];
  };

  const computeRiskFromFindings = (findings) => {
    if (!findings || findings.length === 0) return null;
    let best = "Low";
    let maxRank = -1;
    findings.forEach((f) => {
      const sev = f.severity || "Medium";
      const rank = sev === "High" ? 2 : sev === "Medium" ? 1 : 0;
      if (rank > maxRank) {
        maxRank = rank;
        best = sev === "High" ? "High" : sev === "Medium" ? "Medium" : "Low";
      }
    });
    return best;
  };

  /** Pick entity for "new run findings" demo: no prior deals, no prior findings in PRIOR_FINDINGS_BY_ENTITY. */
  const getTargetEntityForRunFindings = (entityList) => {
    if (!entityList?.length) return null;
    const withNoPrior =
      entityList.find(
        (e) =>
          (e.priorDeals?.length ?? 0) === 0 &&
          (PRIOR_FINDINGS_BY_ENTITY[getEntityKey(e)] || []).length === 0
      ) ?? null;
    return withNoPrior ?? entityList[0];
  };

  const entityNeedsReview = (entity) => {
    const findings = getFindingsForEntity(entity);
    if (!findings.length) return false;
    return findings.some(
      (f) => (findingStateById[f.id]?.triage ?? "Unreviewed") === "Unreviewed"
    );
  };

  const handleFindingTriageChange = (findingId, triage) => {
    setFindingStateById((prev) => {
      const prevState = prev[findingId] || {
        triage: "Unreviewed",
        triagedAt: undefined,
      };
      return {
        ...prev,
        [findingId]: {
          ...prevState,
          triage,
          triagedAt: triage !== "Unreviewed" ? new Date().toISOString() : undefined,
        },
      };
    });
  };

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
    if (customTerms.some((term) => term.toLowerCase() === trimmed.toLowerCase())) {
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

    setFindingStateById((prev) => {
      const next = { ...prev };
      prior.forEach((f) => {
        if (!next[f.id]) next[f.id] = { triage: "Unreviewed", triagedAt: undefined };
      });
      return next;
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
      prev.includes(dealName) ? prev.filter((n) => n !== dealName) : [...prev, dealName]
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

    const allPriorFindings = entitiesToImport.flatMap((entity) => {
      const key = getEntityKey(entity);
      return PRIOR_FINDINGS_BY_ENTITY[key] || [];
    });

    setFindingStateById((prev) => {
      const next = { ...prev };
      allPriorFindings.forEach((f) => {
        if (!next[f.id]) next[f.id] = { triage: "Unreviewed", triagedAt: undefined };
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
            (e.searchStatus || "").toLowerCase().includes("complete") ? e.searchStatus : "In Progress",
        }))
      );
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const completedAt = new Date().toISOString();
      setStatus("Completed");
      setLastRun(new Date().toLocaleString());
      setLastRunAt(completedAt);

      const targetEntity = getTargetEntityForRunFindings(entities);
      const targetKey = targetEntity ? getEntityKey(targetEntity) : null;

      if (setEntities) {
        setEntities((prev) =>
          prev.map((e) => {
            const eKey = getEntityKey(e);
            const runCount = (runFindingsByEntityId[eKey] || []).length;
            const importedCount = (importedFindingsByEntityId[eKey] || []).length;
            const willHaveFindings = runCount > 0 || importedCount > 0 || eKey === targetKey;
            const riskLevel = willHaveFindings ? (e.riskLevel ?? "Low") : "Low";
            return { ...e, searchStatus: "Complete", riskLevel };
          })
        );
      }

      if (targetKey) {
        const key = targetKey;
        const today = new Date().toISOString().slice(0, 10);
        const materialFindings = [
          {
            id: `run-material-1-${key}`,
            sourceDeal: "Current deal",
            date: today,
            type: "Adverse Media",
            severity: "High",
            title: "Adverse media coverage involving related party",
            snippet:
              "Recent coverage references regulatory inquiry and litigation; recommend further due diligence and sponsor disclosure for underwriting.",
            url: "https://example.com/adverse-media-coverage",
            isFalsePositive: false,
          },
          {
            id: `run-material-2-${key}`,
            sourceDeal: "Current deal",
            date: today,
            type: "Regulatory",
            severity: "Medium",
            title: "State filing discrepancy flagged",
            snippet:
              "Entity name and address mismatch in secretary of state records; may require verification and explanation from borrower.",
            attachmentName: "SOS filing excerpt.pdf",
            attachmentUrl: "/demo/sos-filing-excerpt.pdf",
            isFalsePositive: false,
          },
        ];

        setRunFindingsByEntityId((prev) => ({ ...prev, [key]: materialFindings }));

        setFindingStateById((prev) => {
          const next = { ...prev };
          materialFindings.forEach((f) => {
            if (!next[f.id]) next[f.id] = { triage: "Unreviewed", triagedAt: undefined };
          });
          return next;
        });
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
      const matchesQuery = query ? entity.name.toLowerCase().includes(query) : true;
      const matchesFlagged = showOnlyFlagged ? getFindingsForEntity(entity).length > 0 : true;
      return matchesQuery && matchesFlagged;
    });
  }, [entities, searchQuery, showOnlyFlagged, runFindingsByEntityId, importedFindingsByEntityId]);

  const pagedEntities = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredEntities.slice(start, end);
  }, [filteredEntities, page, rowsPerPage]);

  const isNewBorrowerIntake = (e) =>
    e.source === "Borrower intake" &&
    lastRunAt != null &&
    new Date(e.createdAt).getTime() > new Date(lastRunAt).getTime();

  const stickyFirstColSx = {
    position: "sticky",
    left: 0,
    zIndex: 2,
    backgroundColor: "background.paper",
    boxShadow: "inset 1px 0 0 0 rgba(0,0,0,0.06)",
  };

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
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
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
              <Typography variant="subtitle1">Sunset Villas Acquisition</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Borrower
              </Typography>
              <Typography variant="subtitle1">Sunset Holdings LLC</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Loan Amount
              </Typography>
              <Typography variant="subtitle1">$45,000,000</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Stage
              </Typography>
              <Typography variant="subtitle1">Underwriting</Typography>
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
                  status === "Not Started" ? "Not yet run" : status === "Running" ? "Running" : "Completed"
                }
                color={status === "Not Started" ? "default" : status === "Completed" ? "success" : "warning"}
                size="small"
                variant={status === "Not Started" ? "outlined" : "filled"}
              />
            </Stack>

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button variant="contained" onClick={handleRunClick} disabled={status === "Running"}>
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
                setTimeout(() => {
                  document.getElementById("search-criteria")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
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
                control={<Switch size="small" checked={showOnlyFlagged} onChange={handleFlaggedToggle} />}
                label="Show entities with findings"
              />
              <Typography variant="caption" color="text.secondary">
                {`Showing ${filteredEntities.length} of ${entities.length} entities`}
              </Typography>
            </Box>
          </Box>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              width: "100%",
              overflowX: "auto",
              position: "relative",
              "&::-webkit-scrollbar": { height: 8 },
              "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 4 },
              "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(0,0,0,0.35)" },
            }}
          >
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    data-sticky="entity"
                    sx={{
                      ...stickyFirstColSx,
                      width: 220,
                      color: "text.secondary",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      zIndex: 3,
                    }}
                  >
                    <Box sx={{ position: "relative", zIndex: 1 }}>Entity Name</Box>
                  </TableCell>

                  <TableCell sx={{ width: 140, color: "text.secondary", fontWeight: 600, fontSize: "0.875rem" }}>
                    Entity Type
                  </TableCell>
                  <TableCell sx={{ width: 140, color: "text.secondary", fontWeight: 600, fontSize: "0.875rem" }}>
                    Source
                  </TableCell>
                  <TableCell sx={{ width: 110, color: "text.secondary", fontWeight: 600, fontSize: "0.875rem" }}>
                    Risk Level
                  </TableCell>
                  <TableCell sx={{ width: 110, color: "text.secondary", fontWeight: 600, fontSize: "0.875rem" }}>
                    Findings
                  </TableCell>
                  <TableCell sx={{ width: 80, color: "text.secondary", fontWeight: 600, fontSize: "0.875rem" }}>
                    Notes
                  </TableCell>
                  <TableCell sx={{ width: 120, color: "text.secondary", fontWeight: 600, fontSize: "0.875rem" }}>
                    Prior Screening
                  </TableCell>
                  <TableCell sx={{ width: 160, color: "text.secondary", fontWeight: 600, fontSize: "0.875rem" }}>
                    Prior deal history
                  </TableCell>
                  <TableCell sx={{ width: 110, color: "text.secondary", fontWeight: 600, fontSize: "0.875rem" }}>
                    Imported
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pagedEntities.map((entity) => (
                  <TableRow
                    key={entity.id}
                    hover
                    tabIndex={0}
                    role="button"
                    onClick={() => handleRowClick(entity)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRowClick(entity);
                      }
                    }}
                    sx={{
                      cursor: "pointer",
                      transition: "background-color 150ms ease",
                      "&:hover": {
                        bgcolor: (theme) => theme.palette.grey[100],
                        boxShadow: "inset 4px 0 0 0 rgba(25, 118, 210, 0.6)",
                        "& .rowChevron": { opacity: 1 },
                      },
                      "&:hover > td": {
                        backgroundColor: (theme) => theme.palette.grey[100],
                      },
                      "&:hover > td[data-sticky='entity']": {
                        backgroundColor: (theme) => theme.palette.grey[100],
                      },
                      "&:focus-visible": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: "-2px",
                      },
                      "&:focus-visible > td[data-sticky='entity']": {
                        backgroundColor: (theme) => theme.palette.grey[100],
                      },
                    }}
                  >
                    <TableCell data-sticky="entity" sx={{ ...stickyFirstColSx, width: 220 }}>
                      <Box
                        sx={{
                          position: "relative",
                          zIndex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          maxWidth: 280,
                          minWidth: 0,
                        }}
                      >
                        <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0, flex: 1 }}>
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
                        <ArrowForwardIosIcon
                          className="rowChevron"
                          fontSize="inherit"
                          sx={{ opacity: 0, flexShrink: 0 }}
                        />
                      </Box>
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
                      {status !== "Not Started" ? (
                        entity.riskLevel ? (
                          <Chip
                            label={entity.riskLevel}
                            color={RISK_COLOR[entity.riskLevel] ?? "default"}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )
                      ) : (() => {
                          const imported = getImportedFindingsForEntity(entity);
                          if (!imported.length) {
                            return (
                              <Typography variant="body2" color="text.secondary">
                                —
                              </Typography>
                            );
                          }
                          const previewRisk = computeRiskFromFindings(imported);
                          if (!previewRisk) {
                            return (
                              <Typography variant="body2" color="text.secondary">
                                —
                              </Typography>
                            );
                          }
                          return (
                            <Chip
                              label={previewRisk}
                              color={RISK_COLOR[previewRisk] ?? "default"}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          );
                        })()}
                    </TableCell>

                    <TableCell>
                      {(() => {
                        if (lastRunAt == null) {
                          return (
                            <Typography variant="body2" color="text.secondary">
                              Not screened
                            </Typography>
                          );
                        }
                        const addedAfterLastRun =
                          entity.createdAt &&
                          new Date(entity.createdAt).getTime() > new Date(lastRunAt).getTime();
                        if (addedAfterLastRun) {
                          return (
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <Typography variant="body2" color="text.secondary">
                                Not screened
                              </Typography>
                              <Chip label="New" size="small" variant="outlined" color="default" />
                            </Stack>
                          );
                        }
                        const findings = getFindingsForEntity(entity);
                        const count = findings.length;
                        const needsReview = count > 0 && entityNeedsReview(entity);
                        if (count === 0) {
                          return (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          );
                        }
                        return (
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Typography variant="body2" color="text.secondary">
                              {count}
                            </Typography>
                            <Tooltip title={needsReview ? "Needs review" : "Reviewed"}>
                              {needsReview ? (
                                <ErrorOutlineIcon fontSize="small" color="warning" />
                              ) : (
                                <CheckCircleOutlineIcon fontSize="small" color="success" />
                              )}
                            </Tooltip>
                          </Stack>
                        );
                      })()}
                    </TableCell>

                    <TableCell>
                      {(() => {
                        const key = getEntityKey(entity);
                        const n = notesCountByEntityKey[key] || 0;
                        if (n === 0) {
                          return (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          );
                        }
                        return <Chip label={`${n}`} size="small" color="info" variant="outlined" />;
                      })()}
                    </TableCell>

                    <TableCell>
                      {(() => {
                        const key = getEntityKey(entity);
                        const hasPriorScreening =
                          (entity.priorDeals && entity.priorDeals.length > 0) || importedEntityIds.includes(key);
                        return (
                          <Typography variant="body2" color="text.secondary">
                            {hasPriorScreening ? "Yes" : "No"}
                          </Typography>
                        );
                      })()}
                    </TableCell>

                    <TableCell>
                      {(!entity.priorDeals || entity.priorDeals.length === 0) && (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                      {entity.priorDeals && entity.priorDeals.length === 1 && (
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
                          {entity.priorDeals[0].dealName}
                        </Typography>
                      )}
                      {entity.priorDeals && entity.priorDeals.length > 1 && (
                        <>
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
                            {entity.priorDeals[0].dealName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {`(+${entity.priorDeals.length - 1} more)`}
                          </Typography>
                        </>
                      )}
                    </TableCell>

                    <TableCell>
                      {(importedFindingsByEntityId[getEntityKey(entity)] || []).length > 0 ||
                      importedEntityIds.includes(getEntityKey(entity)) ? (
                        <Chip label="Imported" size="small" color="info" variant="outlined" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
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
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Default Terms
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
              {DEFAULT_TERMS.map((term) => (
                <Chip key={term} label={term} variant="outlined" color="primary" size="small" />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
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
              <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                {customTerms.map((term) => (
                  <Chip key={term} label={term} size="small" onDelete={() => handleRemoveTerm(term)} />
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
          sx: {
            width: { xs: "100%", sm: 680 },
            maxWidth: "100%",
            p: 0,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {selectedEntity && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                bgcolor: "background.paper",
                px: 3,
                pt: 3,
                pb: 2,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Typography variant="h6" fontWeight={600}>
                    {selectedEntity.name}
                  </Typography>
                  {(() => {
                    const allFindings = getFindingsForEntity(selectedEntity);
                    const headerRisk = computeRiskFromFindings(allFindings);
                    if (!headerRisk) {
                      return (
                        <Typography component="span" variant="body2" color="text.secondary">
                          —
                        </Typography>
                      );
                    }
                    return (
                      <Chip
                        label={headerRisk}
                        size="small"
                        variant="outlined"
                        color={RISK_COLOR[headerRisk] ?? "default"}
                        sx={{ fontWeight: 600, px: 1 }}
                      />
                    );
                  })()}
                </Stack>

                <IconButton size="small" onClick={handleDrawerClose} aria-label="Close">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedEntity.type} · Reputation findings
              </Typography>

              {lastRunAt && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Last screened {new Date(lastRunAt).toLocaleString()}
                </Typography>
              )}
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                Entity History
              </Typography>

              {!selectedEntity.priorDeals || selectedEntity.priorDeals.length === 0 ? (
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

              <Box sx={{ mt: 4 }}>
                {(() => {
                  const key = getEntityKey(selectedEntity);
                  const runFindings = runFindingsByEntityId[key] || [];
                  const importedFindings = importedFindingsByEntityId[key] || [];

                  const renderFindingCard = (finding) => {
                    const state = findingStateById[finding.id] || { triage: "Unreviewed", triagedAt: undefined };
                    const showHistoricalFalsePositive = !!finding.isFalsePositive;

                    return (
                      <Paper key={finding.id} variant="outlined" sx={{ p: 3, width: "100%", boxSizing: "border-box" }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1}
                          sx={{ mb: 0.5 }}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {finding.title}
                          </Typography>
                          <Chip
                            label={finding.severity || "Medium"}
                            size="small"
                            variant="outlined"
                            color="default"
                            sx={{ fontWeight: 500 }}
                          />
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                          {finding.type} · {finding.sourceDeal} · {finding.date}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ wordBreak: "break-word", lineHeight: 1.6, mb: 2 }}
                        >
                          {finding.snippet}
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                          <TextField
                            select
                            size="small"
                            label="Review decision"
                            value={state.triage ?? "Unreviewed"}
                            onChange={(e) => handleFindingTriageChange(finding.id, e.target.value)}
                            sx={{ minWidth: 150 }}
                          >
                            <MenuItem value="Unreviewed">Unreviewed</MenuItem>
                            <MenuItem value="Confirmed">Confirmed</MenuItem>
                            <MenuItem value="False Positive">False Positive</MenuItem>
                          </TextField>
                        </Stack>

                        <TextField
                          label="Analyst notes"
                          placeholder="Add context, rationale, or supporting detail…"
                          multiline
                          minRows={3}
                          size="small"
                          fullWidth
                          value={uwNotesByFinding[finding.id] ?? ""}
                          onChange={(e) => handleUwNoteChange(finding.id, e.target.value)}
                          sx={{ mb: 1.5, "& .MuiInputBase-root": { maxWidth: "100%" } }}
                        />

                        {noteSavedHintFindingId === finding.id && (
                          <Typography variant="caption" color="success.main" sx={{ display: "block", mb: 1 }}>
                            Saved
                          </Typography>
                        )}

                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          Source:{" "}
                          {finding.url || finding.attachmentUrl ? (
                            <>
                              {finding.url && (
                                <Link href={finding.url} target="_blank" rel="noopener noreferrer" sx={linkSx}>
                                  Open source
                                </Link>
                              )}
                              {finding.url && finding.attachmentUrl && " · "}
                              {finding.attachmentUrl && (
                                <Link
                                  href={finding.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={linkSx}
                                >
                                  {finding.attachmentName || "View attachment"}
                                </Link>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </Typography>

                        {showHistoricalFalsePositive && (
                          <Stack direction="row" sx={{ mt: 0.5 }}>
                            <Chip label="Previously marked false positive" size="small" color="default" variant="outlined" />
                          </Stack>
                        )}
                      </Paper>
                    );
                  };

                  const hasRun = runFindings.length > 0;
                  const hasImported = importedFindings.length > 0;

                  return (
                    <>
                      {hasRun && (
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, letterSpacing: 0.2 }}>
                            Run findings ({runFindings.length})
                          </Typography>
                          <Stack spacing={3} sx={{ mb: 2 }}>
                            {runFindings.map(renderFindingCard)}
                          </Stack>
                        </Box>
                      )}

                      {hasRun && hasImported && <Divider sx={{ mt: 4, mb: 4 }} />}

                      {hasImported && (
                        <Box sx={{ mt: 5 }}>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, letterSpacing: 0.2 }}>
                            Imported findings ({importedFindings.length})
                          </Typography>
                          <Stack spacing={3} sx={{ mb: 2 }}>
                            {importedFindings.map(renderFindingCard)}
                          </Stack>
                        </Box>
                      )}

                      {hasRun || hasImported ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, mb: 3 }}>
                          {entityNeedsReview(selectedEntity) ? "Needs review" : "Reviewed"}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          No additional findings available for this entity.
                        </Typography>
                      )}
                    </>
                  );
                })()}
              </Box>
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
                  <ListItemButton dense onClick={() => handleBulkDealToggle(deal.dealName)}>
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