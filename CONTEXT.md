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

## Constraints & Rules

- **Max Files:** 10 files per message.
- **File Size:** No maximum size (supported for large HPC datasets).
- **Iconography:** Files should use specialized icons based on their extension (e.g., FileImage, FileCode).
- **Extension Visibility:** The file extension must always be visible, even if the filename itself is truncated.
