'use client';

import { useState } from 'react';
import Link from 'next/link';

const tools = [
  { abbr: 'QR',  name: 'QR Code Generator',    desc: 'Generate QR from URL or text',    slug: 'qr',              category: 'Images' },
  { abbr: '{ }', name: 'JSON Formatter',        desc: 'Validate & format JSON',          slug: 'json',            category: 'Developer' },
  { abbr: '***', name: 'Password Generator',    desc: 'Secure custom passwords',         slug: 'password',        category: 'Encryption' },
  { abbr: 'IMG', name: 'Image Compressor',      desc: 'Compress images in browser',      slug: 'image-compressor',category: 'Images' },
  { abbr: 'RGB', name: 'Color Picker',          desc: 'HEX / RGB / HSL converter',       slug: 'color-picker',    category: 'Colors' },
  { abbr: 'MD',  name: 'Markdown Editor',       desc: 'Write & preview Markdown',        slug: 'markdown',        category: 'Text' },
  { abbr: 'W',   name: 'Word Counter',          desc: 'Count words & characters',        slug: 'word-counter',    category: 'Text' },
  { abbr: 'B64', name: 'Base64 Encoder',        desc: 'Encode & decode Base64',          slug: 'base64',          category: 'Developer' },
  { abbr: 'URL', name: 'URL Encoder',           desc: 'URL encode & decode',             slug: 'url-encoder',     category: 'Developer' },
  { abbr: 'LI',  name: 'Lorem Ipsum',           desc: 'Generate placeholder text',       slug: 'lorem-ipsum',     category: 'Text' },
  { abbr: 'ID',  name: 'UUID Generator',        desc: 'Generate v4 UUIDs',               slug: 'uuid',            category: 'Developer' },
  { abbr: 'UTC', name: 'Timestamp Converter',   desc: 'Unix timestamp convert',          slug: 'timestamp',       category: 'Date & Time' },
  { abbr: 'AES', name: 'AES Encryption',        desc: 'AES-128/192/256 encrypt/decrypt', slug: 'aes',             category: 'Encryption' },
  { abbr: 'RSA', name: 'RSA Encryption',        desc: 'RSA-2048 key gen & encrypt',      slug: 'rsa',             category: 'Encryption' },
  { abbr: 'DES', name: 'DES Encryption',        desc: 'DES ECB/CBC encrypt/decrypt',     slug: 'des',             category: 'Encryption' },
  { abbr: '3DS', name: 'Triple DES',            desc: '3DES ECB/CBC encrypt/decrypt',    slug: 'triple-des',      category: 'Encryption' },
  { abbr: 'BCR', name: 'Bcrypt Hash',           desc: 'Hash & verify with Bcrypt',       slug: 'bcrypt',          category: 'Encryption' },
  { abbr: 'MD5', name: 'MD5 Hash',              desc: 'Generate MD5 hash from text',     slug: 'md5',             category: 'Encryption' },
  { abbr: 'SHA', name: 'SHA-256 / SHA-512',     desc: 'SHA-256 and SHA-512 hashes',      slug: 'sha256',          category: 'Encryption' },
  { abbr: 'MAC', name: 'HMAC Generator',        desc: 'HMAC-SHA256 / HMAC-SHA512',       slug: 'hmac',            category: 'Encryption' },
  { abbr: 'HEX', name: 'Hex Encoder',           desc: 'Text to hex and hex to text',     slug: 'hex',             category: 'Encryption' },
  { abbr: 'JAS', name: 'Jasypt Encryption',     desc: 'PBEWithMD5AndDES, Spring Boot',   slug: 'jasypt',          category: 'Encryption' },
  { abbr: 'F64', name: 'File to Base64',        desc: 'File to Base64 and back',         slug: 'file-base64',     category: 'Developer' },
  { abbr: 'DDT', name: 'Date Difference',       desc: 'Days between two dates',          slug: 'date-diff',       category: 'Date & Time' },
  { abbr: 'AGE', name: 'Age Calculator',        desc: 'Your exact age + birthday',       slug: 'age-calc',        category: 'Date & Time' },
  { abbr: 'SIP', name: 'SIP Calculator',        desc: 'Mutual fund SIP returns',         slug: 'sip-calc',        category: 'Finance' },
  { abbr: 'TIP', name: 'Tip Calculator',        desc: 'Tip + bill split',                slug: 'tip-calc',        category: 'Finance' },
  { abbr: 'JWT', name: 'JWT Decoder',           desc: 'Decode + inspect JWT tokens',     slug: 'jwt-decoder',     category: 'Encryption' },
  { abbr: 'BIN', name: 'Number Base Converter', desc: 'Binary / Octal / Hex / Dec',      slug: 'number-base',     category: 'Developer' },
  { abbr: 'HTM', name: 'HTML Entities',         desc: 'Encode & decode HTML entities',   slug: 'html-entities',   category: 'Text' },
  { abbr: 'STR', name: 'String Case Converter', desc: 'camelCase snake_case kebab...',   slug: 'string-case',     category: 'Text' },
  { abbr: 'CRN', name: 'Cron Parser',           desc: 'Explain cron expressions',        slug: 'cron-parser',     category: 'Developer' },
  { abbr: 'CSS', name: 'CSS Unit Converter',    desc: 'px rem em vw vh pt pc',           slug: 'css-units',       category: 'Developer' },
  { abbr: 'REX', name: 'Regex Tester',          desc: 'Test regex with highlighting',    slug: 'regex-tester',    category: 'Developer' },
  { abbr: 'DIF', name: 'Text Diff Checker',       desc: 'Compare two texts line by line',  slug: 'text-diff',          category: 'Text' },
  { abbr: 'J2C', name: 'JSON to CSV',             desc: 'Convert JSON arrays to CSV',       slug: 'json-to-csv',        category: 'Developer' },
  { abbr: 'XML', name: 'XML Formatter',           desc: 'Format & validate XML',            slug: 'xml-formatter',      category: 'Developer' },
  { abbr: 'MIN', name: 'Code Minifier',           desc: 'Minify HTML / CSS / JS',           slug: 'code-minifier',      category: 'Developer' },
  { abbr: 'UNT', name: 'Unit Converter',          desc: 'Temp, length, weight, speed',      slug: 'unit-converter',     category: 'Developer' },
  { abbr: 'RSZ', name: 'Image Resize',            desc: 'Resize images in browser',         slug: 'image-resize',       category: 'Images' },
  { abbr: 'PWS', name: 'Password Strength',       desc: 'Analyse password strength',        slug: 'password-strength',  category: 'Encryption' },
  { abbr: 'PDF', name: 'PDF Merge',               desc: 'Merge multiple PDFs into one',     slug: 'pdf-merge',          category: 'PDF' },
];

const categories = ['All', 'Text', 'Encryption', 'Developer', 'Images', 'Colors', 'Date & Time', 'Finance', 'PDF'];

export default function HomeToolsSection() {
  const [active, setActive] = useState('Developer');

  const filtered = active === 'All' ? tools : tools.filter(t => t.category === active);

  return (
    <section className="py-7 pb-10">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-7">
        <div className="text-[10px] font-semibold text-t3 uppercase tracking-[0.1em] mb-[6px]">Free tools</div>
        <h2 className="font-display text-[22px] sm:text-[24px] tracking-[-0.03em] mb-1">100+ browser tools</h2>
        <p className="text-xs text-t3 mb-5">Everything runs in your browser. Nothing is sent to any server.</p>

        <div className="flex gap-[5px] flex-wrap mb-[18px]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-[11px] py-1 rounded-full text-[11px] font-medium border transition-colors ${
                cat === active
                  ? 'bg-ac border-ac text-white'
                  : 'border-white/10 text-t2 hover:border-white/20 hover:text-t1'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="p-4 bg-s2 border border-white/10 rounded-xl hover:border-[var(--ac-glow)] hover:bg-[var(--ac-bg)] transition-all group"
            >
              <span className="inline-block font-mono text-[10px] font-bold text-t3 bg-s3 px-[7px] py-[2px] rounded mb-3 group-hover:text-ac transition-colors">
                {tool.abbr}
              </span>
              <div className="text-[13px] font-semibold text-t1 mb-1 leading-snug">{tool.name}</div>
              <div className="text-[11px] text-t3 leading-snug">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
