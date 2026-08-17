# Project Log: DJM Inventory System
**Date:** July 17, 2026

## Overview
**How it works:** A Python-based inventory system utilizing SQLite for local data and web scrapers for cloud data retrieval.

## Changes Made Today
**How it was affected:** 
The project folder was renamed from `DJMAudio_Inventory` to `djm-inventory-system` and moved into the `Web_Applications` hub. All internal absolute paths pointing to the old folder were updated programmatically.

## 🛑 ROADMAP: How to Roll Back
If this project fails to run, loses its API connections, or crashes due to path resolution errors, execute the following steps to revert the work done today:

1. Move the folder back to the root directory.
2. Rename it back to `DJMAudio_Inventory`.
3. Run a text replacement on the codebase replacing `/Web_Applications/djm-inventory-system` with `/DJMAudio_Inventory`.
4. Rebuild the `.venv` if Python environment errors occur.

## Phase 2 Debugging (July 17, 2026)
- **Action:** Installed `requirements.txt` into local `.venv`.
- **Why:** Application threw a `ModuleNotFoundError` for `streamlit`.
- **Details:** Sourced `.venv` and installed all project requirements to resolve dependency issues.
- **Road Back:** Delete `.venv` to remove installed dependencies and restore to broken state.
