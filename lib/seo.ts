// Site-wide constants
export const SITE_URL = 'https://clipvault-tools.vercel.app'
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
  { name: 'Jasypt Encryption', slug: 'jasypt', description: 'Encrypt and decrypt with Jasypt-compatible PBEWithMD5AndDES. Test your Spring Boot configs.', category: 'Crypto', keywords: ['jasypt encryption online', 'jasypt decrypt', 'pbe md5 des'] },
  { name: 'File to Base64', slug: 'file-base64', description: 'Convert any file to Base64 and decode Base64 back to a downloadable file. No upload required.', category: 'Developer', keywords: ['file to base64', 'base64 to file', 'base64 encoder file'] },
  { name: 'Date Difference', slug: 'date-diff', description: 'Calculate the exact difference between two dates in days, weeks, months, and years.', category: 'Time & Date', keywords: ['date difference calculator', 'days between dates', 'date calculator'] },
  { name: 'Age Calculator', slug: 'age-calc', description: 'Calculate your exact age in years, months, and days. Find your next birthday countdown.', category: 'Time & Date', keywords: ['age calculator', 'how old am i', 'birthday calculator'] },
  { name: 'SIP Calculator', slug: 'sip-calc', description: 'Calculate SIP returns with monthly investment, annual rate, and investment period.', category: 'Finance', keywords: ['sip calculator', 'systematic investment plan', 'mutual fund sip'] },
  { name: 'Tip Calculator', slug: 'tip-calc', description: 'Calculate tip amount and split the bill among multiple people. Quick preset percentages.', category: 'Finance', keywords: ['tip calculator', 'bill splitter', 'gratuity calculator'] },
  { name: 'JWT Decoder', slug: 'jwt-decoder', description: 'Decode and inspect JSON Web Tokens. View header, payload, and signature. Highlights expiry and date claims.', category: 'Security', keywords: ['jwt decoder', 'jwt parser', 'decode jwt token online'] },
  { name: 'Number Base Converter', slug: 'number-base', description: 'Convert numbers between binary, octal, decimal, and hexadecimal. Type in any base and all others update live.', category: 'Developer', keywords: ['number base converter', 'binary to decimal', 'hex to decimal', 'number system converter'] },
  { name: 'HTML Entities', slug: 'html-entities', description: 'Encode and decode HTML entities. Convert special characters like &amp; &lt; &gt; &quot; instantly.', category: 'Developer', keywords: ['html entity encoder', 'html decode online', 'html entities converter'] },
  { name: 'String Case Converter', slug: 'string-case', description: 'Convert text between camelCase, PascalCase, snake_case, kebab-case, and more. Real-time conversion.', category: 'Text', keywords: ['string case converter', 'camelcase converter', 'snake case online', 'kebab case generator'] },
  { name: 'Cron Expression Parser', slug: 'cron-parser', description: 'Parse and explain cron expressions in plain English. See next 5 run times with preset shortcuts.', category: 'Developer', keywords: ['cron expression parser', 'cron job parser', 'crontab generator', 'cron next run'] },
  { name: 'CSS Unit Converter', slug: 'css-units', description: 'Convert between px, rem, em, vw, vh, pt, and pc units. Set custom root font size, element size, and viewport.', category: 'Developer', keywords: ['css unit converter', 'px to rem', 'rem to px', 'css units online'] },
  { name: 'Regex Tester', slug: 'regex-tester', description: 'Test and debug regular expressions with real-time match highlighting. Supports global, case-insensitive, and multiline flags.', category: 'Developer', keywords: ['regex tester online', 'regular expression tester', 'regex debugger', 'regex match online'] },
  { name: 'Text Diff Checker', slug: 'text-diff', description: 'Compare two texts side by side and see exactly what changed. Line-by-line diff with added and removed highlighting.', category: 'Developer', keywords: ['diff checker online', 'text comparison tool', 'text diff online', 'compare text files'] },
  { name: 'JSON to CSV', slug: 'json-to-csv', description: 'Convert JSON arrays and objects to CSV format instantly. Supports nested objects with dot notation.', category: 'Developer', keywords: ['json to csv converter', 'convert json to csv', 'json csv online'] },
  { name: 'XML Formatter', slug: 'xml-formatter', description: 'Format and validate XML with proper indentation. Minify XML for production use.', category: 'Developer', keywords: ['xml formatter online', 'xml validator', 'format xml', 'xml beautifier'] },
  { name: 'Code Minifier', slug: 'code-minifier', description: 'Minify HTML, CSS, and JavaScript to reduce file size. See percentage saved instantly.', category: 'Developer', keywords: ['code minifier online', 'html minifier', 'css minifier', 'js minifier'] },
  { name: 'Unit Converter', slug: 'unit-converter', description: 'Convert between temperature, length, weight, and speed units. Type in any field and all others update live.', category: 'Developer', keywords: ['unit converter online', 'temperature converter', 'length converter', 'weight converter'] },
  { name: 'Image Resize', slug: 'image-resize', description: 'Resize images in your browser with aspect ratio lock. Export as JPG, PNG, or WEBP with quality control.', category: 'Images', keywords: ['image resize online', 'resize image free', 'image resizer', 'compress resize image'] },
  { name: 'Password Strength Checker', slug: 'password-strength', description: 'Analyse password strength instantly with a detailed checklist. Get suggestions to make it stronger.', category: 'Encryption', keywords: ['password strength checker', 'password strength meter', 'how strong is my password'] },
  { name: 'PDF Merge', slug: 'pdf-merge', description: 'Merge multiple PDF files into one in your browser. Reorder pages, no upload required.', category: 'PDF', keywords: ['merge pdf online', 'combine pdf files', 'pdf merger free', 'join pdf'] },
  { name: 'Word Viewer', slug: 'word-viewer', description: 'Open and read .docx Word documents in your browser. No Microsoft Office needed. Export as HTML.', category: 'Documents', keywords: ['word viewer online', 'docx viewer', 'open word file online', 'view docx without word'] },
  { name: 'Excel Viewer', slug: 'excel-viewer', description: 'Open and view .xlsx, .xls, and .csv spreadsheets in your browser. Download as CSV or XLSX.', category: 'Documents', keywords: ['excel viewer online', 'xlsx viewer', 'open excel file online', 'view spreadsheet online'] },
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
