import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchProjects } from '../services/projectService';

const ProjectsContext = createContext();

export function useProjects() {
  return useContext(ProjectsContext);
}

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const data = await fetchProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const selectProject = (projectId) => {
    setSelectedProjectId(projectId);
  };

  const refreshProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing projects:', err);
      setError('Failed to refresh projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProject = () => {
    return projects.find(project => project.id === selectedProjectId) || null;
  };

  const value = {
    projects,
    loading,
    error,
    selectedProjectId,
    selectProject,
    refreshProjects,
    getSelectedProject
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}