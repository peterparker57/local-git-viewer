import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function FileViewer({ file, content }) {
  if (!file || !content) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No file content to display</Alert>
      </Box>
    );
  }

  // Handle deleted files
  if (file.operation === 'delete') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          This file was deleted in this commit
        </Alert>
      </Box>
    );
  }

  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    if (!bytes) return 'Unknown';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Determine language for syntax highlighting
  const getLanguage = (filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();
    
    const languageMap = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rb': 'ruby',
      'php': 'php',
      'sql': 'sql',
      'sh': 'bash',
      'bat': 'batch',
      'ps1': 'powershell',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'txt': 'text',
    };
    
    return languageMap[extension] || 'text';
  };

  return (
    <Box>
      <Box sx={{ p: 2, bgcolor: 'primary.main', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'medium' }}>
          {file.filePath}
        </Typography>
        <Typography variant="caption" sx={{ color: 'white', opacity: 0.9 }}>
          Status: {file.status || (file.operation.charAt(0).toUpperCase() + file.operation.slice(1) + 'ed')}
        </Typography>
        {file.size && (
          <Typography variant="caption" sx={{ color: 'white', opacity: 0.9, ml: 2 }}>
            Size: {formatFileSize(file.size)}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ p: 0, maxHeight: '500px', overflow: 'auto' }}>
        <SyntaxHighlighter 
          language={getLanguage(file.filePath)} 
          style={docco} 
          showLineNumbers={true}
          wrapLines={true}
          customStyle={{ margin: 0, borderRadius: 0 }}
        >
          {content.content || ''}
        </SyntaxHighlighter>
      </Box>
    </Box>
  );
}

export default FileViewer;