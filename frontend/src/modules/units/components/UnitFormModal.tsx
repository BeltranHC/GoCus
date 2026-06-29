import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUnit, updateUnit } from '../../../api/units';
import type { Unit } from '../../../api/units';

const unitSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  abbreviation: z.string().min(1, 'La abreviatura es requerida'),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface Props {
  unit?: Unit;
  onClose: () => void;
  onSuccess: () => void;
}

export const UnitFormModal: React.FC<Props> = ({ unit, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: unit?.name || '',
      abbreviation: unit?.abbreviation || '',
    }
  });

  const onSubmit = async (data: UnitFormData) => {
    try {
      if (unit) {
        await updateUnit(unit.id, data);
      } else {
        await createUnit(data);
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving unit', error);
      alert(error.response?.data?.message || 'Error al guardar la unidad');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', padding: '1rem',
    }}>
      <div style={{
        background: 'var(--color-bg-raised)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '420px',
        overflow: 'hidden', border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xl)', animation: 'scaleIn var(--duration-normal) var(--ease-out)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-inset)',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {unit ? 'Editar Unidad' : 'Nueva Unidad'}
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
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>Nombre</label>
            <input
              {...register('name')}
              style={{
                width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--color-border)', background: 'var(--color-bg-base)',
                color: 'var(--color-text-primary)', fontSize: '0.875rem', fontFamily: 'inherit',
                outline: 'none', transition: 'border-color var(--duration-fast), box-shadow var(--duration-fast)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.boxShadow = '0 0 0 3px var(--color-brand-glow)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              placeholder="Ej: Unidad, Kilogramo, Caja"
            />
            {errors.name && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>Abreviatura</label>
            <input
              {...register('abbreviation')}
              style={{
                width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--color-border)', background: 'var(--color-bg-base)',
                color: 'var(--color-text-primary)', fontSize: '0.875rem', fontFamily: "'JetBrains Mono', monospace",
                outline: 'none', transition: 'border-color var(--duration-fast), box-shadow var(--duration-fast)',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.boxShadow = '0 0 0 3px var(--color-brand-glow)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              placeholder="Ej: UND, KG, CJ"
            />
            {errors.abbreviation && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.abbreviation.message}</p>}
          </div>

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
              {isSubmitting ? 'Guardando...' : 'Guardar Unidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
