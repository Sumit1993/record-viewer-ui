# Record Viewer UI

This is a web application for viewing and filtering records, built with React, TypeScript, Vite, and Material-UI. It provides a dynamic and interactive interface for managing various types of records.

## Features

This project is a feature-rich user interface designed for efficient record management. The key features are listed below, based on the current implementation:

### Record Visualization
- **Dynamic Data Table**: Records are displayed in a table powered by TanStack Table, allowing for flexible data representation.
- **Column Visibility**: Users can customize the table display by selecting which columns to show or hide through a dedicated drawer. Options to "Select All", "Clear All", and reset to "Default" columns are available.
- **Record Type Navigation**: A sidebar allows users to easily switch between different record types, such as "Business", "Building Permit", and "Zoning Variance", which updates the displayed data accordingly.

### Advanced Filtering
- **Complex Filter Logic**: A powerful filtering system allows users to create detailed queries with `AND`/`OR` conditions.
- **Multi-Condition Groups**: Users can add multiple filter groups (combined with `AND`) and add multiple conditions within each group (combined with `OR`).
- **Autocomplete Suggestions**: To streamline the filtering process, autocomplete suggestions are available for certain text-based fields.

### Record Management
- **Add New Records**: A dedicated form allows for the creation of new records. The form supports dynamic multi-entry fields for addresses, emails, and phone numbers.
- **Form Validation**: The "Add New Record" form includes validation to ensure all required fields are completed before submission.

### User Experience
- **Informative Header**: A header provides at-a-glance information, including the total number of records, the last update time, and the count of active filters.
- **Modern Tech Stack**: The application is built with a modern frontend stack, including:
  - **React** and **Vite** for a fast development experience.
  - **TypeScript** for type safety.
  - **Material-UI** for a consistent and visually appealing design.
  - **TanStack Router** for efficient client-side routing.
  - **TanStack Query** for robust data fetching and state management.

## Getting Started

### Prerequisites
- Node.js and npm (or a compatible package manager)

### Installation
1. Navigate to the `record-viewer-ui` directory.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
To start the development server, run the following command:
```bash
npm run dev
```
The application will be available at `http://localhost:3000` (or another port if 3000 is in use).

### Building for Production
To build the application for production, run the following command:
```bash
npm run build
```
The production-ready files will be generated in the `dist` directory.
