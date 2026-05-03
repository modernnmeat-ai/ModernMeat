const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize database
const initDB = async () => {
  const exists = await fs.pathExists(DB_FILE);
  if (!exists) {
    const initialData = {
      users: [],
      inventory: [],
      orders: [],
      products: [],
      categories: [
        { id: 'mol', name: "Mol Go'shti" },
        { id: 'qoy', name: "Qo'y Go'shti" }
      ]
    };
    await fs.writeJson(DB_FILE, initialData, { spaces: 2 });
  } else {
    // Migration for existing DBs
    const data = await fs.readJson(DB_FILE);
    if (!data.categories) {
      data.categories = [
        { id: 'mol', name: "Mol Go'shti" },
        { id: 'qoy', name: "Qo'y Go'shti" }
      ];
      await fs.writeJson(DB_FILE, data, { spaces: 2 });
    }
  }
};

const getDB = () => fs.readJson(DB_FILE);
const saveDB = (data) => fs.writeJson(DB_FILE, data, { spaces: 2 });

// --- ROUTES ---

app.get('/', (req, res) => {
  res.send('ModernMeat Backend is running!');
});

// CATEGORIES
app.get('/api/categories', async (req, res) => {
  const db = await getDB();
  res.json(db.categories || []);
});

app.post('/api/categories', async (req, res) => {
  const db = await getDB();
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const newCat = {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name
  };
  if (!db.categories) db.categories = [];
  db.categories.push(newCat);
  await saveDB(db);
  res.json(newCat);
});

app.delete('/api/categories/:id', async (req, res) => {
  const db = await getDB();
  if (!db.categories) return res.json({ success: true });
  db.categories = db.categories.filter(c => c.id !== req.params.id);
  await saveDB(db);
  res.json({ success: true });
});

// USERS
app.get('/api/users', async (req, res) => {
  const db = await getDB();
  res.json(db.users);
});

app.post('/api/users/register', async (req, res) => {
  const { firstName, lastName, phone, password } = req.body;
  const db = await getDB();
  if (db.users.find(u => u.phone === phone)) {
    return res.status(400).json({ success: false, message: 'Bu raqam band!' });
  }
  const newUser = { id: Date.now().toString(), firstName, lastName, phone, password, registeredAt: new Date().toISOString(), isAdmin: false };
  db.users.push(newUser);
  await saveDB(db);
  res.json({ success: true, user: newUser });
});

app.post('/api/users/login', async (req, res) => {
  const { phone, password } = req.body;
  const db = await getDB();

  // 1. Check Hardcoded Super Admin (Master account)
  const ADMIN_PHONE = '+998500089912';
  const ADMIN_PASS = 'FRONTOZA1976';

  if (phone === ADMIN_PHONE && password === ADMIN_PASS) {
    return res.json({
      success: true,
      user: { id: 'super-admin', firstName: 'Abdulloh', lastName: 'Solihov', phone: ADMIN_PHONE, isAdmin: true, isSuperAdmin: true }
    });
  }

  // 2. Check Database Users
  const user = db.users.find(u => u.phone === phone && u.password === password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Telefon raqam yoki parol noto\'g\'ri!' });
  }
});

// Admin management
app.patch('/api/users/:id/toggle-admin', async (req, res) => {
  const db = await getDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (user) {
    user.isAdmin = !user.isAdmin;
    await saveDB(db);
    res.json({ success: true, user });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.post('/api/users/admin-create', async (req, res) => {
  const { firstName, lastName, phone, password } = req.body;
  const db = await getDB();
  if (db.users.find(u => u.phone === phone)) {
    return res.status(400).json({ success: false, message: 'Bu raqam band!' });
  }
  const newUser = { 
    id: Date.now().toString(), 
    firstName, 
    lastName, 
    phone, 
    password, 
    registeredAt: new Date().toISOString(), 
    isAdmin: true 
  };
  db.users.push(newUser);
  await saveDB(db);
  res.json({ success: true, user: newUser });
});

// PRODUCTS
app.get('/api/products', async (req, res) => {
  const db = await getDB();
  res.json(db.products);
});

app.post('/api/products', async (req, res) => {
  const db = await getDB();
  const newProduct = { ...req.body, id: 'p' + Date.now() };
  db.products.push(newProduct);
  await saveDB(db);
  res.json(newProduct);
});

app.delete('/api/products/:id', async (req, res) => {
  const db = await getDB();
  db.products = db.products.filter(p => p.id !== req.params.id);
  await saveDB(db);
  res.json({ success: true });
});

app.patch('/api/products/:id', async (req, res) => {
  const db = await getDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    await saveDB(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// ORDERS
app.get('/api/orders', async (req, res) => {
  const db = await getDB();
  res.json(db.orders);
});

app.post('/api/orders', async (req, res) => {
  const db = await getDB();
  const newOrder = { ...req.body, id: 'ORD-' + Date.now(), createdAt: new Date().toISOString(), status: 'pending' };
  db.orders.unshift(newOrder);
  await saveDB(db);
  res.json(newOrder);
});

app.patch('/api/orders/:id', async (req, res) => {
  const db = await getDB();
  const order = db.orders.find(o => o.id === req.params.id);
  if (order) {
    order.status = req.body.status;
    await saveDB(db);
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  const db = await getDB();
  db.orders = db.orders.filter(o => o.id !== req.params.id);
  await saveDB(db);
  res.json({ success: true });
});

// INVENTORY
app.get('/api/inventory', async (req, res) => {
  const db = await getDB();
  res.json(db.inventory);
});

app.post('/api/inventory', async (req, res) => {
  const db = await getDB();
  const newEntry = { ...req.body, id: 'inv-' + Date.now(), createdAt: new Date().toISOString() };
  db.inventory.unshift(newEntry);
  await saveDB(db);
  res.json(newEntry);
});

app.delete('/api/inventory/:id', async (req, res) => {
  const db = await getDB();
  db.inventory = db.inventory.filter(e => e.id !== req.params.id);
  await saveDB(db);
  res.json({ success: true });
});

initDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
  });

  // Handle server errors (e.g., port already in use)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${PORT} is already in use. Please kill the process using it or use a different port.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
}).catch(err => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});
