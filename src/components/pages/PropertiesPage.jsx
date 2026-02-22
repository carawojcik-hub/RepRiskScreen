import {
  Box,
  Chip,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useMemo, useRef, useState } from "react";
import { COMPS, DATE_RANGE_MONTHS, DISTANCES, MARKETS, SALE_COMPS } from "../../data/comps";

const formatCurrencyCard = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const subjectProperty = {
  id: "subject",
  name: "Sunset Villas",
  address: "1200 Palm Ridge Drive",
  city: "Tampa",
  state: "FL",
  region: "Southeast",
  market: "Tampa",
  submarket: "Westshore",
  borrower: "Sunset Holdings LLC",
  loanAmount: 45000000,
  stage: "Underwriting",
  distanceMiles: 0,
  compType: "SALE",

  // Physical characteristics
  units: 220,
  yearBuilt: 1998,
  renovationYear: 2021,
  avgUnitSize: 925, // sq ft
  occupancy: 94, // %
  propertyClass: "Class B",

  // Financials
  purchasePrice: 68200000,
  pricePerUnit: 310000,
  capRate: 5.4,
  saleDate: null,
  salePrice: 68200000,

  // Market context
  walkScore: 72,

  amenities: [
    "Pool",
    "Fitness Center",
    "Clubhouse",
    "Covered Parking",
    "In-Unit Laundry",
    "Dog Park",
  ],

  photos: [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
  ],
};

// Shared column labels so card and table stay in sync
const COL_LABELS = {
  units: "Units",
  yearBuilt: "Year Built",
  renovationYear: "Renovation Year",
  avgUnitSize: "Avg Unit Size (SF)",
  occupancy: "Occupancy %",
  walkScore: "Walk Score",
  pricePerUnit: "Price/Unit",
  capRate: "Cap Rate",
};

const STICKY_HEADER_TOP = 56;

const SALE_HEADER_CELL_SX = {
  zIndex: 3,
  bgcolor: "background.paper",
  fontWeight: 600,
  fontSize: 13,
  letterSpacing: 0.2,
  py: 1.25,
  borderBottom: "2px solid",
  borderColor: "divider",
};

const SALE_COL_WIDTHS = {
  property: 220,
  market: 110,
  distance: 80,
  units: 80,
  yearBuilt: 100,
  avgUnitSize: 120,
  renovationYear: 110,
  walkScore: 90,
  pricePerUnit: 120,
  capRate: 90,
  similarity: 110,
};

function SubjectPropertyHeroCard({ property }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!property) return null;

  const photos = property.photos && property.photos.length > 0 ? property.photos : ["Photo 1", "Photo 2", "Photo 3"];
  const n = photos.length;
  const fullAddress = [property.address, property.city, property.state].filter(Boolean).join(", ");
  const showAsPlaceholder = imageError || (typeof photos[activePhotoIndex] === "string" && photos[activePhotoIndex].startsWith("Photo "));

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2.5, mb: 3 }}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", height: { xs: 220, md: 280 }, bgcolor: "grey.200" }}>
            {showAsPlaceholder ? (
              <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "grey.300" }}>
                <Typography variant="body2" color="text.secondary">
                  {typeof photos[activePhotoIndex] === "string" ? photos[activePhotoIndex] : `Photo ${activePhotoIndex + 1}`}
                </Typography>
              </Box>
            ) : (
              <Box
                component="img"
                src={photos[activePhotoIndex]}
                alt=""
                onError={() => setImageError(true)}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
            {n > 1 && (
              <>
                <IconButton size="small" onClick={() => setActivePhotoIndex((i) => (i - 1 + n) % n)} sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", bgcolor: "rgba(255,255,255,0.9)", "&:hover": { bgcolor: "white" } }}>
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton size="small" onClick={() => setActivePhotoIndex((i) => (i + 1) % n)} sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", bgcolor: "rgba(255,255,255,0.9)", "&:hover": { bgcolor: "white" } }}>
                  <ChevronRightIcon />
                </IconButton>
                <Typography variant="caption" sx={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", bgcolor: "rgba(0,0,0,0.5)", color: "white", px: 1, borderRadius: 1 }}>
                  {activePhotoIndex + 1} / {n}
                </Typography>
              </>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
            {property.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fullAddress}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.85 }}>
            {[property.submarket, property.market, property.region].filter(Boolean).join(" · ")}
          </Typography>

          <Box sx={{ my: 2, borderBottom: 1, borderColor: "divider" }} />

          <Typography variant="h4" fontWeight={600}>
            {formatCurrencyCard(property.purchasePrice)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {COL_LABELS.pricePerUnit} {property.pricePerUnit != null ? formatCurrencyCard(property.pricePerUnit) : "—"} · {COL_LABELS.capRate} {property.capRate != null ? `${property.capRate}%` : "—"}
          </Typography>

          {property.propertyClass && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, mb: 1.5 }}>
              <Chip label={property.propertyClass} size="small" variant="outlined" />
            </Stack>
          )}
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            {[
              { label: COL_LABELS.units, value: property.units ?? "—" },
              { label: COL_LABELS.yearBuilt, value: property.yearBuilt ?? "—" },
              { label: COL_LABELS.avgUnitSize, value: property.avgUnitSize != null ? `${property.avgUnitSize} SF` : "—" },
              { label: COL_LABELS.renovationYear, value: property.renovationYear ?? "—" },
              { label: COL_LABELS.occupancy, value: property.occupancy != null ? `${property.occupancy}%` : "—" },
              { label: COL_LABELS.walkScore, value: property.walkScore ?? "—" },
            ].map(({ label, value }) => (
              <Box key={label}>
                <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                <Typography variant="body2" fontWeight={600}>{value}</Typography>
              </Box>
            ))}
          </Stack>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>Amenities</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {(property.amenities || []).slice(0, 6).map((a) => (
                <Chip key={a} label={a} size="small" variant="outlined" />
              ))}
              {(property.amenities || []).length > 6 && (
                <Chip label={`+${(property.amenities || []).length - 6} more`} size="small" variant="outlined" />
              )}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

function formatCurrency(n) {
  if (n == null || n === "") return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPct(n) {
  if (n == null || n === "") return "—";
  return `${Number(n)}%`;
}

function formatNumber(n) {
  if (n == null || n === "") return "—";
  return String(Number(n));
}

function formatPercent(n) {
  if (n == null || n === "") return "—";
  return `${Number(n)}%`;
}

/** type: 'number' | 'years' | 'currency' | 'percentPoints' */
function deltaText(value, subjectValue, type) {
  if (value == null || subjectValue == null) return null;
  const v = Number(value);
  const s = Number(subjectValue);
  if (Number.isNaN(v) || Number.isNaN(s)) return null;
  const d = v - s;
  if (d === 0) return "0 vs subject";
  const sign = d > 0 ? "+" : "";
  if (type === "years") return `${sign}${d} yrs vs subject`;
  if (type === "currency") {
    const k = Math.abs(d) >= 1000 ? `${sign}${(d / 1000).toFixed(0)}k` : `${sign}$${Math.round(d)}`;
    return `${k} vs subject`;
  }
  if (type === "percentPoints") return `${sign}${d.toFixed(1)} pp vs subject`;
  return `${sign}${d} vs subject`;
}

function ValueWithDelta({ value, delta, formatValue = (v) => v }) {
  return (
    <Box sx={{ lineHeight: 1.2 }}>
      <Typography variant="body2" fontWeight={500}>
        {formatValue(value)}
      </Typography>
      {delta != null && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
          {delta}
        </Typography>
      )}
    </Box>
  );
}

const SIMILARITY_WEIGHTS = {
  distanceMiles: 0.25,
  yearBuilt: 0.15,
  avgUnitSize: 0.2,
  units: 0.1,
  walkScore: 0.1,
  pricePerUnit: 0.2,
};
const SIMILARITY_CAPS = {
  distanceMiles: 10,
  yearBuilt: 25,
  avgUnitSize: 400,
  units: 200,
  walkScore: 50,
  pricePerUnit: 150000,
};

function calcSimilarity(comp, subject) {
  if (!comp || !subject) return 0;
  let weighted = 0;
  for (const [key, weight] of Object.entries(SIMILARITY_WEIGHTS)) {
    const c = comp[key];
    const s = subject[key];
    const cap = SIMILARITY_CAPS[key];
    if (c == null || s == null) continue;
    const cv = Number(c);
    const sv = Number(s);
    if (Number.isNaN(cv) || Number.isNaN(sv)) continue;
    const diff = Math.abs(cv - sv);
    const normalized = Math.min(1, diff / cap);
    weighted += weight * normalized;
  }
  const score = Math.round(100 * (1 - weighted));
  return Math.max(0, Math.min(100, score));
}

function isWithinMonths(dateStr, months) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return d >= cutoff;
}

function PropertiesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [market, setMarket] = useState("All");
  const [distance, setDistance] = useState("");
  const [dateRangeMonths, setDateRangeMonths] = useState(12);
  const [drawerComp, setDrawerComp] = useState(null);
  const [notesByCompId, setNotesByCompId] = useState({});

  const overviewRef = useRef(null);
  const salesRef = useRef(null);
  const rentRef = useRef(null);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    const refs = [overviewRef, salesRef, rentRef];
    const el = refs[newValue]?.current;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredRentComps = useMemo(() => {
    return COMPS.filter((c) => {
      if (c.type !== "Rent") return false;
      if (market !== "All" && c.market !== market) return false;
      if (distance !== "" && c.distanceMi > Number(distance)) return false;
      if (!isWithinMonths(c.compDate, dateRangeMonths)) return false;
      return true;
    });
  }, [market, distance, dateRangeMonths]);

  // Subject as first row for Sale comparison table (same shape as SALE_COMPS)
  const subjectAsRow = useMemo(() => ({
    ...subjectProperty,
    id: subjectProperty.id,
    name: subjectProperty.name,
    market: subjectProperty.market,
    submarket: subjectProperty.submarket,
    distanceMiles: 0,
    units: subjectProperty.units,
    yearBuilt: subjectProperty.yearBuilt,
    renovationYear: subjectProperty.renovationYear,
    avgUnitSize: subjectProperty.avgUnitSize,
    walkScore: subjectProperty.walkScore,
    pricePerUnit: subjectProperty.pricePerUnit,
    capRate: subjectProperty.capRate,
    saleDate: subjectProperty.saleDate,
    salePrice: subjectProperty.salePrice,
    isSubject: true,
  }), []);

  const filteredSaleComps = useMemo(() => {
    return SALE_COMPS.filter((c) => {
      if (market !== "All" && c.market !== market) return false;
      if (distance !== "" && c.distanceMiles > Number(distance)) return false;
      if (!isWithinMonths(c.saleDate, dateRangeMonths)) return false;
      return true;
    });
  }, [market, distance, dateRangeMonths]);

  const saleTableRows = useMemo(() => {
    const sorted = [...filteredSaleComps].sort((a, b) => calcSimilarity(b, subjectProperty) - calcSimilarity(a, subjectProperty));
    return [subjectAsRow, ...sorted];
  }, [subjectAsRow, filteredSaleComps]);

  const notes = drawerComp ? (notesByCompId[drawerComp.id] ?? "") : "";
  const setNotes = (value) => {
    if (!drawerComp) return;
    setNotesByCompId((prev) => ({ ...prev, [drawerComp.id]: value }));
  };

  return (
    <Box sx={{ overflowX: "hidden", maxWidth: "100%", minWidth: 0 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Property Comps
      </Typography>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
        <Tab label="Overview" />
        <Tab label="Sales Comps" />
        <Tab label="Rent Comps" />
      </Tabs>

      <Box ref={overviewRef} sx={{ scrollMarginTop: 24 }}>
        <SubjectPropertyHeroCard property={subjectProperty} />
      </Box>

      <Box ref={salesRef} sx={{ mb: 4, scrollMarginTop: 24 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Sales comps
        </Typography>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Market</InputLabel>
                <Select
                  label="Market"
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                >
                  {MARKETS.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Distance</InputLabel>
                <Select
                  label="Distance"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {DISTANCES.map((d) => (
                    <MenuItem key={d} value={String(d)}>
                      {d} mi
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Date range</InputLabel>
                <Select
                  label="Date range"
                  value={dateRangeMonths}
                  onChange={(e) => setDateRangeMonths(Number(e.target.value))}
                >
                  {DATE_RANGE_MONTHS.map((m) => (
                    <MenuItem key={m} value={m}>
                      Last {m} months
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              width: "100%",
              overflowX: "auto",
              maxHeight: 520,
              overflowY: "auto",
            }}
          >
            <Table size="small" stickyHeader sx={{ tableLayout: "fixed", width: "100%", minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <>
                    <TableCell sx={{ ...SALE_HEADER_CELL_SX, minWidth: SALE_COL_WIDTHS.property }}>Property</TableCell>
                      <TableCell sx={{ ...SALE_HEADER_CELL_SX, minWidth: SALE_COL_WIDTHS.market }}>Market</TableCell>
                      <TableCell align="right" sx={{ ...SALE_HEADER_CELL_SX, minWidth: SALE_COL_WIDTHS.distance, borderRight: "1px solid", borderColor: "divider" }}>Distance</TableCell>
                      <TableCell align="right" sx={{ ...SALE_HEADER_CELL_SX, minWidth: SALE_COL_WIDTHS.units }}>{COL_LABELS.units}</TableCell>
                      <TableCell align="right" sx={{ ...SALE_HEADER_CELL_SX, minWidth: SALE_COL_WIDTHS.yearBuilt }}>{COL_LABELS.yearBuilt}</TableCell>
                      <TableCell align="right" sx={{ ...SALE_HEADER_CELL_SX, minWidth: SALE_COL_WIDTHS.avgUnitSize }}>{COL_LABELS.avgUnitSize}</TableCell>
                      <TableCell align="right" sx={{ ...SALE_HEADER_CELL_SX, minWidth: SALE_COL_WIDTHS.renovationYear }}>{COL_LABELS.renovationYear}</TableCell>
                      <TableCell align="right" sx={{ ...SALE_HEADER_CELL_SX, minWidth: SALE_COL_WIDTHS.walkScore, borderRight: "1px solid", borderColor: "divider" }}>{COL_LABELS.walkScore}</TableCell>
                      <TableCell align="right" sx={{ ...SALE_HEADER_CELL_SX, minWidth: SALE_COL_WIDTHS.pricePerUnit }}>{COL_LABELS.pricePerUnit}</TableCell>
                      <TableCell align="right" sx={{ ...SALE_HEADER_CELL_SX, minWidth: SALE_COL_WIDTHS.capRate }}>{COL_LABELS.capRate}</TableCell>
                      <TableCell align="center" sx={{ ...SALE_HEADER_CELL_SX, minWidth: SALE_COL_WIDTHS.similarity }}>Similarity</TableCell>
                  </>
                </TableRow>
              </TableHead>
              <TableBody>
                {saleTableRows.map((row) => {
                    const isSubject = row.isSubject || row.id === "subject";
                    const sub = subjectProperty;
                    const similarity = isSubject ? null : calcSimilarity(row, sub);
                    return (
                      <TableRow
                        key={row.id}
                        hover={!isSubject}
                        onClick={() => !isSubject && setDrawerComp(row)}
                        sx={{
                          cursor: isSubject ? "default" : "pointer",
                          ...(isSubject
                            ? {
                                "& .MuiTableCell-root": {
                                  position: "sticky",
                                  top: STICKY_HEADER_TOP,
                                  zIndex: 2,
                                  bgcolor: "grey.50",
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                },
                              }
                            : { "&:hover": { bgcolor: "action.hover" } }),
                        }}
                      >
                        <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: SALE_COL_WIDTHS.property }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {row.name}
                            </Typography>
                            {isSubject && <Chip label="SUBJECT" size="small" color="default" variant="filled" />}
                          </Stack>
                          {row.submarket && (
                            <Typography variant="caption" color="text.secondary">
                              {row.submarket}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ minWidth: SALE_COL_WIDTHS.market }}><Typography variant="body2" fontWeight={500}>{row.market}</Typography></TableCell>
                        <TableCell align="right" sx={{ minWidth: SALE_COL_WIDTHS.distance, width: SALE_COL_WIDTHS.distance, borderRight: "1px solid", borderColor: "divider" }}><Typography variant="body2" fontWeight={500}>{isSubject ? "—" : `${row.distanceMiles} mi`}</Typography></TableCell>
                        <TableCell align="right" sx={{ minWidth: SALE_COL_WIDTHS.units }}>
                          {isSubject ? (
                            <Typography variant="body2" fontWeight={500}>{formatNumber(row.units)}</Typography>
                          ) : (
                            <ValueWithDelta
                              value={row.units}
                              delta={deltaText(row.units, sub.units, "number")}
                              formatValue={formatNumber}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: SALE_COL_WIDTHS.yearBuilt }}>
                          {isSubject ? (
                            <Typography variant="body2" fontWeight={500}>{formatNumber(row.yearBuilt)}</Typography>
                          ) : (
                            <ValueWithDelta
                              value={row.yearBuilt}
                              delta={deltaText(row.yearBuilt, sub.yearBuilt, "years")}
                              formatValue={formatNumber}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: SALE_COL_WIDTHS.avgUnitSize }}>
                          {isSubject ? (
                            <Typography variant="body2" fontWeight={500}>{row.avgUnitSize != null ? `${row.avgUnitSize} SF` : "—"}</Typography>
                          ) : (
                            <ValueWithDelta
                              value={row.avgUnitSize}
                              delta={deltaText(row.avgUnitSize, sub.avgUnitSize, "number")}
                              formatValue={(v) => (v != null ? `${v} SF` : "—")}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: SALE_COL_WIDTHS.renovationYear }}>
                          {isSubject ? (
                            <Typography variant="body2" fontWeight={500}>{row.renovationYear ?? "—"}</Typography>
                          ) : (
                            <ValueWithDelta
                              value={row.renovationYear}
                              delta={row.renovationYear != null && sub.renovationYear != null ? deltaText(row.renovationYear, sub.renovationYear, "years") : null}
                              formatValue={(v) => v ?? "—"}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: SALE_COL_WIDTHS.walkScore, borderRight: "1px solid", borderColor: "divider" }}>
                          {isSubject ? (
                            <Typography variant="body2" fontWeight={500}>{formatNumber(row.walkScore)}</Typography>
                          ) : (
                            <ValueWithDelta
                              value={row.walkScore}
                              delta={deltaText(row.walkScore, sub.walkScore, "number")}
                              formatValue={formatNumber}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: SALE_COL_WIDTHS.pricePerUnit }}>
                          {isSubject ? (
                            <Typography variant="body2" fontWeight={500}>{formatCurrency(row.pricePerUnit)}</Typography>
                          ) : (
                            <ValueWithDelta
                              value={row.pricePerUnit}
                              delta={deltaText(row.pricePerUnit, sub.pricePerUnit, "currency")}
                              formatValue={(v) => formatCurrency(v)}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: SALE_COL_WIDTHS.capRate }}>
                          {isSubject ? (
                            <Typography variant="body2" fontWeight={500}>{formatPercent(row.capRate)}</Typography>
                          ) : (
                            <ValueWithDelta
                              value={row.capRate}
                              delta={deltaText(row.capRate, sub.capRate, "percentPoints")}
                              formatValue={(v) => formatPercent(v)}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: SALE_COL_WIDTHS.similarity }}>
                          {isSubject ? (
                            "—"
                          ) : (
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{similarity}</Typography>
                              <LinearProgress variant="determinate" value={similarity} sx={{ mt: 0.5, height: 3, borderRadius: 2 }} />
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Box ref={rentRef} sx={{ mb: 4, scrollMarginTop: 24 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Rent comps
        </Typography>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ width: "100%", overflowX: "auto" }}>
            <Table size="small" sx={{ tableLayout: "fixed", width: "100%", minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Market</TableCell>
                  <TableCell align="right">Distance</TableCell>
                  <TableCell align="right">Units</TableCell>
                  <TableCell align="right">Avg Rent</TableCell>
                  <TableCell align="right">Rent PSF</TableCell>
                  <TableCell align="right">Occ %</TableCell>
                  <TableCell>Concessions</TableCell>
                  <TableCell>Comp Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRentComps.map((c) => (
                  <TableRow
                    key={c.id}
                    hover
                    onClick={() => setDrawerComp(c)}
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                  >
                    <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</TableCell>
                    <TableCell>{c.market}</TableCell>
                    <TableCell align="right">{c.distanceMi} mi</TableCell>
                    <TableCell align="right">{c.units}</TableCell>
                    <TableCell align="right">{c.avgRent != null ? `$${c.avgRent}` : "—"}</TableCell>
                    <TableCell align="right">{c.rentPsf != null ? `$${c.rentPsf}` : "—"}</TableCell>
                    <TableCell align="right">{formatPct(c.occPct)}</TableCell>
                    <TableCell>{c.concessions ?? "—"}</TableCell>
                    <TableCell>{c.compDate ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Drawer
        anchor="right"
        open={Boolean(drawerComp)}
        onClose={() => setDrawerComp(null)}
        slotProps={{ backdrop: { invisible: false } }}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 380 } },
        }}
      >
        {drawerComp && (
          <Box sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {drawerComp.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {drawerComp.address || (drawerComp.submarket ? `${drawerComp.market}, ${drawerComp.submarket}` : drawerComp.market)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Type: {drawerComp.compType || drawerComp.type || "Sale"}
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Key metrics
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  Market: {drawerComp.market} · {(drawerComp.distanceMiles ?? drawerComp.distanceMi) != null ? `${drawerComp.distanceMiles ?? drawerComp.distanceMi} mi` : "—"} · {drawerComp.units} units
                </Typography>
                {drawerComp.type === "Rent" && (
                  <>
                    <Typography variant="body2">
                      Avg Rent: {drawerComp.avgRent != null ? `$${drawerComp.avgRent}` : "—"} · Rent PSF:{" "}
                      {drawerComp.rentPsf != null ? `$${drawerComp.rentPsf}` : "—"}
                    </Typography>
                    <Typography variant="body2">
                      Occ %: {formatPct(drawerComp.occPct)} · Concessions: {drawerComp.concessions ?? "—"}
                    </Typography>
                    <Typography variant="body2">Comp date: {drawerComp.compDate}</Typography>
                  </>
                )}
                {(drawerComp.type === "Sale" || drawerComp.compType === "SALE" || drawerComp.saleDate) && (
                  <>
                    <Typography variant="body2">
                      Sale Date: {drawerComp.saleDate} · Sale Price: {formatCurrency(drawerComp.salePrice)}
                    </Typography>
                    <Typography variant="body2">
                      Price/Unit: {formatCurrency(drawerComp.pricePerUnit)} · Cap Rate:{" "}
                      {drawerComp.capRate != null ? `${drawerComp.capRate}%` : "—"}
                    </Typography>
                  </>
                )}
              </Stack>
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Notes
            </Typography>
            <TextField
              multiline
              minRows={4}
              fullWidth
              placeholder="Add underwriting notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ flex: 1, "& .MuiInputBase-root": { alignItems: "flex-start" } }}
            />
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

export default PropertiesPage;
