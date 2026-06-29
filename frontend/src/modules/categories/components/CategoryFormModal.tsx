import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategory, updateCategory } from '../../../api/categories';
import type { Category } from '../../../api/categories';
import * as LucideIcons from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Props {
  category?: Category;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_ICONS = [
  'Gamepad2', 'Cpu', 'Sun', 'BatteryCharging', 'Bike', 
  'Satellite', 'Home', 'Wifi', 'Zap', 'Cctv', 
  'Smartphone', 'Laptop', 'Headphones', 'Monitor', 'Keyboard'
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--color-border)', background: 'var(--color-bg-base)',
  color: 'var(--color-text-primary)', fontSize: '0.875rem', fontFamily: 'inherit',
  outline: 'none', transition: 'border-color var(--duration-fast), box-shadow var(--duration-fast)',
};

const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = 'var(--color-brand)';
  e.target.style.boxShadow = '0 0 0 3px var(--color-brand-glow)';
};

const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = 'var(--color-border)';
  e.target.style.boxShadow = 'none';
};

export const CategoryFormModal: React.FC<Props> = ({ category, categories, onClose, onSuccess }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      icon: category?.icon || '',
      parentId: category?.parentId || '',
    }
  });

  const selectedIcon = watch('icon');

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        await updateCategory(category.id, data);
      } else {
        await createCategory(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving category', error);
      alert('Error al guardar la categoría');
    }
  };

  const renderIcon = (iconName: string) => {
    const pascalName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    const IconComponent = (LucideIcons as any)[pascalName] || (LucideIcons as any)[iconName] || LucideIcons.Folder;
    return <IconComponent size={18} />;
  };

  const availableParents = categories.filter(c => c.id !== category?.id);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', padding: '1rem',
    }}>
      <div style={{
        background: 'var(--color-bg-raised)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px',
        overflow: 'hidden', border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xl)', animation: 'scaleIn var(--duration-normal) var(--ease-out)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-inset)',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
            display: 'flex', padding: '0.25rem', borderRadius: 'var(--radius-xs)',
            transition: 'color var(--duration-fast)',
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Nombre */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>Nombre</label>
            <input {...register('name')} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="Ej: Laptops Gamer" />
            {errors.name && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name.message}</p>}
          </div>

          {/* Categoría Padre */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>Categoría Padre (Opcional)</label>
            <select {...register('parentId')} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={handleFocus as any} onBlur={handleBlur as any}>
              <option value="">Ninguna (Categoría Principal)</option>
              {availableParents.map(parent => (
                <option key={parent.id} value={parent.id}>{parent.name}</option>
              ))}
            </select>
          </div>

          {/* Ícono */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>Ícono</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.375rem',
              marginBottom: '0.5rem', maxHeight: '120px', overflowY: 'auto',
              padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg-base)',
            }} className="custom-scrollbar">
              {COMMON_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue('icon', icon)}
                  style={{
                    padding: '0.5rem', borderRadius: 'var(--radius-xs)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
                    transition: 'all var(--duration-fast)',
                    background: selectedIcon === icon ? 'var(--color-brand)' : 'var(--color-bg-raised)',
                    color: selectedIcon === icon ? 'var(--color-text-on-brand)' : 'var(--color-text-secondary)',
                    boxShadow: selectedIcon === icon ? 'var(--shadow-brand)' : 'none',
                  }}
                >
                  {renderIcon(icon)}
                </button>
              ))}
            </div>
            <input {...register('icon')} style={{ ...inputStyle, fontSize: '0.8125rem' }} onFocus={handleFocus} onBlur={handleBlur} placeholder="Nombre del ícono (ej. Gamepad2, Monitor)" />
          </div>

          {/* Descripción */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>Descripción</label>
            <textarea
              {...register('description')}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' as any }}
              onFocus={handleFocus as any}
              onBlur={handleBlur as any}
              placeholder="Breve descripción (opcional)"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '0.625rem', borderRadius: 'var(--radius-sm)', fontWeight: 600,
                border: '1px solid var(--color-border)', background: 'transparent',
                color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.8125rem',
                transition: 'all var(--duration-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-inset)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1, padding: '0.625rem', borderRadius: 'var(--radius-sm)', fontWeight: 700,
                border: 'none', background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                color: 'var(--color-text-on-brand)', cursor: 'pointer', fontSize: '0.8125rem',
                boxShadow: 'var(--shadow-brand)',
                transition: 'transform var(--duration-fast) var(--ease-spring)',
                opacity: isSubmitting ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
