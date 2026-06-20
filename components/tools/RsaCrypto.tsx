'use client';

import { useState } from 'react';

interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyPem: string;
  privateKeyPem: string;
}

export default function RsaCrypto() {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Encrypt state
  const [message, setMessage] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [encryptLoading, setEncryptLoading] = useState(false);

  // Decrypt state
  const [ciphertextInput, setCiphertextInput] = useState('');
  const [plaintext, setPlaintext] = useState('');
  const [decryptLoading, setDecryptLoading] = useState(false);

  const generateKeyPair = async () => {
    setLoading(true);
    try {
      const pair = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      );

      const pubRaw = await crypto.subtle.exportKey('spki', pair.publicKey);
      const pubB64 = btoa(String.fromCharCode(...new Uint8Array(pubRaw)));
      const pubPem = `-----BEGIN PUBLIC KEY-----\n${pubB64.match(/.{1,64}/g)?.join('\n') || pubB64}\n-----END PUBLIC KEY-----`;

      const privRaw = await crypto.subtle.exportKey('pkcs8', pair.privateKey);
      const privB64 = btoa(String.fromCharCode(...new Uint8Array(privRaw)));
      const privPem = `-----BEGIN PRIVATE KEY-----\n${privB64.match(/.{1,64}/g)?.join('\n') || privB64}\n-----END PRIVATE KEY-----`;

      setKeyPair({
        publicKey: pair.publicKey,
        privateKey: pair.privateKey,
        publicKeyPem: pubPem,
        privateKeyPem: privPem,
      });
      setCiphertext('');
      setPlaintext('');
    } catch (error) {
      console.error('Key generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEncrypt = async () => {
    if (!message.trim() || !keyPair) return;
    setEncryptLoading(true);
    try {
      const enc = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        keyPair.publicKey,
        new TextEncoder().encode(message)
      );
      const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(enc)));
      setCiphertext(cipherB64);
      setPlaintext('');
    } catch (error) {
      console.error('Encryption error:', error);
    } finally {
      setEncryptLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!ciphertextInput.trim() || !keyPair) return;
    setDecryptLoading(true);
    try {
      const cipherBytes = Uint8Array.from(atob(ciphertextInput), (c) =>
        c.charCodeAt(0)
      );
      const dec = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        keyPair.privateKey,
        cipherBytes
      );
      const decrypted = new TextDecoder().decode(dec);
      setPlaintext(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      setPlaintext('[DECRYPTION FAILED]');
    } finally {
      setDecryptLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-[#111115] rounded-lg border border-white/10">
      <h1 className="text-lg font-bold text-[#FAFAFA] mb-6">RSA ENCRYPT DECRYPT</h1>

      {/* Key Generation Section */}
      <div className="mb-8 pb-8 border-b border-white/10">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-4">
          KEY GENERATION
        </h2>

        <button
          onClick={generateKeyPair}
          disabled={loading}
          className="bg-[#F97316] text-[#09090B] px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full mb-4"
        >
          {loading ? 'GENERATING KEY PAIR...' : 'GENERATE KEY PAIR'}
        </button>

        {keyPair ? (
          <div className="space-y-4">
            {/* Public Key */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-2">
                PUBLIC KEY
              </label>
              <div className="flex gap-2">
                <textarea
                  value={keyPair.publicKeyPem}
                  readOnly
                  className="flex-1 bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none resize-none h-24"
                />
                <button
                  onClick={() => copyToClipboard(keyPair.publicKeyPem)}
                  className="border border-white/10 text-[#A1A1AA] px-3 py-2 rounded-[7px] text-sm hover:border-white/20 hover:text-[#FAFAFA] transition-colors font-semibold whitespace-nowrap"
                >
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>

            {/* Private Key */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-2">
                PRIVATE KEY (PKCS8)
              </label>
              <div className="flex gap-2">
                <textarea
                  value={keyPair.privateKeyPem}
                  readOnly
                  className="flex-1 bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none resize-none h-24"
                />
                <button
                  onClick={() => copyToClipboard(keyPair.privateKeyPem)}
                  className="border border-white/10 text-[#A1A1AA] px-3 py-2 rounded-[7px] text-sm hover:border-white/20 hover:text-[#FAFAFA] transition-colors font-semibold whitespace-nowrap"
                >
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <p className="text-[10px] text-[#F59E0B] mt-1">
                Save this key to decrypt data in future sessions. Keep it secret.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-[7px] bg-[#18181C] border border-white/10 text-[#A1A1AA] text-sm text-center">
            NO KEY PAIR GENERATED
          </div>
        )}
      </div>

      {/* Encrypt Section */}
      {keyPair && (
        <div className="mb-8 pb-8 border-b border-white/10">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-4">
            ENCRYPT
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-2">
                MESSAGE
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message to encrypt..."
                className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none h-20"
              />
            </div>

            <button
              onClick={handleEncrypt}
              disabled={encryptLoading || !message.trim()}
              className="bg-[#F97316] text-[#09090B] px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {encryptLoading ? 'ENCRYPTING...' : 'ENCRYPT WITH PUBLIC KEY'}
            </button>

            {ciphertext && (
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-2">
                  CIPHERTEXT (BASE64)
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={ciphertext}
                    readOnly
                    className="flex-1 bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none resize-none h-20 break-all"
                  />
                  <button
                    onClick={() => copyToClipboard(ciphertext)}
                    className="border border-white/10 text-[#A1A1AA] px-3 py-2 rounded-[7px] text-sm hover:border-white/20 hover:text-[#FAFAFA] transition-colors font-semibold whitespace-nowrap"
                  >
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decrypt Section */}
      {keyPair && (
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-4">
            DECRYPT
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-2">
                CIPHERTEXT (BASE64)
              </label>
              <textarea
                value={ciphertextInput}
                onChange={(e) => setCiphertextInput(e.target.value)}
                placeholder="Paste base64 ciphertext here..."
                className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none h-20"
              />
            </div>

            <button
              onClick={handleDecrypt}
              disabled={decryptLoading || !ciphertextInput.trim()}
              className="bg-[#F97316] text-[#09090B] px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {decryptLoading ? 'DECRYPTING...' : 'DECRYPT WITH PRIVATE KEY'}
            </button>

            {plaintext && (
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-2">
                  PLAINTEXT OUTPUT
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={plaintext}
                    readOnly
                    className={`flex-1 bg-[#18181C] border rounded-[7px] px-3 py-2 text-sm font-mono outline-none resize-none h-20 ${
                      plaintext === '[DECRYPTION FAILED]'
                        ? 'border-[#F43F5E]/40 text-[#F43F5E]'
                        : 'border-white/10 text-[#FAFAFA]'
                    }`}
                  />
                  {plaintext !== '[DECRYPTION FAILED]' && (
                    <button
                      onClick={() => copyToClipboard(plaintext)}
                      className="border border-white/10 text-[#A1A1AA] px-3 py-2 rounded-[7px] text-sm hover:border-white/20 hover:text-[#FAFAFA] transition-colors font-semibold whitespace-nowrap"
                    >
                      {copied ? 'COPIED' : 'COPY'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!keyPair && (
        <div className="p-6 rounded-[7px] bg-[#18181C] border border-white/10 text-center">
          <p className="text-[#A1A1AA] text-sm">
            GENERATE A KEY PAIR TO BEGIN ENCRYPTION AND DECRYPTION
          </p>
        </div>
      )}
    </div>
  );
}
