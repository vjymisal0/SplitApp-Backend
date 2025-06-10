// File: routes/settlements.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

function calculateBalances(expenses) {
    const balances = {};
    expenses.forEach(exp => {
        const share = exp.amount / exp.participants.length;
        exp.participants.forEach(person => {
            if (!balances[person]) balances[person] = 0;
            balances[person] -= share;
        });
        if (!balances[exp.paid_by]) balances[exp.paid_by] = 0;
        balances[exp.paid_by] += exp.amount;
    });
    return balances;
}

router.get('/balances', async (req, res) => {
    try {
        const expenses = await Expense.find();
        const balances = calculateBalances(expenses);
        res.json({ success: true, data: balances });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/settlements', async (req, res) => {
    try {
        const expenses = await Expense.find();
        const balances = calculateBalances(expenses);
        const debtors = Object.entries(balances).filter(([_, v]) => v < 0).map(([k, v]) => [k, -v]);
        const creditors = Object.entries(balances).filter(([_, v]) => v > 0);

        let settlements = [];
        debtors.forEach(([debtor, debt]) => {
            creditors.forEach(([creditor, credit], i) => {
                if (debt > 0 && credit > 0) {
                    const amount = Math.min(debt, credit);
                    settlements.push({ from: debtor, to: creditor, amount: +amount.toFixed(2) });
                    debt -= amount;
                    creditors[i][1] -= amount;
                }
            });
        });
        res.json({ success: true, data: settlements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/people', async (req, res) => {
    try {
        const expenses = await Expense.find();
        const people = new Set();
        expenses.forEach(e => {
            e.participants.forEach(p => people.add(p));
            people.add(e.paid_by);
        });
        res.json({ success: true, data: [...people] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
