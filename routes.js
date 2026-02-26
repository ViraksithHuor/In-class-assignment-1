const express = require('express');
const router = express.Router();
const state = require('./data');

router.post('/report', (req, res) => {
    const { name, description, locationLost, date, contactEmail } = req.body;
    const itemImage = req.file;

    if (!name || !description || !locationLost || !date || !contactEmail || !itemImage) {
        return res.status(400).json({ error: 'All fields including image are required' });
    }

    const id = state.items.length + 1;

    const newItem = {
        id,
        name,
        description,
        locationLost,
        date,
        contactEmail,
        image: itemImage.filename,
        status: 'Lost'
    };

    state.items.push(newItem);

    res.status(201).json(newItem);
});

router.get('/report' , (req, res) => {
    res.json({ message: 'Report received' });
});

router.get('/dashboard' , (req, res) => {
    const summary = state.items.map(item => ({
        id: item.id,
        name: item.name,
        date: item.date,
        status: item.status
    }));

    res.json(summary);
});

router.post('/items/:id/status' , (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status || (status !== 'Lost' && status !== 'Found')) {
        return res.status(400).json({ error: 'Status must be either "Lost" or "Found"' });
    }

    const item = state.items.find(i => i.id === id);

    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }

    item.status = status;
    
    res.json(item);
});

router.post('/items/:id/delete', (req, res) => {
    const id = Number(req.params.id);

    const index = state.items.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Item not found' });
    }

    state.items.splice(index, 1);

    res.json({ message: 'Item deleted successfully' });
});

router.get('/items/:id' , (req, res) => {
    const id = Number(req.params.id);
    const item = state.items.find(i => i.id === id);

    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
});