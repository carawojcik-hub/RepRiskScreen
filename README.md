# Reputation Risk Screening – UX/Product Prototype

**Live prototype:**  
👉https://reputationriskscreening.vercel.app/

---

## Overview

This project is a concept redesign of an internal enterprise tool used by underwriting teams to perform **borrower reputation and risk screening** during multifamily loan underwriting.

The prototype demonstrates how the workflow could be modernized using automation, institutional memory, and improved information architecture.

**Primary users**
- Underwriters  
- Analysts performing due diligence on borrowers, sponsors, and affiliated entities

---

## The Problem

In the original workflow, underwriting teams were required to:

1. Manually search **every deal entity** (borrower, property, management company, seller, etc.)
2. Run repeated searches across:
   - Google  
   - LexisNexis Bridger Insight
3. Manually document findings in an internal system.

### Major pain points

- Extremely manual and repetitive workflow  
- Users had to leave the application to perform searches  
- Prior screening work could not be reused  
- Repeat borrowers required full re-screening every deal  
- High time-on-task for low-value repetitive work  

This resulted in significant operational friction and unnecessary duplication of effort.

---

## Design Goals

This concept explores how the workflow could be redesigned to:

- Reduce manual effort and context switching  
- Reuse institutional knowledge from prior deals  
- Improve transparency and auditability  
- Provide faster at-a-glance risk visibility  
- Better support complex borrower structures  

---

## Key Product Improvements

### 1. Automated Screening Workflow

The redesigned tool simulates an automated screening process that:

- Runs searches across entities directly inside the app  
- Tracks run metadata (last run, user, search terms)  
- Allows manual re-runs when new entities are added  

---

### 2. Institutional Memory via Prior Deal History

One of the biggest opportunities was eliminating repeated work.

**New capabilities**
- Each entity displays prior deal screening history  
- Users can review historical outcomes directly in the app  
- Findings can be imported into the current deal  

---

### 3. Bulk Import of Prior Findings

The most impactful improvement.

Users can now:

- Detect prior deals across the borrower structure  
- Bulk import findings from multiple prior deals  
- Exclude specific deals before importing  
- Clearly see which entities have imported findings  

This transforms a repetitive task into a **one-click workflow**.

---

### 4. Entity-Level Transparency

For each entity, users can:

- View findings and source links  
- Mark false positives  
- Add notes for underwriting decisions  
- See
