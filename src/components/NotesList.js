import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NoteIcon from '@mui/icons-material/Note';
import { format } from 'date-fns';
import { createNote, updateNote, deleteNote } from '../services/projectService';

function NotesList({ notes, projectId, onRefresh }) {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
const handleOpenNoteDialog = (note = null) => {
  if (note) {
    setIsEditing(true);
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || '');
    setTags(note.tags ? note.tags.join(', ') : '');
  } else {
    setIsEditing(false);
    setCurrentNote(null);
    setTitle('');
    setContent('');
    setCategory('');
    setTags('');
  }
  setNoteDialogOpen(true);
};

const handleCloseNoteDialog = () => {
  setNoteDialogOpen(false);
  setError(null);
};

const handleOpenDeleteDialog = (note) => {
  setNoteToDelete(note);
  setDeleteDialogOpen(true);
};

const handleCloseDeleteDialog = () => {
  setDeleteDialogOpen(false);
  setNoteToDelete(null);
};

const handleSelectNote = (note) => {
  setSelectedNote(note);
};

  const handleSaveNote = async () => {
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse tags from comma-separated string to array
      const tagsArray = tags
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      if (isEditing && currentNote) {
        await updateNote(currentNote.id, title, content, category, tagsArray);
      } else {
        await createNote(projectId, title, content, category, tagsArray);
      }

      setNoteDialogOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      setLoading(true);
      await deleteNote(noteToDelete.id);
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
      onRefresh();
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return dateString;
    }
  };
  
  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Project Notes</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenNoteDialog()}
        >
          Add Note
        </Button>
      </Box>

      {notes.length === 0 ? (
        <Alert severity="info">No notes found for this project. Click "Add Note" to create one.</Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Left column - Notes list */}
          <Grid item xs={12} md={4}>
            <Paper>
              <Typography variant="h6" sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                Notes ({notes.length})
              </Typography>
              <List sx={{ maxHeight: '500px', overflow: 'auto' }}>
                {notes.map((note) => (
                  <ListItemButton
                    key={note.id}
                    selected={selectedNote && selectedNote.id === note.id}
                    onClick={() => handleSelectNote(note)}
                  >
                    <ListItemText
                      primary={
                        <>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {note.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {formatDate(note.createdAt || note.updatedAt)}
                          </Typography>
                        </>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          {note.category && (
                            <Typography component="div" variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                              Category: {note.category}
                            </Typography>
                          )}
                          {note.tags && note.tags.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                              {note.tags.map((tag, index) => (
                                <Chip key={index} label={tag} size="small" />
                              ))}
                            </Stack>
                          )}
                          <Box sx={{ display: 'flex', mt: 1 }}>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenNoteDialog(note);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteDialog(note);
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Right column - Note content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ height: '100%', minHeight: '500px' }}>
              {!selectedNote ? (
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Select a note to view its content
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ p: 2, bgcolor: 'primary.main', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'medium' }}>
                        {selectedNote.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'white', opacity: 0.9 }}>
                        {formatDate(selectedNote.updatedAt)}
                      </Typography>
                    </Box>
                    
                    {selectedNote.category && (
                      <Typography variant="caption" sx={{ color: 'white', opacity: 0.9, display: 'block', mt: 0.5 }}>
                        Category: {selectedNote.category}
                      </Typography>
                    )}
                    
                    {selectedNote.tags && selectedNote.tags.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {selectedNote.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                '& .MuiChip-label': {
                                  fontSize: '0.7rem'
                                }
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ p: 3, maxHeight: '500px', overflow: 'auto', bgcolor: '#f8f9fa' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#000' }}>
                      {selectedNote.content}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={handleCloseNoteDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Note' : 'Add Note'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="content"
            label="Content"
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="category"
            label="Category (optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="tags"
            label="Tags (comma-separated, optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            helperText="Example: frontend, bug, documentation"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteDialog}>Cancel</Button>
          <Button
            onClick={handleSaveNote}
            variant="contained"
            disabled={!title || !content || loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the note "{noteToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteNote}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default NotesList;