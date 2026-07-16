import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

export interface OptionItem {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  placeholder?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  testId?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  style,
  disabled = false,
  testId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Combobox Button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        data-testid={testId || 'custom-select-trigger'}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10.5px 12px',
          border: isOpen ? '1px solid var(--color-velvet)' : '1px solid #D8CEBE',
          borderRadius: '7px',
          fontSize: '13.5px',
          backgroundColor: disabled ? '#F8F5F0' : '#fff',
          color: '#241F18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(162, 63, 29, 0.15)' : 'none',
          transition: 'all 0.15s ease',
          textAlign: 'left',
          ...style
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: selectedOption ? 500 : 400 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: isOpen ? 'var(--color-velvet)' : '#5E564A',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease, color 0.15s ease',
            flexShrink: 0,
            marginLeft: '8px'
          }}
        />
      </button>

      {/* Option Listbox Frame */}
      {isOpen && (
        <div
          role="listbox"
          data-testid={`${testId || 'custom-select'}-options`}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 1050,
            backgroundColor: '#fff',
            border: '1px solid #D8CEBE',
            borderRadius: '10px',
            boxShadow: '0 10px 28px rgba(36, 31, 24, 0.14), 0 2px 8px rgba(36, 31, 24, 0.05)',
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '6px',
            animation: 'voFadeIn 0.15s ease'
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                data-testid={`option-${option.value}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#FFF5F0' : 'transparent',
                  color: isSelected ? 'var(--color-velvet)' : '#241F18',
                  fontWeight: isSelected ? 700 : 400,
                  transition: 'background-color 0.12s ease, color 0.12s ease',
                  marginBottom: '2px'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#FBF8F3';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{option.label}</span>
                {isSelected && <CheckCircle2 size={15} style={{ color: 'var(--color-velvet)', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
