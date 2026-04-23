import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Add,
  AssignmentTurnedIn,
  AutoAwesome,
  CalendarMonth,
  Close,
  DataObject,
  Delete,
  Edit,
  FilterList,
  LocalOffer,
  Person,
  Refresh,
  Save,
  School,
  Search,
  TrendingUp,
  WarningAmber
} from '@mui/icons-material';
import './index.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const emptyProject = {
  title: '',
  studentName: '',
  rollNumber: '',
  department: '',
  mentor: '',
  status: 'Planning',
  priority: 'Medium',
  budget: '',
  dueDate: '',
  tags: '',
  summary: ''
};

const departments = ['Computer Science', 'Information Technology', 'AI & Data Science', 'Electronics', 'Mechanical'];
const statuses = ['Planning', 'In Progress', 'Review', 'Completed'];
const priorities = ['Low', 'Medium', 'High'];

const statusClass = {
  Planning: 'status-planning',
  'In Progress': 'status-progress',
  Review: 'status-review',
  Completed: 'status-completed'
};

const priorityColor = {
  Low: 'success',
  Medium: 'warning',
  High: 'error'
};

function App() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inReview: 0, urgent: 0, departments: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', department: '', priority: '', sort: '-updatedAt' });
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const [projectRes, statRes] = await Promise.all([
        axios.get(`${API_URL}/projects`, { params: filters }),
        axios.get(`${API_URL}/projects/stats/overview`)
      ]);
      setProjects(projectRes.data);
      setStats(statRes.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to connect to the backend. Start MongoDB and the API server.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const completionRate = useMemo(() => {
    if (!stats.total) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);

  const openCreateDialog = () => {
    setEditingId(null);
    setProjectForm(emptyProject);
    setOpen(true);
  };

  const openEditDialog = (project) => {
    setEditingId(project._id);
    setProjectForm({
      ...project,
      dueDate: project.dueDate ? project.dueDate.slice(0, 10) : '',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : ''
    });
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setSaving(false);
  };

  const updateForm = (field, value) => {
    setProjectForm((current) => ({ ...current, [field]: value }));
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/projects/${editingId}`, projectForm);
        setMessage('Project updated successfully.');
      } else {
        await axios.post(`${API_URL}/projects`, projectForm);
        setMessage('New project added to MongoDB.');
      }
      closeDialog();
      fetchProjects();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Please check the form values and try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (project) => {
    const confirmed = window.confirm(`Delete "${project.title}" from the database?`);
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/projects/${project._id}`);
      setMessage('Project deleted successfully.');
      fetchProjects();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Delete failed.');
    }
  };

  const updateStatus = async (project, status) => {
    try {
      await axios.patch(`${API_URL}/projects/${project._id}/status`, { status });
      setMessage(`Status changed to ${status}.`);
      fetchProjects();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Status update failed.');
    }
  };

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  return (
    <Box className="app-shell">
      <Box className="hero-band">
        <Box className="hero-copy">
          <Chip icon={<DataObject />} label="MongoDB CRUD Dashboard" className="hero-chip" />
          <Typography variant="h2" component="h1">
            Student Project Registry
          </Typography>
          <Typography variant="body1">
            Navigate live database records with add, edit, delete, search, filters, status updates, and analytics.
          </Typography>
          <Stack direction="row" spacing={1.5} className="hero-actions">
            <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
              Add Project
            </Button>
            <Tooltip title="Refresh database records">
              <IconButton onClick={fetchProjects} aria-label="refresh records">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        <Box className="hero-visual" aria-hidden="true">
          <Box className="database-core">
            <span />
            <span />
            <span />
          </Box>
          <Box className="metric-float metric-one">
            <AssignmentTurnedIn />
            <strong>{completionRate}%</strong>
            <small>completed</small>
          </Box>
          <Box className="metric-float metric-two">
            <WarningAmber />
            <strong>{stats.urgent}</strong>
            <small>high priority</small>
          </Box>
        </Box>
      </Box>

      <Box className="content-wrap">
        {message && (
          <Alert severity="info" onClose={() => setMessage('')} className="app-alert">
            {message}
          </Alert>
        )}

        <Grid container spacing={2.5} className="stats-grid">
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-card">
              <School />
              <span>Total Projects</span>
              <strong>{stats.total}</strong>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-card">
              <AssignmentTurnedIn />
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-card">
              <TrendingUp />
              <span>In Review</span>
              <strong>{stats.inReview}</strong>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-card">
              <DataObject />
              <span>Departments</span>
              <strong>{stats.departments}</strong>
            </Paper>
          </Grid>
        </Grid>

        <Paper className="control-panel">
          <TextField
            label="Search records"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <FormControl>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
              <MenuItem value="">All</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Department</InputLabel>
            <Select label="Department" value={filters.department} onChange={(event) => updateFilter('department', event.target.value)}>
              <MenuItem value="">All</MenuItem>
              {departments.map((department) => (
                <MenuItem key={department} value={department}>
                  {department}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Priority</InputLabel>
            <Select label="Priority" value={filters.priority} onChange={(event) => updateFilter('priority', event.target.value)}>
              <MenuItem value="">All</MenuItem>
              {priorities.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Sort</InputLabel>
            <Select label="Sort" value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}>
              <MenuItem value="-updatedAt">Recently updated</MenuItem>
              <MenuItem value="dueDate">Due date</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="-budget">Highest budget</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFilters({ search: '', status: '', department: '', priority: '', sort: '-updatedAt' })}
          >
            Clear
          </Button>
        </Paper>

        {loading && <LinearProgress className="loader" />}

        <Grid container spacing={2.5} className="project-grid">
          {projects.map((project) => (
            <Grid item xs={12} md={6} xl={4} key={project._id}>
              <Paper className="project-card">
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box>
                    <Chip className={statusClass[project.status]} label={project.status} size="small" />
                    <Typography variant="h5">{project.title}</Typography>
                  </Box>
                  <Chip color={priorityColor[project.priority]} label={project.priority} size="small" />
                </Stack>

                <Typography className="summary">{project.summary}</Typography>

                <Grid container spacing={1.5} className="detail-grid">
                  <Grid item xs={6}>
                    <Person />
                    <span>{project.studentName}</span>
                  </Grid>
                  <Grid item xs={6}>
                    <School />
                    <span>{project.rollNumber}</span>
                  </Grid>
                  <Grid item xs={6}>
                    <DataObject />
                    <span>{project.department}</span>
                  </Grid>
                  <Grid item xs={6}>
                    <CalendarMonth />
                    <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No date'}</span>
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap className="tag-row">
                  {(project.tags || []).map((tag) => (
                    <Chip key={tag} icon={<AutoAwesome />} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>

                <Divider />

                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} className="card-actions">
                  <FormControl size="small">
                    <InputLabel>Move</InputLabel>
                    <Select label="Move" value={project.status} onChange={(event) => updateStatus(project, event.target.value)}>
                      {statuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit project">
                      <IconButton onClick={() => openEditDialog(project)} aria-label="edit project">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete project">
                      <IconButton color="error" onClick={() => deleteProject(project)} aria-label="delete project">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {!loading && projects.length === 0 && (
          <Paper className="empty-state">
            <DataObject />
            <Typography variant="h5">No matching records</Typography>
            <Typography>Adjust filters or add a new project to MongoDB.</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
              Add First Project
            </Button>
          </Paper>
        )}
      </Box>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <span>{editingId ? 'Edit Project Record' : 'Add New Project Record'}</span>
            <IconButton onClick={closeDialog} aria-label="close dialog">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField label="Project title" fullWidth required value={projectForm.title} onChange={(event) => updateForm('title', event.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Roll number" fullWidth required value={projectForm.rollNumber} onChange={(event) => updateForm('rollNumber', event.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Student name" fullWidth required value={projectForm.studentName} onChange={(event) => updateForm('studentName', event.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Mentor" fullWidth required value={projectForm.mentor} onChange={(event) => updateForm('mentor', event.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select label="Department" value={projectForm.department} onChange={(event) => updateForm('department', event.target.value)}>
                  {departments.map((department) => (
                    <MenuItem key={department} value={department}>
                      {department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={projectForm.status} onChange={(event) => updateForm('status', event.target.value)}>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select label="Priority" value={projectForm.priority} onChange={(event) => updateForm('priority', event.target.value)}>
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Budget" type="number" fullWidth value={projectForm.budget} onChange={(event) => updateForm('budget', event.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Due date"
                type="date"
                fullWidth
                required
                value={projectForm.dueDate}
                onChange={(event) => updateForm('dueDate', event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Tags"
                fullWidth
                value={projectForm.tags}
                onChange={(event) => updateForm('tags', event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOffer />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Project summary"
                fullWidth
                multiline
                minRows={4}
                required
                value={projectForm.summary}
                onChange={(event) => updateForm('summary', event.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} onClick={saveProject} disabled={saving}>
            {saving ? 'Saving' : 'Save Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
