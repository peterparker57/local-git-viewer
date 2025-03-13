import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Chip,
  Stack,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import HistoryIcon from '@mui/icons-material/History';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import NoteIcon from '@mui/icons-material/Note';
import { format } from 'date-fns';
import { useProjects } from '../contexts/ProjectsContext';
import {
  fetchProjectById,
  getLocalCommitHistory,
  listLocalBranches,
  getPendingChanges,
  createLocalCommit,
  initLocalRepository,
  getProjectNotes,
} from '../services/projectService';
import CommitList from '../components/CommitList';
import BranchList from '../components/BranchList';
import PendingChangesList from '../components/PendingChangesList';
import NotesList from '../components/NotesList';

function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { selectProject } = useProjects();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [commits, setCommits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [notes, setNotes] = useState([]);
  const [hasLocalRepo, setHasLocalRepo] = useState(false);
  const [initializingRepo, setInitializingRepo] = useState(false);
  const [commitDialogOpen, setCommitDialogOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [creatingCommit, setCreatingCommit] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    selectProject(projectId);
    loadProjectData();
  }, [projectId, selectProject]);
  
  // Set the initial tab value when hasLocalRepo changes
  useEffect(() => {
    // If repository is not initialized, show Notes tab (index 0)
    // If repository is initialized, keep current tab or default to Commits (index 0)
    setTabValue(hasLocalRepo ? tabValue : 0);
  }, [hasLocalRepo]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const projectData = await fetchProjectById(projectId);
      setProject(projectData);
      
      try {
        // Try to load commits to check if local repo exists
        const commitsData = await getLocalCommitHistory(projectId);
        setCommits(commitsData);
        setHasLocalRepo(true);
        
        // Load branches
        const branchesData = await listLocalBranches(projectId);
        setBranches(branchesData);
        
        // Load pending changes
        const changesData = await getPendingChanges(projectId);
        setPendingChanges(changesData);
      } catch (err) {
        console.log('Local repo not initialized or error:', err);
        setHasLocalRepo(false);
      }
      
      // Load notes
      try {
        setLoadingNotes(true);
        const notesData = await getProjectNotes(projectId);
        setNotes(notesData);
      } catch (err) {
        console.error('Error loading notes:', err);
        // Don't set the main error state, just log it
      } finally {
        setLoadingNotes(false);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInitRepo = async () => {
    try {
      setInitializingRepo(true);
      await initLocalRepository(projectId);
      setHasLocalRepo(true);
      await loadProjectData();
    } catch (err) {
      console.error('Error initializing repository:', err);
      setError('Failed to initialize repository. Please try again later.');
    } finally {
      setInitializingRepo(false);
    }
  };

  const handleOpenCommitDialog = () => {
    setCommitDialogOpen(true);
  };

  const handleCloseCommitDialog = () => {
    setCommitDialogOpen(false);
  };

  const handleCreateCommit = async () => {
    if (!commitMessage) {
      return;
    }
    
    try {
      setCreatingCommit(true);
      await createLocalCommit(projectId, commitMessage, authorName, authorEmail);
      setCommitDialogOpen(false);
      setCommitMessage('');
      await loadProjectData();
    } catch (err) {
      console.error('Error creating commit:', err);
      setError('Failed to create commit. Please try again later.');
    } finally {
      setCreatingCommit(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={loadProjectData}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Project not found</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ width: '70%' }}>
            <Typography variant="h4" component="h1">
              {project.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {project.description || 'No description'}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label={project.type || 'Unknown'} color="primary" />
              {project.status && (
                <Chip
                  label={project.status}
                  color={project.status === 'Active' ? 'success' :
                         project.status === 'Archived' ? 'default' : 'info'}
                />
              )}
              {project.repository && (
                <Chip
                  icon={<GitHubIcon />}
                  label={`${project.repository.owner}/${project.repository.name}`}
                  color="secondary"
                />
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project Type
                </Typography>
                <Typography variant="body2">
                  {project.type || 'Unknown'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project Path
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {project.path}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Repository Owner
                </Typography>
                <Typography variant="body2">
                  {project.repository ? project.repository.owner : 'None'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Repository Name
                </Typography>
                <Typography variant="body2">
                  {project.repository ? project.repository.name : 'None'}
                </Typography>
              </Grid>
              
              {project.lastCommit && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Commit
                  </Typography>
                  <Typography variant="body2">
                    {project.lastCommit}
                  </Typography>
                </Grid>
              )}
              
              {project.createdAt && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
              
              {project.updatedAt && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
            
            {project.technologies && project.technologies.length > 0 && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Technologies
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {project.technologies.map((tech, index) => (
                    <Chip
                      key={index}
                      label={tech}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
          
          <Box>
            {!hasLocalRepo ? (
              <Button
                variant="contained"
                onClick={handleInitRepo}
                disabled={initializingRepo}
                startIcon={initializingRepo ? <CircularProgress size={20} /> : <GitHubIcon />}
              >
                Initialize Local Repository
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenCommitDialog}
                disabled={pendingChanges.length === 0}
                startIcon={<AddIcon />}
              >
                Create Commit
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
          {hasLocalRepo && <Tab icon={<HistoryIcon />} label="Commits" />}
          {hasLocalRepo && <Tab icon={<AccountTreeIcon />} label="Branches" />}
          {hasLocalRepo && <Tab icon={<AddIcon />} label="Pending Changes" />}
          <Tab icon={<NoteIcon />} label="Notes" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {hasLocalRepo && tabValue === 0 && (
          <CommitList
            commits={commits}
            projectId={projectId}
            onRefresh={loadProjectData}
          />
        )}
        {hasLocalRepo && tabValue === 1 && (
          <BranchList
            branches={branches}
            projectId={projectId}
            onRefresh={loadProjectData}
          />
        )}
        {hasLocalRepo && tabValue === 2 && (
          <PendingChangesList
            changes={pendingChanges}
            projectId={projectId}
            onRefresh={loadProjectData}
            onCommit={handleOpenCommitDialog}
          />
        )}
        {(!hasLocalRepo && tabValue === 0 || hasLocalRepo && tabValue === 3) && (
          <NotesList
            notes={notes}
            projectId={projectId}
            onRefresh={loadProjectData}
          />
        )}
        
        {!hasLocalRepo && tabValue !== 0 && (
          <Alert severity="info">
            Initialize a local repository to start tracking changes and creating commits.
          </Alert>
        )}
      </Box>

      <Dialog open={commitDialogOpen} onClose={handleCloseCommitDialog}>
        <DialogTitle>Create New Commit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="message"
            label="Commit Message"
            type="text"
            fullWidth
            variant="outlined"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="authorName"
            label="Author Name (optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="authorEmail"
            label="Author Email (optional)"
            type="email"
            fullWidth
            variant="outlined"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCommitDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateCommit} 
            variant="contained" 
            disabled={!commitMessage || creatingCommit}
            startIcon={creatingCommit ? <CircularProgress size={20} /> : null}
          >
            Create Commit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectDetailsPage;