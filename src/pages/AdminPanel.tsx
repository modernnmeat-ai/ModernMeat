import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Flame, Users, Package, ShoppingBag, BarChart3, LogOut,
  ChevronRight, Edit2, Trash2, Plus, X, CheckCircle, XCircle, Warehouse, Menu, UserCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OmborTab } from '../components/OmborTab';
import { useInventory } from '../context/InventoryContext';
import { useOrders, OrderStatus } from '../context/OrderContext';
import { useProducts, Product } from '../context/ProductContext';



type AdminTab = 'dashboard' | 'products' | 'users' | 'employees' | 'orders' | 'ombor';





export function AdminPanel() {
  const { user, logout, getAllUsers } = useAuth();
  const { getStock } = useInventory();
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory } = useProducts();
  const { items } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '', price: 0, category: '', image: '/images/wagyu.png', description: ''
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [notification, setNotification] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ firstName: '', lastName: '', phone: '', password: '' });
  const { toggleAdminStatus, createAdmin } = useAuth();

  const registeredUsers = getAllUsers();
  const customers = registeredUsers.filter(u => !u.isAdmin && !u.isSuperAdmin);
  const employees = registeredUsers.filter(u => u.isAdmin || u.isSuperAdmin);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleLogout = () => { logout(); navigate('/'); };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    showNotif('Mahsulot o\'chirildi');
  };

  const handleSaveEdit = async () => {
    if (!editProduct) return;
    await updateProduct(editProduct.id, editProduct);
    setEditProduct(null);
    showNotif('Mahsulot yangilandi');
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    const catToUse = newProduct.category || categories[0]?.id || '';
    addProduct({ ...newProduct, category: catToUse });
    setShowAddModal(false);
    setNewProduct({ name: '', price: 0, category: '', image: '/images/wagyu.png', description: '' });
    showNotif('Yangi mahsulot qo\'shildi');
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName);
    setNewCategoryName('');
    setShowCategoryModal(false);
    showNotif("Yangi kategoriya qo'shildi");
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.firstName || !newAdmin.phone || !newAdmin.password) {
      showNotif('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }
    const res = await createAdmin(newAdmin.firstName, newAdmin.lastName, newAdmin.phone, newAdmin.password);
    if (res.success) {
      setShowUserModal(false);
      setNewAdmin({ firstName: '', lastName: '', phone: '', password: '' });
      showNotif(res.message);
    } else {
      showNotif(res.message);
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    if (userId === 'super-admin') return; // Cannot revoke super admin
    const success = await toggleAdminStatus(userId);
    if (success) {
      showNotif('Foydalanuvchi roli o\'zgartirildi');
    } else {
      showNotif('Xatolik yuz berdi');
    }
  };

  const stockData = getStock(categories);
  const omborRemaining = stockData.reduce((s, x) => s + x.remaining, 0);

  const stats = [
    { label: 'Jami Mahsulotlar', value: products.length, icon: <Package size={24} />, color: '#D4AF37' },
    { label: 'Ro\'yxatdagi Foydalanuvchilar', value: registeredUsers.length, icon: <Users size={24} />, color: '#4CAF50' },
    { label: 'Buyurtmalar', value: orders.length, icon: <ShoppingBag size={24} />, color: '#2196F3' },
    { label: 'Omborda Qolgan', value: `${omborRemaining.toFixed(1)} kg`, icon: <Warehouse size={24} />, color: '#FF9800' },
  ];

  return (
    <div className="admin-layout">
      {/* Notification */}
      {notification && (
        <div className="admin-notification">
          <CheckCircle size={16} /> {notification}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="admin-mobile-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">
          <Flame color="#D4AF37" size={28} />
          <span>Admin Panel</span>
        </div>
        <div className="admin-user-info">
          <div className="admin-user-avatar">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <div className="admin-user-name">{user?.firstName} {user?.lastName}</div>
            <div className="admin-user-role">Administrator</div>
          </div>
        </div>

        <nav className="admin-nav">
          {([
            { tab: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
            { tab: 'products', label: 'Mahsulotlar', icon: <Package size={20} /> },
            { tab: 'users', label: 'Foydalanuvchilar', icon: <Users size={20} /> },
            { tab: 'employees', label: 'Ishchilar', icon: <UserCheck size={20} /> },
            { tab: 'orders', label: 'Buyurtmalar', icon: <ShoppingBag size={20} /> },
            { tab: 'ombor', label: 'Ombor', icon: <Warehouse size={20} /> },
          ] as const).map(item => (
            <button
              key={item.tab}
              className={`admin-nav-item ${activeTab === item.tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.tab); setIsMobileSidebarOpen(false); }}
            >
              {item.icon}
              <span>{item.label}</span>
              <ChevronRight size={16} className="nav-chevron" />
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item admin-logout-btn" onClick={() => navigate('/')}>
            <Flame size={20} />
            <span>Saytga o'tish</span>
          </button>
          <button className="admin-nav-item admin-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="admin-mobile-menu-btn" onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}>
              <Menu size={24} />
            </button>
            <h1 className="admin-page-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'products' && 'Mahsulotlar'}
              {activeTab === 'users' && 'Foydalanuvchilar'}
              {activeTab === 'employees' && 'Ishchilar'}
              {activeTab === 'orders' && 'Buyurtmalar'}
              {activeTab === 'ombor' && '🏪 Ombor — Kirim / Chiqim'}
            </h1>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-date">
              {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="admin-content">
            <div className="admin-stats-grid">
              {stats.map((s, i) => (
                <div className="admin-stat-card" key={i} style={{ '--accent': s.color } as React.CSSProperties}>
                  <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="admin-dashboard-bottom">
              <div className="admin-recent-card">
                <h3>So'nggi Buyurtmalar</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mijoz</th>
                        <th>Mahsulotlar</th>
                        <th>Summa</th>
                        <th>Holat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td>{o.userName}</td>
                          <td>{o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                          <td className="order-price">{o.totalPrice.toLocaleString()} so'm</td>
                          <td>
                            <span className={`status-badge status-${o.status}`}>
                              {o.status === 'completed' ? 'Bajarildi' : o.status === 'pending' ? 'Kutmoqda' : o.status === 'processing' ? 'Jarayonda' : 'Bekor qilindi'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-recent-card">
                <h3>Savat Ma'lumotlari</h3>
                {items.length === 0 ? (
                  <div className="admin-empty">Hozir savat bo'sh</div>
                ) : (
                  <table className="admin-table">
                    <thead><tr><th>Mahsulot</th><th>Miqdor</th><th>Narx</th></tr></thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td className="order-price">{(item.price * item.quantity).toLocaleString()} so'm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div className="admin-content">
            <div className="admin-actions-bar">
              <span className="admin-count">{products.length} ta mahsulot, {categories.length} ta toifa</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="admin-add-btn" style={{ background: '#4CAF50' }} onClick={() => setShowCategoryModal(true)}>
                  <Plus size={18} /> Yangi Kategoriya
                </button>
                <button className="admin-add-btn" onClick={() => setShowAddModal(true)}>
                  <Plus size={18} /> Yangi Mahsulot
                </button>
              </div>
            </div>

            <div className="admin-categories-list" style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '10px' }}>
              {categories.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
                  <span>{c.name}</span>
                  <button onClick={() => { if(window.confirm('Kategoriyani o\'chirmoqchimisiz?')) deleteCategory(c.id); }} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', padding: '2px' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="admin-products-grid">
              {products.map(p => (
                <div className="admin-product-card" key={p.id}>
                  <div className="admin-product-img-wrap">
                    <img src={p.image} alt={p.name} />
                    <span className="admin-product-cat">{categories.find(c => c.id === p.category)?.name || p.category}</span>
                  </div>
                  <div className="admin-product-info">
                    <h4>{p.name}</h4>
                    <p className="admin-product-price">{p.price.toLocaleString()} so'm/kg</p>
                    <p className="admin-product-desc">{p.description}</p>
                  </div>
                  <div className="admin-product-actions">
                    <button className="admin-edit-btn" onClick={() => setEditProduct({ ...p })}>
                      <Edit2 size={16} /> Tahrirlash
                    </button>
                    <button className="admin-del-btn" onClick={() => handleDeleteProduct(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="admin-content">
            <div className="admin-actions-bar">
              <span className="admin-count">{customers.length} ta foydalanuvchi</span>
            </div>
            {customers.length === 0 ? (
              <div className="admin-empty-large">Hali hech kim ro'yxatdan o'tmagan</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-table-full">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ism Familiya</th>
                      <th>Telefon</th>
                      <th>Ro'yxat Sanasi</th>
                      <th>Amal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((u, i) => (
                      <tr key={u.id}>
                        <td>{i + 1}</td>
                        <td>
                          <strong>{u.firstName} {u.lastName}</strong>
                        </td>
                        <td>{u.phone}</td>
                        <td>{new Date(u.registeredAt || '').toLocaleDateString('uz-UZ')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="admin-edit-btn"
                              onClick={() => handleToggleAdmin(u.id)}
                              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            >
                              Admin qilish
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* EMPLOYEES */}
        {activeTab === 'employees' && (
          <div className="admin-content">
            <div className="admin-actions-bar">
              <span className="admin-count">{employees.length} ta ishchi</span>
              <button className="admin-add-btn" onClick={() => setShowUserModal(true)}>
                <Plus size={18} /> Yangi Admin
              </button>
            </div>
            {employees.length === 0 ? (
              <div className="admin-empty-large">Hali hech qanday ishchi qo'shilmagan</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-table-full">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ism Familiya</th>
                      <th>Telefon</th>
                      <th>Ro'yxat Sanasi</th>
                      <th>Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((u, i) => (
                      <tr key={u.id}>
                        <td>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong>{u.firstName} {u.lastName}</strong>
                            {u.isAdmin && <span className="status-badge status-processing" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>Admin</span>}
                            {u.isSuperAdmin && <span className="status-badge status-completed" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>Super</span>}
                          </div>
                        </td>
                        <td>{u.phone}</td>
                        <td>{new Date(u.registeredAt || '').toLocaleDateString('uz-UZ')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className={`admin-edit-btn ${u.isAdmin ? 'active' : ''}`}
                              onClick={() => handleToggleAdmin(u.id)}
                              disabled={u.isSuperAdmin}
                              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            >
                              {u.isAdmin ? 'Adminlikni olish' : 'Admin qilish'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className="admin-content">
            <div className="admin-actions-bar">
              <span className="admin-count">{orders.length} ta buyurtma</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table admin-table-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mijoz</th>
                    <th>Telefon</th>
                    <th>Mahsulotlar</th>
                    <th>Summa</th>
                    <th>Sana</th>
                    <th>Holat</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>{o.id}</td>
                      <td><strong>{o.userName}</strong></td>
                      <td>{o.userPhone}</td>
                      <td style={{maxWidth: '300px', fontSize: '0.85rem'}}>
                        {o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                      </td>
                      <td className="order-price">{o.totalPrice.toLocaleString()} so'm</td>
                      <td>{new Date(o.createdAt).toLocaleDateString('uz-UZ')}</td>
                      <td>
                        <select 
                          className={`status-select status-${o.status}`}
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                        >
                          <option value="pending">Kutmoqda</option>
                          <option value="processing">Jarayonda</option>
                          <option value="completed">Bajarildi</option>
                          <option value="cancelled">Bekor qilindi</option>
                        </select>
                      </td>
                      <td>
                        <button className="admin-del-btn" onClick={() => {
                          if(window.confirm('Buyurtmani o\'chirmoqchimisiz?')) deleteOrder(o.id);
                        }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OMBOR */}
        {activeTab === 'ombor' && (
          <div className="admin-content">
            <OmborTab />
          </div>
        )}
      </main>

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="admin-modal-overlay" onClick={() => setEditProduct(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Mahsulotni Tahrirlash</h3>
              <button onClick={() => setEditProduct(null)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="modal-field">
                <label>Nomi</label>
                <input value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
              </div>
              <div className="modal-field">
                <label>Narxi (so'm/kg)</label>
                <input type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: Number(e.target.value) })} />
              </div>
              <div className="modal-field">
                <label>Kategoriya</label>
                <select value={editProduct.category} onChange={e => setEditProduct({ ...editProduct, category: e.target.value })}>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-field">
                <label>Tavsif</label>
                <textarea value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} />
              </div>
              <div className="modal-field">
                <label>Rasm (URL yoki Fayl yuklash)</label>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <input value={editProduct.image} onChange={e => setEditProduct({ ...editProduct, image: e.target.value })} placeholder="https://example.com/image.jpg" />
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, (b64) => setEditProduct({ ...editProduct, image: b64 }))} />
                </div>
              </div>
              {editProduct.image && (
                <div className="modal-image-preview">
                  <img src={editProduct.image} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', marginTop: '10px', border: '1px solid #eee' }} />
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="modal-cancel" onClick={() => setEditProduct(null)}><XCircle size={16} /> Bekor</button>
              <button className="modal-save" onClick={handleSaveEdit}><CheckCircle size={16} /> Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Yangi Mahsulot Qo'shish</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="modal-field">
                <label>Nomi</label>
                <input placeholder="Mahsulot nomi" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
              </div>
              <div className="modal-field">
                <label>Narxi (so'm/kg)</label>
                <input type="number" placeholder="0" value={newProduct.price || ''} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
              </div>
              <div className="modal-field">
                <label>Kategoriya</label>
                <select value={newProduct.category || categories[0]?.id || ''} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-field">
                <label>Tavsif</label>
                <textarea placeholder="Mahsulot haqida..." value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
              </div>
              <div className="modal-field">
                <label>Rasm (URL yoki Fayl yuklash)</label>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <input placeholder="https://example.com/image.jpg" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, (b64) => setNewProduct({ ...newProduct, image: b64 }))} />
                </div>
              </div>
              {newProduct.image && (
                <div className="modal-image-preview">
                  <img src={newProduct.image} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', marginTop: '10px', border: '1px solid #eee' }} />
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="modal-cancel" onClick={() => setShowAddModal(false)}><XCircle size={16} /> Bekor</button>
              <button className="modal-save" onClick={handleAddProduct}><Plus size={16} /> Qo'shish</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Yangi Kategoriya Qo'shish</h3>
              <button onClick={() => setShowCategoryModal(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="modal-field">
                <label>Kategoriya Nomi</label>
                <input placeholder="Masalan: Tovuq Go'shti, Baliq..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="modal-cancel" onClick={() => setShowCategoryModal(false)}><XCircle size={16} /> Bekor</button>
              <button className="modal-save" onClick={handleAddCategory}><Plus size={16} /> Qo'shish</button>
            </div>
          </div>
        </div>
      )}
      {/* Add Admin Modal */}
      {showUserModal && (
        <div className="admin-modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Yangi Admin Qo'shish</h3>
              <button onClick={() => setShowUserModal(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="modal-field">
                <label>Ism</label>
                <input placeholder="Ism" value={newAdmin.firstName} onChange={e => setNewAdmin({ ...newAdmin, firstName: e.target.value })} />
              </div>
              <div className="modal-field">
                <label>Familiya</label>
                <input placeholder="Familiya" value={newAdmin.lastName} onChange={e => setNewAdmin({ ...newAdmin, lastName: e.target.value })} />
              </div>
              <div className="modal-field">
                <label>Telefon</label>
                <input placeholder="+998" value={newAdmin.phone} onChange={e => setNewAdmin({ ...newAdmin, phone: e.target.value })} />
              </div>
              <div className="modal-field">
                <label>Parol</label>
                <input type="password" placeholder="Parol" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="modal-cancel" onClick={() => setShowUserModal(false)}><XCircle size={16} /> Bekor</button>
              <button className="modal-save" onClick={handleAddAdmin}><Plus size={16} /> Qo'shish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
