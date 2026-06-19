// Site-wide constants
export const SITE_URL = 'https://clipvault.vercel.app'
export const SITE_NAME = 'ClipVault'
export const SITE_DESCRIPTION = 'Share text and files instantly across devices. Free real-time clipboard boards. No account required.'

// Tool metadata map (used by tool pages for metadata + JSON-LD)
export type ToolMeta = {
  name: string
  slug: string
  description: string
  category: string
  keywords: string[]
}

export const TOOLS: ToolMeta[] = [
  { name: 'QR Code Generator', slug: 'qr', description: 'Generate QR codes from any URL or text instantly. Free, client-side, no signup.', category: 'Images', keywords: ['qr code generator', 'qr code free', 'create qr code online'] },
  { name: 'JSON Formatter', slug: 'json', description: 'Format, validate, and minify JSON instantly. Runs in your browser - nothing uploaded.', category: 'Developer', keywords: ['json formatter', 'json validator online', 'format json'] },
  { name: 'Password Generator', slug: 'password', description: 'Generate strong, secure passwords with custom rules. Client-side only.', category: 'Security', keywords: ['password generator', 'strong password generator', 'secure password'] },
  { name: 'Image Compressor', slug: 'image-compressor', description: 'Compress JPEG, PNG, and WEBP images in your browser. No upload required.', category: 'Images', keywords: ['image compressor online', 'compress image free', 'reduce image size'] },
  { name: 'Color Picker', slug: 'color-picker', description: 'Convert colors between HEX, RGB, and HSL formats. Interactive color picker.', category: 'Colors', keywords: ['color picker online', 'hex to rgb', 'color converter'] },
  { name: 'Markdown Editor', slug: 'markdown', description: 'Write and preview Markdown with live rendering. Download as HTML or plain text.', category: 'Text', keywords: ['markdown editor online', 'markdown preview', 'markdown converter'] },
  { name: 'Word Counter', slug: 'word-counter', description: 'Count words, characters, sentences, and estimate reading time instantly.', category: 'Text', keywords: ['word counter online', 'character counter', 'word count'] },
  { name: 'Base64 Encoder', slug: 'base64', description: 'Encode and decode Base64 strings. Supports text and data URIs.', category: 'Developer', keywords: ['base64 encoder decoder', 'base64 online', 'encode base64'] },
  { name: 'URL Encoder', slug: 'url-encoder', description: 'URL encode and decode strings for safe use in query parameters.', category: 'Developer', keywords: ['url encoder decoder', 'url encode online', 'percent encoding'] },
  { name: 'Lorem Ipsum Generator', slug: 'lorem-ipsum', description: 'Generate Lorem Ipsum placeholder text. Control paragraph count and length.', category: 'Generators', keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text generator'] },
  { name: 'UUID Generator', slug: 'uuid', description: 'Generate RFC 4122 v4 UUIDs instantly. View history of generated IDs.', category: 'Generators', keywords: ['uuid generator', 'uuid v4', 'generate uuid online'] },
  { name: 'Timestamp Converter', slug: 'timestamp', description: 'Convert Unix timestamps to human-readable dates and back. Shows current epoch.', category: 'Time & Date', keywords: ['unix timestamp converter', 'epoch time converter', 'timestamp to date'] },
  { name: 'AES Encryption', slug: 'aes', description: 'Encrypt and decrypt text with AES-128/192/256. ECB and CBC modes. Runs entirely in your browser.', category: 'Crypto', keywords: ['aes encryption online', 'aes decrypt', 'aes encrypt tool'] },
  { name: 'RSA Encryption', slug: 'rsa', description: 'Generate RSA-2048 key pairs and encrypt/decrypt messages using Web Crypto API. Client-side only.', category: 'Crypto', keywords: ['rsa encryption online', 'rsa key generator', 'rsa decrypt'] },
  { name: 'DES Encryption', slug: 'des', description: 'Encrypt and decrypt with DES (ECB/CBC). For legacy system compatibility testing.', category: 'Crypto', keywords: ['des encryption online', 'des decrypt', 'des cipher tool'] },
  { name: 'Triple DES Encryption', slug: 'triple-des', description: 'Encrypt and decrypt with Triple DES (3DES) using a 24-character key. ECB and CBC modes.', category: 'Crypto', keywords: ['triple des encryption', '3des online', 'triple des decrypt'] },
  { name: 'Bcrypt Hash Generator', slug: 'bcrypt', description: 'Hash and verify passwords with Bcrypt. Choose salt rounds from 8 to 14. Browser-only.', category: 'Crypto', keywords: ['bcrypt hash generator', 'bcrypt online', 'bcrypt verify'] },
  { name: 'MD5 Hash Generator', slug: 'md5', description: 'Generate MD5 hashes from any text. Instant, client-side, no data uploaded.', category: 'Crypto', keywords: ['md5 hash generator', 'md5 online', 'md5 checksum'] },
  { name: 'SHA-256 Hash Generator', slug: 'sha256', description: 'Generate SHA-256 and SHA-512 hashes using the Web Crypto API. Nothing leaves your browser.', category: 'Crypto', keywords: ['sha256 generator online', 'sha-256 hash', 'sha512 online'] },
  { name: 'HMAC Generator', slug: 'hmac', description: 'Generate HMAC-SHA256 and HMAC-SHA512 signatures with a secret key. Uses Web Crypto API.', category: 'Crypto', keywords: ['hmac generator online', 'hmac sha256', 'hmac sha512'] },
  { name: 'Hex Encoder / Decoder', slug: 'hex', description: 'Encode text to hexadecimal and decode hex back to text. Pure client-side.', category: 'Crypto', keywords: ['hex encoder online', 'hex decoder', 'text to hex'] },
]

// Build Next.js Metadata object for a page
export function buildMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string
  description: string
  path: string
  noindex?: boolean
}) {
  const url = `${SITE_URL}${path}`
  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      site: '@clipvault',
    },
  }
}

// JSON-LD: WebApplication schema for homepage
export function webAppJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Real-time clipboard sharing',
      'File sharing with expiry',
      'No account required',
      '100+ free browser tools',
    ],
  }
}

// JSON-LD: SoftwareApplication for individual tool pages
export function toolJsonLd(tool: ToolMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    url: `${SITE_URL}/tools/${tool.slug}`,
    description: tool.description,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    keywords: tool.keywords.join(', '),
  }
}

// JSON-LD: BreadcrumbList
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
