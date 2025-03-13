import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import CodeIcon from '@mui/icons-material/Code';
import BugReportIcon from '@mui/icons-material/BugReport';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock data for file types
const fileTypeData = [
  { name: 'JavaScript', value: 45, color: '#F0DB4F' },
  { name: 'HTML', value: 15, color: '#E34C26' },
  { name: 'CSS', value: 20, color: '#264DE4' },
  { name: 'JSON', value: 10, color: '#000000' },
  { name: 'Markdown', value: 5, color: '#083fa1' },
  { name: 'Other', value: 5, color: '#7F7F7F' },
];

// Mock data for commit frequency
const commitFrequencyData = [
  { name: 'Jan', commits: 12 },
  { name: 'Feb', commits: 19 },
  { name: 'Mar', commits: 25 },
  { name: 'Apr', commits: 18 },
  { name: 'May', commits: 22 },
  { name: 'Jun', commits: 30 },
];

// Mock data for contributor activity
const contributorActivityData = [
  { name: 'John Doe', commits: 45 },
  { name: 'Jane Smith', commits: 32 },
  { name: 'Bob Johnson', commits: 28 },
  { name: 'Alice Brown', commits: 15 },
];

// Mock data for file change frequency
const fileChangeFrequencyData = [
  { name: 'src/App.js', changes: 25 },
  { name: 'src/components/Header.js', changes: 18 },
  { name: 'src/utils/api.js', changes: 15 },
  { name: 'src/styles/main.css', changes: 12 },
  { name: 'src/components/Footer.js', changes: 10 },
];

// Mock data for code complexity
const codeComplexityData = [
  { name: 'src/App.js', complexity: 15 },
  { name: 'src/components/Header.js', complexity: 8 },
  { name: 'src/utils/api.js', complexity: 12 },
  { name: 'src/components/Footer.js', complexity: 5 },
];

// Mock file tree data
const fileTreeData = {
  id: 'root',
  name: 'Project Root',
  children: [
    {
      id: 'src',
      name: 'src',
      children: [
        {
          id: 'components',
          name: 'components',
          children: [
            { id: 'components/AnalysisList.js', name: 'AnalysisList.js' },
            { id: 'components/BranchList.js', name: 'BranchList.js' },
            { id: 'components/CommitList.js', name: 'CommitList.js' },
            { id: 'components/FileViewer.js', name: 'FileViewer.js' },
            { id: 'components/Layout.js', name: 'Layout.js' },
            { id: 'components/NotesList.js', name: 'NotesList.js' },
            { id: 'components/PendingChangesList.js', name: 'PendingChangesList.js' },
          ],
        },
        {
          id: 'contexts',
          name: 'contexts',
          children: [
            { id: 'contexts/ProjectsContext.js', name: 'ProjectsContext.js' },
          ],
        },
        {
          id: 'pages',
          name: 'pages',
          children: [
            { id: 'pages/BranchesPage.js', name: 'BranchesPage.js' },
            { id: 'pages/CommitDetailsPage.js', name: 'CommitDetailsPage.js' },
            { id: 'pages/ProjectDetailsPage.js', name: 'ProjectDetailsPage.js' },
            { id: 'pages/ProjectsPage.js', name: 'ProjectsPage.js' },
          ],
        },
        {
          id: 'services',
          name: 'services',
          children: [
            { id: 'services/projectService.js', name: 'projectService.js' },
          ],
        },
        { id: 'src/App.js', name: 'App.js' },
        { id: 'src/index.js', name: 'index.js' },
      ],
    },
    {
      id: 'public',
      name: 'public',
      children: [
        { id: 'public/index.html', name: 'index.html' },
        { id: 'public/manifest.json', name: 'manifest.json' },
      ],
    },
    { id: 'file-endpoints.js', name: 'file-endpoints.js' },
    { id: 'package.json', name: 'package.json' },
    { id: 'package-lock.json', name: 'package-lock.json' },
    { id: 'README.md', name: 'README.md' },
    { id: 'server.js', name: 'server.js' },
  ],
};

// Custom file tree component that doesn't rely on TreeView
const FileTreeItem = ({ item, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = item.children && item.children.length > 0;
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Box sx={{ ml: depth * 2, mb: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: hasChildren ? 'pointer' : 'default',
          py: 0.5
        }}
        onClick={hasChildren ? toggleExpand : undefined}
      >
        {hasChildren ? (
          expanded ? <ExpandMoreIcon color="action" /> : <ChevronRightIcon color="action" />
        ) : (
          <Box sx={{ width: 24 }} /> // Spacer
        )}
        {hasChildren ? (
          <FolderIcon color="primary" sx={{ mr: 1 }} />
        ) : (
          <InsertDriveFileIcon color="info" sx={{ mr: 1 }} />
        )}
        <Typography variant="body2">{item.name}</Typography>
      </Box>
      
      {expanded && hasChildren && (
        <Box>
          {item.children.map((child, index) => (
            <FileTreeItem key={child.id || index} item={child} depth={depth + 1} />
          ))}
        </Box>
      )}
    </Box>
  );
};

// Custom file tree component
const CustomFileTree = ({ data }) => {
  if (!data) return <Typography>No file tree data available</Typography>;
  
  return (
    <Box sx={{ mt: 1 }}>
      <FileTreeItem item={data} />
    </Box>
  );
};

function AnalysisList({ projectId, project }) {
  const [analysisTab, setAnalysisTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectFiles, setProjectFiles] = useState(null);
  const [fileTypes, setFileTypes] = useState(null);

  // Debug output
  console.log('AnalysisList render - projectId:', projectId);
  console.log('AnalysisList render - project:', project);
  console.log('AnalysisList render - projectFiles:', projectFiles);
  console.log('AnalysisList render - fileTypes:', fileTypes);

  useEffect(() => {
    console.log('AnalysisList useEffect triggered - projectId:', projectId);
    console.log('AnalysisList useEffect triggered - project:', project);
    
    // Always update the data when this component mounts or when project changes
    setLoading(true);
    
    // Use a shorter timeout for testing
    setTimeout(() => {
      try {
        // Create a custom file tree based on the project
        const customFileTree = {
          id: 'root',
          name: project?.name || 'Project Root',
          children: [
            {
              id: 'src',
              name: 'src',
              children: [
                {
                  id: 'components',
                  name: 'components',
                  children: [
                    { id: 'comp-1', name: 'AnalysisList.js' },
                    { id: 'comp-2', name: 'BranchList.js' },
                    { id: 'comp-3', name: 'CommitList.js' },
                  ],
                },
                {
                  id: 'pages',
                  name: 'pages',
                  children: [
                    { id: 'page-1', name: 'ProjectDetailsPage.js' },
                    { id: 'page-2', name: 'ProjectsPage.js' },
                  ],
                },
                { id: 'app', name: 'App.js' },
                { id: 'index', name: 'index.js' },
              ],
            },
            { id: 'package', name: 'package.json' },
            { id: 'readme', name: 'README.md' },
          ],
        };
        
        // Create custom file type distribution
        const customFileTypes = [
          { name: 'JavaScript', value: Math.floor(Math.random() * 50) + 30, color: '#F0DB4F' },
          { name: 'HTML', value: Math.floor(Math.random() * 20) + 5, color: '#E34C26' },
          { name: 'CSS', value: Math.floor(Math.random() * 20) + 5, color: '#264DE4' },
          { name: 'JSON', value: Math.floor(Math.random() * 10) + 5, color: '#8884d8' }, // Changed from black to purple
          { name: 'Markdown', value: Math.floor(Math.random() * 10) + 5, color: '#083fa1' },
        ];
        
        console.log('Setting new project files:', customFileTree);
        console.log('Setting new file types:', customFileTypes);
        
        setProjectFiles(customFileTree);
        setFileTypes(customFileTypes);
        setLoading(false);
      } catch (err) {
        console.error('Error in AnalysisList useEffect:', err);
        setError('Failed to load project analysis data: ' + err.message);
        setLoading(false);
      }
    }, 300);
    
    // Cleanup function
    return () => {
      console.log('AnalysisList useEffect cleanup');
    };
  }, [project, projectId]);

  const handleAnalysisTabChange = (event, newValue) => {
    setAnalysisTab(newValue);
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
      <Alert severity="error">{error}</Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={analysisTab}
          onChange={handleAnalysisTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="analysis tabs"
        >
          <Tab icon={<FolderIcon />} label="Project Structure" />
          <Tab icon={<BarChartIcon />} label="Commit Analysis" />
          <Tab icon={<CodeIcon />} label="Code Quality" />
          <Tab icon={<TimelineIcon />} label="Timeline" />
          <Tab icon={<AssessmentIcon />} label="Dependencies" />
        </Tabs>
      </Paper>

      {/* Project Structure Tab */}
      {analysisTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                File Tree
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Box sx={{ border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                  <CustomFileTree data={projectFiles} />
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                File Type Distribution
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                {fileTypes ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fileTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {fileTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${(props.percent * 100).toFixed(0)}%`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No file type data available
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Largest Files
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <InsertDriveFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="node_modules/react/cjs/react.production.min.js"
                    secondary="Size: 12.5 KB"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InsertDriveFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="build/static/js/main.chunk.js"
                    secondary="Size: 8.2 KB"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InsertDriveFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="src/assets/logo.svg"
                    secondary="Size: 5.7 KB"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Commit Analysis Tab */}
      {analysisTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Commit Frequency
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={commitFrequencyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="commits" fill="#8884d8" name="Commits" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Contributor Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={contributorActivityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="commits" fill="#82ca9d" name="Commits" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                File Change Frequency
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={fileChangeFrequencyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="changes" fill="#ffc658" name="Changes" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Code Quality Tab */}
      {analysisTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Code Complexity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={codeComplexityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="complexity" fill="#ff8042" name="Complexity Score" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                TODO Comments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <BugReportIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="src/components/Header.js:45"
                    secondary="TODO: Fix mobile navigation menu"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BugReportIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="src/utils/api.js:23"
                    secondary="TODO: Add error handling for API requests"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BugReportIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="src/App.js:78"
                    secondary="TODO: Implement user authentication"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Lines of Code by File
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'src/App.js', lines: 120 },
                      { name: 'src/components/Header.js', lines: 85 },
                      { name: 'src/utils/api.js', lines: 65 },
                      { name: 'src/components/Footer.js', lines: 45 },
                      { name: 'src/pages/Home.js', lines: 95 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="lines" fill="#8884d8" name="Lines of Code" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Timeline Tab */}
      {analysisTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Development Timeline
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { date: 'Jan 1', commits: 5, lines: 250 },
                      { date: 'Jan 15', commits: 8, lines: 420 },
                      { date: 'Feb 1', commits: 12, lines: 680 },
                      { date: 'Feb 15', commits: 7, lines: 320 },
                      { date: 'Mar 1', commits: 15, lines: 750 },
                      { date: 'Mar 15', commits: 9, lines: 480 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="commits" stroke="#8884d8" name="Commits" />
                    <Line yAxisId="right" type="monotone" dataKey="lines" stroke="#82ca9d" name="Lines Changed" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Key Milestones
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TimelineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Project Initialization"
                    secondary="Jan 1, 2025 - Initial commit with project setup"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TimelineIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Core Features Implemented"
                    secondary="Feb 1, 2025 - Basic functionality complete"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TimelineIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Version 1.0 Release"
                    secondary="Mar 1, 2025 - First stable release"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Dependencies Tab */}
      {analysisTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Package Dependencies
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="react"
                    secondary="v18.2.0 (Latest: 18.2.0)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="react-dom"
                    secondary="v18.2.0 (Latest: 18.2.0)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="axios"
                    secondary="v0.27.2 (Latest: 1.3.4) - Update recommended"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="@mui/material"
                    secondary="v5.11.12 (Latest: 5.11.12)"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Dependency Graph
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Dependency graph visualization would be shown here.
                  This would require a specialized graph visualization library.
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Security Vulnerabilities
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Alert severity="warning" sx={{ mb: 2 }}>
                1 moderate severity vulnerability found in axios@0.27.2
              </Alert>
              <Typography variant="body2">
                Recommended actions:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Update axios to version 1.3.4 or later"
                    secondary="Run: npm update axios"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default AnalysisList;