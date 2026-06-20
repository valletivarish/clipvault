'use client'

import { useState } from 'react'

type Algorithm = 'SHA-256' | 'SHA-512'

export default function Sha256Hash() {
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-256')
  const [hash, setHash] = useState('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleHash = async () => {
    if (!input) return

    setIsLoading(true)
    try {
      const buffer = new TextEncoder().encode(input)
      const digestBuffer = await crypto.subtle.digest(algorithm, buffer)
      const hashHex = Array.from(new Uint8Array(digestBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      setHash(hashHex)
    } catch (error) {
      console.error('Hash error:', error)
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
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none"
          rows={4}
        />
        <div className="mt-2 text-xs text-[#52525B]">
          {input.length} characters
        </div>
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
          <option value="SHA-256">SHA-256</option>
          <option value="SHA-512">SHA-512</option>
        </select>
      </div>

      <button
        onClick={handleHash}
        disabled={isLoading || !input}
        className="bg-[#F97316] text-white px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : `Generate ${algorithm}`}
      </button>

      {hash && (
        <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-5">
          <label className="block text-[#A1A1AA] text-sm font-medium mb-2">
            {algorithm} Hash
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
