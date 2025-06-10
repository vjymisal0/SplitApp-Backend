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
app.use(express.static('public'));



mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));


app.get('/', async (req, res) => {
    const expenses = await Expense.find();
    res.render('index', { expenses });
});

app.post('/expenses', async (req, res) => {
    const { amount, description, paid_by, participants, share_type, shares } = req.body;

    const parsedParticipants = participants.split(',').map(p => p.trim());
    let parsedShares = [];

    if (share_type !== 'equal' && shares) {
        parsedShares = shares.split(',').map(pair => {
            const [person, value] = pair.split(':');
            return { person: person.trim(), value: parseFloat(value) };
        });
    }

    await Expense.create({
        amount,
        description,
        paid_by,
        participants: parsedParticipants,
        share_type,
        shares: parsedShares
    });

    res.redirect('/');
});

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// editing expenses

app.get('/edit/:id', async (req, res) => {
    const expense = await Expense.findById(req.params.id);
    res.render('edit', { expense });
});

app.put('/expenses/:id', async (req, res) => {
    const { amount, description, paid_by, participants, share_type, shares } = req.body;

    const parsedParticipants = participants.split(',').map(p => p.trim());
    let parsedShares = [];

    if (share_type !== 'equal' && shares) {
        parsedShares = shares.split(',').map(pair => {
            const [person, value] = pair.split(':');
            return { person: person.trim(), value: parseFloat(value) };
        });
    }

    await Expense.findByIdAndUpdate(req.params.id, {
        amount,
        description,
        paid_by,
        participants: parsedParticipants,
        share_type,
        shares: parsedShares
    });

    res.redirect('/');
});

app.delete('/expenses/:id', async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.redirect('/');
});





// settlements:

// Utility function for balance calculations
const calculateBalances = (expenses) => {
    const balances = {};
    expenses.forEach(exp => {
        const share = exp.share_type === 'equal'
            ? exp.amount / exp.participants.length
            : null;

        exp.participants.forEach(part => {
            if (!balances[part]) balances[part] = 0;
            balances[part] -= share ?? 0;
        });

        if (!balances[exp.paid_by]) balances[exp.paid_by] = 0;
        balances[exp.paid_by] += exp.amount;
    });
    return balances;
};

// Simplify settlements
const simplify = (balancesObj) => {
    const settlements = [];
    const balances = Object.entries(balancesObj)
        .map(([person, balance]) => ({ person, balance }))
        .filter(entry => entry.balance !== 0);

    balances.sort((a, b) => a.balance - b.balance);

    let i = 0, j = balances.length - 1;
    while (i < j) {
        const owe = balances[i];
        const receive = balances[j];
        const settledAmount = Math.min(-owe.balance, receive.balance);
        if (settledAmount > 0) {
            settlements.push({
                from: owe.person,
                to: receive.person,
                amount: settledAmount.toFixed(2)
            });
            owe.balance += settledAmount;
            receive.balance -= settledAmount;
        }
        if (owe.balance === 0) i++;
        if (receive.balance === 0) j--;
    }
    return settlements;
};

// Route for frontend
app.get('/summary', async (req, res) => {
    const expenses = await Expense.find();
    const balances = calculateBalances(expenses);
    const settlements = simplify(balances);
    res.render('summary', { balances, settlements });
});




app.use('/expenses', expenseRoutes);
app.use('/', settlementRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
