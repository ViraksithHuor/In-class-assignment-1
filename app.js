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
    eq: function(a, b) {
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

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

global.reports = [];

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/report', (req, res) => {
  res.render('report');
});

app.post('/report', (req, res) => {
  // TODO: handle file upload with multiparty and validate form data
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { reports: global.reports });
});

app.get('/items/:id', (req, res) => {
  const item = global.reports.find(r => r.id === req.params.id);
  res.render('item-detail', { item: item });
});

app.post('/items/:id/status', (req, res) => {
  // TODO: update status for item
  res.redirect('/dashboard');
});

app.post('/items/:id/delete', (req, res) => {
  // TODO: remove item from array
  res.redirect('/dashboard');
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
