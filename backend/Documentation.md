# Serverless AWS Backend – Complete Revision Guide

This document is a **complete end‑to‑end revision guide** for the backend we built together.
It covers **concepts, architecture, configuration, code flow, deployment, and debugging**.

---

## 1. Project Overview

We built a **production‑ready serverless backend** using:

* API Gateway (HTTP API)
* AWS Lambda (Node.js + Express)
* DynamoDB (User database)
* S3 (Profile image storage)
* JWT authentication
* Serverless Framework

The backend supports:

* User signup
* User login (JWT)
* Get users (protected)
* Upload profile image (protected)

---

## 2. Final Architecture

Client (Postman / Browser)
↓
API Gateway (HTTP API)
↓
Lambda (Express App)
↓
DynamoDB (Users table)
↓
S3 (Profile images)

Key idea:

* **One API Gateway**
* **One Lambda**
* **Multiple APIs handled by Express routes**

---

## 3. Why We Did NOT Use VPC

VPC is **not required** because:

* DynamoDB is fully managed
* S3 is fully managed
* API Gateway + Lambda already run securely

Adding VPC would:

* Increase cold start
* Require NAT or VPC endpoints
* Add cost and complexity

Rule:

> No private DB (RDS/Redis) → No VPC

---

## 4. REST API vs HTTP API

We used **HTTP API** because:

* Lower latency
* ~70% cheaper
* Native Lambda integration
* Perfect for serverless backends

REST API is needed only for:

* API keys
* Mapping templates
* Usage plans

---

## 5. API Gateway Configuration

### Proxy Routing

We used:

/{proxy+}

Meaning:

* All paths
* All HTTP methods

Are forwarded to **one Lambda**.

Routing happens inside Express.

---

## 6. Serverless Framework Role

Serverless Framework handles:

* Lambda creation
* API Gateway creation
* IAM role & permissions
* Deployment automation

Important rules:

* `serverless deploy` → IAM / env / API changes
* `serverless deploy function` → code only

---

## 7. DynamoDB Setup

### Table: Users

Primary Key:

* `userId` (Partition key)

Attributes (schema‑less):

* name
* email
* password (hashed)
* profile_image
* createdAt

Key points:

* No migrations needed
* New attributes added automatically

---

## 8. S3 Setup (Profile Images)

* Bucket: `user-profile-images-<account-id>`
* Objects are **private by default**

We store:

* Image file in S3
* Image URL (or key) in DynamoDB

Access options:

1. Public bucket (dev only)
2. Pre‑signed URLs (recommended)
3. CloudFront (enterprise)

---

## 9. JWT Authentication Flow

### JWT Basics

* Issued on login
* Sent via `Authorization: Bearer <token>`
* Verified on every protected API

### Flow

/signup → create user
/login → return JWT
/protected APIs → verify JWT middleware

JWT validation happens **inside Lambda** using Express middleware.

---

## 10. Password Security

We use:

* bcryptjs

Process:

* Hash password during signup
* Compare hash during login

Passwords are **never stored in plain text**.

---

## 11. Environment Variables

Defined in `serverless.yml`:

provider.environment

Example:

* JWT_SECRET

Important:

* Never define env vars directly under `provider`
* Use Secrets Manager for production

---

## 12. IAM Permissions (Critical Section)

Lambda IAM Role allows:

DynamoDB:

* Scan
* GetItem
* PutItem
* UpdateItem

S3:

* PutObject
* GetObject

All permissions are defined in `serverless.yml`.

Never edit IAM manually in console.

---

## 13. Dependency Pitfall We Solved

### The Issue

* multer‑s3 v3 → AWS SDK v3
* Our code used AWS SDK v2
* Caused runtime crash

### Final Fix

* Downgraded multer‑s3 to v2
* Locked multer to v1
* Removed all @aws-sdk/* packages

Lesson:

> Never mix AWS SDK v2 and v3

---

## 14. API List

Public APIs:

* POST /signup
* POST /login

Protected APIs (JWT required):

* GET /users
* POST /upload_profile_pic

---

## 15. Deployment Steps (Always Follow This Order)

1. Update code or config
2. Run `npm install` if deps changed
3. Run `serverless deploy`
4. Verify using Postman or curl
5. Check logs if needed

---

## 16. Debugging Checklist

If something fails:

* Check CloudWatch logs
* Check IAM permissions
* Check region consistency
* Check environment variables
* Check dependency versions

---

## 17. When to Split Lambdas

Use single Lambda when:

* Small/medium backend
* Same auth rules
* Same scaling pattern

Split Lambdas when:

* Very high traffic
* Different memory/timeout needs
* Different security rules

---

## 18. Interview‑Ready One‑Line Summary

"I built a serverless backend using API Gateway HTTP APIs, Lambda with Express, DynamoDB for user data, S3 for file storage, JWT authentication, and managed deployments using Serverless Framework."

---

## 19. Recommended Next Improvements

* Move JWT_SECRET to Secrets Manager
* Add refresh tokens
* Use pre‑signed S3 uploads
* Add rate limiting
* Add prod stage
* Add CI/CD pipeline

---

## 20. Final Advice

This architecture is:

* Scalable
* Secure
* Cost‑effective
* Interview‑ready
* Production‑capable

Use this document as your **personal AWS serverless handbook**.

---

END OF DOCUMENT
