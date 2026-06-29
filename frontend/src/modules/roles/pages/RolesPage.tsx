import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Search } from 'lucide-react';
import { getRoles, deleteRole } from '../../../api/roles';
import type { Role } from '../../../api/roles';
import { RoleFormModal } from '../components/RoleFormModal';

export const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getRoles(1, 100);
      setRoles(response.data);
    } catch (error) {
      console.error('Error loading roles', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (role: Role) => {
    if (role.isSystem) {
      alert('Los roles del sistema no pueden ser editados.');
      return;
    }
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedRole(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      alert('No puedes eliminar un rol del sistema.');
      return;
    }
    if (confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
      try {
        await deleteRole(role.id);
        loadData();
      } catch (error) {
        console.error('Error deleting role', error);
        alert('Error al eliminar');
      }
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn var(--duration-normal) var(--ease-out)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.03em' }}>
            <Shield size={24} style={{ color: 'var(--color-brand)' }} /> Roles y Permisos
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Gestiona los niveles de acceso de los usuarios al sistema.</p>
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
          <Plus size={18} /> Nuevo Rol
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
              placeholder="Buscar rol..." 
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
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Nombre</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Descripción</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Estado</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando roles...</td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No se encontraron roles.</td>
                </tr>
              ) : (
                filteredRoles.map(role => (
                  <tr key={role.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background var(--duration-fast)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-inset)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {role.name}
                      {role.isSystem && <span style={{ marginLeft: '0.5rem', padding: '0.125rem 0.375rem', background: 'var(--color-brand-glow)', color: 'var(--color-brand)', borderRadius: 'var(--radius-xs)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>Sistema</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{role.description || '-'}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
                        background: role.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: role.isActive ? '#22c55e' : '#ef4444'
                      }}>
                        {role.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {!role.isSystem && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(role)} style={{ padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent', color: 'var(--color-info)', cursor: 'pointer', display: 'flex', transition: 'background var(--duration-fast)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-info-bg)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(role)} style={{ padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', transition: 'background var(--duration-fast)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-danger-bg)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <RoleFormModal 
          role={selectedRole} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};
