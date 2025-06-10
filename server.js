const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const expenseRoutes = require('./routes/expenses');
const settlementRoutes = require('./routes/settlements');
const Expense = require('./models/Expense');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    const expenses = await Expense.find();
    res.render('index', { expenses });
});

app.post('/expenses', async (req, res) => {
    const { amount, description, paid_by, participants } = req.body;
    await Expense.create({
        amount,
        description,
        paid_by,
        participants: participants.split(',').map(p => p.trim()),
        share_type: 'equal',
        shares: []
    });
    res.redirect('/');
});


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.use('/expenses', expenseRoutes);
app.use('/', settlementRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
