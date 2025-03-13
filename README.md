# Local Git Viewer

A web interface for viewing and managing local git repositories tracked by the Project Hub MCP. This application provides a user-friendly way to interact with your local git repositories, view commits, branches, and file changes.

## Features

- **Project Management**: View and manage projects tracked by Project Hub MCP
- **Commit History**: Browse commit history with detailed information
- **Branch Management**: View and switch between branches
- **File Viewing**: Examine file changes with syntax highlighting
- **Notes System**: Create and manage project notes with categories and tags
- **Analysis Tools**: Visualize project structure and file type distribution

## Recent Improvements

### Notes Tab UI Enhancements

The Notes tab has been redesigned to match the layout of the Commit Details page, providing a more consistent user experience:

- Two-column layout with notes list on the left and content on the right
- Header section for note content with title, date, category, and tags
- Scrollable content area for note text with proper contrast
- Date and time display under each note title in the list

### Analysis Tab

The Analysis tab provides visual insights into project structure and file composition:

- File tree visualization with expand/collapse functionality
- File type distribution pie chart with percentage calculations
- Commit analysis showing frequency and contributor activity
- Code quality metrics and dependency information

## Technology Stack

- **Frontend**: React, Material-UI, React Router
- **Backend**: Express.js, SQLite
- **Data Visualization**: Recharts
- **Code Highlighting**: React Syntax Highlighter
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Project Hub MCP server running

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/local-git-viewer.git
   cd local-git-viewer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

This will start both the Express backend server and the React frontend development server concurrently.

## Usage

### Viewing Projects

The home page displays a list of all projects tracked by Project Hub MCP. Click on a project to view its details.

### Working with Commits

1. Navigate to a project's details page
2. View the commit history in the Commits tab
3. Click on a commit to view its details, including file changes

### Managing Branches

1. Navigate to a project's details page
2. Go to the Branches tab
3. View all branches and switch between them

### Creating and Managing Notes

1. Navigate to a project's details page
2. Go to the Notes tab
3. Create, edit, or delete notes with optional categories and tags

### Analyzing Project Structure

1. Navigate to a project's details page
2. Go to the Analysis tab
3. Explore the file tree and file type distribution

## Project Structure

- `/public` - Static assets
- `/src` - React frontend source code
  - `/components` - Reusable UI components
  - `/contexts` - React context providers
  - `/pages` - Page components
  - `/services` - API service functions
- `server.js` - Express backend server

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Project Hub MCP for providing the backend API
- Material-UI for the component library
- React team for the frontend framework