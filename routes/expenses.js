// File: routes/expenses.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json({ success: true, data: expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', async (req, res) => {
    const { amount, description, paid_by, participants, share_type, shares } = req.body;
    if (!amount || amount < 0 || !description || !paid_by || !participants.length) {
        return res.status(400).json({ success: false, message: 'Invalid input fields' });
    }
    try {
        const newExpense = new Expense({ amount, description, paid_by, participants, share_type, shares });
        await newExpense.save();
        res.status(201).json({ success: true, data: newExpense, message: 'Expense added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Expense.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;