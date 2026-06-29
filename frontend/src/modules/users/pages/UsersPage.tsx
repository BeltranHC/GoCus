import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Search, UserCheck, UserX } from 'lucide-react';
import { getUsers, deleteUser } from '../../../api/users';
import type { User } from '../../../api/users';
import { UserFormModal } from '../components/UserFormModal';

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getUsers(1, 100);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (confirm(`¿Estás seguro de desactivar al usuario "${user.firstName} ${user.lastName}"?`)) {
      try {
        await deleteUser(user.id);
        loadData();
      } catch (error) {
        console.error('Error deleting user', error);
        alert('Error al eliminar');
      }
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn var(--duration-normal) var(--ease-out)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.03em' }}>
            <Users size={24} style={{ color: 'var(--color-brand)' }} /> Usuarios
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Gestiona los miembros del equipo y su acceso al sistema.</p>
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
          <Plus size={18} /> Nuevo Usuario
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
              placeholder="Buscar por nombre o correo..." 
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
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Correo</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Rol</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Asignación</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Estado</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando usuarios...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No se encontraron usuarios.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background var(--duration-fast)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-inset)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-brand-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand)', fontWeight: 700 }}>
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <div>{user.firstName} {user.lastName}</div>
                          {user.phone && <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{user.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{user.email}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ padding: '0.125rem 0.5rem', background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem' }}>
                        {user.role?.name || 'Sin rol'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{user.company?.name || '-'}</div>
                      {user.branch && <div style={{ fontSize: '0.6875rem' }}>Sucursal: {user.branch.name}</div>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {user.isActive ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                          <UserCheck size={14} /> Activo
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                          <UserX size={14} /> Inactivo
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(user)} style={{ padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent', color: 'var(--color-info)', cursor: 'pointer', display: 'flex', transition: 'background var(--duration-fast)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-info-bg)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(user)} style={{ padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', transition: 'background var(--duration-fast)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-danger-bg)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
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
        <UserFormModal 
          user={selectedUser} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};
