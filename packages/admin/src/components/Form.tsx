interface ToggleSwitchProps {
    label: string;
    description?: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
}

export function ToggleSwitch({ label, description, enabled, onChange, disabled = false }: ToggleSwitchProps) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="font-medium text-gray-900">{label}</p>
                {description && (
                    <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                )}
            </div>
            <button
                type="button"
                onClick={() => onChange(!enabled)}
                disabled={disabled}
                className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
        `}
                role="switch"
                aria-checked={enabled}
            >
                <span
                    className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full 
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
                />
            </button>
        </div>
    );
}

interface SelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
}

export function Select({ label, value, onChange, options, disabled = false }: SelectProps) {
    return (
        <div className="py-3">
            <label className="block font-medium text-gray-900 mb-2">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`
          w-full px-4 py-2 border border-gray-300 rounded-lg bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
