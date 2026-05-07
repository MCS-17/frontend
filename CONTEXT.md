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

### GuestSession
The state of the application when no user is authenticated. In this state, the sidebar is hidden, and only the login interface is accessible.

### ActiveSession
The state of the application after a successful login. The sidebar becomes visible, and all application routes (Chat, Dashboard, Storage) are accessible.

### Global Auth Guard
The logic residing in the root layout that determines whether to show the GuestSession (Login) or ActiveSession (App) based on the current authentication state.

### Route-Triggered Entrance
The coordinated animation where the sidebar slides in and the login card slides out simultaneously during a route transition from `/login` to an application route.

### User Storage Root
The dedicated filesystem path on the HPC cluster (/mnt/beegfs/user/<user_id>) that serves as the base directory for a user's file management in the application.

### Path Breadcrumbs
A navigation element in the Storage page that allows users to see their current depth within the User Storage Root and quickly jump back to any parent directory.

### Path Aliasing
The technique of presenting a simplified, user-friendly path in the UI (starting at `/` or `Home`) while mapping it to the full absolute path on the HPC backend (/mnt/beegfs/user/<user_id>).

### High-Friction Deletion
A deletion workflow that requires the user to explicitly confirm their action via a modal to prevent accidental data loss on the HPC filesystem.

### Quick Look Preview
A feature in the Storage page that allows users to instantly view the contents of a file (code, text, or images) in a modal without navigating away from the current directory.

### Selection Toolbar
A context-sensitive UI element that appears at the bottom of the Storage page when one or more files are selected, providing actions like 'Download Zip' or 'Delete Selected'.

### Recursive Folder Upload
The ability to drag and drop or select an entire folder for upload, preserving its nested directory structure on the User Storage Root.

### Context-Aware Menu
A custom right-click menu that displays relevant actions based on the specific element (file, folder, or empty space) being interacted with in the Storage page.

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
