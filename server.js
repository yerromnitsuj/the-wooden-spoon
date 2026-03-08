const express = require('express');
const path = require('path');
const recipes = require('./data/recipes');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Home page
app.get('/', (req, res) => {
  res.render('index', {
    title: 'The Wooden Spoon — Simple Recipes, Real Stories',
    recipes,
    currentPath: '/',
  });
});

// About page
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About — The Wooden Spoon',
    currentPath: '/about',
  });
});

// Individual recipe page
app.get('/recipes/:slug', (req, res) => {
  const recipe = recipes.find((r) => r.slug === req.params.slug);
  if (!recipe) {
    return res.status(404).render('404', {
      title: 'Recipe Not Found — The Wooden Spoon',
      currentPath: req.path,
    });
  }
  res.render('recipe', {
    title: `${recipe.name} — The Wooden Spoon`,
    recipe,
    recipes,
    currentPath: req.path,
  });
});

// JSON-LD API endpoint (for programmatic access)
app.get('/api/recipes', (req, res) => {
  res.json(recipes.map((r) => ({
    slug: r.slug,
    name: r.name,
    description: r.description,
    url: `${req.protocol}://${req.get('host')}/recipes/${r.slug}`,
  })));
});

app.get('/api/recipes/:slug', (req, res) => {
  const recipe = recipes.find((r) => r.slug === req.params.slug);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  res.json(recipe);
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found — The Wooden Spoon',
    currentPath: req.path,
  });
});

app.listen(PORT, () => {
  console.log(`The Wooden Spoon is running at http://localhost:${PORT}`);
});
