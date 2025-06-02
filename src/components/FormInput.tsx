import React from 'react';
import { UseFormRegister, Path, FieldValues } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  required?: boolean;
  register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
}

export const FormInput = <T extends FieldValues>({
  label,
  name,
  type = 'text',
  required = false,
  register,
  error,
  placeholder,
}: FormInputProps<T>) => {
  const { onChange, onBlur, ref, ...rest } = register(name);

  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-[#C4122F] ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        className="form-input"
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        {...rest}
      />
      {error && <p className="text-[#C4122F] text-sm mt-1">{error}</p>}
    </div>
  );
};

export const FormCheckbox = <T extends FieldValues>({
  label,
  name,
  register,
}: Omit<FormInputProps<T>, 'type'>) => {
  const { onChange, onBlur, ref, ...rest } = register(name);

  return (
    <label className="form-checkbox-label">
      <input
        type="checkbox"
        className="form-checkbox"
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
};

export const FormSelect = <T extends FieldValues>({
  label,
  name,
  required = false,
  register,
  error,
  options,
}: FormInputProps<T> & { options: { value: string; label: string }[] }) => {
  const { onChange, onBlur, ref, ...rest } = register(name);

  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-[#C4122F] ml-1">*</span>}
      </label>
      <select
        id={name}
        className="form-select"
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        {...rest}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[#C4122F] text-sm mt-1">{error}</p>}
    </div>
  );
}; 