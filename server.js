const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Render uses dynamic PORT (important!)
const PORT = process.env.PORT || 5000;

// Database file
const DB_FILE = path.join(__dirname, 'products-db.json');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static website (HTML, CSS, JS)
app.use(express.static(__dirname));

// Initialize DB if not found
async function initDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ products: [] }, null, 2));
  }
}

/* ----------------------- API ROUTES ----------------------- */

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    res.json(JSON.parse(data).products);
  } catch (err) {
    res.status(500).json({ error: 'Error reading product database' });
  }
});

// Save products (overwrite file)
app.post('/api/products', async (req, res) => {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify({ products: req.body }, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error saving product database' });
  }
});

/* ---------------- SERVER-SIDE ADMIN PAGES ----------------- */

// Admin panel (no JS version)
app.get('/admin/products-server', async (req, res) => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const products = JSON.parse(data).products;

    let html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Admin - Products</title>
  <link rel="stylesheet" href="/assets/css/styles.css"/>
</head>
<body>
  <h1>Manage Products (Server Side)</h1>

  <form method="POST" action="/admin/products-server/save">
    <input type="hidden" name="id" value="">
    <label>Title <input name="title" required></label>
    <label>Category <input name="category"></label>
    <label>Price <input type="number" step="0.01" name="price"></label>
    <label>Image URL <input name="image"></label>
    <label>Description <textarea name="description"></textarea></label>
    <button type="submit">Save</button>
  </form>

  <h2>Products</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;">
  `;

    for (let p of products) {
      html += `
      <div style="border:1px solid #ccc;padding:10px;border-radius:8px;">
        <img src="${p.image}" style="width:100%;height:120px;object-fit:cover;">
        <h3>${p.title}</h3>
        <p>₹${p.price} | ${p.category}</p>
        <p>${p.description}</p>

        <form method="GET" action="/admin/products-server/edit/${p.id}">
          <button>Edit</button>
        </form>

        <form method="POST" action="/admin/products-server/delete/${p.id}">
          <button onclick="return confirm('Delete?')">Delete</button>
        </form>
      </div>
      `;
    }

    html += "</div></body></html>";

    res.send(html);
  } catch (e) {
    res.status(500).send("Error loading admin page");
  }
});

// Edit product page
app.get('/admin/products-server/edit/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const db = JSON.parse(data);
    const p = db.products.find(x => x.id === req.params.id);

    if (!p) return res.redirect('/admin/products-server');

    let html = `
<!doctype html>
<html>
<head><meta charset="utf-8"/><title>Edit Product</title></head>
<body>
  <h1>Edit Product</h1>
  <form method="POST" action="/admin/products-server/save">
    <input type="hidden" name="id" value="${p.id}">
    <label>Title <input name="title" value="${p.title}" required></label>
    <label>Category <input name="category" value="${p.category}"></label>
    <label>Price <input type="number" step="0.01" name="price" value="${p.price}"></label>
    <label>Image URL <input name="image" value="${p.image}"></label>
    <label>Description <textarea name="description">${p.description}</textarea></label>
    <button type="submit">Update</button>
  </form>
</body>
</html>`;
    res.send(html);
  } catch (err) {
    res.status(500).send("Error loading product");
  }
});

// Save / update product
app.post('/admin/products-server/save', async (req, res) => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const db = JSON.parse(data);

    const id = req.body.id || "p" + Date.now();

    const product = {
      id,
      title: req.body.title,
      category: req.body.category,
      price: parseFloat(req.body.price),
      image: req.body.image,
      description: req.body.description
    };

    const index = db.products.findIndex(x => x.id === id);

    if (index >= 0) db.products[index] = product;
    else db.products.unshift(product);

    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
    res.redirect('/admin/products-server');
  } catch {
    res.status(500).send('Error saving');
  }
});

// Delete
app.post('/admin/products-server/delete/:id', async (req, res) => {
  try {
    const db = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
    db.products = db.products.filter(p => p.id !== req.params.id);

    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
    res.redirect('/admin/products-server');
  } catch {
    res.status(500).send('Error deleting');
  }
});

/* ---------------------- START SERVER ---------------------- */

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log("Server running on port " + PORT);
  });
});