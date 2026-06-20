'use client';

import { useState } from 'react';
import Link from 'next/link';

const tools = [
  { abbr: 'QR',  name: 'QR Code Generator',    desc: 'Generate QR from URL or text',  slug: 'qr',              category: 'Images' },
  { abbr: '{ }', name: 'JSON Formatter',        desc: 'Validate & format JSON',        slug: 'json',            category: 'Developer' },
  { abbr: '***', name: 'Password Generator',    desc: 'Secure custom passwords',       slug: 'password',        category: 'Security' },
  { abbr: 'IMG', name: 'Image Compressor',      desc: 'Compress images in browser',    slug: 'image-compressor',category: 'Images' },
  { abbr: 'RGB', name: 'Color Picker',          desc: 'HEX / RGB / HSL converter',     slug: 'color-picker',    category: 'Colors' },
  { abbr: 'MD',  name: 'Markdown Editor',       desc: 'Write & preview Markdown',      slug: 'markdown',        category: 'Text' },
  { abbr: 'W',   name: 'Word Counter',          desc: 'Count words & characters',      slug: 'word-counter',    category: 'Text' },
  { abbr: 'B64', name: 'Base64 Encoder',        desc: 'Encode & decode Base64',        slug: 'base64',          category: 'Developer' },
  { abbr: 'URL', name: 'URL Encoder',           desc: 'URL encode & decode',           slug: 'url-encoder',     category: 'Developer' },
  { abbr: 'LI',  name: 'Lorem Ipsum',           desc: 'Generate placeholder text',     slug: 'lorem-ipsum',     category: 'Generators' },
  { abbr: 'ID',  name: 'UUID Generator',        desc: 'Generate v4 UUIDs',             slug: 'uuid',            category: 'Generators' },
  { abbr: 'UTC', name: 'Timestamp Converter',   desc: 'Unix timestamp convert',        slug: 'timestamp',       category: 'Time & Date' },
  { abbr: 'AES', name: 'AES Encryption',        desc: 'AES-128/192/256 encrypt/decrypt', slug: 'aes',           category: 'Crypto' },
  { abbr: 'RSA', name: 'RSA Encryption',        desc: 'RSA-2048 key gen & encrypt',    slug: 'rsa',             category: 'Crypto' },
  { abbr: 'DES', name: 'DES Encryption',        desc: 'DES ECB/CBC encrypt/decrypt',   slug: 'des',             category: 'Crypto' },
  { abbr: '3DS', name: 'Triple DES',            desc: '3DES ECB/CBC encrypt/decrypt',  slug: 'triple-des',      category: 'Crypto' },
  { abbr: 'BCR', name: 'Bcrypt Hash',           desc: 'Hash & verify with Bcrypt',     slug: 'bcrypt',          category: 'Crypto' },
  { abbr: 'MD5', name: 'MD5 Hash',              desc: 'Generate MD5 hash from text',   slug: 'md5',             category: 'Crypto' },
  { abbr: 'SHA', name: 'SHA-256 / SHA-512',     desc: 'SHA-256 and SHA-512 hashes',    slug: 'sha256',          category: 'Crypto' },
  { abbr: 'MAC', name: 'HMAC Generator',        desc: 'HMAC-SHA256 / HMAC-SHA512',     slug: 'hmac',            category: 'Crypto' },
  { abbr: 'HEX', name: 'Hex Encoder',           desc: 'Text to hex and hex to text',   slug: 'hex',             category: 'Crypto' },
  { abbr: 'JAS', name: 'Jasypt Encryption',     desc: 'PBEWithMD5AndDES, Spring Boot', slug: 'jasypt',          category: 'Crypto' },
  { abbr: 'F64', name: 'File to Base64',        desc: 'File to Base64 and back',       slug: 'file-base64',     category: 'Developer' },
  { abbr: 'DDT', name: 'Date Difference',       desc: 'Days between two dates',        slug: 'date-diff',       category: 'Time & Date' },
  { abbr: 'AGE', name: 'Age Calculator',        desc: 'Your exact age + birthday',     slug: 'age-calc',        category: 'Time & Date' },
  { abbr: 'SIP', name: 'SIP Calculator',        desc: 'Mutual fund SIP returns',       slug: 'sip-calc',        category: 'Finance' },
  { abbr: 'TIP', name: 'Tip Calculator',        desc: 'Tip + bill split',              slug: 'tip-calc',        category: 'Finance' },
  { abbr: 'JWT', name: 'JWT Decoder',           desc: 'Decode + inspect JWT tokens',   slug: 'jwt-decoder',     category: 'Security' },
  { abbr: 'BIN', name: 'Number Base Converter', desc: 'Binary / Octal / Hex / Dec',    slug: 'number-base',     category: 'Developer' },
  { abbr: 'HTM', name: 'HTML Entities',         desc: 'Encode & decode HTML entities', slug: 'html-entities',   category: 'Developer' },
  { abbr: 'STR', name: 'String Case Converter', desc: 'camelCase snake_case kebab...',  slug: 'string-case',     category: 'Text' },
  { abbr: 'CRN', name: 'Cron Parser',           desc: 'Explain cron expressions',      slug: 'cron-parser',     category: 'Developer' },
  { abbr: 'CSS', name: 'CSS Unit Converter',    desc: 'px rem em vw vh pt pc',         slug: 'css-units',       category: 'Developer' },
  { abbr: 'REX', name: 'Regex Tester',          desc: 'Test regex with highlighting',  slug: 'regex-tester',    category: 'Developer' },
  { abbr: 'DIF', name: 'Text Diff Checker',     desc: 'Compare two texts line by line',slug: 'text-diff',       category: 'Developer' },
];

const categories = [
  'All', 'Text', 'Developer', 'Security', 'Crypto', 'Images', 'Colors', 'Finance', 'Time & Date', 'Generators',
];

export default function ToolsClient() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTools = activeCategory === 'All'
    ? tools
    : tools.filter((t) => t.category === activeCategory);

  return (
    <>
      <header className="px-5 sm:px-7 py-8 border-b border-white/[0.06]">
        <div className="text-[10px] font-semibold text-t3 uppercase tracking-[0.1em] mb-[6px]">
          Free tools
        </div>
        <h1 className="font-display text-[26px] sm:text-[30px] leading-[1.2] tracking-[-0.04em] mb-2">
          100+ browser tools
        </h1>
        <p className="text-sm text-t2">
          All tools run client-side. Nothing is uploaded.
        </p>
      </header>

      <section className="px-5 sm:px-7 py-6 flex-1">
        <div
          className="flex gap-[5px] flex-wrap mb-6"
          role="tablist"
          aria-label="Tool categories"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={cat === activeCategory}
              onClick={() => setActiveCategory(cat)}
              className={`px-[11px] py-1 rounded-full text-[11px] font-medium border transition-colors ${
                cat === activeCategory
                  ? 'bg-ac border-ac text-white'
                  : 'border-white/10 text-t2 hover:border-white/20 hover:text-t1'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {filteredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="p-4 bg-s1 border border-white/[0.06] rounded-[10px] hover:border-[var(--ac-glow)] hover:bg-[var(--ac-bg)] transition-all group"
            >
              <div className="font-mono text-[13px] font-semibold text-t3 mb-3 group-hover:text-ac transition-colors">
                {tool.abbr}
              </div>
              <div className="text-sm font-medium text-t1 mb-1">{tool.name}</div>
              <div className="text-[11px] text-t3">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
