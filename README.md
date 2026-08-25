# Bajaj Manufacturing Dashboard

A modern, high-performance web dashboard for manufacturing execution and intelligence. This application is designed to track real-time production, performance (OEE), straight-pass rates, quality defects, process monitoring, and genealogy/traceability.

## 🚀 Features & What We Built

- **Production Module**: Detailed hourly tracking of Plan vs. Actual production using composed step-line charts. Includes loss analysis via Pareto charts and SKU-wise tracking.
- **Straight Pass Report**: Tracks First-Time-Right (FTR) vs. Reworked engines.
- **Performance (OEE) Dashboard**: Comprehensive tracking of Equipment Efficiency, Quality, Product Availability, and Performance using half-circle gauge charts, alongside runtime vs. downtime analysis.
- **Unified Layout Architecture**: All 14+ modules share a unified layout featuring a sticky top-bar with native dropdown filters (Year, Month, Shift, Line) for maximized horizontal screen real estate.
- **Data-Dense UI Design**: Clean, bright, PowerBI/Excel-style light mode aesthetic optimized for readability and professional manufacturing environments.

## 🛠️ Tech Stack Used

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (with custom utility classes for lean scrollbars and standardized KPI cards)
- **Data Visualization**: Recharts (ComposedCharts, BarCharts, AreaCharts, PieCharts for Gauges)
- **Icons**: Lucide-React
- **Animations**: Framer Motion (for smooth data loading transitions)
- **Routing**: React Router DOM v6

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   \\\ash
   git clone https://github.com/Saksham1244/BajajDashboard.git
   cd BajajDashboard
   \\\

2. Navigate to the client directory and install dependencies:
   \\\ash
   cd client
   npm install
   \\\

3. Start the development server:
   \\\ash
   npm run dev
   \\\

The application will typically be available at http://localhost:5173.

## 📂 Project Structure

- \/client/src/pages\ - Contains the main module views (Production, Performance, TrackTrace, ProcessMonitoring, Quality).
- \/client/src/components\ - Contains reusable UI components like \ReportLayout.jsx\, \Sidebar.jsx\, and \Header.jsx\.
- \/server\ - Backend architecture (Express/Node) placeholder for future MES/SAP integration.

