// ============================================
// GOCus — Page: Punto de Venta (POS)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  createSale,
  fetchSalePdfBlob,
  type Sale,
  type SaleDocumentType,
  type PaymentMethod,
} from '../../../api/sales';
import {
  getProducts,
  type Product as ApiProduct,
} from '../../../api/products';
import { storage } from '../../../utils/storage';
import { STORAGE_KEYS, API_URL } from '../../../utils/constants';
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
  CheckCircle2,
  Download,
  MessageCircle,
  PlusCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import '../../../styles/pos.css';

// ── Types ──
interface PosProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  categoryId: string | null;
  unit: string;
}

interface CartItem extends PosProduct {
  quantity: number;
}

// ── Category Definitions ──
const DEFAULT_CATEGORIES = [
  { key: 'all', label: 'Todos', icon: <Ruler size={14} /> },
];

export const PosPage = () => {
  // ── State ──
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [customerDoc, setCustomerDoc] = useState('');
  const [customerName, setCustomerName] = useState('CLIENTE VARIOS');
  const [documentType, setDocumentType] = useState<SaleDocumentType>('BOLETA');
  const [serie, setSerie] = useState('B001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // ── Load products from API ──
  const loadProducts = useCallback(async (search?: string) => {
    try {
      setIsLoadingProducts(true);
      setLoadError(null);
      const apiProducts = await getProducts(search);
      
      // Transform API products to POS products
      const posProducts: PosProduct[] = apiProducts
        .filter((p) => p.isActive)
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.salePrice),
          stock: 999, // TODO: integrate with inventory when available
          category: p.category?.name || 'Sin categoría',
          categoryId: p.categoryId || null,
          unit: p.unit?.abbreviation || 'UND',
        }));

      setProducts(posProducts);

      // Build dynamic category list from loaded products
      const uniqueCategories = new Map<string, string>();
      posProducts.forEach((p) => {
        if (p.categoryId && p.category !== 'Sin categoría') {
          uniqueCategories.set(p.categoryId, p.category);
        }
      });

      const dynamicCategories = [
        { key: 'all', label: 'Todos', icon: <Ruler size={14} /> },
        ...Array.from(uniqueCategories.entries()).map(([id, name]) => ({
          key: id,
          label: name,
          icon: <Smartphone size={14} />,
        })),
      ];
      setCategories(dynamicCategories);
    } catch (err) {
      console.error('Error loading products:', err);
      setLoadError('No se pudieron cargar los productos. Verifica tu conexión.');
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    };
  }, [pdfPreviewUrl]);

  // ── Search with debounce ──
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        loadProducts(searchTerm);
      } else if (searchTerm.length === 0) {
        loadProducts();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, loadProducts]);

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

  // ── Filter products (local filter by category) ──
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'all' || p.categoryId === activeCategory;
    return matchesCategory;
  });

  // ── Cart operations ──
  const addToCart = (product: PosProduct) => {
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

  const closeSuccessModal = () => {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    setPdfPreviewUrl(null);
    setShowSuccessModal(false);
  };

  // ── Process sale ──
  const handleProcessSale = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const sale = await createSale({
        documentType,
        paymentMethod,
        items: cart.map((c) => ({
          productId: c.id,
          quantity: c.quantity,
          unitPrice: c.price,
        })),
      });

      // Use direct API URL with token to support iframe native features correctly
      const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
      const url = `${API_URL}/sales/${sale.id}/pdf?token=${token}`;

      setLastSale(sale);
      setPdfPreviewUrl(url);
      setCart([]);
      setShowSuccessModal(true);
      setShowMobileCart(false);
    } catch (error) {
      console.error(error);
      alert('❌ Error procesando venta. Revise la consola para más detalles.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!pdfPreviewUrl) return;
    const printWindow = window.open(pdfPreviewUrl, '_blank');
    printWindow?.addEventListener('load', () => printWindow.print());
  };

  const handleDownloadReceipt = () => {
    if (!pdfPreviewUrl || !lastSale) return;
    const link = document.createElement('a');
    // Remove the #toolbar=0 hash if present for the download link
    const cleanUrl = pdfPreviewUrl.split('#')[0];
    link.href = cleanUrl;
    link.download = `comprobante-${lastSale.series ?? 'DOC'}-${(lastSale.correlative ?? 0).toString().padStart(7, '0')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetPos = () => {
    closeSuccessModal();
    setCustomerDoc('');
    setCustomerName('CLIENTE VARIOS');
    setDocumentType('BOLETA');
    setSerie('B001');
    setLastSale(null);
  };

  const saleTotal = lastSale ? Number(lastSale.total) : total;

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
              onChange={(e) => setDocumentType(e.target.value as SaleDocumentType)}
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
            <>
              <Loader2 size={20} className="pos__spinner" />
              Procesando...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              PROCESAR VENTA
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
          {categories.map((cat) => (
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
            {isLoadingProducts ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                <Loader2 size={40} style={{ opacity: 0.4, marginBottom: '0.75rem', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontWeight: 600 }}>Cargando productos...</p>
              </div>
            ) : loadError ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-danger, #ef4444)' }}>
                <AlertCircle size={40} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 600 }}>{loadError}</p>
                <button
                  onClick={() => loadProducts()}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid currentColor',
                    background: 'transparent',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="pos__product-card"
                    onClick={() => addToCart(product)}
                  >
                    <div>
                      <div className="pos__product-name">{product.name}</div>
                      <div className="pos__product-stock">
                        {product.unit} | {product.category}
                      </div>
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
              </>
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

      {/* ── Success Modal ── */}
      {showSuccessModal && lastSale && pdfPreviewUrl && (
        <div className="pos__modal-overlay" onClick={closeSuccessModal}>
          <div className="pos__modal pos__modal--with-pdf" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="pos__modal-close"
              onClick={closeSuccessModal}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="pos__modal-header">
              <div className="pos__modal-icon-success">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="pos__modal-title">¡Venta Exitosa!</h2>
              <p className="pos__modal-subtitle">
                El comprobante se generó correctamente.
              </p>
              <div className="pos__modal-total">
                S/ {saleTotal.toFixed(2)}
              </div>
            </div>

            <div className="pos__pdf-preview">
              <iframe
                src={pdfPreviewUrl}
                title="Vista previa del comprobante"
                className="pos__pdf-iframe"
              />
            </div>

            <div className="pos__modal-actions">
              <button
                type="button"
                className="pos__modal-btn pos__modal-btn--primary"
                onClick={handlePrintReceipt}
              >
                <Printer size={18} />
                Imprimir Comprobante
              </button>

              <button
                type="button"
                className="pos__modal-btn pos__modal-btn--secondary"
                onClick={handleDownloadReceipt}
              >
                <Download size={18} />
                Descargar PDF
              </button>

              <button
                type="button"
                className="pos__modal-btn pos__modal-btn--whatsapp"
                onClick={() => {
                  const url = `https://wa.me/?text=Aquí%20tienes%20tu%20comprobante%20de%20GOCus%20por%20S/%20${saleTotal.toFixed(2)}`;
                  window.open(url, '_blank');
                }}
              >
                <MessageCircle size={18} />
                Enviar por WhatsApp
              </button>
            </div>

            <div className="pos__modal-footer">
              <button
                type="button"
                className="pos__modal-btn pos__modal-btn--outline"
                onClick={resetPos}
              >
                <PlusCircle size={18} />
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
