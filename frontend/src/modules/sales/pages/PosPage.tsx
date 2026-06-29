// ============================================
// GOCus — Page: Punto de Venta (POS)
// ============================================

import { useState } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  FileText,
  Calendar,
  Ruler,
  X,
  Smartphone,
} from 'lucide-react';
import '../../../styles/pos.css';

// ── Types ──
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

// ── Category Definitions ──
const CATEGORIES = [
  { key: 'all', label: 'Todos', icon: <Ruler size={14} /> },
  { key: 'starlink', label: 'Starlink', icon: <Smartphone size={14} /> },
  { key: 'redes', label: 'Redes', icon: <Smartphone size={14} /> },
  { key: 'proteccion', label: 'Protección', icon: <Smartphone size={14} /> },
  { key: 'cables', label: 'Cables', icon: <Smartphone size={14} /> },
  { key: 'solar', label: 'Solar', icon: <Smartphone size={14} /> },
  { key: 'perifericos', label: 'Periféricos', icon: <Smartphone size={14} /> },
];

// ── Mock Products ──
const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'STARLINK MINI INTERNET SATELITAL', price: 990.00, stock: 10, category: 'starlink' },
  { id: '2', name: 'FORZA FVR-902 ESTABILIZADOR 900 VA', price: 65.00, stock: 25, category: 'proteccion' },
  { id: '3', name: 'ROUTER TP-LINK ARCHER C50 AC1200', price: 120.00, stock: 5, category: 'redes' },
  { id: '4', name: 'CABLE RED CAT6 30M EXTERIOR', price: 45.00, stock: 50, category: 'cables' },
  { id: '5', name: 'PANEL SOLAR 550W MONOCRISTALINO', price: 750.00, stock: 8, category: 'solar' },
  { id: '6', name: 'MOUSE LOGITECH G502 HERO', price: 185.00, stock: 15, category: 'perifericos' },
  { id: '7', name: 'TECLADO REDRAGON KUMARA K552 RGB', price: 135.00, stock: 12, category: 'perifericos' },
  { id: '8', name: 'SWITCH TP-LINK 8 PUERTOS GIGABIT', price: 85.00, stock: 20, category: 'redes' },
  { id: '9', name: 'UPS FORZA NT-751 750VA INTERACTIVO', price: 210.00, stock: 7, category: 'proteccion' },
  { id: '10', name: 'CABLE HDMI 2.1 3M ULTRA HD 8K', price: 35.00, stock: 40, category: 'cables' },
  { id: '11', name: 'STARLINK STANDARD KIT COMPLETO', price: 1599.00, stock: 3, category: 'starlink' },
  { id: '12', name: 'INVERSOR SOLAR 3KW HÍBRIDO', price: 2800.00, stock: 4, category: 'solar' },
];

export const PosPage = () => {
  // ── State ──
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [customerDoc, setCustomerDoc] = useState('');
  const [customerName, setCustomerName] = useState('CLIENTE VARIOS');
  const [documentType, setDocumentType] = useState('BOLETA');
  const [serie, setSerie] = useState('B001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // ── Customer lookup simulation ──
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerDoc(val);
    if (val.length === 8) {
      setCustomerName('JUAN PEREZ (Búsqueda API)');
    } else if (val.length === 11) {
      setCustomerName('EMPRESA EJEMPLO S.A.C.');
      setDocumentType('FACTURA');
      setSerie('F001');
    } else {
      setCustomerName('CLIENTE VARIOS');
    }
  };

  // ── Filter products ──
  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // ── Cart operations ──
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQ = item.quantity + delta;
          return newQ > 0 ? { ...item, quantity: newQ } : item;
        }
        return item;
      }),
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // ── Calculations ──
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const igv = subtotal - subtotal / 1.18;
  const total = subtotal;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Process sale ──
  const handleProcessSale = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const payload = {
        documentType,
        serie,
        date,
        customer: { doc: customerDoc, name: customerName },
        paymentMethod,
        items: cart.map((c) => ({ productId: c.id, quantity: c.quantity, unitPrice: c.price })),
      };
      console.log('Sending payload:', payload);
      await new Promise((r) => setTimeout(r, 1000));
      alert('✅ Venta procesada exitosamente!');
      setCart([]);
      setCustomerDoc('');
      setCustomerName('CLIENTE VARIOS');
      setShowMobileCart(false);
    } catch (error) {
      console.error(error);
      alert('❌ Error procesando venta');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Cart Content (shared between desktop and mobile) ──
  const renderCartContent = () => (
    <>
      {/* Cart Header */}
      <div className="pos__cart-header">
        <div className="pos__cart-title-bar">
          <span className="pos__cart-title">
            <ShoppingCart size={18} />
            Carrito
            {totalItems > 0 && <span className="pos__cart-badge">{totalItems}</span>}
          </span>
          {cart.length > 0 && (
            <button className="pos__cart-clear" onClick={clearCart}>
              Vaciar
            </button>
          )}
        </div>

        {/* Customer */}
        <div className="pos__customer">
          <div className="pos__customer-avatar">
            <User size={18} />
          </div>
          <div className="pos__customer-fields">
            <input
              type="text"
              placeholder="DNI / RUC del cliente"
              value={customerDoc}
              onChange={handleDocChange}
              className="pos__customer-input"
            />
            <div className="pos__customer-name">{customerName}</div>
          </div>
        </div>

        {/* Document Info */}
        <div className="pos__doc-row">
          <div className="pos__doc-field">
            <label className="pos__doc-label">
              <FileText size={10} /> Tipo
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="pos__doc-select"
            >
              <option value="BOLETA">Boleta</option>
              <option value="FACTURA">Factura</option>
            </select>
          </div>
          <div className="pos__doc-field">
            <label className="pos__doc-label">
              <FileText size={10} /> Serie
            </label>
            <input
              type="text"
              value={serie}
              onChange={(e) => setSerie(e.target.value.toUpperCase())}
              className="pos__doc-input"
            />
          </div>
          <div className="pos__doc-field">
            <label className="pos__doc-label">
              <Calendar size={10} /> Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pos__doc-input"
            />
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="pos__cart-items">
        {cart.length === 0 ? (
          <div className="pos__cart-empty">
            <ShoppingCart size={48} className="pos__cart-empty-icon" />
            <span className="pos__cart-empty-text">El carrito está vacío</span>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="pos__cart-item">
              <div className="pos__cart-item-info">
                <div className="pos__cart-item-name">{item.name}</div>
                <div className="pos__cart-item-price">S/ {item.price.toFixed(2)} c/u</div>
              </div>
              <div className="pos__qty-controls">
                <button className="pos__qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                  <Minus size={14} />
                </button>
                <span className="pos__qty-value">{item.quantity}</span>
                <button className="pos__qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                  <Plus size={14} />
                </button>
              </div>
              <div className="pos__cart-item-subtotal">
                S/ {(item.price * item.quantity).toFixed(2)}
              </div>
              <button className="pos__cart-item-remove" onClick={() => removeItem(item.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Checkout */}
      <div className="pos__checkout">
        {/* Payment Methods */}
        <div className="pos__payment-methods">
          <button
            className={`pos__payment-btn ${paymentMethod === 'CASH' ? 'pos__payment-btn--active' : ''}`}
            onClick={() => setPaymentMethod('CASH')}
          >
            <Banknote size={16} /> Efectivo
          </button>
          <button
            className={`pos__payment-btn ${paymentMethod === 'CARD' ? 'pos__payment-btn--active' : ''}`}
            onClick={() => setPaymentMethod('CARD')}
          >
            <CreditCard size={16} /> Tarjeta
          </button>
          <button
            className={`pos__payment-btn ${paymentMethod === 'TRANSFER' ? 'pos__payment-btn--active' : ''}`}
            onClick={() => setPaymentMethod('TRANSFER')}
          >
            <Smartphone size={16} /> Yape/Plin
          </button>
        </div>

        {/* Totals */}
        <div className="pos__totals">
          <div className="pos__total-row">
            <span>Subtotal</span>
            <span>S/ {(total - igv).toFixed(2)}</span>
          </div>
          <div className="pos__total-row">
            <span>IGV (18%)</span>
            <span>S/ {igv.toFixed(2)}</span>
          </div>
          <div className="pos__total-row pos__total-row--grand">
            <span className="pos__total-label--grand">Total</span>
            <span className="pos__total-value--grand">S/ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Process Button */}
        <button
          className="pos__process-btn"
          onClick={handleProcessSale}
          disabled={cart.length === 0 || isProcessing}
        >
          {isProcessing ? (
            'Procesando...'
          ) : (
            <>
              <Printer size={20} />
              COBRAR E IMPRIMIR
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="pos">
      {/* ── Products Panel ── */}
      <div className="pos__products">
        {/* Search */}
        <div className="pos__search">
          <Search size={20} className="pos__search-icon" />
          <input
            type="text"
            placeholder="Escanea código de barras o busca producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pos__search-input"
            autoFocus
          />
        </div>

        {/* Category Pills */}
        <div className="pos__categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`pos__category-pill ${activeCategory === cat.key ? 'pos__category-pill--active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="pos__grid-wrapper">
          <div className="pos__grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="pos__product-card"
                onClick={() => addToCart(product)}
              >
                <div>
                  <div className="pos__product-name">{product.name}</div>
                  <div className="pos__product-stock">Stock: {product.stock} uds.</div>
                </div>
                <div className="pos__product-footer">
                  <span className="pos__product-price">S/ {product.price.toFixed(2)}</span>
                  <span className="pos__product-add">
                    <Plus size={16} />
                  </span>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                <Search size={40} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 600 }}>No se encontraron productos</p>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                  Intenta con otro término de búsqueda o categoría
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop Cart Panel ── */}
      <div className="pos__cart">
        {renderCartContent()}
      </div>

      {/* ── Mobile: Floating Cart Button ── */}
      {!showMobileCart && (
        <button
          className="pos__mobile-fab"
          onClick={() => setShowMobileCart(true)}
        >
          <ShoppingCart size={20} />
          {totalItems > 0 ? (
            <>
              S/ {total.toFixed(2)}
              <span className="pos__mobile-fab-badge">{totalItems}</span>
            </>
          ) : (
            'Ver Carrito'
          )}
        </button>
      )}

      {/* ── Mobile: Cart Bottom Sheet ── */}
      {showMobileCart && (
        <>
          <div
            className="pos__mobile-overlay pos__mobile-overlay--visible"
            onClick={() => setShowMobileCart(false)}
          />
          <div className="pos__mobile-cart-sheet pos__mobile-cart-sheet--visible">
            <div className="pos__mobile-cart-handle" />
            <button
              onClick={() => setShowMobileCart(false)}
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              <X size={20} />
            </button>
            {renderCartContent()}
          </div>
        </>
      )}
    </div>
  );
};
