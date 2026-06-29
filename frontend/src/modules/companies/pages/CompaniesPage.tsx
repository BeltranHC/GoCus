import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2, Search } from 'lucide-react';
import { getCompanies, deleteCompany } from '../../../api/companies';
import type { Company } from '../../../api/companies';
import { CompanyFormModal } from '../components/CompanyFormModal';

export const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getCompanies(1, 100);
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCompany(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (company: Company) => {
    if (confirm(`¿Estás seguro de eliminar la empresa "${company.name}"?`)) {
      try {
        await deleteCompany(company.id);
        loadData();
      } catch (error) {
        console.error('Error deleting company', error);
        alert('Error al eliminar');
      }
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.taxId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn var(--duration-normal) var(--ease-out)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.03em' }}>
            <Building2 size={24} style={{ color: 'var(--color-brand)' }} /> Empresas
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Administra las empresas o razones sociales que operan en el sistema.</p>
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
          <Plus size={18} /> Nueva Empresa
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
              placeholder="Buscar por nombre o RUC/NIT..." 
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
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Empresa</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Documento (RUC/NIT)</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Contacto</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Estado</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando empresas...</td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No se encontraron empresas.</td>
                </tr>
              ) : (
                filteredCompanies.map(company => (
                  <tr key={company.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background var(--duration-fast)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-inset)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--color-brand-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand)', fontWeight: 700 }}>
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div>{company.name}</div>
                          {company.address && <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: 400 }}>{company.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{company.taxId}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                      {company.email && <div>{company.email}</div>}
                      {company.phone && <div>{company.phone}</div>}
                      {!company.email && !company.phone && '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
                        background: company.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: company.isActive ? '#22c55e' : '#ef4444'
                      }}>
                        {company.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(company)} style={{ padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent', color: 'var(--color-info)', cursor: 'pointer', display: 'flex', transition: 'background var(--duration-fast)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-info-bg)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(company)} style={{ padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', transition: 'background var(--duration-fast)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-danger-bg)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
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
        <CompanyFormModal 
          company={selectedCompany} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};
