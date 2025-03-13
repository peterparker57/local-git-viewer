import axios from 'axios';

// Base URL for the MCP API
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    throw new Error(error.response.data.message || 'An error occurred with the API');
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request error:', error.message);
    throw new Error('Error setting up request: ' + error.message);
  }
};

// Fetch all projects
export const fetchProjects = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/list_projects`, {
      page: 1,
      page_size: 100
    });
    return response.data.projects || [];
  } catch (error) {
    return handleApiError(error);
  }
};

// Fetch a specific project by ID
export const fetchProjectById = async (projectId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/get_project`, {
      projectId
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Initialize a local repository
export const initLocalRepository = async (projectId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/init_local_repository`, {
      projectId
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get local commit history
export const getLocalCommitHistory = async (projectId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/get_local_commit_history`, {
      projectId
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Create a local commit
export const createLocalCommit = async (projectId, message, authorName, authorEmail) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/create_local_commit`, {
      projectId,
      message,
      authorName,
      authorEmail
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get pending changes
export const getPendingChanges = async (projectId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/get_pending_changes`, {
      projectId
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// List local branches
export const listLocalBranches = async (projectId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/list_local_branches`, {
      projectId
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Create a local branch
export const createLocalBranch = async (projectId, name, startingCommitId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/create_local_branch`, {
      projectId,
      name,
      startingCommitId
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Switch to a local branch
export const switchLocalBranch = async (projectId, branchName) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/switch_local_branch`, {
      projectId,
      branchName
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Restore to a local commit
export const restoreToLocalCommit = async (projectId, commitId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/restore_to_local_commit`, {
      projectId,
      commitId
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Restore to a local branch
export const restoreToLocalBranch = async (projectId, branchName) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/restore_to_local_branch`, {
      projectId,
      branchName
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Push local commits to GitHub
export const pushLocalCommits = async (projectId, repo, branch) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/push_local_commits`, {
      projectId,
      repo,
      branch
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get file snapshots for a commit
export const getFileSnapshots = async (commitId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/get_file_snapshots`, {
      commitId
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get file content for a snapshot
export const getFileContent = async (snapshotId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mcp/project-hub/get_file_content`, {
      snapshotId
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};