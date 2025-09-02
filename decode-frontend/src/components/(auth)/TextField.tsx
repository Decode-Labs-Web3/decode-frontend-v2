'use client';

export default function TextField({
    id,
    type = 'text',
    value,
    onChange,
    placeholder,
}: {
    id: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}) {
    return (
        <div className="mb-5">
            <input
                required
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-gray-800/70 border border-white/10 rounded-lg pl-4 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
        </div>
    );
}


