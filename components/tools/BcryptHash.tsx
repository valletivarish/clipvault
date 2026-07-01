'use client';

import { useState } from 'react';
import bcrypt from 'bcryptjs';

export default function BcryptHash() {
  const [activeTab, setActiveTab] = useState<'hash' | 'verify'>('hash');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hash tab state
  const [plaintext, setPlaintext] = useState('');
  const [saltRounds, setSaltRounds] = useState(10);
  const [hashOutput, setHashOutput] = useState('');

  // Verify tab state
  const [verifyPlaintext, setVerifyPlaintext] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<'match' | 'nomatch' | null>(null);

  const handleGenerateHash = async () => {
    if (!plaintext.trim()) return;
    setLoading(true);
    try {
      const hash = await bcrypt.hash(plaintext, saltRounds);
      setHashOutput(hash);
      setVerifyResult(null);
    } catch (error) {
      console.error('Hash error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyPlaintext.trim() || !verifyHash.trim()) return;
    setLoading(true);
    try {
      const isMatch = await bcrypt.compare(verifyPlaintext, verifyHash);
      setVerifyResult(isMatch ? 'match' : 'nomatch');
    } catch (error) {
      console.error('Verify error:', error);
      setVerifyResult('nomatch');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-[#111115] rounded-lg border border-white/10">
      <h1 className="text-lg font-bold text-[#FAFAFA] mb-6">Bcrypt Hash Generator</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('hash')}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'hash'
              ? 'text-[#F97316] border-b-2 border-[#F97316]'
              : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
          }`}
        >
          Hash
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'verify'
              ? 'text-[#F97316] border-b-2 border-[#F97316]'
              : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
          }`}
        >
          Verify
        </button>
      </div>

      {/* Hash Tab */}
      {activeTab === 'hash' && (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-2">
              Plaintext
            </label>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none h-24"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-2">
              Salt rounds
            </label>
            <select
              value={saltRounds}
              onChange={(e) => setSaltRounds(Number(e.target.value))}
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors"
            >
              <option value={8}>8 rounds</option>
              <option value={10}>10 rounds</option>
              <option value={12}>12 rounds</option>
              <option value={14}>14 rounds</option>
            </select>
          </div>

          <button
            onClick={handleGenerateHash}
            disabled={loading || !plaintext.trim()}
            className="bg-[#F97316] text-[#09090B] px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {loading ? 'Generating...' : 'Generate hash'}
          </button>

          {hashOutput && (
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-2">
                Hash output
              </label>
              <div className="flex gap-2">
                <textarea
                  value={hashOutput}
                  readOnly
                  className="flex-1 bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none resize-none h-20"
                />
                <button
                  onClick={() => copyToClipboard(hashOutput)}
                  className="border border-white/10 text-[#A1A1AA] px-3 py-2 rounded-[7px] text-sm hover:border-white/20 hover:text-[#FAFAFA] transition-colors font-semibold whitespace-nowrap"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verify Tab */}
      {activeTab === 'verify' && (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-2">
              Plaintext
            </label>
            <textarea
              value={verifyPlaintext}
              onChange={(e) => setVerifyPlaintext(e.target.value)}
              placeholder="Enter original text..."
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none h-20"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-2">
              Hash to verify
            </label>
            <textarea
              value={verifyHash}
              onChange={(e) => setVerifyHash(e.target.value)}
              placeholder="Paste hash here..."
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none h-20"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || !verifyPlaintext.trim() || !verifyHash.trim()}
            className="bg-[#F97316] text-[#09090B] px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          {verifyResult && (
            <div
              className={`p-3 rounded-[7px] text-center font-semibold text-sm ${
                verifyResult === 'match'
                  ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                  : 'bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/20'
              }`}
            >
              {verifyResult === 'match' ? 'Match' : 'No match'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
