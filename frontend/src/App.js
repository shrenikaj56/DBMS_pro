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
  ArrowForward,
  AutoAwesome,
  CalendarMonth,
  Close,
  DataObject,
  Delete,
  Edit,
  FilterList,
  HomeRounded,
  Insights,
  LocalOffer,
  Person,
  Refresh,
  RocketLaunch,
  Save,
  School,
  Search,
  AutoAwesomeMotion,
  TaskAlt,
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

const priorityClass = {
  Low: 'priority-low',
  Medium: 'priority-medium',
  High: 'priority-high'
};

const sortDefaults = {
  search: '',
  status: '',
  department: '',
  priority: '',
  sort: '-updatedAt'
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'No date';

function App() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inReview: 0, urgent: 0, departments: 0 });
  const [filters, setFilters] = useState(sortDefaults);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [transitionStage, setTransitionStage] = useState('intro');

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

  const dashboardMetrics = useMemo(() => {
    const total = stats.total || projects.length;
    const completed = stats.completed || 0;
    const progress = total ? Math.round((completed / total) * 100) : 0;
    const totalBudget = projects.reduce((sum, project) => sum + Number(project.budget || 0), 0);
    const active = projects.filter((project) => project.status === 'In Progress').length;
    const recent = [...projects]
      .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
      .slice(0, 4);

    return {
      progress,
      totalBudget,
      active,
      recent
    };
  }, [projects, stats]);

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

  const enterWorkspace = () => {
    setTransitionStage('exiting-intro');
    window.setTimeout(() => {
      setShowIntro(false);
      setTransitionStage('workspace-enter');
      window.setTimeout(() => setTransitionStage('workspace'), 520);
    }, 420);
  };

  const goToIntro = () => {
    setTransitionStage('exiting-workspace');
    window.setTimeout(() => {
      setShowIntro(true);
      setTransitionStage('intro-enter');
      window.setTimeout(() => setTransitionStage('intro'), 520);
    }, 420);
  };

  return (
    <Box className={`app-shell stage-${transitionStage}`}>
      <Box className="page-background">
        <Box className="aurora aurora-one" />
        <Box className="aurora aurora-two" />
        <Box className="aurora aurora-three" />
        <Box className="grid-glow" />
      </Box>

      {showIntro ? (
        <Box className={`intro-screen ${transitionStage === 'exiting-intro' ? 'screen-exit' : 'screen-enter'}`}>
          <Box className="intro-panel">
            <Box className="intro-content">
              <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap" className="intro-topline">
                <Chip icon={<AutoAwesomeMotion />} label="Modern project workspace" className="intro-chip intro-chip-bright" />
              </Stack>

              <Typography variant="h1" component="h1">
                Student Project Registry
              </Typography>

              <Typography className="intro-text">
                Manage projects, deadlines, mentors, and updates in one attractive dashboard designed for students and teachers.
              </Typography>

              <Stack direction="row" spacing={1.5} className="intro-actions">
                <Button variant="contained" endIcon={<ArrowForward />} onClick={enterWorkspace}>
                  Open dashboard
                </Button>
              </Stack>
            </Box>

            <Box className="intro-orbit">
              <Box className="ring ring-one" />
              <Box className="ring ring-two" />
              <Box className="ring ring-three" />

              <Paper className="intro-float intro-float-main">
                <TaskAlt />
                <Box>
                  <strong>{dashboardMetrics.progress}%</strong>
                  <span>completion</span>
                </Box>
              </Paper>

              <Paper className="intro-float intro-float-left">
                <RocketLaunch />
                <Box>
                  <strong>{stats.total}</strong>
                  <span>projects</span>
                </Box>
              </Paper>

              <Paper className="intro-float intro-float-right">
                <WarningAmber />
                <Box>
                  <strong>{stats.urgent}</strong>
                  <span>urgent</span>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box className={`workspace-screen ${transitionStage === 'exiting-workspace' ? 'screen-exit' : 'screen-enter'}`}>
          <Box className="workspace-hero">
            <Box className="workspace-copy">
              <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap" className="workspace-topline">
                <Chip icon={<Insights />} label="Live project tracking" className="workspace-chip workspace-chip-bright" />
                <Chip icon={<School />} label="Students and teachers" className="workspace-chip workspace-chip-glass" />
              </Stack>

              <Typography variant="h2" component="h1">
                ProjectSphere
              </Typography>

              <Typography className="workspace-text">
                Student Project Management System
              </Typography>

              <Typography className="workspace-subtext">
                Empowering Academic Innovation
              </Typography>

              <Stack direction="row" spacing={1.5} className="workspace-actions">
                <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
                  Add project
                </Button>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchProjects}>
                  Refresh
                </Button>
                <Button variant="text" startIcon={<HomeRounded />} onClick={goToIntro}>
                  Home
                </Button>
              </Stack>
            </Box>
          </Box>

          <Box className="content-wrap">
            {message && (
              <Alert severity="info" onClose={() => setMessage('')} className="app-alert">
                {message}
              </Alert>
            )}

            <Box className="live-strip">
              <StatPill icon={<DataObject />} label="Total" value={stats.total} />
              <StatPill icon={<TaskAlt />} label="Completed" value={stats.completed} />
              <StatPill icon={<Insights />} label="Review" value={stats.inReview} />
              <StatPill icon={<WarningAmber />} label="Urgent" value={stats.urgent} />
              <StatPill icon={<AutoAwesome />} label="Budget" value={dashboardMetrics.totalBudget} formatter={formatCurrency} />
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} xl={8.5}>
                <Paper className="control-panel">
                  <Box className="control-panel-heading">
                    <Box className="control-icon-badge">
                      <FilterList />
                    </Box>
                    <Box>
                      <Typography variant="h5">Browse records</Typography>
                      <Typography>Search, filter, sort, and manage projects with clarity.</Typography>
                    </Box>
                  </Box>

                  <Box className="control-grid">
                    <TextField
                      label="Search"
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
                    <Button variant="outlined" startIcon={<Refresh />} onClick={() => setFilters({ ...sortDefaults })}>
                      Reset
                    </Button>
                  </Box>
                </Paper>

                {loading && <LinearProgress className="loader" />}

                <Grid container spacing={2.5} className="project-grid">
                  {projects.map((project) => {
                    return (
                      <Grid item xs={12} md={6} key={project._id}>
                        <Paper className="project-card">
                          <Box className="card-glow" />
                          <Box className="card-shine" />

                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                            <Box className="card-title-wrap">
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap className="project-badges">
                                <Chip label={project.status} size="small" className={statusClass[project.status]} />
                                <Chip label={project.priority} size="small" className={priorityClass[project.priority]} />
                              </Stack>
                              <Typography variant="h5">{project.title}</Typography>
                              <Typography className="card-subtitle">{project.summary}</Typography>
                            </Box>

                            <Box className="card-budget">
                              <span>Budget</span>
                              <strong>{formatCurrency(project.budget)}</strong>
                            </Box>
                          </Stack>

                          <Box className="meta-strip">
                            <Box>
                              <Person />
                              <span>{project.studentName}</span>
                            </Box>
                            <Box>
                              <School />
                              <span>{project.rollNumber}</span>
                            </Box>
                            <Box>
                              <DataObject />
                              <span>{project.department}</span>
                            </Box>
                            <Box>
                              <CalendarMonth />
                              <span>{formatDate(project.dueDate)}</span>
                            </Box>
                          </Box>

                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="signal-row">
                            <Chip icon={<AutoAwesome />} label={`Mentor: ${project.mentor}`} className="mentor-chip" size="small" />
                          </Stack>

                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap className="tag-row">
                            {(project.tags || []).map((tag) => (
                              <Chip key={tag} icon={<LocalOffer />} label={tag} size="small" variant="outlined" />
                            ))}
                          </Stack>

                          <Divider />

                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5} className="card-actions">
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

                            <Stack direction="row" spacing={0.75}>
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
                    );
                  })}
                </Grid>

                {!loading && projects.length === 0 && (
                  <Paper className="empty-state">
                    <DataObject />
                    <Typography variant="h5">No matching records</Typography>
                    <Typography>Add a new project or adjust filters to see data here.</Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
                      Add project
                    </Button>
                  </Paper>
                )}
              </Grid>

              <Grid item xs={12} xl={3.5}>
                <Box className="side-rail">
                  <Paper className="side-panel">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Project flow</Typography>
                      <Chip label={`${dashboardMetrics.progress}%`} size="small" className="side-chip" />
                    </Stack>
                    <LinearProgress variant="determinate" value={dashboardMetrics.progress} className="side-progress" />
                    <Typography className="side-copy">
                      Track how quickly projects move from planning to completion.
                    </Typography>
                  </Paper>

                  <Paper className="side-panel">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Recent updates</Typography>
                      <Insights />
                    </Stack>
                    <Box className="recent-list">
                      {dashboardMetrics.recent.length ? (
                        dashboardMetrics.recent.map((project) => (
                          <Box className="recent-item" key={project._id}>
                            <strong>{project.title}</strong>
                            <span>{formatDate(project.updatedAt)}</span>
                          </Box>
                        ))
                      ) : (
                        <Typography className="side-copy">Recent activity will appear here after saving projects.</Typography>
                      )}
                    </Box>
                  </Paper>

                  <Paper className="side-panel side-panel-highlight">
                    <AutoAwesomeMotion />
                    <Typography variant="h6">Registry pulse</Typography>
                    <strong>{dashboardMetrics.active}</strong>
                    <Typography className="side-copy">Projects are currently in active progress.</Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="md" className="project-dialog">
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5">{editingId ? 'Edit project' : 'Add project'}</Typography>
              <Typography className="dialog-subtitle">Save clean project information into the registry.</Typography>
            </Box>
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
            {saving ? 'Saving' : 'Save record'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function StatPill({ icon, label, value, formatter }) {
  return (
    <Box className="stat-pill">
      <Box className="stat-pill-icon">{icon}</Box>
      <Box>
        <span>{label}</span>
        <strong>{formatter ? formatter(value) : value}</strong>
      </Box>
    </Box>
  );
}

export default App;
