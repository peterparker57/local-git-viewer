import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Grid,
} from '@mui/material';
import CommitIcon from '@mui/icons-material/Commit';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import { getLocalCommitHistory, getFileSnapshots, getFileContent } from '../services/projectService';
import FileViewer from '../components/FileViewer';

function CommitDetailsPage() {
  const { projectId, commitId } = useParams();
  const navigate = useNavigate();
  
  const [commit, setCommit] = useState(null);
  const [fileSnapshots, setFileSnapshots] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    loadCommitData();
  }, [projectId, commitId]);

  const loadCommitData = async () => {
    try {
      setLoading(true);
      
      // Get commit details
      const commits = await getLocalCommitHistory(projectId);
      const foundCommit = commits.find(c => c.id === commitId);
      
      if (!foundCommit) {
        setError('Commit not found');
        return;
      }
      
      setCommit(foundCommit);
      
      // Get file snapshots for this commit
      const snapshots = await getFileSnapshots(commitId);
      setFileSnapshots(snapshots);
      
      setError(null);
    } catch (err) {
      console.error('Error loading commit data:', err);
      setError('Failed to load commit data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (snapshot) => {
    try {
      setLoadingFile(true);
      setSelectedFile(snapshot);
      
      // Get file content
      const content = await getFileContent(snapshot.id);
      setFileContent(content);
    } catch (err) {
      console.error('Error loading file content:', err);
      setError('Failed to load file content. Please try again later.');
    } finally {
      setLoadingFile(false);
    }
  };

  const getOperationIcon = (operation) => {
    switch (operation) {
      case 'add':
        return <AddIcon color="success" />;
      case 'delete':
        return <DeleteIcon color="error" />;
      case 'modify':
      default:
        return <EditIcon color="primary" />;
    }
  };
  
  const getOperationPastTense = (operation) => {
    switch (operation) {
      case 'add':
        return 'Added';
      case 'delete':
        return 'Deleted';
      case 'modify':
        return 'Modified';
      default:
        // Capitalize and try to make past tense
        const capitalized = operation.charAt(0).toUpperCase() + operation.slice(1);
        if (capitalized.endsWith('e')) {
          return capitalized + 'd';
        } else {
          return capitalized + 'ed';
        }
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    if (!bytes) return 'Unknown';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          onClick={loadCommitData}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!commit) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Commit not found</Alert>
        <Button
          variant="contained"
          onClick={() => navigate(`/projects/${projectId}`)}
          sx={{ mt: 2 }}
        >
          Back to Project
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/projects/${projectId}`)}
        sx={{ mb: 2 }}
      >
        Back to Project
      </Button>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CommitIcon sx={{ mr: 2 }} />
          <Typography variant="h5" component="h1">
            {commit.message}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">
              Author: {commit.authorName || 'Unknown'}
              {commit.authorEmail && ` <${commit.authorEmail}>`}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">
              Date: {format(new Date(commit.timestamp), 'PPpp')}
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          {commit.parentCommitId && (
            <Chip
              label={`Parent: ${commit.parentCommitId.substring(0, 8)}...`}
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}
          {commit.pushedToRemote ? (
            <Chip
              label="Pushed to GitHub"
              color="success"
              variant="outlined"
            />
          ) : (
            <Chip
              label="Local Only"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper>
            <Typography variant="h6" sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              Files ({fileSnapshots.length})
            </Typography>
            <List sx={{ maxHeight: '500px', overflow: 'auto' }}>
              {fileSnapshots.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No files in this commit" />
                </ListItem>
              ) : (
                fileSnapshots.map((snapshot) => (
                  <ListItemButton
                    key={snapshot.id}
                    selected={selectedFile && selectedFile.id === snapshot.id}
                    onClick={() => handleFileClick(snapshot)}
                  >
                    <ListItemIcon>
                      {getOperationIcon(snapshot.operation)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {snapshot.filePath}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography component="div" variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                            Status: {snapshot.status || getOperationPastTense(snapshot.operation)}
                          </Typography>
                          
                          {/* Always show file info in a consistent format */}
                          <Typography component="div" variant="body2" color="text.secondary" sx={{ mt: 1, mb: 0.5 }}>
                            <strong>Size:</strong> {snapshot.size ? formatFileSize(snapshot.size) : 'Unknown'}
                          </Typography>
                          
                          <Typography component="div" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            <strong>Created:</strong> {snapshot.createdAt
                              ? format(new Date(snapshot.createdAt), 'MMM d, yyyy h:mm a')
                              : 'Unknown'}
                          </Typography>
                          
                          <Typography component="div" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            <strong>Modified:</strong> {snapshot.modifiedAt
                              ? format(new Date(snapshot.modifiedAt), 'MMM d, yyyy h:mm a')
                              : 'Unknown'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', minHeight: '500px' }}>
            {!selectedFile ? (
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Select a file to view its content
                </Typography>
              </Box>
            ) : loadingFile ? (
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <FileViewer file={selectedFile} content={fileContent} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CommitDetailsPage;