# System Architecture & Flow Document (`flow.md`)
**Bajaj Manufacturing Execution & Intelligence Dashboard**

---

## 1. Executive Summary & Application Overview

The **Bajaj Manufacturing Dashboard** is an enterprise-grade Manufacturing Execution System (MES) intelligence web application engineered for high-volume automotive engine assembly and production plants (e.g., Bajaj Auto). 

The platform aggregates real-time and historical telemetry across **8 major manufacturing domains**:
1. **Production Management**: Plan vs. Actual tracking, Shift/Hourly yields, Shortfall Pareto analysis, and Straight-Pass / First-Time-Right (FTR) metrics.
2. **Performance (OEE) Management**: Overall Equipment Effectiveness (OEE), Overall Line Efficiency (OLE), Availability, Performance, and Runtime vs. Downtime breakdowns.
3. **Process Monitoring**: Poka-Yoke interlocking, Bypass event auditing, Torque angle/tightening verification, and Conveyor stoppage metrics.
4. **Track & Trace**: Serialized engine genealogy (barcode UID tracking), Work-in-Progress (WIP) buffer tracking, and Engine-wise rework logging.
5. **Quality Assurance**: Defect classification, Pareto defect drilldowns, Process Quality Control Audits (PQCA), and standard checklists (IQC, IPQC, FQC).
6. **Maintenance Operations**: Breakdown logs, Mean Time Between Failures (MTBF), Mean Time To Repair (MTTR), and Preventive Maintenance (PM) schedules.
7. **Material & Kitting**: Real-time stock status, shortage alerts, bill of materials (BOM) consumption tracking, and kitting station efficiency.
8. **Workforce Allocation**: Shift attendance, station line-balancing, operator skill matrix matching, and idle time / overtime analytics.

---

## 2. High-Level Architecture

The system follows a tiered client-server manufacturing intelligence architecture:

```mermaid
flowchart TD
    subgraph ClientLayer ["Frontend Client (React 18 + Vite + Tailwind)"]
        UI["UI Views & Reports (25+ Screens)"]
        Router["React Router v7 / v6 Routing"]
        Filters["Global Filter Bar (Shift, Date, Line, SKU)"]
        Components["Reusable UI Components (StatCard, DataTable, Recharts)"]
        Export["Client-Side Multi-Tab Excel (.xlsx) & PDF Print Engine"]
    end

    subgraph APILayer ["Backend API (Node.js + Express)"]
        ExpressApp["Express Application (Port 5000)"]
        Endpoints["REST API Endpoints (/api/dashboard, /api/process, /api/quality...)"]
        ScaleEngine["Deterministic Time-Scaling Fallback Engine"]
    end

    subgraph DataLayer ["Database Layer (Microsoft SQL Server)"]
        MSSQL[("PPMS_BajajPant DB")]
        ConfigTables["Config Tables (Plant, Line, Station, SKU, BOM)"]
        ProdTables["Production & Defect Tables (Prod_EnginePlanExecution, Prod_Defect_Log)"]
        PerfTables["Performance Tables (Perf_Hourly_OLE)"]
    end

    subgraph ShopFloor ["Industrial Shop Floor (Telemetry & Hardware)"]
        PLCs["PLC Controllers & Assembly Stations"]
        PokaYoke["Poka-Yoke & Torque Sensors"]
        Scanners["Barcode / RFID UID Scanners"]
    end

    ShopFloor -.->|Telemetry & Scans| DataLayer
    DataLayer <-->|Windows Auth / msnodesqlv8| APILayer
    APILayer <-->|REST / JSON| ClientLayer
    Filters --> UI
    Router --> UI
    UI --> Components
    Components --> Export
```

---

## 3. End-to-End Data & Execution Flow

### 3.1 User Navigation & Routing Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Plant Operator / Manager
    participant Browser as React SPA (Vite)
    participant Layout as Layout Component
    participant Sidebar as Sidebar Navigation
    participant View as Active Report Page (Lazy)
    participant Backend as Express REST API
    participant DB as MS SQL Server

    User->>Browser: Enters URL / Selects Menu (e.g. /production/report)
    Browser->>Layout: Render Shell (Sidebar + Top Header + Lenis Scroll)
    Layout->>Sidebar: Highlight active route & expand module hierarchy
    Layout->>View: Load Page Chunk via React.lazy & Suspense
    View->>View: Initialize filters via useReportFilters hook
    View->>Backend: HTTP GET /api/dashboard/production?period=Shift&shift=Shift 1
    Backend->>DB: Query Prod_EnginePlanExecution / Perf_Hourly_OLE
    alt DB Connected
        DB-->>Backend: Return SQL Recordsets
    else DB Disconnected / Fallback
        Backend-->>Backend: Apply deterministic scaling factor getScale(period)
    end
    Backend-->>View: JSON Payload (Plan vs Actual, KPIs, StraightPass)
    View->>View: Compute client-side aggregations, Pareto curves & chart models
    View-->>User: Render KPI Cards, ComposedCharts, Gauges, & DataTables
```

---

## 4. Module-by-Module Operational Flow

```mermaid
graph LR
    subgraph P1 [Production & OEE]
        PR[Production Report] --> SP[Straight Pass FTR]
        PF[Performance Report] --> DT[Downtime Loss]
    end

    subgraph P2 [Shop Floor Control]
        PY[Poka Yoke Interlock] --> BP[Bypass Logging]
        TQ[Torque Tightening] --> CV[Conveyor Speed]
    end

    subgraph P3 [Traceability & Quality]
        GN[Genealogy Barcode UID] --> WP[WIP Pipeline]
        DF[Defect Breakdown] --> QC[IQC / IPQC / FQC]
    end

    subgraph P4 [Resource Management]
        MN[Maintenance MTBF/MTTR] --> PM[Preventive Maint.]
        MT[Material Stock & Shortage] --> KT[Kitting Prep]
        WF[Workforce Allocation] --> SM[Skill Matrix]
    end
```

### 4.1 Production Management Flow
1. **Plan vs. Actual Analysis**:
   - `Prod_Shift_Plan` and `Prod_EnginePlanExecution` supply planned engine quota vs. completed count.
   - Recharts `ComposedChart` renders hourly step-line target curves against bar charts of actual completions.
2. **Shortfall & Pareto Loss Calculation**:
   - Shortfall is quantified (`Plan - Actual`).
   - Root causes (Material Shortage, Machine Breakdown, Quality Hold, Setup Delay) are ranked in descending order with cumulative percentage lines (80/20 Pareto rule).
3. **Straight-Pass / First-Time-Right (FTR)**:
   - Tracks engines completing assembly without hitting any rework loop:
     $$\text{Straight Pass Qty} = \text{Completed Qty} - \text{Rework OK Qty}$$

### 4.2 Performance (OEE / OLE) Flow
1. **OEE Metrics Engine**:
   - Overall Equipment Effectiveness is computed from three core pillars:
     $$\text{OEE} = \text{Availability} \times \text{Performance} \times \text{Quality}$$
2. **Gauge Visualizations**:
   - Half-circle pie gauges (`PieChart` with `startAngle={180}` and `endAngle={0}`) visualize real-time percentages for Product Availability, Line Performance, Quality/OLE, and Equipment Efficiency.
3. **Runtime vs. Downtime**:
   - Stacked bar charts break down machine operational run-time against unscheduled downtime per station.

### 4.3 Process Monitoring Flow
1. **Poka-Yoke Interlocking**:
   - Assembly stations feature sensor-gated error proofing (tightening confirmation, component presence).
   - OK vs. NOT-OK (NOK) cycles are plotted hourly.
2. **Bypass Event Auditing**:
   - If an operator or supervisor bypasses a safety/quality gate (e.g. sensor fault), the bypass duration, reason, authorization, and station ID are logged in real-time.
3. **Torque Tightening Curves**:
   - Fastening operations log peak torque (Nm) and angle against minimum/maximum specification limits.
4. **Conveyor Analytics**:
   - Tracks line stoppage durations, motor faults, and line speed variations.

### 4.4 Track & Trace (Genealogy) Flow
1. **Engine UID Genealogy**:
   - Operators scan a barcode UID (e.g., `ENG-2026-00123`).
   - System fetches the full sequential history across all assembly stations (`ST-01 Block Assembly` $\rightarrow$ `ST-02 Piston` $\rightarrow$ `ST-03 Head` $\rightarrow$ `RW-01 Rework`).
2. **Work-In-Progress (WIP) Tracking**:
   - Real-time station buffer monitoring to identify bottlenecks where semi-finished engines accumulate.
3. **Engine-Wise Rework History**:
   - Tracks rework frequency, cycle time spent in rework bays, and defect clearance stamps.

### 4.5 Quality Assurance & Checklists Flow
1. **Defect Categorization**:
   - Captures defect logs (`Prod_Defect_Log`) categorized by Engine Half, Leakage, Pressure Vessel, Cosmetic, and Torque failure.
2. **Standardized Checklists (IQC / IPQC / FQC)**:
   - **IQC (Incoming Quality Control)**: Raw materials & supplier components.
   - **IPQC (In-Process Quality Control)**: Sub-assembly and mid-line checks.
   - **FQC (Final Quality Control)**: Dyno engine firing, strip audit, and final electrical testing.

### 4.6 Maintenance Operations Flow
1. **Equipment Health Monitoring**:
   - Tracks live states across machines: `Running`, `Breakdown`, `Maintenance`, or `Idle`.
2. **MTTR & MTBF Reliability**:
   - **MTBF (Mean Time Between Failures)**: $\frac{\text{Operational Uptime}}{\text{Number of Breakdowns}}$
   - **MTTR (Mean Time To Repair)**: $\frac{\text{Total Downtime}}{\text{Number of Breakdowns}}$
3. **Preventive Maintenance (PM)**:
   - Tracks schedule compliance, lubrication routines, and calendar-based servicing.

### 4.7 Material Management & Kitting Flow
1. **Stock Levels & Safety Buffers**:
   - Identifies items in **Critical** ($< \text{Min Stock}$), **Safe**, or **Excess** zones.
2. **Kitting Operations**:
   - Measures kitting preparation speed, kit inspection pass rates, and synchronization with main assembly line speed.

### 4.8 Workforce Management Flow
1. **Shift Attendance & Skill Balancing**:
   - Compares planned vs. present workforce per station.
2. **Skill Matrix Matching**:
   - Ensures high-criticality stations (e.g., Crankcase Sub-Assy) are manned by certified Skill Level 3/4 operators.

---

## 5. Filter & State Propagation Flow

The user filter interaction operates via a centralized unidirectional flow:

```mermaid
flowchart TD
    A[User Modifies Filter: Shift / Date / Line / SKU] --> B[useReportFilters Hook]
    B --> C[StandardFilterBar Component]
    C --> D[Updates Component State & URL Query Params]
    D --> E{Backend API Available?}
    E -- Yes --> F[Fetch /api/... with query params]
    E -- No --> G[Apply Deterministic Scale Factor]
    F --> H[Scale Server Response]
    G --> H
    H --> I[StatCards Re-render with Scaling]
    H --> J[Recharts Re-render with Time Labels]
    H --> K[DataTable Re-renders Filtered Rows]
```

### Deterministic Period Scaling Matrix:
To allow offline demonstration and standalone UI interaction without requiring a live MSSQL instance:
- **Month View**: Base multiplier = `1.000`
- **Week View**: Base multiplier = `0.250`
- **Day View**: Base multiplier = `0.030`
- **Shift View**: Base multiplier = `0.015`

---

## 6. Export & Reporting Flow

1. **Excel Generation (`exportToXLSX`)**:
   - Multi-sheet workbook builder using `xlsx` (SheetJS).
   - Generates worksheets for:
     - `KPI Summary` (Aggregated metrics)
     - `Hourly / Trend Data` (Time-series records)
     - `Detailed Event Logs` (Row-level operational data)
2. **Print & PDF Engine**:
   - Customized CSS print stylesheet (`@media print`) hides navigation sidebars and headers, scales charts to full page width, and enables direct clean vector PDF export via native browser print dialog.

---
