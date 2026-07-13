# PlaceMux Backend

> **A production-grade, skill-gated Job Marketplace Backend** built using **Node.js**, **Express.js**, and **PostgreSQL (Supabase)**. The project is developed incrementally across **25 standalone backend tasks**, where each task introduces a new capability while contributing to the complete recruitment ecosystem.

The project begins with core marketplace functionality and progressively evolves into an enterprise-ready platform featuring secure payment processing, revenue reconciliation, offer generation, digital signatures, interview management, college portals, compliance (DPDP), AI telemetry, operational resilience, and production deployment workflows.


# Project Overview

The backend is divided into **25 independent tasks**, each focusing on a specific business capability.

## Phase 1 — Marketplace Foundation (Tasks 1–5)

Builds the core recruitment platform.

| Task       | Description                                                |
| ---------- | ---------------------------------------------------------- |
| **Task 1** | Marketplace data models (Students, Companies, Skills, KYC) |
| **Task 2** | Job posting, eligibility criteria & assessment generation  |
| **Task 3** | Job search, discovery feed & ranking engine                |
| **Task 4** | Student applications, idempotency & shortlist workflow     |
| **Task 5** | Full marketplace integration of Tasks 1–4                  |


## Phase 2 — Payment Infrastructure (Tasks 6–8)

Introduces secure financial workflows.

| Task       | Description                                |
| ---------- | ------------------------------------------ |
| **Task 6** | Razorpay payment gateway integration       |
| **Task 7** | Pay-per-Application workflow               |
| **Task 8** | Receipts, refunds & payment reconciliation |


## Phase 3 — Enterprise Platform (Tasks 9–25)

Builds enterprise-grade platform capabilities.

| Task        | Description                                         |
| ----------- | --------------------------------------------------- |
| **Task 9**  | Failure handling, webhook retries & recovery engine |
| **Task 10** | Revenue dashboard & monetization analytics          |
| **Task 11** | Offer generation & cryptographic e-sign mapping     |
| **Task 12** | Digital signature & tamper-evident verification     |
| **Task 13** | Public offer verification & interview scheduling    |
| **Task 14** | End-to-end application status tracking              |
| **Task 15** | Trust layer integration & dry-run validation        |
| **Task 16** | College portal & reporting APIs                     |
| **Task 17** | College administration enhancements                 |
| **Task 18** | Assessment bank & proctoring adjudication           |
| **Task 19** | Bulk student onboarding                             |
| **Task 20** | Cross-portal ecosystem validation                   |
| **Task 21** | DPDP consent management & Right to be Forgotten     |
| **Task 22** | Data-subject rights & resilience engine             |
| **Task 23** | API hardening, rate limiting & MLOps telemetry      |
| **Task 24** | Launch rehearsal, bug-bash & data retention         |
| **Task 25** | Production go-live & deployment checklist           |


# Project Structure

```text
PlaceMux Backend/
│
├── task1-marketplace-data-model/
├── task2-job-posting/
├── task3-search-discovery/
├── task4-applications-shortlisting/
├── task5-marketplace-integration/
│
├── task6-payment-gateway/
├── task7-pay-per-application/
├── task8-receipts-refunds-reconciliation/
│
├── task9-failure-handling/
├── task10-monetization-revenue/
├── task11-offer-esign/
├── task12-esign-tamper/
├── task13-verification-interviews/
├── task14-status-tracking/
├── task15-trust-layer/
├── task16-college-portal/
├── task17-college-admin/
├── task18-admin-console/
├── task19-bulk-onboarding/
├── task20-portals-integration/
├── task21-dpdp-consent/
├── task22-data-rights-resilience/
├── task23-api-hardening/
├── task24-launch-rehearsal/
├── task25-production-cutover/
│
└── README.md
```

# Platform Features

##  Marketplace

* Student Profiles
* Company Profiles
* Skills Management
* KYC Verification
* Job Posting
* Job Discovery & Search
* Eligibility Filtering
* Assessment Integration
* Application Management
* Shortlisting Workflow


## Payments

* Razorpay Integration
* Pay-per-Application
* Payment Verification
* Receipt Generation
* Refund Management
* Revenue Reconciliation
* Webhook Processing
* Failure Recovery
* Dead Letter Queue (DLQ)


## Hiring Workflow

* Offer Generation
* Digital Signatures
* Cryptographic Verification
* Public Offer Verification
* Interview Scheduling
* Status Tracking
* Trust Layer Validation


## College Ecosystem

* College Portal
* Institution Reporting
* Bulk Student Import
* Assessment Question Bank
* Proctoring Review
* Cross-Portal Validation


##  Security & Compliance

* DPDP Consent Management
* Right to be Forgotten
* Multi-Tenant Authorization
* API Rate Limiting
* MLOps Telemetry
* Audit Logging
* Data Retention Policies
* Production Readiness Checks


# Tech Stack

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL
* Supabase

### Payments

* Razorpay

### Validation

* Zod

### Authentication

* JWT

### Logging

* Winston

### Testing

* Jest
* Supertest

### API Testing

* Postman
* cURL


# Getting Started

Each task is completely self-contained.

## Clone the Repository

```bash
git clone <repository-url>
cd placemux-backend
```

## Install Dependencies

Navigate to any task directory.

```bash
cd taskX-task-name
npm install
```


## Configure Environment Variables

Each task contains its own `.env.example`.

Create a `.env` file:

```bash
cp .env.example .env
```

Update the required values.


## Run Database Migrations

```bash
npm run migrate
```


## Start the Development Server

```bash
npm run dev
```


## Run Tests

```bash
npm test
```


# Documentation

Every task contains its own documentation.

Typical structure:

```text
docs/
├── api-contract.md
├── demo-script.md
└── README.md
```

Each task README includes:

* Folder structure
* Architecture overview
* Core workflows
* Setup instructions
* API validation scripts
* Demo walkthroughs
* Security features


# System Evolution

```text
Marketplace Foundation
        │
        ▼
Payment Gateway
        │
        ▼
Pay-per-Application
        │
        ▼
Receipts & Reconciliation
        │
        ▼
Failure Recovery
        │
        ▼
Revenue Dashboard
        │
        ▼
Offer Generation
        │
        ▼
Digital Signatures
        │
        ▼
Public Verification
        │
        ▼
Interview Scheduling
        │
        ▼
Status Tracking
        │
        ▼
Trust Layer
        │
        ▼
College Portal
        │
        ▼
Assessment Platform
        │
        ▼
Bulk Student Onboarding
        │
        ▼
Cross-Portal Validation
        │
        ▼
Privacy & Compliance
        │
        ▼
API Hardening
        │
        ▼
Launch Rehearsal
        │
        ▼
Production Go-Live
```


# Learning Outcomes

This project demonstrates practical implementation of:

* REST API Design
* Modular Backend Architecture
* PostgreSQL Database Design
* Payment Gateway Integration
* Revenue Reconciliation
* Webhook Processing
* Failure Recovery Patterns
* Idempotent APIs
* State Machines
* Digital Signature Workflows
* Cryptographic Verification
* Multi-Tenant Systems
* DPDP Compliance
* MLOps Telemetry
* API Security
* Production Deployment Workflows


# Notes

* Every task is independently executable.
* Each task maintains its own `.env.example`.
* ES Modules are used throughout the project.
* PostgreSQL (Supabase) is the primary datastore.
* Tasks are designed to be modular while progressively building a complete backend platform.
* **Task 25 represents the final production-ready deployment workflow**, integrating all previous modules into a complete enterprise backend.


