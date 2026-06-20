'use client';

import { useState, useCallback } from 'react';

interface PasswordSettings {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

interface StrengthLevel {
  label: string;
  color: string;
  bgColor: string;
}

function calculatePasswordStrength(password: string, settings: PasswordSettings): StrengthLevel {
  const length = password.length;
  const typeCount = Object.values(settings).filter(Boolean).length;
  const entropy = length * Math.log2(typeCount > 0 ? 26 * typeCount : 1);

  if (entropy < 30) {
    return { label: 'Weak', color: '#F43F5E', bgColor: '#F43F5E20' };
  } else if (entropy < 50) {
    return { label: 'Medium', color: '#F59E0B', bgColor: '#F59E0B20' };
  } else {
    return { label: 'Strong', color: '#22C55E', bgColor: '#22C55E20' };
  }
}

function generatePassword(
  length: number,
  settings: PasswordSettings
): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*_-+=?';

  let charset = '';
  if (settings.uppercase) charset += uppercase;
  if (settings.lowercase) charset += lowercase;
  if (settings.numbers) charset += numbers;
  if (settings.symbols) charset += symbols;

  if (charset.length === 0) {
    charset = lowercase;
  }

  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  return password;
}

export default function PasswordGenerator() {
  const [length, setLength] = useState<number>(16);
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [settings, setSettings] = useState<PasswordSettings>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });

  const strength = calculatePasswordStrength(password, settings);

  const handleGenerate = useCallback(() => {
    const newPassword = generatePassword(length, settings);
    setPassword(newPassword);
    setCopied(false);
  }, [length, settings]);

  const handleCopy = useCallback(() => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [password]);

  const handleToggleSetting = (key: keyof PasswordSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Generate initial password on mount
  useState(() => {
    const initialPassword = generatePassword(length, settings);
    setPassword(initialPassword);
  });

  return (
    <div className="mx-auto w-full max-w-[420px]">
      {/* Controls Card */}
      <div className="mb-3 rounded-xl border border-white/[0.06] bg-[#111115] p-5">
        {/* Length Slider */}
        <div className="mb-3">
          <label className="mb-2 block text-xs text-[#A1A1AA]">
            Length: {length}
          </label>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#F97316]"
          />
        </div>

        {/* Checkboxes Row */}
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]">
            <input
              type="checkbox"
              checked={settings.uppercase}
              onChange={() => handleToggleSetting('uppercase')}
              className="h-[14px] w-[14px] cursor-pointer rounded border border-white/10 bg-[#222228] accent-[#F97316]"
            />
            Uppercase (A-Z)
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]">
            <input
              type="checkbox"
              checked={settings.lowercase}
              onChange={() => handleToggleSetting('lowercase')}
              className="h-[14px] w-[14px] cursor-pointer rounded border border-white/10 bg-[#222228] accent-[#F97316]"
            />
            Lowercase (a-z)
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]">
            <input
              type="checkbox"
              checked={settings.numbers}
              onChange={() => handleToggleSetting('numbers')}
              className="h-[14px] w-[14px] cursor-pointer rounded border border-white/10 bg-[#222228] accent-[#F97316]"
            />
            Numbers (0-9)
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]">
            <input
              type="checkbox"
              checked={settings.symbols}
              onChange={() => handleToggleSetting('symbols')}
              className="h-[14px] w-[14px] cursor-pointer rounded border border-white/10 bg-[#222228] accent-[#F97316]"
            />
            Symbols (!@#$)
          </label>
        </div>
      </div>

      {/* Output Card */}
      <div className="mb-3 overflow-hidden rounded-xl border border-white/[0.06] bg-[#111115]">
        {/* Password Display */}
        <div className="flex min-h-[52px] items-center px-4 py-4 font-mono text-[15px] tracking-[0.02em] text-[#FAFAFA]">
          {password || '••••••••••••••••'}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2">
          <span className="text-[10px] text-[#52525B]" style={{ color: strength.color }}>
            {strength.label}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-[#A1A1AA] transition-colors hover:border-white/20 hover:text-[#FAFAFA]"
              title="Generate new password"
            >
              ↻ Generate
            </button>
            <button
              onClick={handleCopy}
              className="rounded-md bg-[#F97316] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#EA8C15]"
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Strength Indicator Bar */}
      <div
        className="h-1 rounded-full transition-all"
        style={{
          backgroundColor: strength.color,
          opacity: 0.6,
        }}
      />
    </div>
  );
}
