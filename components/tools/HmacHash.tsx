'use client'

import { useState } from 'react'

type Algorithm = 'SHA-256' | 'SHA-512'

export default function HmacHash() {
  const [message, setMessage] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-256')
  const [hash, setHash] = useState('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateHmac = async () => {
    if (!message || !secretKey) return

    setIsLoading(true)
    try {
      const algoConfig = {
        name: 'HMAC',
        hash: algorithm,
      }

      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secretKey),
        algoConfig,
        false,
        ['sign']
      )

      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(message)
      )

      const hmacHex = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      setHash(hmacHex)
    } catch (error) {
      console.error('HMAC generation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-5">
        <label className="block text-[#A1A1AA] text-sm font-medium mb-2">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message to sign..."
          className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none"
          rows={4}
        />
        <div className="mt-2 text-xs text-[#52525B]">
          {message.length} characters
        </div>
      </div>

      <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-5">
        <label className="block text-[#A1A1AA] text-sm font-medium mb-2">
          Secret Key
        </label>
        <input
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder="Enter secret key..."
          className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors"
        />
      </div>

      <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-5">
        <label className="block text-[#A1A1AA] text-sm font-medium mb-2">
          Algorithm
        </label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
          className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40 transition-colors"
        >
          <option value="SHA-256">HMAC-SHA256</option>
          <option value="SHA-512">HMAC-SHA512</option>
        </select>
      </div>

      <button
        onClick={handleGenerateHmac}
        disabled={isLoading || !message || !secretKey}
        className="bg-[#F97316] text-white px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : 'Generate HMAC'}
      </button>

      {hash && (
        <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-5">
          <label className="block text-[#A1A1AA] text-sm font-medium mb-2">
            HMAC Output
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hash}
              readOnly
              className="flex-1 bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none break-all"
            />
            <button
              onClick={handleCopy}
              className={`border border-white/10 px-4 py-2 rounded-[7px] text-sm font-semibold transition-colors whitespace-nowrap ${
                copied
                  ? 'border-[#22C55E]/40 text-[#22C55E]'
                  : 'text-[#A1A1AA] hover:border-white/20 hover:text-[#FAFAFA]'
              }`}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
