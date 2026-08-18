# Render Status API Proxy Log

This folder contains the Next.js API route that proxies status calls to the Render API.

## Changes on August 18, 2026

- **route.ts**: Implemented a secure GET handler that retrieves the Render API Key from client headers or environment variables, lists all services from Render, queries the latest deploy status for each service in parallel, and returns the compiled payload to bypass browser CORS restrictions.
