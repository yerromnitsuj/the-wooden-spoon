const express = require('express');
const path = require('path');
const recipes = require('./data/recipes');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

// sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: '/', changefreq: 'weekly', priority: '0.5' },
    { loc: '/about', changefreq: 'monthly', priority: '0.5' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static pages
  for (const page of staticPages) {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  // Recipe pages
  for (const recipe of recipes) {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/recipes/${recipe.slug}</loc>\n`;
    xml += `    <lastmod>${recipe.datePublished || today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

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
