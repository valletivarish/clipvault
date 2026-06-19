'use client'

import { useState } from 'react'
import CryptoJS from 'crypto-js'

export default function Md5Hash() {
  const [input, setInput] = useState('')
  const [hash, setHash] = useState('')
  const [copied, setCopied] = useState(false)

  const handleHash = () => {
    const md5Hash = CryptoJS.MD5(input).toString()
    setHash(md5Hash)
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

      <button
        onClick={handleHash}
        className="bg-[#F97316] text-white px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors w-full"
      >
        Generate MD5
      </button>

      {hash && (
        <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-5">
          <label className="block text-[#A1A1AA] text-sm font-medium mb-2">
            MD5 Hash
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hash}
              readOnly
              className="flex-1 bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none"
            />
            <button
              onClick={handleCopy}
              className={`border border-white/10 px-4 py-2 rounded-[7px] text-sm font-semibold transition-colors ${
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
