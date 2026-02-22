# Reputation Risk Screening – UX/Product Prototype

**Live prototype:**  
👉 https://reputationriskscreening.vercel.app/

---

## Overview

This project is a concept redesign of an internal enterprise tool used by underwriting teams to perform borrower reputation and risk screening during multifamily loan underwriting.

The prototype demonstrates how the workflow can be modernized using:

- Automation  
- Institutional memory  
- Persistent screening history  
- Improved information architecture  
- Clear entity-level traceability  

This case study focuses on transforming a manual, repetitive compliance workflow into a structured, auditable, productized system.

---

## Primary Users

- **Underwriters**
- **Analysts performing due diligence** on borrowers, sponsors, guarantors, properties, and affiliated entities

---

# The Problem

In the legacy workflow, underwriting teams were required to:

- Manually search every deal entity (borrower, property, management company, seller, etc.)
- Run repeated searches across:
  - Google  
  - LexisNexis Bridger Insight  
- Manually document findings in an internal system  

### Major Pain Points

- Extremely manual and repetitive workflow  
- Users had to leave the application to perform searches  
- Prior screening work could not be reused  
- Repeat borrowers required full re-screening on every deal  
- High time-on-task for low-value repetitive work  
- No persistent institutional memory  
- Limited audit transparency  

This resulted in significant operational friction and unnecessary duplication of effort.

---

# Design Goals

This concept explores how the workflow could be redesigned to:

- Reduce manual effort and context switching  
- Reuse institutional knowledge from prior deals  
- Improve transparency and auditability  
- Provide faster at-a-glance risk visibility  
- Better support complex borrower structures  
- Normalize entity identity across deals  

---

# Key Product Improvements

---

## 1. Automated Screening Workflow

The redesigned tool simulates an automated screening process that:

- Runs searches across entities directly inside the app  
- Tracks run metadata (last run, user, search terms)  
- Allows manual re-runs when new entities are added  
- Separates screening status from risk evaluation  

This reduces dependency on external tools and centralizes documentation.

---

## 2. Institutional Memory via Prior Deal History

A major inefficiency in the original workflow was re-screening repeat borrowers from scratch.

The redesigned experience introduces persistent screening history:

- Each entity displays prior deal screening history  
- Prior deals show:
  - Date range  
  - Number of findings  
  - False positive count  
- Users can review historical outcomes directly in the app  

This creates an institutional memory layer that compounds value over time.

---

## 3. Import Prior Findings (Entity-Level)

One of the most impactful improvements is entity-level finding import.

### New Behavior

Within the entity drawer:

- Users see prior deal history  
- If findings exist, they can click **Import Prior Findings**  
- Imported findings are:
  - Persisted in application state  
  - Associated with the current deal  
  - Rendered immediately in the findings section  
  - Reflected in entity-level summary counts  

### Technical Design Consideration

To ensure consistency across entities:

- A canonical `entityKey` strategy was introduced  
- Findings are keyed by stable entity identifiers (not display names)  
- Import logic merges findings by unique ID to prevent duplication  
- State persists across drawer open/close cycles  

This resolves a common enterprise data problem:

> Entity identity mismatch across deals.

---

## 4. Bulk Import of Prior Findings (Deal-Level)

The workflow supports bulk import across the borrower structure:

- Detect prior deals across related entities  
- Bulk import findings from multiple deals  
- Exclude specific deals before importing  
- Clearly indicate which entities now contain imported findings  

This transforms a repetitive workflow into a one-click operation.

---

## 5. Entity-Level Transparency

For each entity, users can:

- View findings with:
  - Source deal  
  - Type  
  - Severity  
  - Date  
- Open source links  
- Identify false positives  
- Add underwriting notes  
- See screening status vs. imported findings clearly separated  

This improves audit traceability and underwriting defensibility.

---

# UX Improvements

- Drawer-based contextual detail views  
- Structured metadata hierarchy  
- Clear visual distinction between:
  - Screening status  
  - Risk level  
  - Imported findings  
- Persistent findings rendering  
- Explicit empty states when no findings exist  

The experience reduces ambiguity and increases user confidence.

---

# Technical Architecture

**Frontend**
- React  
- Material UI  
- Vite  

**State Management**
- Local component state (no external store)  
- Findings persisted by entity key  
- Deterministic import logic with ID-based merging  

**Deployment**
- Vercel  

**Version Control**
- GitHub with feature-branch workflow  

---

# Product Thinking Demonstrated

This prototype demonstrates:

- Workflow simplification in enterprise systems  
- Reduction of repetitive compliance work  
- Institutional memory design  
- Entity identity normalization  
- Data persistence modeling  
- Clear separation of system state vs. business state  
- UX for complex underwriting structures  

---

# Future Enhancements

Potential next steps:

- True screening run simulation with async state transitions  
- Audit log timeline per entity  
- Finding severity filters  
- Risk scoring aggregation at borrower level  
- Reviewer/approver workflow layer  
- API-based persistence instead of local state  
- Advanced entity resolution logic  

---

# About This Project

This is a UX/Product concept prototype intended to demonstrate:

- Enterprise workflow redesign  
- Product strategy in regulated environments  
- Practical React implementation of complex business logic  

It is not connected to real borrower data.
