# Technical Decision Record (`decision.md`)
**Bajaj Manufacturing Execution & Intelligence Dashboard**

---

## 1. Problem Statement & Project Goals

Industrial automotive manufacturing environments (such as Bajaj Auto engine assembly plants) produce massive streams of telemetry across assembly lines, testing stations, torque controllers, Poka-Yoke sensors, and manual quality checklists. 

Historically, plant supervisors and industrial engineers faced several challenges:
- **Fragmented Data Silos**: SCADA screens, PLC logs, paper checklists, and maintenance logs were disconnected.
- **Lack of Real-Time OEE Visibility**: Shift managers lacked instant visibility into live line bottlenecks, Pareto loss causes, and straight-pass rates.
- **Heavy, Non-Responsive Legacy Software**: Existing desktop-bound MES interfaces were slow, difficult to navigate, and incapable of rapid export/reporting on mobile or tablet devices.

**Project Objective**: Build a modern, lightning-fast, unified web-based manufacturing dashboard covering 8 operational domains with standardized KPI cards, interactive charts, and instantaneous client-side Excel/PDF reporting.

---

## 2. Architecture Decision Records (ADRs)

### ADR-001: Frontend Framework & Build Tooling (React 18 + Vite)
- **Decision**: Use React 18 with Vite as the build engine.
- **Rationale**:
  - **Single Page Application (SPA)** architecture is ideal for shop-floor display kiosks and operator terminals where page reloads disrupt monitoring.
  - **Vite's Rollup/ESBuild pipeline** delivers sub-second Hot Module Replacement (HMR) and optimized chunk bundling.
  - Avoided SSR frameworks (like Next.js) because the app operates behind an industrial on-premise firewall with no SEO requirements; static client SPA minimizes server hosting overhead.

### ADR-002: Visual Design System & Styling (Tailwind CSS)
- **Decision**: Adopt Tailwind CSS with custom utility classes for industrial density (`brand-primary`, `brand-accent`, lean scrollbars, and card containers).
- **Rationale**:
  - **Data Density**: Factory control rooms require high information density (compact tables, concise KPI cards, minimal padding).
  - **Light Mode Aesthetic**: Designed with an Excel/PowerBI clean aesthetic (`#0369a1` primary blue, `#f97316` secondary orange, `#10b981` emerald green) optimized for high readability on factory monitors under ambient fluorescent lighting.
  - **Print CSS (`@media print`)**: Native Tailwind print utilities (`print:hidden`, `print:overflow-visible`) allow clean, borderless PDF reporting directly from the browser without third-party rendering bloat.

### ADR-003: Data Visualization Strategy (Recharts)
- **Decision**: Standardize on Recharts (built on SVG & D3 math).
- **Rationale**:
  - **Composed Charts**: Enables multi-metric superposition—such as Bar charts (Actual units) with step-line overlays (Target quota) and dual Y-axes (Pareto loss count vs. cumulative %).
  - **Custom Gauge Charts**: Implemented half-circle gauges via `<PieChart>` (`startAngle={180}` to `endAngle={0}`) to represent OEE/OLE efficiency KPIs without requiring heavyweight specialized gauge libraries.
  - **Responsive Containers**: Seamless auto-resizing across varying terminal screen resolutions.

### ADR-004: Unified Component & Layout Architecture
- **Decision**: Abstract all 25+ views under a unified layout hierarchy (`Layout.jsx`, `StandardFilterBar.jsx`, `StatCard.jsx`, `DataTable.jsx`, and `useReportFilters.js`).
- **Rationale**:
  - **Consistency**: Shift supervisors experience zero cognitive friction moving between Production, Maintenance, and Quality screens.
  - **Code Deduplication**: Shared `useReportFilters` hook centralizes Period (Shift/Day/Week/Month), Date Picker, Line, and Station dropdown logic.
  - **Maintainability**: Global styling adjustments or export enhancements immediately propagate across all 25+ reports.

### ADR-005: Hybrid Data Strategy (MSSQL with Deterministic Fallbacks)
- **Decision**: Implement a dual-mode data layer: Microsoft SQL Server query engine with a deterministic scaling fallback engine (`getScale(period)`).
- **Rationale**:
  - **Zero-Dependency Demos**: Allows the dashboard frontend and API server to run seamlessly on developer machines, client showcases, and staging environments without requiring a local instance of the 500MB `PPMS_BajajPant` SQL Server database.
  - **Realistic Scaling**: When switching between `Month` $\rightarrow$ `Week` $\rightarrow$ `Day` $\rightarrow$ `Shift`, metrics dynamically scale proportionally ($1.0 \rightarrow 0.25 \rightarrow 0.03 \rightarrow 0.015$), providing realistic numbers and chart trends.

### ADR-006: Database Choice & Authentication (Microsoft SQL Server + Windows Auth)
- **Decision**: Target Microsoft SQL Server (`msnodesqlv8` driver and Windows Authentication).
- **Rationale**:
  - Standard enterprise IT stack across Bajaj manufacturing facilities is Windows Server hosting MS SQL Server.
  - Windows Integrated Authentication (`trustedConnection: true`) aligns with domain security policies without hardcoding plain-text passwords into environment configurations.

### ADR-007: Client-Side Multi-Sheet Excel & PDF Generation
- **Decision**: Use `xlsx` (SheetJS) for client-side workbook generation and CSS `@media print` for PDF generation.
- **Rationale**:
  - Avoids server-side memory spikes and long-running headless browser processes (Puppeteer/Chromium) on the Node.js backend.
  - Instantaneous multi-tab spreadsheet generation directly from in-memory client state (`KPI Summary`, `Time-Series Trends`, `Row Details`).

### ADR-008: Performance Optimization & Code Splitting
- **Decision**: Dynamic route-level code splitting via `React.lazy` and `Suspense`.
- **Rationale**:
  - Isolates heavy report modules (Quality, Maintenance, Material, Workforce) into separate JS bundles, reducing initial payload size and speeding up Initial Contentful Paint (ICP) on low-power shop floor terminals.

### ADR-009: Micro-Interactions & Smooth Scroll Experience
- **Decision**: Integrate `@studio-freight/lenis` smooth momentum scrolling with `framer-motion` page and drawer animations.
- **Rationale**:
  - Delivers a polished, native application feel on large touch-screen plant displays and executive desktop monitors.

---

## 3. Technical Trade-offs & Analysis

| Decision | Pros | Cons / Trade-offs | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Client-Side Scaling Fallbacks** | Instant offline testing; no DB dependency required for UI verification. | Potential drift between fallback formulas and complex SQL aggregations. | Keep SQL views and fallback formulas synchronized via regression tests. |
| **`msnodesqlv8` Windows Auth** | Native enterprise security on Windows servers without password storage. | Requires Windows runtime; Linux/Docker deployments require standard SQL credentials. | Support dual configuration via `.env` (`DB_USER`, `DB_PASSWORD` vs `trustedConnection`). |
| **Local State vs. Full Redux Store** | Lightweight boilerplate; rapid component development per module. | Partial redundancy in fetch handling across individual report pages. | Abstract common fetch logic into React Query / RTK Query slices in future sprints. |
| **SVG-Based Recharts** | High visual sharpness, easy DOM styling, crisp vector rendering. | Can experience performance degradation with $>10,000$ simultaneous SVG nodes. | Aggregate data points into hourly/daily buckets before passing to chart props. |

---

## 4. Future Architecture Roadmap

1. **Real-time Telemetry via WebSockets / MQTT**:
   - Introduce an MQTT broker bridge to stream live PLC cycle times and torque readings directly to frontend WebSocket listeners.
2. **Role-Based Access Control (RBAC)**:
   - Implement JWT / SAML SSO authentication with granular permission tiers (Operator, Shift Incharge, Quality Auditor, Plant Head).
3. **Automated Alerting & Push Notifications**:
   - Webhook integration for WhatsApp/Email alerts when Poka-Yoke bypasses exceed threshold limits or critical machine breakdowns occur.
4. **Predictive Maintenance ML Pipeline**:
   - Feed historical MTTR/MTBF and vibration data into anomaly detection models to forecast equipment failures before downtime occurs.

---
