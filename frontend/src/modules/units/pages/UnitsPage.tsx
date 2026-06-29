import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Ruler } from 'lucide-react';
import { getUnits, deleteUnit } from '../../../api/units';
import type { Unit } from '../../../api/units';
import { UnitFormModal } from '../components/UnitFormModal';

export const UnitsPage = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | undefined>(undefined);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getUnits();
      setUnits(data);
    } catch (error) {
      console.error('Error loading units', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUnit(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta unidad?')) {
      try {
        await deleteUnit(id);
        loadData();
      } catch (error) {
        console.error('Error deleting unit', error);
        alert('Error al eliminar');
      }
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn var(--duration-normal) var(--ease-out)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.03em' }}>
            <Ruler size={24} style={{ color: 'var(--color-brand)' }} /> Unidades de Medida
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Gestiona las unidades para tus productos (Und, Kg, Caja, etc).</p>
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
          <Plus size={18} /> Nueva Unidad
        </button>
      </div>

      {/* Table */}
      <div style={{
        flex: 1, background: 'var(--color-bg-raised)', borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Cargando unidades...</div>
          ) : units.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No se encontraron unidades.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-inset)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Nombre</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Abreviatura</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', width: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {units.map(unit => (
                  <tr 
                    key={unit.id}
                    className="group"
                    style={{ borderBottom: '1px solid var(--color-border-subtle)', transition: 'background var(--duration-fast)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-inset)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                      {unit.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', 
                        fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                        background: 'var(--color-brand-glow)', color: 'var(--color-brand)', letterSpacing: '0.04em',
                      }}>
                        {unit.abbreviation}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem', opacity: 0, transition: 'opacity var(--duration-fast)' }}
                        ref={el => {
                          if (el) {
                            const parent = el.closest('.group');
                            if (parent) {
                              parent.addEventListener('mouseenter', () => el.style.opacity = '1');
                              parent.addEventListener('mouseleave', () => el.style.opacity = '0');
                            }
                          }
                        }}
                      >
                        <button onClick={() => handleEdit(unit)} style={{ padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent', color: 'var(--color-info)', cursor: 'pointer', display: 'flex' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-info-bg)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Edit size={15} />
                        </button>
                        <button onClick={() => handleDelete(unit.id)} style={{ padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-danger-bg)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <UnitFormModal 
          unit={selectedUnit} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};
