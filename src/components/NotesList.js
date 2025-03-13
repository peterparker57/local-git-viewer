import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
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
  Modal,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { createNote, updateNote, deleteNote } from '../services/projectService';

function NotesList({ notes, projectId, onRefresh }) {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);

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
  
  const handleOpenViewModal = (note) => {
    setViewingNote(note);
    setViewModalOpen(true);
  };
  
  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewingNote(null);
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
        <List>
          {notes.map((note) => (
            <ListItem key={note.id} sx={{ mb: 2, p: 0 }}>
              <Card sx={{ width: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div">
                      {note.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(note.updatedAt)}
                    </Typography>
                  </Box>
                  
                  {note.category && (
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                      Category: {note.category}
                    </Typography>
                  )}
                  
                  <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                    {truncateContent(note.content)}
                  </Typography>
                  
                  {note.tags && note.tags.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      {note.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Stack>
                  )}
                </CardContent>
                <Divider />
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleOpenViewModal(note)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenNoteDialog(note)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleOpenDeleteDialog(note)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </ListItem>
          ))}
        </List>
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

      {/* View Note Modal */}
      <Modal
        open={viewModalOpen}
        onClose={handleCloseViewModal}
        aria-labelledby="view-note-modal"
        aria-describedby="view-note-full-content"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: 800,
            maxHeight: '80vh',
            overflow: 'auto',
            p: 4,
            outline: 'none',
          }}
        >
          {viewingNote && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {viewingNote.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(viewingNote.updatedAt)}
                </Typography>
              </Box>
              
              {viewingNote.category && (
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                  Category: {viewingNote.category}
                </Typography>
              )}
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                {viewingNote.content}
              </Typography>
              
              {viewingNote.tags && viewingNote.tags.length > 0 && (
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags:</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {viewingNote.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Stack>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={handleCloseViewModal}>Close</Button>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => {
                    handleCloseViewModal();
                    handleOpenNoteDialog(viewingNote);
                  }}
                  sx={{ ml: 1 }}
                >
                  Edit
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Modal>
    </Box>
  );
}

export default NotesList;