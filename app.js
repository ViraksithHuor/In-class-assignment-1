const express = require('express');
const path = require('path');
const { create } = require('express-handlebars');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.disable('x-powered-by');

const hbs = create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    eq: function (a, b) {
      return a === b;
    }
  }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

global.reports = [];

// Routes

app.get('/', (req, res) => {
  res.render('index');
});


// REPORT FORM PAGE

app.get('/report', (req, res) => {
  res.render('report');
});


app.post('/report', upload.single('image'), (req, res) => {
  const { name, description, location, date, contact } = req.body;

  const itemImage = req.file;

  if (!name || !description || !location || !date || !contact || !itemImage) {
    return res.status(400).send('All fields including image are required.');
  }

  const newItem = {
    id: Date.now().toString(),
    name,
    description,
    location,
    date,
    contact,
    image: itemImage.filename,
    status: 'Lost'
  };

  global.reports.push(newItem);

  res.redirect('/dashboard');
});


// DASHBOARD

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { reports: global.reports });
});


// ITEM DETAIL

app.get('/items/:id', (req, res) => {
  const item = global.reports.find(r => r.id === req.params.id);

  if (!item) {
    return res.status(404).send('Item not found');
  }

  res.render('item-detail', { item });
});


// STATUS UPDATE

app.post('/items/:id/status', (req, res) => {
  const item = global.reports.find(r => r.id === req.params.id);

  if (!item) {
    return res.status(404).send('Item not found');
  }

  const { status } = req.body;

  if (!status || !['Lost', 'Found', 'Closed'].includes(status)) {
    return res.status(400).send('Invalid status');
  }

  item.status = status;

  res.redirect(`/items/${item.id}`);
});


// DELETE

app.post('/items/:id/delete', (req, res) => {
  const index = global.reports.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).send('Item not found');
  }

  global.reports.splice(index, 1);

  res.redirect('/dashboard');
});


app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});