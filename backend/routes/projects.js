const express = require('express');

const Project = require('../models/Project');

const router = express.Router();
const allowedSorts = ['-updatedAt', 'updatedAt', 'dueDate', '-dueDate', 'title', '-title', '-budget', 'budget'];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeProject = (body) => ({
  title: body.title,
  studentName: body.studentName,
  rollNumber: body.rollNumber,
  department: body.department,
  mentor: body.mentor,
  status: body.status,
  priority: body.priority,
  budget: Number(body.budget || 0),
  dueDate: body.dueDate,
  tags: Array.isArray(body.tags)
    ? body.tags
    : String(body.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
  summary: body.summary
});

router.get('/', async (req, res) => {
  try {
    const { search = '', status = '', department = '', priority = '', sort = '-updatedAt' } = req.query;
    const query = {};

    if (search) {
      const safeSearch = new RegExp(escapeRegex(search), 'i');
      query.$or = [
        { title: safeSearch },
        { studentName: safeSearch },
        { rollNumber: safeSearch },
        { mentor: safeSearch },
        { tags: safeSearch }
      ];
    }

    if (status) query.status = status;
    if (department) query.department = department;
    if (priority) query.priority = priority;

    const projects = await Project.find(query).sort(allowedSorts.includes(sort) ? sort : '-updatedAt');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats/overview', async (req, res) => {
  try {
    const [total, completed, inReview, urgent, departments] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'Completed' }),
      Project.countDocuments({ status: 'Review' }),
      Project.countDocuments({ priority: 'High' }),
      Project.distinct('department')
    ]);

    res.json({
      total,
      completed,
      inReview,
      urgent,
      departments: departments.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const project = await Project.create(normalizeProject(req.body));
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, normalizeProject(req.body), {
      new: true,
      runValidators: true
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
