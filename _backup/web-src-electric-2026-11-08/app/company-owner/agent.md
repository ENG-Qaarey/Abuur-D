# OWNERAGENT.md

# Company Owner Authorization & Management Specification

## Overview

The Company Owner is the highest-level administrator inside a single electricity company within the Somali Electric Management System.

The Company Owner can fully manage:

* Customers
* Meters
* Billing
* Payments
* Staff
* Reports
* Support tickets
* Company settings
* Notifications
* Analytics
* Electricity operations

The Company Owner CANNOT:

* Access other companies
* Modify Super Admin settings
* Delete platform-level configurations
* Manage global system infrastructure

---

# Company Owner Dashboard

## Dashboard Features

The dashboard must show:

### Statistics Cards

* Total Customers
* Active Customers
* Total Meters
* Online Meters
* Offline Meters
* Monthly Revenue
* Pending Bills
* Total Electricity Usage
* Active Staff
* Open Support Tickets

### Analytics

* Daily Revenue Chart
* Monthly Revenue Chart
* Power Consumption Analytics
* Customer Growth Graph
* Payment Success Rate
* Electricity Usage Trends

### Quick Actions

* Add Customer
* Assign Meter
* Generate Bill
* Send Notification
* Add Staff
* Create Announcement
* View Reports

### Activity Feed

* New Customer Registrations
* Recent Payments
* Meter Activations
* Support Tickets
* Staff Activities
* System Alerts

---

# Customers Management

## Authorized Actions

The Company Owner can:

* Create customer accounts
* Edit customer details
* Suspend customers
* Activate customers
* Delete customers
* Search customers
* Export customer data
* View customer history
* View customer usage analytics
* Reset customer passwords
* Assign customer meters

## Customer Fields

### Personal Information

* Customer ID
* Full Name
* Phone Number
* Email Address
* National ID
* Gender
* Date of Birth
* Customer Type

### Address Information

* Region
* District
* Area
* Street
* House Number
* GPS Location

### Meter Information

* Meter Number
* Meter Type
* Meter Status
* Installation Date
* Tariff Plan

### Billing Information

* Current Balance
* Outstanding Balance
* Payment Method
* Billing Cycle

### Documents

* National ID Upload
* Customer Photo
* House Proof
* Agreement Files

---

# Meter Management

## Authorized Actions

The Company Owner can:

* Add new meters
* Edit meter details
* Activate meters
* Suspend meters
* Remove meters
* Assign meters to customers
* Monitor meter status
* View live electricity usage
* Monitor online/offline status
* Configure tariffs

## Meter Information

* Meter Number
* Meter Type
* Meter Capacity
* Meter Status
* Customer Assignment
* Power Limit
* Installation Date
* Consumption History

## Meter Status Types

* Active
* Offline
* Suspended
* Faulty
* Maintenance

---

# Billing & Invoicing

## Authorized Actions

The Company Owner can:

* Generate invoices
* Create bills
* Edit bills
* Cancel bills
* View payment history
* Monitor unpaid invoices
* Export billing reports
* Configure tariff plans
* Configure tax settings
* Send payment reminders

## Billing Features

* Automatic bill generation
* Monthly billing
* Weekly billing
* Usage-based billing
* Fixed-rate billing
* Discount support
* Tax calculation
* Penalty calculation

## Invoice Information

* Invoice Number
* Customer Name
* Meter Number
* Usage Units
* Tariff Rate
* Total Amount
* Due Date
* Payment Status

---

# Payments Management

## Authorized Actions

The Company Owner can:

* View payments
* Confirm payments
* Refund payments
* Export transactions
* Monitor failed payments
* Generate financial reports
* Configure payment methods

## Supported Payment Methods

* EVC Plus
* ZAAD
* Sahal
* Bank Transfer
* Cash
* Credit Card

## Payment Status

* Paid
* Pending
* Failed
* Refunded
* Cancelled

---

# Staff Management

## Authorized Actions

The Company Owner can:

* Add staff accounts
* Edit staff details
* Suspend staff
* Delete staff
* Assign permissions
* Monitor staff activities
* Reset passwords
* View activity logs

## Staff Roles

* Manager
* Technician
* Cashier
* Support Agent
* Billing Officer
* Meter Operator
* Accountant

## Staff Permissions

* Customer Management
* Meter Access
* Billing Access
* Payment Access
* Report Access
* Ticket Access
* Settings Access

---

# Roles & Permissions

## Company Owner Permissions

The Company Owner has full company-level access.

## Permission Categories

* Create
* Read
* Update
* Delete
* Export
* Approve
* Suspend
* Configure

## Module Permissions

* Customers
* Meters
* Billing
* Payments
* Reports
* Staff
* Support
* Notifications
* Settings

---

# Reports & Analytics

## Authorized Actions

The Company Owner can:

* View reports
* Export reports
* Print reports
* Filter reports
* Analyze usage
* Analyze revenue
* Monitor growth

## Report Types

* Revenue Reports
* Customer Reports
* Electricity Usage Reports
* Staff Reports
* Payment Reports
* Meter Reports
* Support Reports

## Export Formats

* PDF
* Excel
* CSV
* Print

---

# Support & Tickets

## Authorized Actions

The Company Owner can:

* View tickets
* Respond to tickets
* Assign technicians
* Close tickets
* Reopen tickets
* Prioritize issues
* Monitor support analytics

## Ticket Categories

* Power Outage
* Meter Fault
* Billing Issue
* Payment Issue
* New Connection
* Technical Support

## Ticket Priorities

* Low
* Medium
* High
* Critical

---

# Notifications & Announcements

## Authorized Actions

The Company Owner can:

* Send notifications
* Create announcements
* Schedule announcements
* Send SMS alerts
* Send maintenance alerts
* Notify customers about outages

## Notification Types

* Payment Reminder
* Maintenance Notice
* Service Alert
* Outage Alert
* Promotional Message

---

# System Monitoring

## Authorized Actions

The Company Owner can:

* Monitor active meters
* View live system activity
* Track outages
* Monitor electricity load
* View performance analytics

## Monitoring Widgets

* Live Meter Status
* Electricity Usage Map
* Revenue Monitoring
* Active Users
* System Alerts

---

# Company Settings

## Authorized Actions

The Company Owner can:

* Edit company profile
* Upload company logo
* Configure tariffs
* Configure billing cycles
* Configure payment settings
* Manage branding
* Configure SMS settings
* Configure email settings

## Company Profile Fields

* Company Name
* Company Logo
* Phone Number
* Email Address
* Address
* Website
* Tax Number
* Support Contact

---

# Security Features

## Security Controls

* Two-Factor Authentication
* Password Reset
* Session Management
* Login Activity Logs
* Device Monitoring
* Role-Based Access Control
* Secure API Authentication

---

# UI/UX Design Requirements

## Design Style

* Modern SaaS Dashboard
* Dark Mode UI
* Glassmorphism Design
* Neon Electric Blue Accents
* Premium Dashboard Aesthetics
* Responsive Layout
* Smooth Animations
* Slow Hover Effects
* Professional Utility Company Branding

## Animation Requirements

* Smooth page transitions
* Slow hover animations
* Floating card effects
* Animated charts
* Micro-interactions
* Soft glow effects

## Responsive Requirements

* Desktop Support
* Tablet Support
* Mobile Responsive
* Adaptive Sidebar
* Responsive Tables
* Touch-Friendly Components

---

# Sidebar Navigation

## Main Navigation

* Dashboard
* Customers
* Meters
* Billing
* Payments
* Staff
* Reports
* Analytics
* Support Tickets
* Notifications
* Settings
* Profile
* Logout

---

# Recommended Technology Stack

## Frontend

* React.js
* Next.js
* Tailwind CSS
* Framer Motion
* Recharts

## Backend

* Node.js
* Express.js
* PHP Laravel
* REST API

## Database

* MySQL
* PostgreSQL

## Authentication

* JWT Authentication
* OAuth
* Role-Based Access

---

# Final Notes

The Company Owner panel must feel:

* Fast
* Premium
* Modern
* Secure
* Easy to use
* Highly responsive
* Professional
* Enterprise-level

The UI should look similar to:

* Stripe Dashboard
* Linear App
* Vercel Dashboard
* Modern Fintech SaaS Platforms
