#!/usr/bin/env node

/**
 * baiduchat2api-manage Project Generator
 * Generates complete project structure with all necessary files
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

// Project structure definition
const projectStructure = {
  'lib': {
    'db.ts': `// Database connection and utilities`,
    'auth.ts': `// Authentication utilities`,
    'utils.ts': `// Common utilities`,
  },
  'lib/db': {
    'schema.ts': `// Database schema types`,
    'queries.ts': `// Database queries`,
  },
  'components': {
    'ui': {
      'button.tsx': `// Button component`,
      'card.tsx': `// Card component`,
      'input.tsx': `// Input component`,
      'table.tsx': `// Table component`,
    },
    'dashboard': {
      'stats-card.tsx': `// Statistics card component`,
      'chart.tsx': `// Chart component`,
    },
    'logs': {
      'log-table.tsx': `// Log table component`,
      'log-filter.tsx': `// Log filter component`,
    },
  },
  'app': {
    'layout.tsx': `// Root layout`,
    'page.tsx': `// Home page (redirect to dashboard)`,
    '(auth)': {
      'layout.tsx': `// Auth layout`,
      'login': {
        'page.tsx': `// Login page`,
      },
    },
    '(dashboard)': {
      'layout.tsx': `// Dashboard layout`,
      'page.tsx': `// Dashboard home`,
      'logs': {
        'page.tsx': `// Logs page`,
      },
      'config': {
        'page.tsx': `// Config page`,
      },
      'cookie': {
        'page.tsx': `// Cookie management page`,
      },
      'monitor': {
        'page.tsx': `// System monitor page`,
      },
    },
    'api': {
      'auth': {
        '[...nextauth]': {
          'route.ts': `// NextAuth API route`,
        },
      },
      'logs': {
        'route.ts': `// Logs API`,
        'stats': {
          'route.ts': `// Logs statistics API`,
        },
      },
      'config': {
        'route.ts': `// Config API`,
      },
      'cookie': {
        'route.ts': `// Cookie API`,
        'status': {
          'route.ts': `// Cookie status API`,
        },
      },
      'monitor': {
        'route.ts': `// Monitor API`,
      },
    },
  },
  'docs': {
    'zh': {
      'README.md': `# 中文文档`,
      'deployment-vercel.md': `# Vercel 部署指南`,
      'deployment-cloudflare.md': `# Cloudflare 部署指南`,
      'cookie-guide.md': `# Cookie 获取教程`,
      'api-reference.md': `# API 参考文档`,
    },
    'en': {
      'README.md': `# English Documentation`,
      'deployment-vercel.md': `# Vercel Deployment Guide`,
      'deployment-cloudflare.md': `# Cloudflare Deployment Guide`,
      'cookie-guide.md': `# Cookie Retrieval Guide`,
      'api-reference.md': `# API Reference`,
    },
  },
  'scripts': {
    'db-migrate.js': `// Database migration script`,
    'db-seed.js': `// Database seed script`,
  },
  'public': {
    'favicon.ico': `// Favicon`,
  },
};

// File templates
const templates = {
  'lib/db.ts': `import { sql } from '@vercel/postgres';

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  try {
    const result = await sql.query(text, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

export default {
  query,
  getOne,
};
`,

  'lib/auth.ts': `import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
`,

  'lib/utils.ts': `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}
`,

  'app/layout.tsx': `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'baiduchat2api-manage',
  description: 'Visual management system for baiduchat2api',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`,

  'app/page.tsx': `import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
`,
};

// Create directory structure
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(\`✅ Created directory: \${dirPath}\`);
  }
}

// Create file with content
function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  createDirectory(dir);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(\`✅ Created file: \${filePath}\`);
  } else {
    console.log(\`⏭️  File exists: \${filePath}\`);
  }
}

// Recursively create structure
function createStructure(structure, basePath = PROJECT_ROOT) {
  for (const [name, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, name);

    if (typeof content === 'object' && !name.includes('.')) {
      // It's a directory
      createDirectory(fullPath);
      createStructure(content, fullPath);
    } else {
      // It's a file
      const templateKey = path.relative(PROJECT_ROOT, fullPath).replace(/\\\\/g, '/');
      const fileContent = templates[templateKey] || content;
      createFile(fullPath, fileContent);
    }
  }
}

// Main execution
console.log('🚀 Starting baiduchat2api-manage project generation...\n');

try {
  createStructure(projectStructure);

  console.log(\`
✨ Project structure generated successfully!

Next steps:
1. Install dependencies: npm install
2. Copy environment variables: cp .env.example .env.local
3. Configure your database connection in .env.local
4. Run database migrations: npm run db:migrate
5. Start development server: npm run dev

📚 Documentation:
- Chinese: ./docs/zh/README.md
- English: ./docs/en/README.md

🚀 Deploy:
- Vercel: See docs/zh/deployment-vercel.md
- Cloudflare: See docs/zh/deployment-cloudflare.md
  \`);
} catch (error) {
  console.error('❌ Error generating project:', error);
  process.exit(1);
}
