'use client';

import { useState } from 'react';

interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyPem: string;
  privateKeyPem: string;
}

async function importPublicKeyFromPem(pem: string): Promise<CryptoKey> {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s+/g, '');
  if (!b64) throw new Error('Empty key');
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'spki',
    raw.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  );
}

export default function RsaCrypto() {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Encrypt state
  const [message, setMessage] = useState('');
  const [encryptKeyPem, setEncryptKeyPem] = useState('');
  const [encryptError, setEncryptError] = useState('');
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
      setEncryptKeyPem(pubPem);
      setCiphertext('');
      setPlaintext('');
    } catch (error) {
      console.error('Key generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEncrypt = async () => {
    if (!message.trim() || !encryptKeyPem.trim()) return;
    setEncryptLoading(true);
    setEncryptError('');
    try {
      const publicKey = await importPublicKeyFromPem(encryptKeyPem);
      const enc = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        new TextEncoder().encode(message)
      );
      const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(enc)));
      setCiphertext(cipherB64);
      setPlaintext('');
    } catch (error) {
      console.error('Encryption error:', error);
      setCiphertext('');
      setEncryptError('Invalid public key - paste a valid RSA public key in PEM format (-----BEGIN PUBLIC KEY-----)');
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
      setPlaintext('[Decryption failed]');
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
      <h1 className="text-lg font-bold text-[#FAFAFA] mb-3">RSA Encrypt Decrypt</h1>

      <p className="text-[12px] text-[#A1A1AA] mb-6 leading-relaxed">
        RSA uses two keys: a <span className="text-[#FAFAFA] font-semibold">public key</span> anyone can use to encrypt a message,
        and a <span className="text-[#FAFAFA] font-semibold">private key</span> only you can use to decrypt it. To receive encrypted
        messages, generate a key pair below and share your public key &mdash; keep the private key secret. To send someone else a
        message only they can read, paste <span className="text-[#FAFAFA] font-semibold">their</span> public key into the Encrypt
        section instead of generating your own; you don't need a key pair of your own just to send.
      </p>

      {/* Key Generation Section */}
      <div className="mb-8 pb-8 border-b border-white/10">
        <h2 className="text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-4">
          Key generation
        </h2>

        <button
          onClick={generateKeyPair}
          disabled={loading}
          className="bg-[#F97316] text-[#09090B] px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full mb-4"
        >
          {loading ? 'Generating key pair...' : 'Generate key pair'}
        </button>

        {keyPair ? (
          <div className="space-y-4">
            {/* Public Key */}
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-2">
                Public key
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
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Private Key */}
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-2">
                Private key (PKCS8)
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
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[10px] text-[#F59E0B] mt-1">
                Save this key to decrypt data in future sessions. Keep it secret.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-[7px] bg-[#18181C] border border-white/10 text-[#A1A1AA] text-sm text-center">
            No key pair generated
          </div>
        )}
      </div>

      {/* Encrypt Section */}
      <div className="mb-8 pb-8 border-b border-white/10">
          <h2 className="text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-4">
            Encrypt
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
                  Public key to encrypt with
                </label>
                {keyPair && (
                  <button
                    onClick={() => setEncryptKeyPem(keyPair.publicKeyPem)}
                    className="text-[10px] text-[#F97316] hover:text-[#EA6C0A] font-semibold"
                  >
                    Use my own key
                  </button>
                )}
              </div>
              <textarea
                value={encryptKeyPem}
                onChange={(e) => setEncryptKeyPem(e.target.value)}
                placeholder="Paste a public key here - yours (generate one above) or someone else's&#10;-----BEGIN PUBLIC KEY-----..."
                className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none h-24"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message to encrypt..."
                className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none h-20"
              />
            </div>

            {encryptError && (
              <p className="text-[11px] text-[#F43F5E]">{encryptError}</p>
            )}

            <button
              onClick={handleEncrypt}
              disabled={encryptLoading || !message.trim() || !encryptKeyPem.trim()}
              className="bg-[#F97316] text-[#09090B] px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {encryptLoading ? 'Encrypting...' : 'Encrypt with public key'}
            </button>

            {ciphertext && (
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-2">
                  Ciphertext (Base64)
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
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Decrypt Section */}
      {keyPair && (
        <div>
          <h2 className="text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-4">
            Decrypt
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-2">
                Ciphertext (Base64)
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
              {decryptLoading ? 'Decrypting...' : 'Decrypt with private key'}
            </button>

            {plaintext && (
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-2">
                  Plaintext output
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={plaintext}
                    readOnly
                    className={`flex-1 bg-[#18181C] border rounded-[7px] px-3 py-2 text-sm font-mono outline-none resize-none h-20 ${
                      plaintext === '[Decryption failed]'
                        ? 'border-[#F43F5E]/40 text-[#F43F5E]'
                        : 'border-white/10 text-[#FAFAFA]'
                    }`}
                  />
                  {plaintext !== '[Decryption failed]' && (
                    <button
                      onClick={() => copyToClipboard(plaintext)}
                      className="border border-white/10 text-[#A1A1AA] px-3 py-2 rounded-[7px] text-sm hover:border-white/20 hover:text-[#FAFAFA] transition-colors font-semibold whitespace-nowrap"
                    >
                      {copied ? 'Copied' : 'Copy'}
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
            Generate a key pair above to decrypt messages sent to you - or just paste someone else's public key into Encrypt to send them one
          </p>
        </div>
      )}
    </div>
  );
}
