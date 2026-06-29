import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Search, GitBranch } from 'lucide-react';
import { getWarehouses, deleteWarehouse } from '../../../api/warehouses';
import type { Warehouse } from '../../../api/warehouses';
import { WarehouseFormModal } from '../components/WarehouseFormModal';

export const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getWarehouses(1, 100);
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error loading warehouses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedWarehouse(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (warehouse: Warehouse) => {
    if (confirm(`¿Estás seguro de eliminar el almacén "${warehouse.name}"?`)) {
      try {
        await deleteWarehouse(warehouse.id);
        loadData();
      } catch (error) {
        console.error('Error deleting warehouse', error);
        alert('Error al eliminar');
      }
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  const filteredWarehouses = warehouses.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.branch?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn var(--duration-normal) var(--ease-out)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.03em' }}>
            <Package size={24} style={{ color: 'var(--color-brand)' }} /> Almacenes
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Controla los puntos de almacenamiento de inventario.</p>
        </div>
        <button 
          onClick={handleCreate}
          style={{
            background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
            color: 'var(--color-text-on-brand)', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none',
            cursor: 'pointer', fontSize: '0.8125rem', boxShadow: 'var(--shadow-brand)',
            transition: 'transform var(--duration-fast) var(--ease-spring), box-shadow var(--duration-normal)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Plus size={18} /> Nuevo Almacén
        </button>
      </div>

      <div style={{
        flex: 1, background: 'var(--color-bg-raised)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o sucursal..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)',
                fontSize: '0.8125rem', transition: 'border-color var(--duration-fast)',
              }}
            />
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead style={{ background: 'var(--color-bg-inset)', position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Almacén</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Sucursal</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Dirección</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Estado</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando almacenes...</td>
                </tr>
              ) : filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No se encontraron almacenes.</td>
                </tr>
              ) : (
                filteredWarehouses.map(warehouse => (
                  <tr key={warehouse.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background var(--duration-fast)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-inset)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--color-brand-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand)', fontWeight: 700 }}>
                          <Package size={16} />
                        </div>
                        <div>
                          <div>{warehouse.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <GitBranch size={14} />
                        <span>{warehouse.branch?.name || '-'}</span>
                      </div>
                      {warehouse.branch?.company && (
                        <div style={{ fontSize: '0.6875rem', marginTop: '2px', marginLeft: '1.25rem' }}>
                          {warehouse.branch.company.name}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{warehouse.address || '-'}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
                        background: warehouse.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: warehouse.isActive ? '#22c55e' : '#ef4444'
                      }}>
                        {warehouse.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(warehouse)} style={{ padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent', color: 'var(--color-info)', cursor: 'pointer', display: 'flex', transition: 'background var(--duration-fast)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-info-bg)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(warehouse)} style={{ padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', transition: 'background var(--duration-fast)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-danger-bg)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <WarehouseFormModal 
          warehouse={selectedWarehouse} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};
