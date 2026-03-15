const express = require('express');
const path = require('path');
const recipes = require('./data/recipes');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Force HTTPS for URL generation (Render proxy terminates SSL, so req.protocol is 'http')
function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  return `${protocol}://${req.get('host')}`;
}

// robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = getBaseUrl(req);
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

// sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = getBaseUrl(req);
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
  const baseUrl = getBaseUrl(req);
  res.render('index', {
    title: 'The Wooden Spoon — Simple Recipes, Real Stories',
    recipes,
    currentPath: '/',
    canonicalUrl: `${baseUrl}/`,
    ogImage: recipes[0] ? recipes[0].image : undefined,
  });
});

// About page
app.get('/about', (req, res) => {
  const baseUrl = getBaseUrl(req);
  res.render('about', {
    title: 'About — The Wooden Spoon',
    currentPath: '/about',
    metaDescription: 'Meet Sarah Chen, the home cook behind The Wooden Spoon. Tested recipes, honest stories, real food.',
    canonicalUrl: `${baseUrl}/about`,
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
  const baseUrl = getBaseUrl(req);
  res.render('recipe', {
    title: `${recipe.name} — The Wooden Spoon`,
    recipe,
    recipes,
    currentPath: req.path,
    metaDescription: recipe.description,
    ogType: 'article',
    ogImage: recipe.image,
    canonicalUrl: `${baseUrl}/recipes/${recipe.slug}`,
  });
});

// JSON-LD API endpoint (for programmatic access)
app.get('/api/recipes', (req, res) => {
  const baseUrl = getBaseUrl(req);
  res.json(recipes.map((r) => ({
    slug: r.slug,
    name: r.name,
    description: r.description,
    url: `${baseUrl}/recipes/${r.slug}`,
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
