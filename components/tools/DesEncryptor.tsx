'use client';

import { useState } from 'react';
import CryptoJS from 'crypto-js';

type Tab = 'encrypt' | 'decrypt';
type Mode = 'ECB' | 'CBC';

export default function DesEncryptor() {
  const [tab, setTab] = useState<Tab>('encrypt');
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState<Mode>('ECB');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleEncrypt = () => {
    setError('');
    if (!plaintext.trim()) {
      setError('Plaintext cannot be empty');
      return;
    }
    if (key.length !== 8) {
      setError('Key must be exactly 8 characters for DES');
      return;
    }

    try {
      const options =
        mode === 'ECB'
          ? { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
          : { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };

      const result = CryptoJS.DES.encrypt(plaintext, CryptoJS.enc.Utf8.parse(key), options).toString();
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed');
      setOutput('');
    }
  };

  const handleDecrypt = () => {
    setError('');
    if (!ciphertext.trim()) {
      setError('Ciphertext cannot be empty');
      return;
    }
    if (key.length !== 8) {
      setError('Key must be exactly 8 characters for DES');
      return;
    }

    try {
      const options =
        mode === 'ECB'
          ? { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
          : { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };

      const result = CryptoJS.DES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), options).toString(CryptoJS.enc.Utf8);
      if (!result) {
        setError('Decryption failed');
        setOutput('');
        return;
      }
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed');
      setOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-5 space-y-4">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#FAFAFA]">DES Encrypt / Decrypt</h3>

        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setTab('encrypt')}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === 'encrypt' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            Encrypt
          </button>
          <button
            onClick={() => setTab('decrypt')}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === 'decrypt' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            Decrypt
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {tab === 'encrypt' ? (
          <>
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
                Plaintext
              </label>
              <textarea
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                placeholder="Enter text to encrypt"
                className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
                Key (8 characters)
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value.slice(0, 8))}
                placeholder="Enter 8-char key"
                className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none"
              />
              <p className="text-[10px] text-[#A1A1AA] mt-1">{key.length}/8 characters</p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors"
              >
                <option value="ECB">ECB</option>
                <option value="CBC">CBC</option>
              </select>
            </div>

            <button onClick={handleEncrypt} className="px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors w-full">
              Encrypt
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
                Ciphertext
              </label>
              <textarea
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                placeholder="Enter text to decrypt"
                className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
                Key (8 characters)
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value.slice(0, 8))}
                placeholder="Enter 8-char key"
                className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none"
              />
              <p className="text-[10px] text-[#A1A1AA] mt-1">{key.length}/8 characters</p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors"
              >
                <option value="ECB">ECB</option>
                <option value="CBC">CBC</option>
              </select>
            </div>

            <button onClick={handleDecrypt} className="px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors w-full">
              Decrypt
            </button>
          </>
        )}
      </div>

      {error && <div className="text-xs text-[#F43F5E] font-mono">{error}</div>}

      {output && (
        <div className="space-y-2">
          <div className="w-full bg-[#111115] border border-white/[0.06] rounded-[7px] px-3 py-3 text-[#F97316] text-xs font-mono min-h-[80px] break-all">
            {output}
          </div>
          <button onClick={copyToClipboard} className="px-4 py-[9px] border border-white/10 text-[#A1A1AA] rounded-[7px] text-sm hover:border-white/20 hover:text-[#FAFAFA] transition-colors w-full">
            Copy Output
          </button>
        </div>
      )}

      <div className="bg-[#18181C] border border-[#F59E0B]/20 rounded-[7px] p-3">
        <p className="text-[10px] text-[#F59E0B] font-mono">DES is considered insecure. Use AES for production.</p>
      </div>
    </div>
  );
}
