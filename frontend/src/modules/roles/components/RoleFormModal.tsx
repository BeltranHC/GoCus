import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { createRole, updateRole, getPermissions } from '../../../api/roles';
import type { Role, Permission } from '../../../api/roles';

interface RoleFormModalProps {
  role?: Role;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoleFormModal = ({ role, onClose, onSuccess }: RoleFormModalProps) => {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [isActive, setIsActive] = useState(role ? role.isActive : true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    role?.permissions?.map(p => p.id) || []
  );
  
  const [submitting, setSubmitting] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(true);

  useEffect(() => {
    const loadPerms = async () => {
      try {
        const data = await getPermissions();
        setPermissions(data);
      } catch (error) {
        console.error('Error loading permissions', error);
      } finally {
        setLoadingPerms(false);
      }
    };
    loadPerms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        name,
        description,
        isActive,
        permissionIds: selectedPermissionIds
      };

      if (role) {
        await updateRole(role.id, payload);
      } else {
        await createRole(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving role', error);
      alert('Error al guardar el rol');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (id: string) => {
    setSelectedPermissionIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

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
            {role ? 'Editar Rol' : 'Nuevo Rol'}
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
          <form id="role-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Nombre del Rol <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Ej. Gerente, Cajero..."
                required
                style={{
                  padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                  transition: 'border-color var(--duration-fast)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Descripción (Opcional)</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={3}
                placeholder="Describe las responsabilidades del rol"
                style={{
                  padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: '0.875rem',
                  resize: 'vertical', minHeight: '80px',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="isActive" 
                checked={isActive} 
                onChange={e => setIsActive(e.target.checked)} 
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--color-brand)' }}
              />
              <label htmlFor="isActive" style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                Rol Activo
              </label>
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1rem', display: 'block' }}>
                Permisos Asignados
              </label>
              
              {loadingPerms ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Cargando permisos...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {Object.entries(permissionsByModule).map(([module, perms]) => (
                    <div key={module}>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                        {module}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                        {perms.map(perm => (
                          <div 
                            key={perm.id} 
                            onClick={() => togglePermission(perm.id)}
                            style={{ 
                              display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem',
                              border: '1px solid', borderColor: selectedPermissionIds.includes(perm.id) ? 'var(--color-brand)' : 'var(--color-border)',
                              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                              background: selectedPermissionIds.includes(perm.id) ? 'var(--color-brand-glow)' : 'var(--color-bg)',
                              transition: 'all var(--duration-fast)',
                            }}
                          >
                            <div style={{ 
                              width: '16px', height: '16px', borderRadius: '4px', border: '1px solid',
                              borderColor: selectedPermissionIds.includes(perm.id) ? 'var(--color-brand)' : 'var(--color-text-muted)',
                              background: selectedPermissionIds.includes(perm.id) ? 'var(--color-brand)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px',
                            }}>
                              {selectedPermissionIds.includes(perm.id) && <Check size={12} color="white" />}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: selectedPermissionIds.includes(perm.id) ? 'var(--color-brand)' : 'var(--color-text-primary)' }}>
                                {perm.name}
                              </div>
                              {perm.description && (
                                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                  {perm.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            form="role-form"
            disabled={submitting}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
              color: 'var(--color-text-on-brand)', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.8125rem',
              boxShadow: 'var(--shadow-brand)', opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Guardando...' : 'Guardar Rol'}
          </button>
        </div>
      </div>
    </div>
  );
};
