import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";

const BORROWER_ALLOWED_TYPES = [
  "Borrower",
  "Holding Company",
  "Individual",
  "LLC",
  "Management Company",
  "SPV",
  "Managing Member",
  "Guarantor",
  "Principal",
  "Equity Partner",
];

const ENTITY_TYPE_OPTIONS = [
  "LLC",
  "Individual",
  "Management Company",
  "Holding Company",
  "SPV",
  "Equity Partner",
];

const ROLE_OPTIONS = [
  "Borrower",
  "Sponsor",
  "Guarantor",
  "Managing Member",
  "Principal",
  "Equity Partner",
];

// Weights for entity type: LLC 50%, Individual 30%, Management Company 10%, Holding 5%, SPV 3%, Equity Partner 2%
const ENTITY_TYPE_WEIGHTS = [
  { type: "LLC", weight: 50 },
  { type: "Individual", weight: 30 },
  { type: "Management Company", weight: 10 },
  { type: "Holding Company", weight: 5 },
  { type: "SPV", weight: 3 },
  { type: "Equity Partner", weight: 2 },
];

const NAME_PREFIXES = [
  "Harborview",
  "Riverside",
  "Summit",
  "Cornerstone",
  "Northgate",
  "Blue Harbor",
  "Maple Grove",
  "Seaside",
  "Meridian",
  "Crescent",
];
const NAME_SUFFIXES = [
  "Capital",
  "Holdings",
  "Ventures",
  "Partners",
  "Equity",
  "Management",
  "Advisory",
  "Acquisitions",
  "Group",
  "Property Services",
];
const NAME_DESIGNATORS = ["LLC", "LP", "Fund II", "Co. LLC", "Management Co."];
const FIRST_NAMES = [
  "Alicia",
  "Maria",
  "David",
  "John",
  "Priya",
  "Daniel",
  "Sarah",
  "Michael",
  "Kim",
  "Jason",
  "Elena",
  "Marcus",
];
const LAST_NAMES = [
  "Grant",
  "Torres",
  "Kim",
  "Reynolds",
  "Patel",
  "Chen",
  "Alvarez",
  "Brooks",
  "Nguyen",
  "Parker",
  "Stone",
  "Howard",
];

function pickWeighted(optionsWithWeights) {
  const total = optionsWithWeights.reduce((s, o) => s + o.weight, 0);
  let r = Math.random() * total;
  for (const o of optionsWithWeights) {
    r -= o.weight;
    if (r <= 0) return o.type;
  }
  return optionsWithWeights[optionsWithWeights.length - 1].type;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCompanyName() {
  const prefix = pick(NAME_PREFIXES);
  const suffix = pick(NAME_SUFFIXES);
  const designator = pick(NAME_DESIGNATORS);
  return `${prefix} ${suffix} ${designator}`;
}

function generateIndividualName() {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const withMiddle = Math.random() < 0.3;
  return withMiddle
    ? `${first} ${last.charAt(0)}. ${last}`
    : `${first} ${last}`;
}

function ensureUniqueName(entityType, existingNames, maxAttempts = 10) {
  const set = new Set((existingNames || []).map((n) => String(n).trim().toLowerCase()));
  const generate = entityType === "Individual" ? generateIndividualName : generateCompanyName;
  let name = generate();
  let attempts = 0;
  while (set.has(name.trim().toLowerCase()) && attempts < maxAttempts) {
    name = generate();
    attempts++;
  }
  if (set.has(name.trim().toLowerCase())) {
    let suffix = 2;
    let next = `${name} (${suffix})`;
    while (set.has(next.trim().toLowerCase())) {
      suffix++;
      next = `${name} (${suffix})`;
    }
    name = next;
  }
  return name;
}

function roleForType(entityType) {
  const r = Math.random();
  if (entityType === "Individual") {
    const roles = ["Principal", "Guarantor", "Managing Member", "Principal", "Guarantor"];
    return pick(roles);
  }
  if (["LLC", "Holding Company", "SPV"].includes(entityType)) {
    return pick(["Sponsor", "Borrower", "Borrower"]);
  }
  if (entityType === "Equity Partner") return "Equity Partner";
  if (entityType === "Management Company") return pick(["Managing Member", "Principal"]);
  return pick(ROLE_OPTIONS);
}

// Static demo: role in deal, ownership %, and guarantor flag per entity (seed data)
const BORROWER_DEMO = {
  3: { roleInDeal: "Borrower", ownershipPct: "60%", isGuarantor: false },
  4: { roleInDeal: "Sponsor", ownershipPct: "25%", isGuarantor: false },
  5: { roleInDeal: "Borrower", ownershipPct: "15%", isGuarantor: false },
  8: { roleInDeal: "Managing Member", ownershipPct: "—", isGuarantor: true },
  9: { roleInDeal: "Guarantor", ownershipPct: "—", isGuarantor: true },
  10: { roleInDeal: "Principal", ownershipPct: "—", isGuarantor: false },
  11: { roleInDeal: "Equity Partner", ownershipPct: "25%", isGuarantor: false },
};

const INTAKE_SNACKBAR_MESSAGE =
  "Intake processed. 2 entities added. Screening required.";

function getNextId(entities, start = 1) {
  if (!entities?.length) return start;
  return Math.max(...entities.map((e) => e.id), 0) + start;
}

const initialFormState = () => ({
  name: "",
  entityType: "LLC",
  roleInDeal: "Borrower",
  ownershipPct: "",
  guarantor: false,
});

function BorrowerPage({ entities = [], setEntities }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const fileInputRef = useRef(null);

  const existingNames = useMemo(
    () => (entities || []).map((e) => e.name),
    [entities]
  );

  const openAddDialog = useCallback(() => {
    const entityType = pickWeighted(ENTITY_TYPE_WEIGHTS);
    const roleInDeal = roleForType(entityType);
    const name = ensureUniqueName(entityType, existingNames);
    const ownershipPct =
      entityType === "Individual"
        ? ""
        : String(Math.floor(Math.random() * 40) + 5) + "%";
    setForm({
      name,
      entityType,
      roleInDeal,
      ownershipPct,
      guarantor: false,
    });
    setAddDialogOpen(true);
  }, [existingNames]);

  const closeAddDialog = useCallback(() => {
    setAddDialogOpen(false);
    setForm(initialFormState());
  }, []);

  const handleGuarantorChange = useCallback((e, checked) => {
    setForm((prev) => ({
      ...prev,
      guarantor: checked,
      ...(checked ? { roleInDeal: "Guarantor" } : {}),
    }));
  }, []);

  const handleAddFromDialog = useCallback(() => {
    const name = (form.name || "").trim();
    const { entityType, roleInDeal } = form;
    if (!name || !entityType || !roleInDeal) return;
    if (!setEntities) return;

    let finalName = name;
    if (existingNames.some((n) => String(n).trim().toLowerCase() === name.toLowerCase())) {
      let suffix = 2;
      while (existingNames.some((n) => String(n).trim().toLowerCase() === `${name} (${suffix})`.toLowerCase())) {
        suffix++;
      }
      finalName = `${name} (${suffix})`;
    }

    const nextId = getNextId(entities);
    const riskLevel = Math.random() < 0.8 ? "Low" : "Medium";
    const newEntity = {
      id: nextId,
      name: finalName,
      type: entityType,
      roleInDeal: form.roleInDeal,
      ownershipPct: entityType === "Individual" ? "—" : (form.ownershipPct || "").trim() || "—",
      isGuarantor: form.guarantor,
      source: "Borrower intake",
      searchStatus: "Not yet run",
      riskLevel,
      priorScreening: "No",
      priorDeals: [],
      imported: false,
      uwNotes: "",
      createdAt: new Date().toISOString(),
    };
    setEntities((prev) => [...(prev || []), newEntity]);
    setSnackbarMessage(`Added entity: ${finalName}. Screening required.`);
    setSnackbarOpen(true);
    closeAddDialog();
  }, [form, existingNames, entities, setEntities, closeAddDialog]);

  const runIntakeSimulation = () => {
    if (!setEntities) return;
    const baseId = getNextId(entities);
    const now = new Date().toISOString();
    const newEntities = [
      {
        id: baseId,
        name: "Riverside Holdings LLC",
        type: "LLC",
        source: "Borrower intake",
        riskLevel: "Low",
        priorScreening: "No",
        priorDeals: [],
        searchStatus: "Not yet run",
        createdAt: now,
      },
      {
        id: baseId + 1,
        name: "Alicia Grant",
        type: "Individual",
        source: "Borrower intake",
        riskLevel: "Low",
        priorScreening: "No",
        priorDeals: [],
        searchStatus: "Not yet run",
        createdAt: now,
      },
    ];
    setEntities((prev) => [...(prev || []), ...newEntities]);
    setSnackbarMessage(INTAKE_SNACKBAR_MESSAGE);
    setSnackbarOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    if (!e.target.files?.length) return;
    setProcessing(true);
    setTimeout(() => {
      runIntakeSimulation();
      setProcessing(false);
    }, 1500);
  };

  const borrowerRows = useMemo(() => {
    const list = Array.isArray(entities) ? entities : [];
    return list
      .filter((e) => BORROWER_ALLOWED_TYPES.includes(e.type))
      .map((entity) => {
        const demo = BORROWER_DEMO[entity.id];
        const roleInDeal = entity.roleInDeal ?? demo?.roleInDeal ?? entity.type;
        const ownershipPct = entity.ownershipPct ?? demo?.ownershipPct ?? "—";
        const isGuarantor = entity.isGuarantor ?? demo?.isGuarantor ?? false;
        return {
          id: entity.id,
          name: entity.name,
          entityType: entity.type,
          roleInDeal,
          ownershipPct,
          isGuarantor,
        };
      });
  }, [entities]);

  return (
    <Box sx={{ overflowX: "hidden", maxWidth: "100%", minWidth: 0 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Borrower Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Entities listed here are automatically included in Reputation Risk Screening.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Borrower intake
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a borrower package (PDF).
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              {processing && (
                <Typography variant="body2" color="text.secondary">
                  Processing…
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.zip"
                onChange={handleFileSelected}
                style={{ display: "none" }}
                aria-hidden
              />
              <Button
                variant="contained"
                size="small"
                disabled={processing}
                onClick={handleUploadClick}
              >
                {processing ? "Processing…" : "Upload"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Borrower entities
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Entity Type</TableCell>
                  <TableCell>Role in Deal</TableCell>
                  <TableCell align="right">Ownership %</TableCell>
                  <TableCell>Guarantor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {borrowerRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.entityType}</TableCell>
                    <TableCell>{row.roleInDeal}</TableCell>
                    <TableCell align="right">{row.ownershipPct}</TableCell>
                    <TableCell>{row.isGuarantor ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Use only if the intake form is unavailable.
        </Typography>
        <Button variant="outlined" size="small" onClick={openAddDialog}>
          Add Entity
        </Button>
      </Box>

      <Dialog open={addDialogOpen} onClose={closeAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add entity</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Entity name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small" required>
              <InputLabel>Entity type</InputLabel>
              <Select
                label="Entity type"
                value={form.entityType}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    entityType: e.target.value,
                    ...(e.target.value === "Individual" ? { ownershipPct: "" } : {}),
                  }))
                }
              >
                {ENTITY_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" required>
              <InputLabel>Role in deal</InputLabel>
              <Select
                label="Role in deal"
                value={form.roleInDeal}
                onChange={(e) => setForm((p) => ({ ...p, roleInDeal: e.target.value }))}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Ownership %"
              value={form.ownershipPct}
              onChange={(e) => setForm((p) => ({ ...p, ownershipPct: e.target.value }))}
              disabled={form.entityType === "Individual"}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0, max: 100, step: 1 }}
              placeholder={form.entityType === "Individual" ? "—" : ""}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.guarantor}
                  onChange={handleGuarantorChange}
                  color="primary"
                />
              }
              label="Guarantor"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAddDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddFromDialog}
            disabled={!(form.name || "").trim() || !form.entityType || !form.roleInDeal}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={5000}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

export default BorrowerPage;
