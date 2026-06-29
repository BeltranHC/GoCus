import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createUser, updateUser } from '../../../api/users';
import { getRoles } from '../../../api/roles';
import { getCompanies } from '../../../api/companies';
import { getBranches } from '../../../api/branches';
import type { User } from '../../../api/users';

interface UserFormModalProps {
  user?: User;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserFormModal = ({ user, onClose, onSuccess }: UserFormModalProps) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    phone: user?.phone || '',
    roleId: user?.roleId || '',
    companyId: user?.companyId || '',
    branchId: user?.branchId || '',
    isActive: user ? user.isActive : true,
  });

  const [roles, setRoles] = useState<{id: string, name: string}[]>([]);
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
  const [branches, setBranches] = useState<{id: string, name: string}[]>([]);
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [rolesRes, companiesRes] = await Promise.all([
          getRoles(1, 100),
          getCompanies(1, 100)
        ]);
        setRoles(rolesRes.data);
        setCompanies(companiesRes.data);
        
        // Default selection if creating new user and companies exist
        if (!user && companiesRes.data.length > 0) {
          setFormData(prev => ({ ...prev, companyId: companiesRes.data[0].id }));
        }
      } catch (error) {
        console.error('Error loading dependencies', error);
      }
    };
    loadDependencies();
  }, [user]);

  // Load branches when company changes
  useEffect(() => {
    if (formData.companyId) {
      const loadBranches = async () => {
        try {
          const branchesRes = await getBranches(1, 100, formData.companyId);
          setBranches(branchesRes.data);
          
          // If editing and branch belongs to company, keep it. Otherwise reset.
          if (!user || user.companyId !== formData.companyId) {
             setFormData(prev => ({ ...prev, branchId: '' }));
          }
        } catch (error) {
          console.error('Error loading branches', error);
        }
      };
      loadBranches();
    } else {
      setBranches([]);
    }
  }, [formData.companyId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.roleId || !formData.companyId) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    if (!user && !formData.password) {
      alert('La contraseña es requerida para nuevos usuarios');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password; // Don't send empty password if editing
      if (!payload.branchId) payload.branchId = null;

      if (user) {
        await updateUser(user.id, payload);
      } else {
        await createUser(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving user', error);
      alert('Error al guardar el usuario');
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
        background: 'var(--color-bg)', width: '100%', maxWidth: '600px', maxHeight: '90vh',
        borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
        animation: 'slideUp var(--duration-normal) var(--ease-spring)', overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--color-bg-inset)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
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
          <form id="user-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Nombre <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="text" 
                  value={formData.firstName} 
                  onChange={e => setFormData({...formData, firstName: e.target.value})} 
                  required
                  style={{
                    padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Apellido <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="text" 
                  value={formData.lastName} 
                  onChange={e => setFormData({...formData, lastName: e.target.value})} 
                  required
                  style={{
                    padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Correo Electrónico <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required
                  style={{
                    padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Teléfono (Opcional)</label>
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
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Contraseña {user ? '(Dejar en blanco para no cambiar)' : <span style={{ color: 'var(--color-danger)' }}>*</span>}</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required={!user}
                minLength={6}
                style={{
                  padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }}></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Rol del Sistema <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <select 
                  value={formData.roleId} 
                  onChange={e => setFormData({...formData, roleId: e.target.value})} 
                  required
                  style={{
                    padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                  }}
                >
                  <option value="">Seleccionar Rol</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Empresa <span style={{ color: 'var(--color-danger)' }}>*</span></label>
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
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Sucursal (Opcional)</label>
                <select 
                  value={formData.branchId} 
                  onChange={e => setFormData({...formData, branchId: e.target.value})} 
                  disabled={!formData.companyId}
                  style={{
                    padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                    opacity: !formData.companyId ? 0.5 : 1
                  }}
                >
                  <option value="">Todas las sucursales</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="userActive" 
                checked={formData.isActive} 
                onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--color-brand)' }}
              />
              <label htmlFor="userActive" style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                Usuario Activo
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
            form="user-form"
            disabled={submitting}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
              color: 'var(--color-text-on-brand)', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.8125rem',
              boxShadow: 'var(--shadow-brand)', opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Guardando...' : 'Guardar Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
};
