'use client';

import { useState } from 'react';
import CryptoJS from 'crypto-js';

export default function AesEncryptor() {
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [mode, setMode] = useState<'ECB' | 'CBC'>('ECB');
  const [keySize, setKeySize] = useState<128 | 192 | 256>(256);
  const [error, setError] = useState('');

  const handleEncrypt = () => {
    setError('');
    if (!plaintext.trim() || !secretKey.trim()) {
      setError('Please enter both plaintext and secret key');
      return;
    }

    try {
      const encrypted = CryptoJS.AES.encrypt(plaintext, secretKey).toString();
      setCiphertext(encrypted);
    } catch (err) {
      setError('Encryption failed');
    }
  };

  const handleDecrypt = () => {
    setError('');
    if (!ciphertext.trim() || !secretKey.trim()) {
      setError('Please enter both ciphertext and secret key');
      return;
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(ciphertext, secretKey).toString(
        CryptoJS.enc.Utf8
      );
      if (!decrypted) {
        setError('Decryption failed - invalid key or corrupted data');
        return;
      }
      setPlaintext(decrypted);
    } catch (err) {
      setError('Decryption failed - invalid key or corrupted data');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-s1 rounded-lg border border-white/10">
      <h2 className="text-lg font-semibold text-t1 mb-6">AES Encrypt / Decrypt</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-t2 mb-2">
            Secret Key
          </label>
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter secret key"
            className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-mono outline-none focus:border-ac/40 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-t2 mb-2">
              Mode
            </label>
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
            <label className="block text-sm font-medium text-t2 mb-2">
              Key Size
            </label>
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
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-t2 mb-2">
            Plaintext
          </label>
          <textarea
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            placeholder="Enter text to encrypt"
            rows={6}
            className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-mono outline-none focus:border-ac/40 transition-colors resize-none"
          />
          <button
            onClick={() => copyToClipboard(plaintext)}
            disabled={!plaintext}
            className="mt-2 border border-white/10 text-t2 px-3 py-1.5 rounded-[7px] text-xs hover:border-white/20 hover:text-t1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Copy
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-t2 mb-2">
            Ciphertext
          </label>
          <textarea
            value={ciphertext}
            onChange={(e) => setCiphertext(e.target.value)}
            placeholder="Encrypted output will appear here"
            rows={6}
            className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-mono outline-none focus:border-ac/40 transition-colors resize-none"
          />
          <button
            onClick={() => copyToClipboard(ciphertext)}
            disabled={!ciphertext}
            className="mt-2 border border-white/10 text-t2 px-3 py-1.5 rounded-[7px] text-xs hover:border-white/20 hover:text-t1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Copy
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-s2 border border-danger/30 rounded-[7px]">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleEncrypt}
          className="bg-ac text-white px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors"
        >
          Encrypt
        </button>
        <button
          onClick={handleDecrypt}
          className="border border-white/10 text-t2 px-4 py-2 rounded-[7px] text-sm hover:border-white/20 hover:text-t1 transition-colors"
        >
          Decrypt
        </button>
      </div>
    </div>
  );
}
