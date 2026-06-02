export default function Input({
  label,
  error,
  className = '',
  id,
  required,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white placeholder-gray-400 transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-400' : 'border-gray-300'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = '', id, required, children, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-400' : 'border-gray-300'}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', id, required, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={3}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white placeholder-gray-400 resize-none transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-400' : 'border-gray-300'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
