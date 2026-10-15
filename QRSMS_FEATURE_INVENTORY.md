# Quantum Ripple School Management System

## Comprehensive Feature Inventory

### 1. Document Purpose and Audit Method

- Purpose: This document inventories the features actually present in the frontend of the QRSMS project, using the implemented routes, views, components, and API calls as the primary evidence.
- Repository inspected: [src](src)
- Framework and libraries observed: Vue 3 + Vite, Vue Router, Pinia, Axios, Tailwind CSS, Vue Query, Chart.js, ApexCharts, jsPDF/html2pdf, xlsx, FileSaver.
- Evidence sources:
  - [package.json](package.json)
  - [src/main.js](src/main.js)
  - [src/routers/index.js](src/routers/index.js)
  - Portal route files under [src/portals](src/portals)
  - Portal API service files under [src/portals](src/portals)
  - Shared auth store at [src/stores/authStore.js](src/stores/authStore.js)
- Audit date: 2026-10-13
- Verification limitations:
  - This is a static frontend audit based on source inspection and build validation.
  - Live backend behavior and data integrity were not independently verified against a running production or staging instance.
  - Some features are implemented in code but not independently runtime-tested here.
- Status definitions used in this inventory:
  - Implemented and functional: UI and supporting API calls are present and the flow is complete enough to be credible.
  - Implemented, functionality unverified: UI exists, but runtime behavior could not be validated from the code alone.
  - Partially implemented: Some parts of the feature exist, but key steps or logic are incomplete or placeholder-driven.
  - UI placeholder / mock data: Page exists but is clearly a shell or demo state.
  - Broken / inaccessible: route/component import, export, or runtime issue is evident.
  - Not found: No corresponding implementation observed in the repository.

### 2. Executive Product Overview

The frontend contains multiple distinct role-based portals with role-specific routes and navigation. The core routing configuration is defined in [src/routers/index.js](src/routers/index.js), and each portal has an independent route module under [src/portals](src/portals).

Confirmed roles and portals observed:
- Student portal: /student
- Teacher portal: /teachers
- Principal / school administrator portal: /principal
- Finance portal: /finance
- Parent portal: /parent
- Admin role alias: the router maps the role "admin" to the principal portal

The system appears to cover the following product areas:
- Student, teacher, and parent management
- Attendance recording and reporting
- Academic exams, grading, assessment, and results release
- Reporting and analytics dashboards
- Fee management, invoices, and payment tracking
- Transport billing and route pricing configuration
- Announcements and communication events
- Assignment and learning-material flows for students and teachers

Major implementation or verification limits:
- The project clearly supports multiple role-specific portals, but some individual pages are clearly placeholder shells.
- Several finance and reporting flows are present, but the actual backend service or environment was not audited here.
- The codebase does contain API integration patterns for M-Pesa / STK push and payment tracking, but the live integration flow was not independently verified.
- A build check completed successfully, but the build output surface still showed a missing export issue in student/teacher event detail components, indicating some unresolved references in the codebase.

### 3. Portal and Access Map

| Portal | Actual role names used by app | Main route prefix | Access guard pattern | Evidence |
|---|---|---|---|---|
| Student | student | /student | requiresAuth + portalRole: 'student' | [src/routers/index.js](src/routers/index.js), [src/portals/students/routes.js](src/portals/students/routes.js) |
| Teacher | teacher | /teachers | requiresAuth + portalRole: 'teacher' | [src/routers/index.js](src/routers/index.js), [src/portals/teachers/routes.js](src/portals/teachers/routes.js) |
| Principal | principal, admin | /principal | requiresAuth + portalRole: 'principal' | [src/routers/index.js](src/routers/index.js), [src/portals/principals/routes.js](src/portals/principals/routes.js) |
| Finance | finance | /finance | requiresAuth + portalRole: 'finance' | [src/routers/index.js](src/routers/index.js), [src/portals/finance/routes.js](src/portals/finance/routes.js) |
| Parent | parent | /parent | requiresAuth + portalRole: 'parent' | [src/routers/index.js](src/routers/index.js), [src/portals/parents/routes.js](src/portals/parents/routes.js) |

Shared modules observed:
- Auth store and JWT refresh flow in [src/stores/authStore.js](src/stores/authStore.js)
- Shared HTTP client in [src/api/axios.js](src/api/axios.js)
- Shared sidebar component pattern in [src/portals/principals/components/SideBar.vue](src/portals/principals/components/SideBar.vue) and mirrored portal variants
- Shared event detail and announcement patterns across portals

### 4. Principal / School Administrator Portal

#### Overview
The principal portal is the richest and most feature-dense area of the frontend. The route file is [src/portals/principals/routes.js](src/portals/principals/routes.js). Its main work areas are student administration, teacher/staff administration, exams and assessment release, reporting, attendance, finance overview, parent management, and settings.

#### Principal feature inventory

| Feature | Description | Available actions | Status | Evidence |
|---|---|---|---|---|
| Dashboard | Principal landing page showing dashboard components | View | Implemented, unverified | [src/portals/principals/views/Dashboard.vue](src/portals/principals/views/Dashboard.vue) |
| Student management | Student list, search, pagination, create student flow | View, search, create | Implemented, unverified | [src/portals/principals/views/StudentsPage.vue](src/portals/principals/views/StudentsPage.vue), [src/portals/principals/components/CreateStudent.vue](src/portals/principals/components/CreateStudent.vue) |
| Student detail view | Student profile/detail page | View | Implemented, unverified | [src/portals/principals/components/StudentsDetail.vue](src/portals/principals/components/StudentsDetail.vue) |
| Teacher management | Teacher list, create teacher, teacher detail view | View, search, create | Implemented, unverified | [src/portals/principals/views/TeachersPage.vue](src/portals/principals/views/TeachersPage.vue), [src/portals/principals/components/CreateTeacher.vue](src/portals/principals/components/CreateTeacher.vue), [src/portals/principals/components/TeachersDetail.vue](src/portals/principals/components/TeachersDetail.vue) |
| Other staff management | Support for non-teaching staff records | View, create, detail | Implemented, unverified | [src/portals/principals/views/OtherStaff.vue](src/portals/principals/views/OtherStaff.vue), [src/portals/principals/components/CreateOtherStaff.vue](src/portals/principals/components/CreateOtherStaff.vue) |
| Parent management | Parent list and parent records | View, edit, manage | Implemented, unverified | [src/portals/principals/views/ParentsList.vue](src/portals/principals/views/ParentsList.vue), [src/portals/principals/components/parents/ParentsPage.vue](src/portals/principals/components/parents/ParentsPage.vue) |
| Attendance management | Attendance overview and session detail pages | View, manage, review | Implemented, unverified | [src/portals/principals/views/Attendance.vue](src/portals/principals/views/Attendance.vue), [src/portals/principals/views/AttendanceSessionDetail.vue](src/portals/principals/views/AttendanceSessionDetail.vue), [src/portals/principals/api/attendance.js](src/portals/principals/api/attendance.js) |
| Attendance drill-down | Class roll and student attendance profile views | View | Implemented, unverified | [src/portals/principals/components/attendance/ClassRoll.vue](src/portals/principals/components/attendance/ClassRoll.vue), [src/portals/principals/components/attendance/StudentAttendanceProfile.vue](src/portals/principals/components/attendance/StudentAttendanceProfile.vue) |
| Exam management | Exam catalog, summary metadata, create exam modal or page | View, create | Implemented, unverified | [src/portals/principals/views/ExamManagement.vue](src/portals/principals/views/ExamManagement.vue), [src/portals/principals/api/Grades.js](src/portals/principals/api/Grades.js) |
| Results release workflow | Readiness check, missing marks, preview, release, withdraw | View, preview, release, withdraw | Implemented, unverified | [src/portals/principals/views/ReleaseResults.vue](src/portals/principals/views/ReleaseResults.vue), [src/portals/principals/components/assessments/release/MissingMarks.vue](src/portals/principals/components/assessments/release/MissingMarks.vue) |
| Academic analytics | Results by class, subject, rankings, comparison | Filter and view | Implemented, unverified | [src/portals/principals/api/analytics.js](src/portals/principals/api/analytics.js), [src/portals/principals/components/analytics](src/portals/principals/components/analytics) |
| Finance overview | Finance dashboard and transaction tables | View, filter | Implemented, unverified | [src/portals/principals/views/Finance.vue](src/portals/principals/views/Finance.vue) |
| Expenditure and invoice views | Finance-related summaries and invoice pages | View | Implemented, unverified | [src/portals/principals/views/Finance.vue](src/portals/principals/views/Finance.vue), [src/portals/principals/components/finance](src/portals/principals/components/finance) |
| Calendar / events | Events/calendar pages and forms | View, create | Implemented, unverified | [src/portals/principals/views/Calender.vue](src/portals/principals/views/Calender.vue), [src/portals/principals/components/EventModal.vue](src/portals/principals/components/EventModal.vue) |
| Reports and exports | Student, teacher, and finance report tabs; CSV export utility | View, export CSV | Implemented, unverified | [src/portals/principals/views/ReportsPage.vue](src/portals/principals/views/ReportsPage.vue), [src/portals/principals/utils/resultsExport.js](src/portals/principals/utils/resultsExport.js) |
| Configurations | School configuration settings | View, configure | Implemented, unverified | [src/portals/principals/views/Configurations.vue](src/portals/principals/views/Configurations.vue) |
| Promotions | Promotion-related workflow | View | Implemented, unverified | [src/portals/principals/views/Promotions.vue](src/portals/principals/views/Promotions.vue) |
| Communications / events | Announcement/event list and detail pages | View, create | Implemented, unverified | [src/portals/principals/views/EventsPage.vue](src/portals/principals/views/EventsPage.vue) |

#### Principal-specific detailed observations

- Student and teacher records are list/search-based and support detail pages and creation workflows.
- Attendance includes session-based and roll-call-like views, which is a strong sign of a school-based attendance management process.
- The results-release workflow is surprisingly advanced: the code checks readiness, allows a preview, supports balance-based audience gating, and allows withdrawal after release. This is a concrete academic workflow with real release logic.
- Finance is represented as a principal summary area, but in practice the coded workflow is closely aligned to the dedicated finance portal described below.
- There is a specific CSV export utility for results tables, which is evidence of export functionality.

#### Principal workflow evidence

Academic workflow trace (from code):
1. Exam catalog and summary loaded from [src/portals/principals/views/ExamManagement.vue](src/portals/principals/views/ExamManagement.vue)
2. Results release readiness and missing marks are checked via [src/portals/principals/api/Grades.js](src/portals/principals/api/Grades.js)
3. Release results route supports preview, audience filters, notification sending, and withdraw actions in [src/portals/principals/views/ReleaseResults.vue](src/portals/principals/views/ReleaseResults.vue)
4. Missing marks breakdown can drill into student-level missing records via [src/portals/principals/components/assessments/release/MissingMarks.vue](src/portals/principals/components/assessments/release/MissingMarks.vue)

### 5. Teacher Portal

#### Overview
The teacher portal is implemented as a role-specific interface with dashboards, student views, grade entry, attendance recording, assessments, assignments, announcements, and results analysis. The route module is [src/portals/teachers/routes.js](src/portals/teachers/routes.js).

#### Teacher feature inventory

| Feature | Description | Available actions | Status | Evidence |
|---|---|---|---|---|
| Dashboard | Teacher summary dashboard with attendance and stats | View | Implemented, unverified | [src/portals/teachers/views/Dashboard.vue](src/portals/teachers/views/Dashboard.vue) |
| Student list | Teacher-focused student roster by active class | View, search | Implemented, unverified | [src/portals/teachers/views/Students.vue](src/portals/teachers/views/Students.vue) |
| Student detail | Student detail page for a teacher | View | Implemented, unverified | [src/portals/teachers/routes.js](src/portals/teachers/routes.js) |
| Attendance | Attendance capture and edit flows | View, record, edit | Implemented, unverified | [src/portals/teachers/views/Attendance.vue](src/portals/teachers/views/Attendance.vue), [src/portals/teachers/api/attendance.js](src/portals/teachers/api/attendance.js) |
| Grades entry | Teacher grade input interface for subjects/exams | View, create, edit | Implemented, unverified | [src/portals/teachers/views/Grades.vue](src/portals/teachers/views/Grades.vue), [src/portals/teachers/api/Grades.js](src/portals/teachers/api/Grades.js) |
| Assessment / rubric workflow | Assessment-related routes for strands, rubrics, subject scores, final results | View, create, update | Implemented, unverified | [src/portals/teachers/routes.js](src/portals/teachers/routes.js), [src/portals/teachers/api/assessments.js](src/portals/teachers/api/assessments.js) |
| Assignment management | Assignment listing and assignment builder pages | View, create | Implemented, unverified | [src/portals/teachers/views/Assignments.vue](src/portals/teachers/views/Assignments.vue), [src/portals/teachers/routes.js](src/portals/teachers/routes.js) |
| Results viewing | Teacher results and subject score views | View | Implemented, unverified | [src/portals/teachers/routes.js](src/portals/teachers/routes.js) |
| Announcements | Events/announcement list and detail | View | Implemented, unverified | [src/portals/teachers/views/Announcements.vue](src/portals/teachers/views/Announcements.vue) |
| Performance page | Route exists, but content is minimal shell | View | UI placeholder / mock data | [src/portals/teachers/views/Performance.vue](src/portals/teachers/views/Performance.vue) |
| Settings | Settings page | View | Implemented, unverified | [src/portals/teachers/views/Settings.vue](src/portals/teachers/views/Settings.vue) |
| Assessments page | Placeholder view with only a heading | View | UI placeholder / mock data | [src/portals/teachers/views/Assessments.vue](src/portals/teachers/views/Assessments.vue) |

Detailed evidence from the teacher Grade/Assessment flows:
- [src/portals/teachers/api/assessments.js](src/portals/teachers/api/assessments.js) includes endpoints for strands, sub-strands, rubric scores, subject scores, term weights, and bulk save operations.
- [src/portals/teachers/views/Grades.vue](src/portals/teachers/views/Grades.vue) implements a spreadsheet-like grade-entry UI, including subject selection and bulk-save patterns.
- [src/portals/teachers/routes.js](src/portals/teachers/routes.js) includes routes like "term-scores", "rubrics", "term-results", "subject-scores", and result detail pages, showing a wide assessment management surface.

Notable limitation:
- The teacher Assessments page is not a real implementation; it is a simple placeholder view. This should not be sold as a fully built assessment module without backend confirmation.

### 6. Finance / Bursar Portal

#### Overview
The finance portal is dedicated to school fees, invoices, payments, expenditure, transport billing, and configuration. The route module is [src/portals/finance/routes.js](src/portals/finance/routes.js). This is one of the better-developed operational modules in the app.

#### Finance feature inventory

| Feature | Description | Available actions | Status | Evidence |
|---|---|---|---|---|
| Finance dashboard | Overview of term data and fee summary stats | View | Implemented, unverified | [src/portals/finance/views/Dashboard.vue](src/portals/finance/views/Dashboard.vue), [src/portals/finance/api/dashboard.js](src/portals/finance/api/dashboard.js) |
| Fee structures | School fee structure management | View, create, edit, delete | Implemented, unverified | [src/portals/finance/views/FeeStructures.vue](src/portals/finance/views/FeeStructures.vue), [src/portals/finance/api/fee.js](src/portals/finance/api/fee.js) |
| Invoices | Invoice listing and invoice generation workflows | View, create, detail | Implemented, unverified | [src/portals/finance/views/Invoices.vue](src/portals/finance/views/Invoices.vue), [src/portals/finance/components/Invoices](src/portals/finance/components/Invoices) |
| Payments | Payment listing and payment details | View, record, update | Implemented, unverified | [src/portals/finance/views/Payments.vue](src/portals/finance/views/Payments.vue), [src/portals/finance/api/fee.js](src/portals/finance/api/fee.js) |
| Expenditures | Expense tracking and summary views | View, create, detail | Implemented, unverified | [src/portals/finance/views/Expenditures.vue](src/portals/finance/views/Expenditures.vue), [src/portals/finance/api/expense.js](src/portals/finance/api/expense.js) |
| Transport billing | Transport invoice generation and billing | View, generate, record payments | Implemented, unverified | [src/portals/finance/views/TransportBilling.vue](src/portals/finance/views/TransportBilling.vue), [src/api/transport.js](src/api/transport.js) |
| Transport configuration | Route configuration and price management | View, create, edit, delete | Implemented, unverified | [src/portals/finance/views/TransportConfiguration.vue](src/portals/finance/views/TransportConfiguration.vue), [src/api/transport.js](src/api/transport.js) |
| Announcements | Finance-facing announcement page | View | Implemented, unverified | [src/portals/finance/views/Announcements.vue](src/portals/finance/views/Announcements.vue) |
| Settings | Finance user settings | View | Implemented, unverified | [src/portals/finance/views/Settings.vue](src/portals/finance/views/Settings.vue) |

Financial workflow evidence:
- [src/portals/finance/api/fee.js](src/portals/finance/api/fee.js) exposes fees, invoice generation, payment listing, and payment creation/update/delete endpoints.
- [src/api/transport.js](src/api/transport.js) adds route and transport invoice endpoints for transport billing workflows.
- [src/portals/parents/components/Finance/OnlinePayment.vue](src/portals/parents/components/Finance/OnlinePayment.vue) demonstrates select-student, invoice selection, and payment flow logic.

Payment and integration notes:
- The code includes explicit M-Pesa STK push hooks in [src/portals/parents/api/Finance.js](src/portals/parents/api/Finance.js): `initiateMpesaSTKPush` and `getMpesaTransactionStatus`.
- These are clear implementation hints for an online payment flow, but the live integration chain was not verified end-to-end in this audit.
- The finance portal itself appears to support manual payment recording as a primary operational workflow; separate online payment logic is present for parents.

### 7. Parent Portal

#### Overview
The parent portal supports a multi-student family context, student selection, finance overview, attendance, grades, assignments, announcements, and settings. The route module is [src/portals/parents/routes.js](src/portals/parents/routes.js).

#### Parent feature inventory

| Feature | Description | Available actions | Status | Evidence |
|---|---|---|---|---|
| Dashboard | Parent dashboard with student selection and key widgets | View | Implemented, unverified | [src/portals/parents/views/Dashboard.vue](src/portals/parents/views/Dashboard.vue) |
| Student selection | Parent may select a child if multiple are linked | View, switch | Implemented, unverified | [src/portals/parents/views/Dashboard.vue](src/portals/parents/views/Dashboard.vue) |
| Fee summary | Financial overview by student and term | View | Implemented, unverified | [src/portals/parents/components/Finance/FeeSummary.vue](src/portals/parents/components/Finance/FeeSummary.vue) |
| Fee structure | Displays school fee structure | View | Implemented, unverified | [src/portals/parents/components/Finance/FeeStructure.vue](src/portals/parents/components/Finance/FeeStructure.vue) |
| Fee statements | Detailed student fee statement and invoice history | View | Implemented, unverified | [src/portals/parents/components/Finance/FeeStatements.vue](src/portals/parents/components/Finance/FeeStatements.vue) |
| Online payment | Payment selection, invoice selection, and payment form logic | View, initiate payment flow | Implemented, unverified | [src/portals/parents/components/Finance/OnlinePayment.vue](src/portals/parents/components/Finance/OnlinePayment.vue) |
| Grades | Student grade view for parent | View | Implemented, unverified | [src/portals/parents/views/Grades.vue](src/portals/parents/views/Grades.vue) |
| Assessment | Parent assessment page | View | UI placeholder / mock data | [src/portals/parents/views/Assessment.vue](src/portals/parents/views/Assessment.vue) |
| Attendance | Attendance tracking for selected student | View | Implemented, unverified | [src/portals/parents/views/Attendance.vue](src/portals/parents/views/Attendance.vue) |
| Assignments | Parent assignment view | View | Implemented, unverified | [src/portals/parents/views/Assignments.vue](src/portals/parents/views/Assignments.vue) |
| Announcements | Event and announcement list | View | Implemented, unverified | [src/portals/parents/views/Announcements.vue](src/portals/parents/views/Announcements.vue) |
| Settings | Parent settings page | View | Implemented, unverified | [src/portals/parents/views/Settings.vue](src/portals/parents/views/Settings.vue) |

Parent portal clarifications:
- The parent app distinguishes between visualizing a balance and initiating a payment; the code supports both by separate components and API layers.
- The parent portal appears capable of selecting multiple children and retrieving finance data by student and active term.
- Some pages are present but clearly minimal or placeholder-driven; the parent assessment page is one example.

### 8. Student Portal

#### Overview
The student portal is meant to serve a personal student account with dashboard, announcements, notes, performance, assignments, settings, and simulation/lab activities. Route definitions are in [src/portals/students/routes.js](src/portals/students/routes.js).

#### Student feature inventory

| Feature | Description | Available actions | Status | Evidence |
|---|---|---|---|---|
| Dashboard | Student profile and dashboard summary | View | Implemented, unverified | [src/portals/students/views/Dashboard.vue](src/portals/students/views/Dashboard.vue) |
| Announcements | Event / announcement list and detail | View | Implemented, unverified | [src/portals/students/views/Announcements.vue](src/portals/students/views/Announcements.vue) |
| Notes | Student notes and note reader | View, read | Implemented, unverified | [src/portals/students/routes.js](src/portals/students/routes.js) |
| Performance | Route exists, but page is a shell | View | UI placeholder / mock data | [src/portals/students/views/Performance.vue](src/portals/students/views/Performance.vue) |
| Assignments | Student assignment list and LMS flow | View, start assignment, answer questions | Implemented, unverified | [src/portals/students/views/Assignments.vue](src/portals/students/views/Assignments.vue), [src/portals/students/routes.js](src/portals/students/routes.js) |
| LMS question flow | Assignment start / question navigation page flow | Start, answer questions | Implemented, unverified | [src/portals/students/components/lms](src/portals/students/components/lms) |
| Virtual lab / simulations | Student simulation route | View | Implemented, unverified | [src/portals/students/routes.js](src/portals/students/routes.js) |
| Settings | Student settings route | View | Implemented, unverified | [src/portals/students/routes.js](src/portals/students/routes.js) |

Notable limitations:
- Some student routes show a strong LMS pattern, but the content is not fully audit-verified in this code review.
- Student performance page is a simple placeholder from the code, so it should not be treated as a functional analytics page.

### 9. Other Portals and Administrative Interfaces

Additional roles or administrative surfaces discovered:
- "admin" role is routed to the principal portal in [src/routers/index.js](src/routers/index.js)
- Finance portal is setup as a separate operational specialization
- Parent and student portals are role-differentiated but not necessarily nested under a super-admin role
- School settings / configuration pages appear under the principal portal and not as separate role modules

### 10. Cross-Portal Workflows

#### Academic workflow
The most substantial academic workflow is supported in the principal and teacher modules:
1. Exam creation in the principal exam module and teacher grade-entry pages.
2. Teacher enters subject grades and rubric-based scores via [src/portals/teachers/views/Grades.vue](src/portals/teachers/views/Grades.vue) and [src/portals/teachers/api/assessments.js](src/portals/teachers/api/assessments.js).
3. Principal checks readiness / missing marks via [src/portals/principals/views/ReleaseResults.vue](src/portals/principals/views/ReleaseResults.vue).
4. Results can be previewed before release and then released with optional audience thresholds.
5. Parents and students access results via the parent and student portals, depending on access configuration.

Evidence of release gating and audience logic is in [src/portals/principals/views/ReleaseResults.vue](src/portals/principals/views/ReleaseResults.vue) and [src/portals/principals/api/Grades.js](src/portals/principals/api/Grades.js).

#### Attendance workflow
Observed attendance workflow:
- Principle/teacher attendance records are implemented via attendance session APIs in [src/portals/principals/api/attendance.js](src/portals/principals/api/attendance.js) and [src/portals/teachers/api/attendance.js](src/portals/teachers/api/attendance.js).
- Attendance overview pages and session detail views are present for principals and teachers.
- Parent and student portals each include attendance views, implying read-only access for family and student accounts.

#### Fees and payment workflow
Observed fee/payment workflow:
- Finance portal: generate fee structures, invoices, record payments, expense tracking, and transport billing.
- Parent portal: select student, view fee summary, view statements, choose invoice, and complete payment flow.
- M-Pesa integration is present in API code: [src/portals/parents/api/Finance.js](src/portals/parents/api/Finance.js) and [src/portals/finance/api/fee.js](src/portals/finance/api/fee.js).
- The code strongly suggests a hybrid model: manual finance recording plus optional online payment hooks.

#### Communication workflow
The app includes event/announcement support across several portals:
- Principal event list and create detail in [src/portals/principals/views/EventsPage.vue](src/portals/principals/views/EventsPage.vue)
- Parent and student announcement pages
- Teacher announcement page
This indicates a general announcement system, though actual delivery channels and notification logic could not be fully validated here.

#### Student and parent access workflow
Route and store logic show access control by role and portal path:
- [src/routers/index.js](src/routers/index.js) checks auth state and portal path beforeEach navigation
- [src/stores/authStore.js](src/stores/authStore.js) loads the authenticated user and token after login and refreshes access on boot
- Parent/student views are designed to switch between child records and show individualized finance and academic data

### 11. Reporting, Exports, and Integrations

Confirmed report/export capabilities:
- CSV export utility: [src/portals/principals/utils/resultsExport.js](src/portals/principals/utils/resultsExport.js)
- Principal reports tabs: [src/portals/principals/views/ReportsPage.vue](src/portals/principals/views/ReportsPage.vue)
- Receipt download buttons in payment tables, such as [src/portals/finance/views/Payments.vue](src/portals/finance/views/Payments.vue)
- PDF/reporting libraries are included in [package.json](package.json), but their actual use in the routes/views was not deeply traced for all pages

Confirmed integrations / API patterns:
- JWT-based auth with refresh token via cookie: [src/api/axios.js](src/api/axios.js), [src/stores/authStore.js](src/stores/authStore.js)
- M-Pesa STK push and transaction status: [src/portals/parents/api/Finance.js](src/portals/parents/api/Finance.js)
- Transport billing APIs: [src/api/transport.js](src/api/transport.js)
- Assessment and results APIs: [src/portals/teachers/api/assessments.js](src/portals/teachers/api/assessments.js), [src/portals/principals/api/Grades.js](src/portals/principals/api/Grades.js)

### 12. Permissions and Data Access

Observed access patterns:
- Router guard enforces authentication and role-based redirect in [src/routers/index.js](src/routers/index.js).
- The login flow sets access token and logged-in user via [src/stores/authStore.js](src/stores/authStore.js).
- Portal access is enforced by comparing the current user role to the expected route prefix.
- The access model is consistent with a school ERP that divides a user into one primary portal, but code also hints at role-specific data retrieval in per-role API modules.

Observed gaps / audit concerns:
- The app uses route paths as the primary access control, but the surrounding code does not expose a full centralized RBAC configuration file.
- The audit did not discover explicit higher-level admin-only permission groups beyond the principal portal and admin alias.
- Some pages are functioning shells rather than complete features, so the actual permission model may not yet be fully enforceable for all modules.

### 13. Consolidated Feature Matrix

| Module / Feature | Principal | Teacher | Finance | Parent | Student | Status |
|---|---|---|---|---|---|---|
| Student management | Yes | Yes (limited) | No | No | No | Implemented, unverified |
| Teacher management | Yes | No | No | No | No | Implemented, unverified |
| Attendance | Yes | Yes | No | Yes | Yes | Implemented, unverified |
| Exams / assessments | Yes | Yes | No | No | No | Implemented, unverified |
| Results release | Yes | Yes (view-related) | No | No | No | Implemented, unverified |
| Analytics dashboards | Yes | Some | Yes | No | No | Implemented, unverified |
| Fee structures | Yes (summary) | No | Yes | Yes | No | Implemented, unverified |
| Invoices / billing | Yes | No | Yes | Yes | No | Implemented, unverified |
| Payments / receipts | Yes (reporting) | No | Yes | Yes | No | Implemented, unverified |
| M-Pesa / online payments | Unverified | No | Unverified | Yes (API hooks) | No | Implemented, functionality unverified |
| Transport billing | No | No | Yes | Unverified | No | Implemented, unverified |
| Announcements / events | Yes | Yes | Yes | Yes | Yes | Implemented, unverified |
| Assignments / LMS | No | Yes | No | Yes | Yes | Implemented, unverified |
| Parent/student data access | Yes | Some | No | Yes | Yes | Implemented, unverified |
| Financial reports / exports | Yes | No | Yes | No | No | Implemented, unverified |
| Student performance page | No | Partial | No | No | Placeholder | UI placeholder / mock data |
| Teacher assessments page | No | Placeholder | No | No | No | UI placeholder / mock data |
| Parent assessment page | No | No | No | Placeholder | No | UI placeholder / mock data |

### 14. Known Limitations and Unverified Features

Confirmed incomplete or placeholder implementations:
- [src/portals/teachers/views/Assessments.vue](src/portals/teachers/views/Assessments.vue) contains only a minimal "Assessment Page" template.
- [src/portals/parents/views/Assessment.vue](src/portals/parents/views/Assessment.vue) contains only a placeholder heading.
- [src/portals/students/views/Performance.vue](src/portals/students/views/Performance.vue) contains a simple Hello-world style placard rather than a real analytics UI.

Broken or inaccessible evidence:
- The production build succeeded, but warnings surfaced showing that two event details import a missing `deleteEvent` export from student and teacher API modules. This indicates a real unresolved code reference, even though the app still builds.
- Evidence: Vite build output from `npm run build` reported missing exports for `deleteEvent` in student/teacher event detail components.

Behaviors that could not be fully verified:
- Exact end-to-end result release and parent notification flow
- Real M-Pesa / Daraja live transaction processing
- Full invoice/payment reconciliation integrity
- Real authentication and user access behavior against a live backend
- Actual completion status of LMS assignments and assessment scoring flows

Dependencies on backend services or configuration:
- All portal data flows appear to rely on the backend API endpoints defined by the frontend service modules.
- Role permissions are likely backend-enforced, but this frontend audit did not inspect the backend.
- The app is configured to use a production API URL in [src/api/axios.js](src/api/axios.js), with commented-out local and preview URLs remaining in the file.

### 15. Potential Enhancements

These are not current product capabilities; they are suggested future improvements based on implementation gaps observed during the audit.

- Complete and unify the teacher, parent, and student assessment views so they match the more complete principal workflows.
- Replace placeholder performance pages with real analytics dashboards tied to actual result data.
- Add stronger validation and error handling around payment workflows, especially for M-Pesa and other online payment flows.
- Harden RBAC and audit logging across operational modules, especially for results release, fee reconciliation, and finance approvals.
- Add export standardization for receipts, student reports, and finance statements.
- Improve testing coverage for role-guarding and route protection across the multi-portal setup.

### 16. Quotation Preparation Appendix

#### Existing modules that could be included in a quotation
- Student information management
- Teacher and staff management
- Attendance tracking
- Exam and result management
- Parent/student communication and announcements
- Finance and billing management
- Transport billing and route pricing
- Student and parent portals
- Teacher portal
- Principal dashboard and reporting module

#### Major capabilities within each module
- Student management: student registration, profile record, class and stream association
- Teacher management: teacher roster, detail views, teacher-specific student access
- Attendance: class-level and student-level attendance views
- Exams and results: exam dashboards, missing marks, release workflow, audience-based release control
- Finance: fee structures, invoices, payments, expenditure, receipts, transport billing
- Parent/school communications: announcements and event details
- Reporting: CSV export support plus principal report tabs

#### Optional or separately configurable capabilities
- Transport billing and route pricing configuration
- Online payment integration (M-Pesa hooks present, but not fully validated in this audit)
- Parent-facing payment initiation and finance statements
- LMS/assignment flows and virtual labs

#### Third-party integrations and dependencies
- Axios API layer
- Vue Query for data fetching
- Charting libraries: Chart.js, ApexCharts
- PDF/report generation libraries: jsPDF / html2pdf
- Excel/CSV export: xlsx and FileSaver
- M-Pesa API hooks observed in client-side code

#### Features requiring verification before being promised
- Real production readiness of all result-release workflows
- Online payment and M-Pesa transaction success flow
- Parent/student data visibility and access restrictions
- LMS completion and assessment scoring reliability
- Full finance reconciliation and reporting accuracy

#### Questions that must be answered before pricing
- How many concurrent users and roles are expected to use the system?
- Is a live backend already available, or is a full stack implementation required?
- Are transport billing, online payments, and M-Pesa required out of the box?
- Are the school’s academic structures (terms, classes, streams) fixed or configurable?
- Is the school expecting school-wide reporting, or only selected principal/teacher reports?

#### Items whose pricing may depend on student population, staff count, usage, support, onboarding, hosting, or integrations
- Student account volume
- Teacher and staff user count
- Transaction volume for finance and payments
- Support SLA and onboarding hours
- Hosting mode (managed / self-hosted)
- M-Pesa / bank integration complexity
- Reporting and custom export requirements

### 17. Audit Complete

This inventory was assembled from the actual frontend source of the QRSMS project. It documents features that are clearly implemented in the code, identifies placeholder or incomplete modules, and distinguishes those from unverified or backend-dependent workflows.

The strongest evidence of product maturity is in:
- principal management and reporting,
- teacher grade entry and assessment logic,
- finance invoicing and payment workflows,
- parent finance and attendance views,
- student assignment/LMS flows.

The main caution points are:
- a few placeholder pages,
- unresolved import/export issues in event detail modules discovered by the build,
- and a significant number of advanced workflows that require live backend validation before they can be confidently included in a commercial proposal without qualification.
