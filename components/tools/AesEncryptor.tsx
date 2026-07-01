'use client';

import { useState } from 'react';
import CryptoJS from 'crypto-js';

function padKey(key: string, bits: 128 | 192 | 256): string {
  const len = bits / 8;
  if (key.length >= len) return key.slice(0, len);
  return key.padEnd(len, '0');
}

export default function AesEncryptor() {
  const [action, setAction] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [iv, setIv] = useState('');
  const [mode, setMode] = useState<'ECB' | 'CBC'>('ECB');
  const [keySize, setKeySize] = useState<128 | 192 | 256>(256);
  const [error, setError] = useState('');

  const buildOptions = () => {
    const keyWA = CryptoJS.enc.Utf8.parse(padKey(secretKey, keySize));
    const opts: Record<string, unknown> = {
      mode: mode === 'CBC' ? CryptoJS.mode.CBC : CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    };
    if (mode === 'CBC') {
      const ivStr = iv.trim() ? iv.slice(0, 16).padEnd(16, '0') : '\0'.repeat(16);
      opts.iv = CryptoJS.enc.Utf8.parse(ivStr);
    }
    return { keyWA, opts };
  };

  const handleEncrypt = () => {
    setError('');
    if (!plaintext.trim() || !secretKey.trim()) {
      setError('Please enter both plaintext and secret key');
      setCiphertext('');
      return;
    }
    try {
      const { keyWA, opts } = buildOptions();
      const encrypted = CryptoJS.AES.encrypt(plaintext, keyWA, opts);
      setCiphertext(encrypted.toString());
    } catch {
      setError('Encryption failed');
      setCiphertext('');
    }
  };

  const handleDecrypt = () => {
    setError('');
    if (!ciphertext.trim() || !secretKey.trim()) {
      setError('Please enter both ciphertext and secret key');
      setPlaintext('');
      return;
    }
    try {
      const { keyWA, opts } = buildOptions();
      const decrypted = CryptoJS.AES.decrypt(ciphertext, keyWA, opts).toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        setError('Decryption failed - wrong key, IV, or corrupted data');
        setPlaintext('');
        return;
      }
      setPlaintext(decrypted);
    } catch {
      setError('Decryption failed - wrong key, IV, or corrupted data');
      setPlaintext('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-s1 rounded-lg border border-white/10">
      <h2 className="text-lg font-semibold text-t1 mb-6">AES Encrypt / Decrypt</h2>

      <select
        value={action}
        onChange={(e) => {
          setAction(e.target.value as 'encrypt' | 'decrypt');
          setError('');
        }}
        className="w-full mb-6 bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-semibold outline-none focus:border-ac/40 transition-colors"
      >
        <option value="encrypt">Encrypt</option>
        <option value="decrypt">Decrypt</option>
      </select>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-t2 mb-2">Secret Key</label>
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder={`Enter secret key (auto-padded to ${keySize / 8} bytes)`}
            className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-mono outline-none focus:border-ac/40 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-t2 mb-2">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'ECB' | 'CBC')}
              className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm outline-none focus:border-ac/40 transition-colors"
            >
              <option value="ECB">ECB</option>
              <option value="CBC">CBC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-t2 mb-2">Key Size</label>
            <select
              value={keySize}
              onChange={(e) => setKeySize(parseInt(e.target.value) as 128 | 192 | 256)}
              className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm outline-none focus:border-ac/40 transition-colors"
            >
              <option value="128">128 bits</option>
              <option value="192">192 bits</option>
              <option value="256">256 bits</option>
            </select>
          </div>
        </div>

        {mode === 'CBC' && (
          <div>
            <label className="block text-sm font-medium text-t2 mb-2">
              IV <span className="text-t3 font-normal">(optional - 16 chars, padded with zeros if shorter)</span>
            </label>
            <input
              type="text"
              value={iv}
              onChange={(e) => setIv(e.target.value)}
              placeholder="Leave blank to use zero IV"
              maxLength={16}
              className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-mono outline-none focus:border-ac/40 transition-colors"
            />
          </div>
        )}
      </div>

      {action === 'encrypt' ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-t2 mb-2">Plaintext</label>
          <textarea
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            placeholder="Enter text to encrypt"
            rows={6}
            className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-mono outline-none focus:border-ac/40 transition-colors resize-none"
          />
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium text-t2 mb-2">Ciphertext</label>
          <textarea
            value={ciphertext}
            onChange={(e) => setCiphertext(e.target.value)}
            placeholder="Paste ciphertext to decrypt"
            rows={6}
            className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-mono outline-none focus:border-ac/40 transition-colors resize-none"
          />
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-s2 border border-danger/30 rounded-[7px]">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={action === 'encrypt' ? handleEncrypt : handleDecrypt}
        className="bg-ac text-white px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors w-full"
      >
        {action === 'encrypt' ? 'Encrypt' : 'Decrypt'}
      </button>

      {action === 'encrypt' && ciphertext && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-t2 mb-2">Ciphertext</label>
          <textarea
            value={ciphertext}
            readOnly
            rows={6}
            className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-mono outline-none resize-none"
          />
          <button
            onClick={() => copyToClipboard(ciphertext)}
            className="mt-2 border border-white/10 text-t2 px-3 py-1.5 rounded-[7px] text-xs hover:border-white/20 hover:text-t1 transition-colors"
          >
            Copy
          </button>
        </div>
      )}

      {action === 'decrypt' && plaintext && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-t2 mb-2">Plaintext</label>
          <textarea
            value={plaintext}
            readOnly
            rows={6}
            className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-mono outline-none resize-none"
          />
          <button
            onClick={() => copyToClipboard(plaintext)}
            className="mt-2 border border-white/10 text-t2 px-3 py-1.5 rounded-[7px] text-xs hover:border-white/20 hover:text-t1 transition-colors"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
