# QRSMS - Features & Capabilities Documentation

**Application Name:** QRSMS (QR-based School Management System)  
**Technology:** Vue 3 + Vite + TailwindCSS + Django REST API  
**Purpose:** Comprehensive, multi-role school administration platform  
**Target Users:** School principals, finance staff, teachers, parents, and students

---

## Table of Contents
1. [Application Overview](#application-overview)
2. [Portal Structure & Roles](#portal-structure--roles)
3. [Principal Portal Features](#principal-portal-features)
4. [Finance Portal Features](#finance-portal-features)
5. [Teachers Portal Features](#teachers-portal-features)
6. [Parents Portal Features](#parents-portal-features)
7. [Students Portal Features](#students-portal-features)
8. [Core Functionality](#core-functionality)
9. [Data Management](#data-management)
10. [Technical Capabilities](#technical-capabilities)
11. [Integration Points](#integration-points)
12. [Security & Authentication](#security--authentication)

---

## Application Overview

QRSMS is an institutional-grade school management system designed to streamline operations across academic, financial, and administrative domains. The platform enables:

- **Multi-role access control** with 5 distinct user portals
- **Real-time data management** for students, teachers, grades, and finances
- **Comprehensive reporting** for stakeholders
- **Automated invoicing and payment tracking**
- **Digital academic record management**
- **Parent engagement and communication tools**
- **School-wide event and announcement management**

**Ideal for:** Medium to large schools managing 200+ students across multiple grades and streams

---

## Portal Structure & Roles

The application implements role-based access control with five distinct portals:

| Portal | Role | Primary Focus | Key Users |
|--------|------|---------------|-----------|
| **Principal** | Administrator | School governance, oversight, management | School administration |
| **Finance** | Finance Officer | Revenue and expense management | Finance department |
| **Teachers** | Educator | Classroom and academic management | Teaching staff |
| **Parents** | Guardian | Student progress monitoring | Parents/guardians |
| **Students** | Learner | Academic records access | Students |

---

## Principal Portal Features

### Administrative Dashboard
- School statistics and overview
- Key performance indicators
- Quick access to all administrative functions

### Student Management
- **Create & Register** new students
- **View student profiles** with complete information
- **Manage student records** (CRUD operations)
- **Track student history** and academic progress
- **Student list** with search and filter capabilities

### Teacher & Staff Management
- **Create & register** teachers and teaching staff
- **Manage teacher profiles** and qualifications
- **Non-teaching staff management** (support staff, administrative)
- **Staff directory** and contact information

### Academic Management
- **Classes Configuration** — Set up grade levels and class streams
- **Grade Promotions** — Manage student advancement to next grade
- **School Calendar** — Create and manage academic calendar
- **Subject Management** — Configure available subjects (18+ subjects)
- **Streams Management** — Organize students by class sections

### Attendance & Monitoring
- **Attendance tracking** across the institution
- **View attendance sessions** and records
- **Attendance analytics** and reports
- **Identify trends** in student attendance

### Financial Oversight
- **Fee overview** and structure management
- **Invoice management** and generation
- **Transaction tracking** and detailed reporting
- **Expenditure monitoring** and analysis
- **Financial dashboards** with monthly/class analytics
- **Payment method tracking** (Bank, M-Pesa, Cash, Cheque)

### Reporting & Analytics
- **Student reports** — Performance, attendance, enrollment
- **Financial reports** — Revenue, expenses, collections
- **Transaction history** — Complete financial audit trail
- **Custom reports** — Generate institution-specific reports

### Events & Communications
- **Create & manage** school events
- **Event scheduling** and notifications
- **Announcement system** for institution-wide communications
- **Calendar integration** with academic events

### Parent & Stakeholder Management
- **View parent profiles** and contact information
- **Parent communications** log
- **Parent engagement tracking**

### Settings & Configuration
- **System configuration** and preferences
- **Workflow settings** and business rules
- **Access control** and user permissions
- **Institutional branding** options

---

## Finance Portal Features

### Financial Dashboard
- Financial overview and key metrics
- Fee collection analytics by class
- Revenue trends and patterns
- Expense summaries
- Outstanding invoice tracking

### Fee Structure Management
- **Create fee structures** for different student categories
- **Manage fees by class** and stream
- **Print fee structures** for parent communication
- **Edit and update** fees when needed
- **View fee details** by student

### Invoice Management
- **Create invoices** (individual and bulk generation)
- **View invoice details** with payment history
- **Print invoices** for distribution
- **Track invoice status** (paid, pending, overdue)
- **Send reminders** for outstanding invoices
- **Invoice archival** and historical records

### Payment Processing & Tracking
- **Track all payments** received
- **Support multiple payment methods:**
  - Bank transfers
  - M-Pesa (mobile money)
  - Cash payments
  - Cheque deposits
- **Payment reconciliation** and verification
- **Receipt generation** for payments
- **Payment analytics** by method and period

### Expenditure Management
- **Record school expenses** and expenditures
- **Categorize expenses** for tracking
- **Budget monitoring** against expenditures
- **Expense reports** and analysis
- **Approval workflows** for expenses

### Financial Reporting
- **Monthly financial summaries**
- **Class-based financial analysis**
- **Cash flow reports**
- **Outstanding fees tracking**
- **Expense vs. revenue analysis**

### Events & Announcements
- **View event-related** financial information
- **Track costs** associated with events
- **Event budget management**
- **Financial announcements** and alerts

### Settings & Configuration
- **Finance workflow configuration**
- **Payment method settings**
- **Reporting preferences**
- **User access and permissions**

---

## Teachers Portal Features

### Classroom Dashboard
- Class overview and statistics
- Student list for assigned class
- Quick access to grading and attendance

### Student Management
- **View assigned students** in class
- **Access student profiles** and contact information
- **View student performance** summary
- **Track individual student** progress

### Attendance Management
- **Mark attendance** for class sessions
- **Create attendance sessions** for specific dates
- **Edit attendance records** if needed
- **View attendance trends** by student
- **Generate attendance reports**
- **Attendance analytics** and patterns

### Grade & Assessment Management
- **Create exams** and assessment events
- **Enter grades** for students
- **Bulk grade uploads** from spreadsheets
- **Edit and manage** grades
- **Grade history** and tracking
- **Grade statistics** (average, median, distribution)

### Performance Tracking
- **Monitor student performance** over time
- **Identify struggling students**
- **View performance trends**
- **Performance-based analytics**

### Assessment & Rubrics
- **Create assessments** with rubrics
- **Manage rubric scoring** (strand scores)
- **Record student assessments**
- **View assessment results**
- **Track competency levels**

### Term Results
- **View term-end results**
- **Generate term scorecards**
- **Aggregate scores** for term
- **Print term reports**
- **Historical term data** access

### Assignment Management (LMS)
- **Create assignments** for students
- **Distribute assignments** to class
- **Set deadlines** for submissions
- **Track submission status**
- **View student submissions**
- **Grade submissions** and provide feedback
- **Assignment analytics**

### Communications
- **Post announcements** to students
- **Communicate with parents** (messaging)
- **Send notifications** about assignments
- **Broadcast important information**

### Settings & Profile Management
- **Manage teacher profile** information
- **Update contact details**
- **Set communication preferences**
- **Password and security settings**

---

## Parents Portal Features

### Parent Dashboard
- **Quick overview** of all assigned children
- **Key alerts** for each child
- **Academic summary** by child
- **Financial summary** (fees owed, payments)

### Student Profile Management
- **View assigned children** profiles
- **Access child's personal information**
- **View enrollment details**
- **Track child's information** over time

### Academic Monitoring
- **View child's grades** and academic performance
- **Track grade trends** over time
- **View subject-wise performance**
- **Compare performance** across terms
- **Identify areas of improvement**

### Assessment Tracking
- **View assessment results**
- **Track competency levels** by subject
- **View strand scores** and rubric feedback
- **Assessment history** across terms

### Attendance Monitoring
- **View child's attendance records**
- **Track attendance trends**
- **Receive attendance alerts** for absences
- **Historical attendance data**

### Assignment Visibility
- **View assigned work** from teachers
- **See assignment details** and deadlines
- **Track submission status** (submitted, pending)
- **View feedback** and grades

### Financial Management
- **Fee Summary** — Total fees and payment status
- **Fee Structure** — View what fees are charged
- **Fee Statements** — Detailed bill history
- **Invoice Details** — View specific invoices
- **Payment Records** — Track all payments made
- **Online Payment** — Pay fees directly (integration ready)
- **Outstanding Balance** — Know amount owed

### School Events & Announcements
- **View school events** and schedules
- **Receive school announcements**
- **Event notifications**
- **Important dates** and reminders

### Settings & Profile
- **Update parent profile** information
- **Manage contact details**
- **Set communication preferences**
- **Password and security settings**

---

## Students Portal Features

### Personal Dashboard
- **Academic overview** for student
- **Quick access** to key features
- **Important alerts** and deadlines

### Assignment Access
- **View assigned work** from teachers
- **See assignment details, descriptions, and deadlines**
- **Submit assignments** digitally
- **Track submission status**
- **View grades and feedback** on submissions
- **Assignment history** and records

### Practice & Simulations
- **Practice tests** and simulations
- **Exam preparation** materials
- **Self-assessment** tools
- **Performance tracking** on practice tests

### Events & Announcements
- **View school events** and calendar
- **Receive school announcements**
- **Important date notifications**
- **Event details** and participation info

### Academic Records
- **View current grades** and performance
- **Access transcript** information
- **View attendance records**
- **Historical academic data**

---

## Core Functionality

### Academic Operations
- **Exam Management** — Create, schedule, and manage exams
- **Grade Entry & Management** — Individual and bulk grade uploads
- **Attendance System** — Session-based attendance tracking
- **Assessment Framework** — Rubric-based competency assessment
- **Student Promotion** — Automated or manual grade advancement
- **Assignment Management** — Complete LMS (Learning Management System)
- **Subject Management** — Support for 18+ subjects

### Financial Operations
- **Fee Structure Definition** — Flexible fee configuration by class/student
- **Automated Invoicing** — Single and bulk invoice generation
- **Payment Processing** — Multi-method payment support
- **Expense Tracking** — Complete expenditure recording
- **Financial Analytics** — Revenue, expense, and cash flow analysis
- **Outstanding Balance Tracking** — Automatic fee collection monitoring

### Administrative Operations
- **CRUD Operations** — Complete database management for all entities
- **User Management** — Create, update, deactivate users
- **Calendar Management** — Academic calendar creation and management
- **Event Planning** — School-wide event scheduling
- **Announcements** — Institution-wide communication system
- **Reporting Framework** — Customizable report generation

### Data Analytics & Reporting
- **Dashboard Analytics** — Real-time KPI tracking
- **Financial Reports** — Monthly and class-based analysis
- **Academic Reports** — Student performance and progress
- **Attendance Analytics** — Patterns and trends
- **Custom Reporting** — Build-your-own reports

---

## Data Management

### Academic Entities
- **User Accounts** — Students, Teachers, Parents, Admin, Finance staff
- **Student Records** — Profile, enrollment, academic history
- **Teacher Records** — Profile, subject assignment, qualifications
- **Exams** — Assessment events and test schedules
- **Grades** — Individual student subject scores
- **ClassInstance** — Student groupings and class assignments
- **Streams** — Class sections (e.g., North, South, East, West)
- **Subjects** — Course/subject offerings (18+ subjects including English, Kiswahili, Math, Science, Social Studies, CRE/IRE/HRE, Computer Studies, Business, Arts, Home Science, Health, PE, Agriculture, Foreign Language, Sign Language)
- **Assessments** — Rubric-based evaluations
- **StrandScore** — Competency-level scoring
- **Attendance** — Student attendance records
- **AttendanceSession** — Specific attendance events
- **Assignments** — LMS assignment records and submissions

### Financial Entities
- **FeeStructure** — Fee configuration and pricing
- **Invoice** — Student billing documents
- **Payment** — Payment records and receipts
- **Expense** — School expenditure tracking

### Administrative Entities
- **Event** — School events and activities
- **Announcement** — System-wide notifications
- **Configuration** — System settings and preferences
- **Promotion** — Grade advancement records
- **Calendar** — Academic and event calendar

### Supported Academic Levels
- **Grades:** 7, 8, 9 (Primary school)
- **Streams:** Multiple sections per grade (North, South, East, West, etc.)
- **Subjects:** 18+ subjects available

---

## Technical Capabilities

### Frontend Architecture
- **Framework:** Vue 3 with Composition API
- **Build Tool:** Vite (fast development and production builds)
- **Styling:** TailwindCSS for responsive design
- **State Management:** Pinia store system
- **Routing:** Vue Router with role-based protection

### Backend Integration
- **API Framework:** Django REST API
- **Backend URL:** https://sms-zpq6.onrender.com/api/v1/
- **Database:** PostgreSQL (production)
- **Authentication:** JWT (JSON Web Tokens)
- **Deployment:** Vercel (frontend), Render (backend)

### UI Components & Libraries
- **Icons:** Heroicons (Vue-optimized)
- **Notifications:** Vue Toastification
- **Charts & Analytics:** ApexCharts, Chart.js
- **Data Export:** PDF (jsPDF, jsPDF-autotable), Excel (xlsx)
- **HTTP Client:** Axios with interceptors
- **Performance:** Vue Query (@tanstack/vue-query) for API caching

### Browser & Platform Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for desktop and tablet
- Progressive Web App ready

---

## Integration Points

### External System Integrations
1. **Payment Systems**
   - Bank Transfer integration
   - M-Pesa (mobile money) — Kenya-specific
   - Cash payment tracking
   - Cheque deposit management

2. **Communication**
   - Email notifications (parent and teacher alerts)
   - In-app messaging system
   - Announcement distribution

3. **Document Generation**
   - PDF report generation
   - Invoice printing
   - Transcript generation
   - Excel export for data analysis

4. **Analytics**
   - Dashboard charts and graphs
   - Financial analytics
   - Performance metrics
   - Attendance trends

### API Capabilities
- RESTful API endpoints for all entities
- Pagination support for large datasets
- Search and filter capabilities
- Bulk operations support
- Audit logging for transactions

---

## Security & Authentication

### Authentication System
- **Method:** JWT (JSON Web Tokens)
- **Token Type:** Bearer tokens in HTTP headers
- **Storage:** Secure localStorage with auto-refresh
- **Session Management:** Automatic token refresh on expiry
- **Logout:** Secure token invalidation

### Authorization & Access Control
- **Role-Based Access Control (RBAC)** — 5 distinct roles
- **Route Protection** — Authentication required for protected routes
- **Portal Isolation** — Users only access their assigned portal
- **Data-Level Security** — Users see only their authorized data
- **Permission Management** — Granular access control

### Data Security Features
- **Encrypted passwords** (backend implementation)
- **HTTPS/TLS** for data transmission
- **CSRF protection** (Vercel/Django standards)
- **Audit logging** for financial transactions
- **Multi-user session** handling
- **Automatic logout** on inactivity

---

## Key Advantages & Benefits

### For School Administration
✅ Centralized management of all school operations  
✅ Real-time visibility into student and financial data  
✅ Reduced manual paperwork and administrative burden  
✅ Automated invoicing and payment tracking  
✅ Comprehensive reporting and analytics  

### For Teachers
✅ Streamlined grade entry and student tracking  
✅ Digital attendance marking with minimal effort  
✅ Assignment distribution and collection  
✅ Performance analytics by student and class  
✅ Direct communication with parents and students  

### For Parents
✅ Real-time access to child's academic progress  
✅ Transparent fee and payment tracking  
✅ Direct communication with teachers  
✅ Attendance monitoring  
✅ Event and announcement notifications  

### For Finance Department
✅ Automated invoice generation and tracking  
✅ Multi-method payment processing  
✅ Detailed financial analytics  
✅ Expense management and reporting  
✅ Outstanding balance tracking and reminders  

### For Students
✅ Digital access to grades and academic records  
✅ Assignment submission and feedback  
✅ Practice and simulation tools  
✅ School announcements and event calendar  
✅ Academic progress tracking  

---

## System Highlights

🎯 **Multi-Tenant Ready** — Can support multiple schools  
🎯 **Scalable Architecture** — Handle growing user base  
🎯 **Real-Time Updates** — Instant data synchronization  
🎯 **Mobile Responsive** — Works on all devices  
🎯 **Export Capabilities** — PDF and Excel export  
🎯 **Comprehensive Reporting** — Custom and standard reports  
🎯 **Secure Authentication** — JWT-based security  
🎯 **Audit Trails** — Financial transaction logging  
🎯 **User-Friendly Interface** — Intuitive navigation  
🎯 **Extensible Design** — Ready for future enhancements  

---

## Conclusion

QRSMS is a **production-ready, institutional-grade school management platform** that addresses the complete lifecycle of school operations — from academic management to financial administration. With its multi-role architecture, comprehensive feature set, and secure authentication system, it's designed to scale with schools of varying sizes while maintaining ease of use and data integrity.

**Ideal For:**
- Medium to large schools (200+ students)
- Schools seeking modern, integrated management solution
- Institutions wanting to improve parent engagement
- Schools implementing digital transformation
- Educational institutions in Kenya and East Africa (M-Pesa integration)

**Latest Update:** August 2026
