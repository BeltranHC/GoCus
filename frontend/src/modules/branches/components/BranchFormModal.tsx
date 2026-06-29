import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createBranch, updateBranch } from '../../../api/branches';
import { getCompanies } from '../../../api/companies';
import type { Branch } from '../../../api/branches';

interface BranchFormModalProps {
  branch?: Branch;
  onClose: () => void;
  onSuccess: () => void;
}

export const BranchFormModal = ({ branch, onClose, onSuccess }: BranchFormModalProps) => {
  const [formData, setFormData] = useState({
    name: branch?.name || '',
    address: branch?.address || '',
    phone: branch?.phone || '',
    companyId: branch?.companyId || '',
    isActive: branch ? branch.isActive : true,
  });

  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await getCompanies(1, 100);
        setCompanies(res.data);
        if (!branch && res.data.length > 0) {
          setFormData(prev => ({ ...prev, companyId: res.data[0].id }));
        }
      } catch (error) {
        console.error('Error loading companies', error);
      }
    };
    loadCompanies();
  }, [branch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.companyId) return;

    try {
      setSubmitting(true);
      if (branch) {
        await updateBranch(branch.id, formData);
      } else {
        await createBranch(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving branch', error);
      alert('Error al guardar la sucursal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--color-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, animation: 'fadeIn var(--duration-fast) var(--ease-out)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--color-bg)', width: '100%', maxWidth: '500px', maxHeight: '90vh',
        borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
        animation: 'slideUp var(--duration-normal) var(--ease-spring)', overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--color-bg-inset)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {branch ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
              cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center',
              borderRadius: 'var(--radius-sm)', transition: 'background var(--duration-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-raised)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
          <form id="branch-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Empresa a la que pertenece <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select 
                value={formData.companyId} 
                onChange={e => setFormData({...formData, companyId: e.target.value})} 
                required
                style={{
                  padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                }}
              >
                <option value="">Seleccionar Empresa</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Nombre de Sucursal <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required
                style={{
                  padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Dirección</label>
              <input 
                type="text" 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                style={{
                  padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Teléfono</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                style={{
                  padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="branchActive" 
                checked={formData.isActive} 
                onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--color-brand)' }}
              />
              <label htmlFor="branchActive" style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                Sucursal Activa
              </label>
            </div>

          </form>
        </div>

        <div style={{
          padding: '1.25rem 1.5rem', borderTop: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'flex-end', gap: '1rem',
          background: 'var(--color-bg-inset)',
        }}>
          <button 
            type="button" 
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
              background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.8125rem',
            }}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="branch-form"
            disabled={submitting}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
              color: 'var(--color-text-on-brand)', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.8125rem',
              boxShadow: 'var(--shadow-brand)', opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Guardando...' : 'Guardar Sucursal'}
          </button>
        </div>
      </div>
    </div>
  );
};
