import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { ProjectsProvider } from './contexts/ProjectsContext';
import Layout from './components/Layout';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import CommitDetailsPage from './pages/CommitDetailsPage';
import BranchesPage from './pages/BranchesPage';

function App() {
  return (
    <ProjectsProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ProjectsPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="projects/:projectId/commits/:commitId" element={<CommitDetailsPage />} />
            <Route path="projects/:projectId/branches" element={<BranchesPage />} />
          </Route>
        </Routes>
      </Box>
    </ProjectsProvider>
  );
}

export default App;