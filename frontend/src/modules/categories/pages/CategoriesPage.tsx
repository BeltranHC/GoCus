import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderTree, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { getCategoryTree, deleteCategory } from '../../../api/categories';
import type { Category } from '../../../api/categories';
import { CategoryFormModal } from '../components/CategoryFormModal';
import * as LucideIcons from 'lucide-react';

// Helper to render icon
const renderIcon = (iconName?: string) => {
  if (!iconName) return <Folder size={18} style={{ color: 'var(--color-text-muted)' }} />;
  const pascalName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const IconComponent = (LucideIcons as any)[pascalName] || (LucideIcons as any)[iconName] || LucideIcons.Folder;
  return <IconComponent size={18} style={{ color: 'var(--color-brand)' }} />;
};

const CategoryRow: React.FC<{
  category: Category;
  level: number;
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
}> = ({ category, level, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <>
      <div 
        className="group"
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.625rem 1rem', paddingLeft: `${level * 1.75 + 1}rem`,
          borderBottom: '1px solid var(--color-border)',
          transition: 'background var(--duration-fast) var(--ease-out)',
          cursor: hasChildren ? 'pointer' : 'default',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-inset)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasChildren ? (
              isExpanded 
                ? <ChevronDown size={15} style={{ color: 'var(--color-text-muted)' }} /> 
                : <ChevronRight size={15} style={{ color: 'var(--color-text-muted)' }} />
            ) : <span style={{ width: '15px' }} />}
          </div>
          
          <div style={{ 
            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-sm)', background: level === 0 ? 'var(--color-brand-glow)' : 'var(--color-bg-inset)',
          }}>
            {renderIcon(category.icon)}
          </div>
          
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{category.name}</div>
            {category.description && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>{category.description}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1" style={{ opacity: 0, transition: 'opacity var(--duration-fast)' }}
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
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(category); }} 
            style={{ 
              padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent',
              color: 'var(--color-info)', cursor: 'pointer', display: 'flex',
              transition: 'background var(--duration-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-info-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Edit size={15} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(category.id); }} 
            style={{ 
              padding: '0.375rem', borderRadius: 'var(--radius-xs)', border: 'none', background: 'transparent',
              color: 'var(--color-danger)', cursor: 'pointer', display: 'flex',
              transition: 'background var(--duration-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-danger-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {isExpanded && hasChildren && category.children!.map(child => (
        <CategoryRow 
          key={child.id} 
          category={child} 
          level={level + 1} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </>
  );
};

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tree = await getCategoryTree();
      setCategories(tree);
      
      const flatten = (cats: Category[]): Category[] => {
        let result: Category[] = [];
        cats.forEach(c => {
          result.push(c);
          if (c.children) result = result.concat(flatten(c.children));
        });
        return result;
      };
      setFlatCategories(flatten(tree));
    } catch (error) {
      console.error('Error loading categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await deleteCategory(id);
        loadData();
      } catch (error) {
        console.error('Error deleting category', error);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.03em' }}>
            <FolderTree size={24} style={{ color: 'var(--color-brand)' }} /> Categorías
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Organiza tus productos en categorías y subcategorías.</p>
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
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      <div style={{
        flex: 1, background: 'var(--color-bg-raised)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Cargando categorías...</div>
          ) : categories.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No se encontraron categorías.</div>
          ) : (
            <div>
              {categories.map(category => (
                <CategoryRow 
                  key={category.id} 
                  category={category} 
                  level={0} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CategoryFormModal 
          category={selectedCategory} 
          categories={flatCategories}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};
