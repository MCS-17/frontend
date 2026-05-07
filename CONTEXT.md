# Context: Chat & File Management

## Glossary

### Staged File
A file selected by the user that is currently held in the UI's local state but has not yet been processed or uploaded to the server.

### Agent-Mediated Processing
The process where the Chat Agent parses the user's message text and the accompanying Staged Files to determine whether to perform an **HPC Upload** or use them as **Chat Context**.

### HPC Shared Directory
A server-side location where files can be uploaded for use in High-Performance Computing tasks.

### Chat Context
Files that are provided to the chat model to inform its responses.

### Sidebar
A collapsible navigation component used to switch between different functional areas of the MONHPC platform.

### Mini-Sidebar (Collapsed)
A state of the sidebar where only icons are visible, maximizing the content area for the main application.

### Mobile Drawer
A state of the sidebar on small screens where it is hidden by default and slides over the content when triggered by a menu button.

## Constraints & Rules

- **Max Files:** 10 files per message.
- **File Size:** No maximum size (supported for large HPC datasets).
- **Iconography:** Files should use specialized icons based on their extension (e.g., FileImage, FileCode).
- **Extension Visibility:** The file extension must always be visible, even if the filename itself is truncated.

## Constraints & Rules (Sidebar)

- **Interaction:** Manual toggle (chevron/hamburger).
- **Navigation:** Must include Chat, Storage, and Dashboard tabs.
- **Aesthetics:** Glassmorphic translucent design with high-quality icons.
- **Branding:** MONHPC text with an associated tech-themed icon.
