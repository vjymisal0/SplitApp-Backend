const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    amount: Number,
    description: String,
    paid_by: String,
    participants: [String],
    share_type: { type: String, default: 'equal' }, // equal | percentage | exact
    shares: [{ person: String, value: Number }]     // only if not equal
});

module.exports = mongoose.model('Expense', ExpenseSchema);
