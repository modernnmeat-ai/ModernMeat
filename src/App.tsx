import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { PullToRefresh } from './components/PullToRefresh';
import { Home } from './pages/Home';
import { Market } from './pages/Market';
import { LoginRegister } from './pages/LoginRegister';
import { AdminPanel } from './pages/AdminPanel';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <PullToRefresh>
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
        <Route path="/*" element={
          <>
            <Navbar />
            <Cart />
            <main style={{ minHeight: '80vh' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/market" element={<Market />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </PullToRefresh>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InventoryProvider>
          <OrderProvider>
            <ProductProvider>
              <CartProvider>
                <Router>
                  <AppRoutes />
                </Router>
              </CartProvider>
            </ProductProvider>
          </OrderProvider>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
