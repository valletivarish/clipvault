'use client';

import { useState } from 'react';
import CryptoJS from 'crypto-js';

export default function JasyptEncryptor() {
  const [plaintext, setPlaintext] = useState('');
  const [password, setPassword] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptPassword, setDecryptPassword] = useState('');
  const [decryptResult, setDecryptResult] = useState('');
  const [error, setError] = useState('');

  const jasyptEncrypt = (text: string, pwd: string): string => {
    const salt = CryptoJS.lib.WordArray.random(8);
    const passwordArray = CryptoJS.lib.WordArray.create(
      [...pwd].map((c) => c.charCodeAt(0))
    );
    const md5Result = CryptoJS.MD5(passwordArray.concat(salt));
    const key = CryptoJS.lib.WordArray.create(md5Result.words.slice(0, 2));
    const iv = CryptoJS.lib.WordArray.create(md5Result.words.slice(2, 4));

    const encrypted = CryptoJS.DES.encrypt(text, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const combined = salt.clone().concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(combined);
  };

  const jasyptDecrypt = (cipher: string, pwd: string): string => {
    const combined = CryptoJS.enc.Base64.parse(cipher);
    const saltWords = combined.words.slice(0, 2);
    const cipherWords = combined.words.slice(2);
    const salt = CryptoJS.lib.WordArray.create(saltWords);

    const passwordArray = CryptoJS.lib.WordArray.create(
      [...pwd].map((c) => c.charCodeAt(0))
    );
    const md5Result = CryptoJS.MD5(passwordArray.concat(salt));
    const key = CryptoJS.lib.WordArray.create(md5Result.words.slice(0, 2));
    const iv = CryptoJS.lib.WordArray.create(md5Result.words.slice(2, 4));

    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.lib.WordArray.create(cipherWords) } as any,
      key,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  };

  const handleEncrypt = () => {
    setError('');
    if (!plaintext.trim() || !password.trim()) {
      setError('Please enter both plaintext and password');
      return;
    }

    try {
      const result = jasyptEncrypt(plaintext, password);
      setCiphertext(result);
      setDecryptPassword('');
      setDecryptResult('');
    } catch (err) {
      setError('Encryption failed');
      setCiphertext('');
    }
  };

  const handleDecrypt = () => {
    setError('');
    if (!ciphertext.trim() || !decryptPassword.trim()) {
      setError('Please enter both ciphertext and password');
      return;
    }

    try {
      const result = jasyptDecrypt(ciphertext, decryptPassword);
      if (!result) {
        setError('Decryption failed - invalid password or corrupted data');
        return;
      }
      setDecryptResult(result);
    } catch (err) {
      setError('Decryption failed - invalid password or corrupted data');
      setDecryptResult('');
    }
  };

  const copyToClipboard = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="w-full">
      {/* Warning Note */}
      <div className="mb-4 p-3 bg-[#18181C] border border-[#F59E0B]/30 rounded-[7px]">
        <p className="text-[#F59E0B] text-xs font-mono">
          Note: This approximates Jasypt PBEWithMD5AndDES. For exact compatibility, test against your Java application.
        </p>
      </div>

      {/* Encrypt Section */}
      <div className="space-y-4 mb-8 pb-8 border-b border-white/[0.06]">
        <h3 className="text-[#FAFAFA] text-sm font-semibold">Encrypt</h3>

        {/* Plaintext Input */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
            Plaintext
          </label>
          <textarea
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            placeholder="Enter text to encrypt..."
            className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none min-h-[100px]"
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors"
          />
        </div>

        {/* Encrypt Button */}
        <button
          onClick={handleEncrypt}
          className="px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors"
        >
          Encrypt
        </button>

        {/* Ciphertext Output */}
        {ciphertext && (
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
              Ciphertext
            </label>
            <div className="bg-[#111115] border border-white/[0.06] rounded-[7px] px-3 py-3 text-[#F97316] text-xs font-mono min-h-[80px] break-all select-all overflow-y-auto max-h-[200px]">
              {ciphertext}
            </div>
            <button
              onClick={() => copyToClipboard(ciphertext)}
              className="mt-2 px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Decrypt Section */}
      <div className="space-y-4">
        <h3 className="text-[#FAFAFA] text-sm font-semibold">Decrypt</h3>

        {/* Ciphertext Input */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
            Ciphertext
          </label>
          <textarea
            value={ciphertext}
            onChange={(e) => setCiphertext(e.target.value)}
            placeholder="Paste encrypted Base64 string..."
            className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none min-h-[100px]"
          />
        </div>

        {/* Decrypt Password Input */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
            Password
          </label>
          <input
            type="password"
            value={decryptPassword}
            onChange={(e) => setDecryptPassword(e.target.value)}
            placeholder="Enter password for decryption..."
            className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors"
          />
        </div>

        {/* Decrypt Button */}
        <button
          onClick={handleDecrypt}
          className="px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors"
        >
          Decrypt
        </button>

        {/* Plaintext Output */}
        {decryptResult && (
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
              Plaintext
            </label>
            <div className="bg-[#111115] border border-white/[0.06] rounded-[7px] px-3 py-3 text-[#F97316] text-xs font-mono min-h-[80px] break-all select-all overflow-y-auto max-h-[200px]">
              {decryptResult}
            </div>
            <button
              onClick={() => copyToClipboard(decryptResult)}
              className="mt-2 px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-[#18181C] border border-[#F43F5E]/30 rounded-[7px]">
          <p className="text-[#F43F5E] text-sm font-mono">{error}</p>
        </div>
      )}
    </div>
  );
}
