# Electoral System Clean Source Code

This file contains the complete clean source code of the project, excluding node_modules, build outputs, and binary assets.

## File: package.json

``json
{
  "name": "electoral-machine-system",
  "version": "1.0.0",
  "private": true,
  "description": "منظومة إدارة الماكينة الانتخابية - Electoral Machine Management System",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "npx prisma generate && next build && node copy-standalone.js",
    "start": "npx prisma db push && node prisma/seed.js && node .next/standalone/server.js",
    "lint": "eslint .",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:reset": "prisma migrate reset",
    "db:seed": "node prisma/seed.js",
    "postinstall": "prisma generate || true"
  },
  "prisma": {
    "seed": "node prisma/seed.js"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@hookform/resolvers": "^5.1.1",
    "@prisma/client": "^6.11.1",
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@reactuses/core": "^6.0.5",
    "@tanstack/react-query": "^5.82.0",
    "@tanstack/react-table": "^8.21.3",
    "bcryptjs": "^3.0.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.23.2",
    "input-otp": "^1.4.2",
    "jose": "^6.2.3",
    "lucide-react": "^0.525.0",
    "next": "^16.1.1",
    "next-themes": "^0.4.6",
    "pg": "^8.21.0",
    "prisma": "^6.11.1",
    "react": "^19.0.0",
    "react-day-picker": "^9.8.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.60.0",
    "react-markdown": "^10.1.0",
    "react-resizable-panels": "^3.0.3",
    "recharts": "^2.15.4",
    "sharp": "^0.34.3",
    "sonner": "^2.0.6",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^11.1.0",
    "vaul": "^1.1.2",
    "zod": "^4.0.2",
    "zustand": "^5.0.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "25.9.3",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^16.1.1",
    "tailwindcss": "^4",
    "tw-animate-css": "1.3.5",
    "typescript": "^5"
  }
}

``

## File: tsconfig.json

``json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "upgrade-temp",
    "prisma",
    "scenarios",
    "temp-skills",
    "election-system"
  ]
}

``

## File: next.config.ts

``typescript
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // allowedDevOrigins is only meaningful in development.
  // In production, Railway serves over HTTPS with a fixed hostname.
  allowedDevOrigins: isDev
    ? [
        "localhost",
        "127.0.0.1",
        "192.168.1.102",
      ]
    : [],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

``

## File: postcss.config.mjs

``
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;

``

## File: tailwind.config.ts

``typescript
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;

``

## File: components.json

``json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}

``

## File: src\middleware.ts

``typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Content-Security-Policy: tight ruleset for an internal SPA.
// Inline styles/scripts are needed by Next.js hydration — use nonces
// in the future when the CSP is tightened further.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // 'unsafe-eval' required by Next.js dev; tighten in future
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', CSP);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  return response;
}

function applyNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /api/ routes EXCEPT /api/access and /api/health
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/access') && !pathname.startsWith('/api/health')) {
    const tokenCookie = request.cookies.get('election_auth');

    if (!tokenCookie) {
      if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', 'dummy-admin-id');
        requestHeaders.set('x-user-role', 'ADMIN');
        requestHeaders.set('x-user-name', 'admin');

        const response = NextResponse.next({ request: { headers: requestHeaders } });
        applySecurityHeaders(response);
        applyNoCacheHeaders(response);
        return response;
      }

      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    try {
      const token = tokenCookie.value;
      const payload = await verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          { error: 'غير مصرح - جلسة غير صالحة أو منتهية' },
          { status: 401 }
        );
      }

      // Note: DB user validation is deferred to each route handler via withAuth()
      // because the Edge Runtime cannot open TCP connections directly to PostgreSQL.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-user-name', payload.username);

      const response = NextResponse.next({ request: { headers: requestHeaders } });
      applySecurityHeaders(response);
      applyNoCacheHeaders(response);
      return response;
    } catch {
      return NextResponse.json(
        { error: 'غير مصرح - توكن تالف أو غير صالح' },
        { status: 401 }
      );
    }
  }

  // For non-API routes, apply security headers only
  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

``

## File: src\app\globals.css

``css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  /* Design System Command Deck Custom Mappings */
  --color-el-bg: var(--background);
  --color-el-surface: var(--card);
  --color-el-surface-container: var(--muted);
  --color-el-line: var(--border);
  --color-el-primary: var(--primary);
  --color-el-secondary: var(--secondary);
  --color-el-alert: var(--destructive);
  --color-el-text: var(--foreground);
  --color-el-muted: var(--muted-foreground);
}

:root {
  --font-geist-sans: 'IBM Plex Sans Arabic', Tajawal, 'Segoe UI', Tahoma, sans-serif;
  --font-geist-mono: 'IBM Plex Mono', 'SFMono-Regular', monospace;
  --radius: 12px;
  
  /* Light Theme (For reports and printing) */
  --background: #F6F8FC;
  --foreground: #0B1120;
  --card: #FFFFFF;
  --card-foreground: #0B1120;
  --popover: #FFFFFF;
  --popover-foreground: #0B1120;
  --primary: #C97D12;
  --primary-foreground: #FFFFFF;
  --secondary: #0E9C8E;
  --secondary-foreground: #FFFFFF;
  --muted: #EEF2F9;
  --muted-foreground: #5A6B85;
  --accent: #EEF2F9;
  --accent-foreground: #0B1120;
  --destructive: #C5383C;
  --border: #DDE4F0;
  --input: #DDE4F0;
  --ring: #C97D12;
  --sidebar: #EEF2F9;
  --sidebar-foreground: #0B1120;
  --sidebar-primary: #C97D12;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #EEF2F9;
  --sidebar-accent-foreground: #0B1120;
  --sidebar-border: #DDE4F0;
  --sidebar-ring: #C97D12;
  
  --chart-1: #C97D12;
  --chart-2: #0E9C8E;
  --chart-3: #EEF2F9;
  --chart-4: #5A6B85;
  --chart-5: #C5383C;
}

.dark {
  /* Dark Theme - Command Deck Default */
  --background: #0B1120;
  --foreground: #E8EDF7;
  --card: #131C2E;
  --card-foreground: #E8EDF7;
  --popover: #131C2E;
  --popover-foreground: #E8EDF7;
  --primary: #F2A024;
  --primary-foreground: #0B1120;
  --secondary: #2DD4BF;
  --secondary-foreground: #0B1120;
  --muted: #1B2638;
  --muted-foreground: #8A99B4;
  --accent: #1B2638;
  --accent-foreground: #E8EDF7;
  --destructive: #E5484D;
  --destructive-foreground: #FFFFFF;
  --border: #26324B;
  --input: #26324B;
  --ring: #F2A024;
  --sidebar: #131C2E;
  --sidebar-foreground: #E8EDF7;
  --sidebar-primary: #F2A024;
  --sidebar-primary-foreground: #0B1120;
  --sidebar-accent: #1B2638;
  --sidebar-accent-foreground: #F2A024;
  --sidebar-border: #26324B;
  --sidebar-ring: #F2A024;

  --chart-1: #F2A024;
  --chart-2: #2DD4BF;
  --chart-3: #1B2638;
  --chart-4: #8A99B4;
  --chart-5: #E5484D;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground transition-colors duration-300;
  }
}

/* Custom scrollbar for high data density */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--muted-foreground);
}

/* Tabular numbers for clean column alignment */
.font-mono {
  font-variant-numeric: tabular-nums;
}

/* War Room pulse animation */
@keyframes warRoomPulse {
  0% { box-shadow: 0 0 0 0 rgba(242, 160, 36, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(242, 160, 36, 0); }
  100% { box-shadow: 0 0 0 0 rgba(242, 160, 36, 0); }
}

.pulse-animation {
  animation: warRoomPulse 2s infinite;
}

/* Alert ping animation */
@keyframes alertPing {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-alert-ping {
  animation: alertPing 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

``

## File: src\app\layout.tsx

``typescript
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "منصة إدارة الماكينة الانتخابية المركزية",
  description: "Central Election Campaign Management System - منصة إدارة الماكينة الانتخابية المركزية",
  keywords: ["election", "campaign", "management", "إدارة", "انتخابات", "ماكينة"],
  authors: [{ name: "Election Management Team" }],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

``

## File: src\app\page.tsx

``typescript
'use client';

import React, { useReducer, useEffect, useCallback } from 'react';
import Layout from '@/components/election/Layout';
import ExecutiveDashboard from '@/components/election/ExecutiveDashboard';
import TaskTracking from '@/components/election/TaskTracking';
import WarRoom from '@/components/election/WarRoom';
import FieldAgentPortal from '@/components/election/FieldAgentPortal';
import CommunicationEngine from '@/components/election/CommunicationEngine';
import SMSBroadcasting from '@/components/election/SMSBroadcasting';
import TribalManagement from '@/components/election/TribalManagement';
import VoterRegistration from '@/components/election/VoterRegistration';
import ElectoralKeyManagement from '@/components/election/ElectoralKeyManagement';
import DataAnalysis from '@/components/election/DataAnalysis';
import EarlyWarningMonitor from '@/components/election/EarlyWarningMonitor';
import AdvancedIndicators from '@/components/election/AdvancedIndicators';
import LoginGate from '@/components/election/LoginGate';
import OwnerPanel from '@/components/election/OwnerPanel';

import ServicesManagement from '@/components/election/ServicesManagement';
import CompetitorsManagement from '@/components/election/CompetitorsManagement';
import VolunteersManagement from '@/components/election/VolunteersManagement';
import PublicOpinion from '@/components/election/PublicOpinion';
import CommissionManagement from '@/components/election/CommissionManagement';

import type { PageId } from '@/components/election/Sidebar';

interface AuthState {
  isLoggedIn: boolean;
  userRole: string;
  isOwner: boolean;
  mounted: boolean;
}

type AuthAction =
  | { type: 'HYDRATE'; payload: AuthState }
  | { type: 'LOGIN'; role: string }
  | { type: 'LOGOUT' };

const initialAuthState: AuthState = {
  isLoggedIn: false,
  userRole: '',
  isOwner: false,
  mounted: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'LOGIN': {
      const isOwner = action.role === 'ADMIN';
      return { isLoggedIn: true, userRole: action.role, isOwner, mounted: true };
    }
    case 'LOGOUT':
      if (typeof window !== 'undefined') {
        // Clear the httpOnly cookie by calling the server
        fetch('/api/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' }),
        }).catch(() => {});
        // Also clear client-side cookie as backup
        document.cookie = "election_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; samesite=strict";
      }
      return { isLoggedIn: false, userRole: '', isOwner: false, mounted: true };
    default:
      return state;
  }
}

export default function Home() {
  const [activePage, setActivePage] = React.useState<PageId>('dashboard');
  const [showOwnerPanel, setShowOwnerPanel] = React.useState(false);
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

  // Hydrate auth state by checking with the server on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          // We have a valid session - determine role from response
          // The middleware already verified the token, we're authenticated
          // Try to determine if admin by checking owner-only endpoints
          dispatch({ type: 'HYDRATE', payload: { isLoggedIn: true, userRole: 'OBSERVER', isOwner: false, mounted: true } });
          
          // Attempt to verify if user is admin by reading the token payload
          // Since we can't decode JWT client-side easily, we'll trust the login response
          // The login handler already set the correct role
        } else if (res.status === 401) {
          dispatch({ type: 'HYDRATE', payload: { ...initialAuthState, mounted: true } });
        } else {
          dispatch({ type: 'HYDRATE', payload: { ...initialAuthState, mounted: true } });
        }
      } catch {
        dispatch({ type: 'HYDRATE', payload: { ...initialAuthState, mounted: true } });
      }
    };
    checkAuth();
  }, []);

  // Ignore chrome extension errors
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason && (
        reason.code === -32603 || 
        (reason.message && reason.message.includes('JSON-RPC')) || 
        (typeof reason === 'object' && Object.keys(reason).length === 0)
      )) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (event.filename && event.filename.includes('chrome-extension://')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  const handleLogin = useCallback((role: string) => {
    dispatch({ type: 'LOGIN', role });
  }, []);

  const handleLogout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    setShowOwnerPanel(false);
  }, []);

  // Don't render until mounted
  if (!authState.mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#031635] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#031635] text-sm font-medium">جاري تهيئة النظام...</p>
        </div>
      </div>
    );
  }

  if (!authState.isLoggedIn) {
    return <LoginGate onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'tribes':
        return <TribalManagement />;
      case 'voters':
        return <VoterRegistration />;
      case 'electoral-keys':
        return <ElectoralKeyManagement />;
      case 'services':
        return <ServicesManagement />;
      case 'tasks':
        return <TaskTracking />;
      case 'volunteers':
        return <VolunteersManagement />;
      case 'public-opinion':
        return <PublicOpinion />;
      case 'competitors':
        return <CompetitorsManagement />;
      case 'data-analysis':
        return <DataAnalysis />;
      case 'early-warnings':
        return <EarlyWarningMonitor />;
      case 'advanced-indicators':
        return <AdvancedIndicators />;
      case 'fieldagent':
        return <FieldAgentPortal />;
      case 'comms':
        return <CommunicationEngine />;
      case 'warroom':
        return <WarRoom />;
      case 'commission':
        return <CommissionManagement />;
      case 'sms':
        return <SMSBroadcasting />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <>
      <Layout
        activePage={activePage}
        onPageChange={setActivePage}
        isOwner={authState.isOwner}
        onOwnerPanelOpen={() => setShowOwnerPanel(true)}
        onLogout={handleLogout}
      >
        {renderPage()}
      </Layout>
      <OwnerPanel
        isOpen={showOwnerPanel}
        onClose={() => setShowOwnerPanel(false)}
        onLogout={handleLogout}
      />
      {/* Owner toggle button - only visible to owner */}
      {authState.isOwner && (
        <button
          onClick={() => setShowOwnerPanel(true)}
          className="fixed bottom-6 left-6 z-40 bg-el-primary text-el-on-primary p-3 rounded-full shadow-lg hover:opacity-90 transition-all active:scale-95 cursor-pointer"
          title="لوحة تحكم المالك"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </button>
      )}
    </>
  );
}

``

## File: src\app\tw-animate.css

``css
@property --tw-animation-delay{syntax:"*";inherits:false;initial-value:0s}@property --tw-animation-direction{syntax:"*";inherits:false;initial-value:normal}@property --tw-animation-duration{syntax:"*";inherits:false}@property --tw-animation-fill-mode{syntax:"*";inherits:false;initial-value:none}@property --tw-animation-iteration-count{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-translate-y{syntax:"*";inherits:false;initial-value:0}@theme inline{--animation-delay-0: 0s; --animation-delay-75: 75ms; --animation-delay-100: .1s; --animation-delay-150: .15s; --animation-delay-200: .2s; --animation-delay-300: .3s; --animation-delay-500: .5s; --animation-delay-700: .7s; --animation-delay-1000: 1s; --animation-repeat-0: 0; --animation-repeat-1: 1; --animation-repeat-infinite: infinite; --animation-direction-normal: normal; --animation-direction-reverse: reverse; --animation-direction-alternate: alternate; --animation-direction-alternate-reverse: alternate-reverse; --animation-fill-mode-none: none; --animation-fill-mode-forwards: forwards; --animation-fill-mode-backwards: backwards; --animation-fill-mode-both: both; --percentage-0: 0; --percentage-5: .05; --percentage-10: .1; --percentage-15: .15; --percentage-20: .2; --percentage-25: .25; --percentage-30: .3; --percentage-35: .35; --percentage-40: .4; --percentage-45: .45; --percentage-50: .5; --percentage-55: .55; --percentage-60: .6; --percentage-65: .65; --percentage-70: .7; --percentage-75: .75; --percentage-80: .8; --percentage-85: .85; --percentage-90: .9; --percentage-95: .95; --percentage-100: 1; --percentage-translate-full: 1; --animate-in: enter var(--tw-animation-duration,var(--tw-duration,.15s))var(--tw-ease,ease)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none); --animate-out: exit var(--tw-animation-duration,var(--tw-duration,.15s))var(--tw-ease,ease)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none); @keyframes enter { from { opacity: var(--tw-enter-opacity,1); transform: translate3d(var(--tw-enter-translate-x,0),var(--tw-enter-translate-y,0),0)scale3d(var(--tw-enter-scale,1),var(--tw-enter-scale,1),var(--tw-enter-scale,1))rotate(var(--tw-enter-rotate,0)); filter: blur(var(--tw-enter-blur,0)); }}@keyframes exit { to { opacity: var(--tw-exit-opacity,1); transform: translate3d(var(--tw-exit-translate-x,0),var(--tw-exit-translate-y,0),0)scale3d(var(--tw-exit-scale,1),var(--tw-exit-scale,1),var(--tw-exit-scale,1))rotate(var(--tw-exit-rotate,0)); filter: blur(var(--tw-exit-blur,0)); }}--animate-accordion-down: accordion-down var(--tw-animation-duration,var(--tw-duration,.2s))var(--tw-ease,ease-out)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none); --animate-accordion-up: accordion-up var(--tw-animation-duration,var(--tw-duration,.2s))var(--tw-ease,ease-out)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none); --animate-collapsible-down: collapsible-down var(--tw-animation-duration,var(--tw-duration,.2s))var(--tw-ease,ease-out)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none); --animate-collapsible-up: collapsible-up var(--tw-animation-duration,var(--tw-duration,.2s))var(--tw-ease,ease-out)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none); @keyframes accordion-down { from { height: 0; }to { height: var(--radix-accordion-content-height,var(--bits-accordion-content-height,var(--reka-accordion-content-height,var(--kb-accordion-content-height,var(--ngp-accordion-content-height,auto))))); }}@keyframes accordion-up { from { height: var(--radix-accordion-content-height,var(--bits-accordion-content-height,var(--reka-accordion-content-height,var(--kb-accordion-content-height,var(--ngp-accordion-content-height,auto))))); }to { height: 0; }}@keyframes collapsible-down { from { height: 0; }to { height: var(--radix-collapsible-content-height,var(--bits-collapsible-content-height,var(--reka-collapsible-content-height,var(--kb-collapsible-content-height,auto)))); }}@keyframes collapsible-up { from { height: var(--radix-collapsible-content-height,var(--bits-collapsible-content-height,var(--reka-collapsible-content-height,var(--kb-collapsible-content-height,auto)))); }to { height: 0; }}--animate-caret-blink: caret-blink 1.25s ease-out infinite; @keyframes caret-blink { 0%,70%,100% { opacity: 1; }20%,50% { opacity: 0; }}}@utility animation-duration-*{--tw-animation-duration: calc(--value(number)*1ms); --tw-animation-duration: --value(--animation-duration-*,[duration],"initial",[*]); animation-duration: calc(--value(number)*1ms); animation-duration: --value(--animation-duration-*,[duration],"initial",[*]);}@utility delay-*{animation-delay: calc(--value(number)*1ms); animation-delay: --value(--animation-delay-*,[duration],"initial",[*]); --tw-animation-delay: calc(--value(number)*1ms); --tw-animation-delay: --value(--animation-delay-*,[duration],"initial",[*]);}@utility repeat-*{animation-iteration-count: --value(--animation-repeat-*,number,"initial",[*]); --tw-animation-iteration-count: --value(--animation-repeat-*,number,"initial",[*]);}@utility direction-*{animation-direction: --value(--animation-direction-*,"initial",[*]); --tw-animation-direction: --value(--animation-direction-*,"initial",[*]);}@utility fill-mode-*{animation-fill-mode: --value(--animation-fill-mode-*,"initial",[*]); --tw-animation-fill-mode: --value(--animation-fill-mode-*,"initial",[*]);}@utility running{animation-play-state: running;}@utility paused{animation-play-state: paused;}@utility play-state-*{animation-play-state: --value("initial",[*]);}@utility blur-in{--tw-enter-blur: 20px;}@utility blur-in-*{--tw-enter-blur: calc(--value(number)*1px); --tw-enter-blur: --value(--blur-*,[*]);}@utility blur-out{--tw-exit-blur: 20px;}@utility blur-out-*{--tw-exit-blur: calc(--value(number)*1px); --tw-exit-blur: --value(--blur-*,[*]);}@utility fade-in{--tw-enter-opacity: 0;}@utility fade-in-*{--tw-enter-opacity: calc(--value(number)/100); --tw-enter-opacity: --value(--percentage-*,[*]);}@utility fade-out{--tw-exit-opacity: 0;}@utility fade-out-*{--tw-exit-opacity: calc(--value(number)/100); --tw-exit-opacity: --value(--percentage-*,[*]);}@utility zoom-in{--tw-enter-scale: 0;}@utility zoom-in-*{--tw-enter-scale: calc(--value(number)*1%); --tw-enter-scale: calc(--value(ratio)); --tw-enter-scale: --value(--percentage-*,[*]);}@utility -zoom-in-*{--tw-enter-scale: calc(--value(number)*-1%); --tw-enter-scale: calc(--value(ratio)*-1); --tw-enter-scale: --value(--percentage-*,[*]);}@utility zoom-out{--tw-exit-scale: 0;}@utility zoom-out-*{--tw-exit-scale: calc(--value(number)*1%); --tw-exit-scale: calc(--value(ratio)); --tw-exit-scale: --value(--percentage-*,[*]);}@utility -zoom-out-*{--tw-exit-scale: calc(--value(number)*-1%); --tw-exit-scale: calc(--value(ratio)*-1); --tw-exit-scale: --value(--percentage-*,[*]);}@utility spin-in{--tw-enter-rotate: 30deg;}@utility spin-in-*{--tw-enter-rotate: calc(--value(number)*1deg); --tw-enter-rotate: calc(--value(ratio)*360deg); --tw-enter-rotate: --value(--rotate-*,[*]);}@utility -spin-in{--tw-enter-rotate: -30deg;}@utility -spin-in-*{--tw-enter-rotate: calc(--value(number)*-1deg); --tw-enter-rotate: calc(--value(ratio)*-360deg); --tw-enter-rotate: --value(--rotate-*,[*]);}@utility spin-out{--tw-exit-rotate: 30deg;}@utility spin-out-*{--tw-exit-rotate: calc(--value(number)*1deg); --tw-exit-rotate: calc(--value(ratio)*360deg); --tw-exit-rotate: --value(--rotate-*,[*]);}@utility -spin-out{--tw-exit-rotate: -30deg;}@utility -spin-out-*{--tw-exit-rotate: calc(--value(number)*-1deg); --tw-exit-rotate: calc(--value(ratio)*-360deg); --tw-exit-rotate: --value(--rotate-*,[*]);}@utility slide-in-from-top{--tw-enter-translate-y: -100%;}@utility slide-in-from-top-*{--tw-enter-translate-y: calc(--value(integer)*var(--spacing)*-1); --tw-enter-translate-y: calc(--value(--percentage-*,--percentage-translate-*)*-100%); --tw-enter-translate-y: calc(--value(ratio)*-100%); --tw-enter-translate-y: calc(--value(--translate-*,[percentage],[length])*-1);}@utility slide-in-from-bottom{--tw-enter-translate-y: 100%;}@utility slide-in-from-bottom-*{--tw-enter-translate-y: calc(--value(integer)*var(--spacing)); --tw-enter-translate-y: calc(--value(--percentage-*,--percentage-translate-*)*100%); --tw-enter-translate-y: calc(--value(ratio)*100%); --tw-enter-translate-y: --value(--translate-*,[percentage],[length]);}@utility slide-in-from-left{--tw-enter-translate-x: -100%;}@utility slide-in-from-left-*{--tw-enter-translate-x: calc(--value(integer)*var(--spacing)*-1); --tw-enter-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*-100%); --tw-enter-translate-x: calc(--value(ratio)*-100%); --tw-enter-translate-x: calc(--value(--translate-*,[percentage],[length])*-1);}@utility slide-in-from-right{--tw-enter-translate-x: 100%;}@utility slide-in-from-right-*{--tw-enter-translate-x: calc(--value(integer)*var(--spacing)); --tw-enter-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*100%); --tw-enter-translate-x: calc(--value(ratio)*100%); --tw-enter-translate-x: --value(--translate-*,[percentage],[length]);}@utility slide-in-from-start{&:dir(ltr){ --tw-enter-translate-x: -100%; }&:dir(rtl){ --tw-enter-translate-x: 100%; }}@utility slide-in-from-start-*{&:where(:dir(ltr),[dir="ltr"],[dir="ltr"]*){ --tw-enter-translate-x: calc(--value(integer)*var(--spacing)*-1); --tw-enter-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*-100%); --tw-enter-translate-x: calc(--value(ratio)*-100%); --tw-enter-translate-x: calc(--value(--translate-*,[percentage],[length])*-1); }&:where(:dir(rtl),[dir="rtl"],[dir="rtl"]*){ --tw-enter-translate-x: calc(--value(integer)*var(--spacing)); --tw-enter-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*100%); --tw-enter-translate-x: calc(--value(ratio)*100%); --tw-enter-translate-x: --value(--translate-*,[percentage],[length]); }}@utility slide-in-from-end{&:dir(ltr){ --tw-enter-translate-x: 100%; }&:dir(rtl){ --tw-enter-translate-x: -100%; }}@utility slide-in-from-end-*{&:where(:dir(ltr),[dir="ltr"],[dir="ltr"]*){ --tw-enter-translate-x: calc(--value(integer)*var(--spacing)); --tw-enter-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*100%); --tw-enter-translate-x: calc(--value(ratio)*100%); --tw-enter-translate-x: --value(--translate-*,[percentage],[length]); }&:where(:dir(rtl),[dir="rtl"],[dir="rtl"]*){ --tw-enter-translate-x: calc(--value(integer)*var(--spacing)*-1); --tw-enter-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*-100%); --tw-enter-translate-x: calc(--value(ratio)*-100%); --tw-enter-translate-x: calc(--value(--translate-*,[percentage],[length])*-1); }}@utility slide-out-to-top{--tw-exit-translate-y: -100%;}@utility slide-out-to-top-*{--tw-exit-translate-y: calc(--value(integer)*var(--spacing)*-1); --tw-exit-translate-y: calc(--value(--percentage-*,--percentage-translate-*)*-100%); --tw-exit-translate-y: calc(--value(ratio)*-100%); --tw-exit-translate-y: calc(--value(--translate-*,[percentage],[length])*-1);}@utility slide-out-to-bottom{--tw-exit-translate-y: 100%;}@utility slide-out-to-bottom-*{--tw-exit-translate-y: calc(--value(integer)*var(--spacing)); --tw-exit-translate-y: calc(--value(--percentage-*,--percentage-translate-*)*100%); --tw-exit-translate-y: calc(--value(ratio)*100%); --tw-exit-translate-y: --value(--translate-*,[percentage],[length]);}@utility slide-out-to-left{--tw-exit-translate-x: -100%;}@utility slide-out-to-left-*{--tw-exit-translate-x: calc(--value(integer)*var(--spacing)*-1); --tw-exit-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*-100%); --tw-exit-translate-x: calc(--value(ratio)*-100%); --tw-exit-translate-x: calc(--value(--translate-*,[percentage],[length])*-1);}@utility slide-out-to-right{--tw-exit-translate-x: 100%;}@utility slide-out-to-right-*{--tw-exit-translate-x: calc(--value(integer)*var(--spacing)); --tw-exit-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*100%); --tw-exit-translate-x: calc(--value(ratio)*100%); --tw-exit-translate-x: --value(--translate-*,[percentage],[length]);}@utility slide-out-to-start{&:dir(ltr){ --tw-exit-translate-x: -100%; }&:dir(rtl){ --tw-exit-translate-x: 100%; }}@utility slide-out-to-start-*{&:where(:dir(ltr),[dir="ltr"],[dir="ltr"]*){ --tw-exit-translate-x: calc(--value(integer)*var(--spacing)*-1); --tw-exit-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*-100%); --tw-exit-translate-x: calc(--value(ratio)*-100%); --tw-exit-translate-x: calc(--value(--translate-*,[percentage],[length])*-1); }&:where(:dir(rtl),[dir="rtl"],[dir="rtl"]*){ --tw-exit-translate-x: calc(--value(integer)*var(--spacing)); --tw-exit-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*100%); --tw-exit-translate-x: calc(--value(ratio)*100%); --tw-exit-translate-x: --value(--translate-*,[percentage],[length]); }}@utility slide-out-to-end{&:dir(ltr){ --tw-exit-translate-x: 100%; }&:dir(rtl){ --tw-exit-translate-x: -100%; }}@utility slide-out-to-end-*{&:where(:dir(ltr),[dir="ltr"],[dir="ltr"]*){ --tw-exit-translate-x: calc(--value(integer)*var(--spacing)); --tw-exit-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*100%); --tw-exit-translate-x: calc(--value(ratio)*100%); --tw-exit-translate-x: --value(--translate-*,[percentage],[length]); }&:where(:dir(rtl),[dir="rtl"],[dir="rtl"]*){ --tw-exit-translate-x: calc(--value(integer)*var(--spacing)*-1); --tw-exit-translate-x: calc(--value(--percentage-*,--percentage-translate-*)*-100%); --tw-exit-translate-x: calc(--value(ratio)*-100%); --tw-exit-translate-x: calc(--value(--translate-*,[percentage],[length])*-1); }}

``

## File: src\app\api\route.ts

``typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

``

## File: src\app\api\access\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { createToken, verifyToken } from "@/lib/auth";
import { checkRateLimit, resetRateLimit, auditLog, getClientIp, validatePassword } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSystemConfig, setSystemConfig } from "@/lib/config-store";

// GET /api/access - Checks whether visitor access is enabled
export async function GET() {
  const config = await getSystemConfig();
  return NextResponse.json({ enabled: config.enabled });
}

// POST /api/access - Handles login, logout, password change, and visitor access toggles
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const { action, password, ownerPassword, currentPassword, newPassword, enabled } = rawBody;
    const clientIp = getClientIp(req);

    // Apply Rate Limiting for Login/Sensitive actions to prevent brute forcing
    if (action === "login" || action === "owner-login" || action === "change-password") {
      const limitKey = `rate_limit_${action}_${clientIp}`;
      const limit = await checkRateLimit(limitKey, 5, 15 * 60 * 1000);
      if (!limit.allowed) {
        return NextResponse.json(
          {
            success: false,
            message: `لقد تجاوزت الحد المسموح به للمحاولات. يرجى المحاولة بعد ${Math.ceil(
              limit.retryAfterMs / 1000 / 60
            )} دقيقة`,
          },
          { status: 429 }
        );
      }
    }

    // --- Action: Visitor/Observer Login ---
    if (action === "login") {
      const systemConfig = await getSystemConfig();
      if (!systemConfig.enabled) {
        return NextResponse.json(
          { success: false, message: "الدخول معطل حالياً من قبل المالك" },
          { status: 403 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { username: "observer" },
      });

      if (!user || !password) {
        return NextResponse.json(
          { success: false, message: "فشل تسجيل الدخول - مستخدم غير موجود" },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        await auditLog({
          username: "observer",
          action: "LOGIN",
          details: { success: false, error: "كلمة مرور خاطئة للزائر" },
          ipAddress: clientIp,
        });
        return NextResponse.json(
          { success: false, message: "كلمة المرور غير صحيحة" },
          { status: 401 }
        );
      }

      // Reset rate limit on success
      await resetRateLimit(`rate_limit_login_${clientIp}`);

      const token = await createToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        isOwner: false,
      });

      await auditLog({
        userId: user.id,
        username: user.username,
        action: "LOGIN",
        details: { success: true },
        ipAddress: clientIp,
      });

      const response = NextResponse.json({
        success: true,
        role: user.role,
        mustChangePwd: user.mustChangePwd,
      });

      response.cookies.set("election_auth", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 8, // 8 hours (reduced from 7 days)
      });

      return response;
    }

    // --- Action: Owner/Admin Login ---
    if (action === "owner-login") {
      const user = await prisma.user.findUnique({
        where: { username: "admin" },
      });

      if (!user || !ownerPassword) {
        return NextResponse.json(
          { success: false, message: "فشل تسجيل الدخول - مستخدم غير موجود" },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(ownerPassword, user.password);
      if (!isMatch) {
        await auditLog({
          username: "admin",
          action: "LOGIN",
          details: { success: false, error: "كلمة مرور خاطئة للمالك" },
          ipAddress: clientIp,
        });
        return NextResponse.json(
          { success: false, message: "كلمة المرور غير صحيحة" },
          { status: 401 }
        );
      }

      // Reset rate limit on success
      await resetRateLimit(`rate_limit_owner-login_${clientIp}`);

      const token = await createToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        isOwner: true,
      });

      await auditLog({
        userId: user.id,
        username: user.username,
        action: "LOGIN",
        details: { success: true },
        ipAddress: clientIp,
      });

      const response = NextResponse.json({
        success: true,
        role: user.role,
        mustChangePwd: user.mustChangePwd,
      });

      response.cookies.set("election_auth", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 8, // 8 hours
      });

      return response;
    }

    // --- Action: Logout ---
    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.set("election_auth", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
      });
      return response;
    }

    // --- Protect ADMIN operations for toggle-access and change-password ---
    const tokenCookie = req.cookies.get("election_auth");
    if (!tokenCookie) {
      return NextResponse.json({ error: "غير مصرح - يرجى تسجيل الدخول" }, { status: 401 });
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح - الصلاحيات غير كافية" }, { status: 403 });
    }

    // --- Action: Toggle Visitor Access ---
    if (action === "toggle-access") {
      if (enabled === undefined) {
        return NextResponse.json({ success: false, message: "حقل enabled مطلوب" }, { status: 400 });
      }

      await setSystemConfig({ enabled: Boolean(enabled) });

      await auditLog({
        userId: payload.userId,
        username: payload.username,
        action: "TOGGLE_ACCESS",
        details: { enabled: Boolean(enabled) },
        ipAddress: clientIp,
      });

      return NextResponse.json({ success: true, enabled: Boolean(enabled) });
    }

    // --- Action: Owner/Admin Change Password ---
    if (action === "change-password") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: "كلمة المرور الحالية والجديدة مطلوبة" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
      }

      const validation = validatePassword(newPassword);
      if (!validation.valid) {
        return NextResponse.json({ success: false, message: validation.errors.join("، ") }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          mustChangePwd: false,
        },
      });

      await auditLog({
        userId: user.id,
        username: user.username,
        action: "CHANGE_PASSWORD",
        ipAddress: clientIp,
      });

      // Reset rate limit after successful password change
      await resetRateLimit(`rate_limit_change-password_${clientIp}`);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "طلب غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("[access-api] failed:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ داخلي في الخادم" }, { status: 500 });
  }
}

``

## File: src\app\api\alerts\route.ts

``typescript
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([]);
}

``

## File: src\app\api\analysis\route.ts

``typescript
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ gsi: {}, edri: {}, recommendations: [] });
}

``

## File: src\app\api\campaign\route.ts

``typescript
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ efficiencyScore: 0, costPerVoter: 0 });
}

``

## File: src\app\api\commission\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// GET /api/commission - Returns all commission statistics grouped by district
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    let list = await prisma.commissionData.findMany({
      orderBy: { district: "asc" }
    });

    // Seed default Governorate totals if empty
    if (list.length === 0) {
      const defaultData = [
        {
          province: "ذي قار",
          district: "ذي قار (كلي)",
          subDistrict: "جميع النواحي",
          pollingCenter: "مراكز ذي قار",
          ballotStation: "كلي",
          registeredVoters: 1099438,
          historicalTurnout: 48.97,
          expectedTurnout: 48.97,
        },
        {
          province: "ذي قار",
          district: "الناصرية",
          subDistrict: "المركز",
          pollingCenter: "مراكز الناصرية",
          ballotStation: "عام",
          registeredVoters: 450000,
          historicalTurnout: 45.2,
          expectedTurnout: 45.2,
        },
        {
          province: "ذي قار",
          district: "الشطرة",
          subDistrict: "الشطرة",
          pollingCenter: "مراكز الشطرة",
          ballotStation: "عام",
          registeredVoters: 210000,
          historicalTurnout: 50.1,
          expectedTurnout: 50.1,
        },
        {
          province: "ذي قار",
          district: "الرفاعي",
          subDistrict: "الرفاعي",
          pollingCenter: "مراكز الرفاعي",
          ballotStation: "عام",
          registeredVoters: 130000,
          historicalTurnout: 52.4,
          expectedTurnout: 52.4,
        },
        {
          province: "ذي قار",
          district: "الدواية",
          subDistrict: "الدواية",
          pollingCenter: "مراكز الدواية",
          ballotStation: "عام",
          registeredVoters: 850000,
          historicalTurnout: 49.8,
          expectedTurnout: 49.8,
        }
      ];

      for (const item of defaultData) {
        await prisma.commissionData.create({
          data: item
        });
      }

      list = await prisma.commissionData.findMany({
        orderBy: { district: "asc" }
      });
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("[commission-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve commission data" }, { status: 500 });
  }
}

// POST /api/commission - Creates new district commission data
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const {
      province,
      district,
      subDistrict,
      pollingCenter,
      ballotStation,
      registeredVoters,
      historicalTurnout,
      expectedTurnout,
    } = body;

    if (!district || !pollingCenter || !ballotStation) {
      return NextResponse.json({ error: "القضاء، مركز الاقتراع، والمحطة حقول مطلوبة" }, { status: 400 });
    }

    const created = await prisma.commissionData.create({
      data: {
        province: province || "ذي قار",
        district,
        subDistrict: subDistrict || "المركز",
        pollingCenter,
        ballotStation,
        registeredVoters: parseInt(registeredVoters) || 0,
        historicalTurnout: parseFloat(historicalTurnout) || 0.0,
        expectedTurnout: expectedTurnout ? parseFloat(expectedTurnout) : null,
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("[commission-post] failed:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "هذه المحطة ومركز الاقتراع مسجلان مسبقاً" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create commission data" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });

``

## File: src\app\api\commission\[id]\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { isValidCuid } from "@/lib/security";

// PUT /api/commission/[id] - Updates a commission data record
async function putHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const commissionId = params.id;
    if (!isValidCuid(commissionId)) {
      return NextResponse.json({ error: "معرف سجل المفوضية غير صالح" }, { status: 400 });
    }
    const body = await request.json();

    const updateData: Record<string, any> = {};

    if (body.province !== undefined) updateData.province = body.province;
    if (body.district !== undefined) updateData.district = body.district;
    if (body.subDistrict !== undefined) updateData.subDistrict = body.subDistrict;
    if (body.pollingCenter !== undefined) updateData.pollingCenter = body.pollingCenter;
    if (body.ballotStation !== undefined) updateData.ballotStation = body.ballotStation;
    
    if (body.registeredVoters !== undefined) {
      updateData.registeredVoters = parseInt(body.registeredVoters) || 0;
    }
    if (body.historicalTurnout !== undefined) {
      updateData.historicalTurnout = parseFloat(body.historicalTurnout) || 0.0;
    }
    if (body.expectedTurnout !== undefined) {
      updateData.expectedTurnout = body.expectedTurnout ? parseFloat(body.expectedTurnout) : null;
    }

    const updated = await prisma.commissionData.update({
      where: { id: commissionId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[commission-put] failed:", error);
    return NextResponse.json({ error: "Failed to update commission record" }, { status: 500 });
  }
}

// DELETE /api/commission/[id] - Deletes a commission data record
async function deleteHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const commissionId = params.id;
    if (!isValidCuid(commissionId)) {
      return NextResponse.json({ error: "معرف سجل المفوضية غير صالح" }, { status: 400 });
    }
    await prisma.commissionData.delete({ where: { id: commissionId } });
    return NextResponse.json({ success: true, message: "Commission record deleted successfully" });
  } catch (error) {
    console.error("[commission-delete] failed:", error);
    return NextResponse.json({ error: "Failed to delete commission record" }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler, { PUT: ["admin", "operator"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["admin"] });

``

## File: src\app\api\competitors\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// GET /api/competitors - Returns all competitors
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const competitors = await prisma.competitor.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mapped = competitors.map(c => ({
      id: c.id,
      candidateName: c.name,
      partyOrList: c.party,
      strengthLevel: String(c.strengthLevel),
      district: c.baseDistrict,
      primaryArea: c.primaryArea || c.tribe || "",
      estimatedVotesBase: c.estimatedVotes,
      keyStrengths: c.keyStrengths || "",
      keyWeaknesses: c.keyWeaknesses || "",
      counterStrategy: c.counterStrategy || "",
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[competitors-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve competitors" }, { status: 500 });
  }
}

// POST /api/competitors - Creates a new competitor
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const {
      candidateName,
      partyOrList,
      strengthLevel,
      district,
      primaryArea,
      estimatedVotesBase,
      keyStrengths,
      keyWeaknesses,
      counterStrategy
    } = body;

    if (!candidateName || !partyOrList) {
      return NextResponse.json({ error: "اسم المرشح المنافس والقائمة حقول مطلوبة" }, { status: 400 });
    }

    const competitor = await prisma.competitor.create({
      data: {
        name: candidateName,
        party: partyOrList,
        tribe: primaryArea || "", // maintaining schema compatibility
        baseDistrict: district || "",
        estimatedVotes: parseInt(estimatedVotesBase) || 0,
        strengthLevel: parseInt(strengthLevel) || 3,
        primaryArea: primaryArea || null,
        keyStrengths: keyStrengths || null,
        keyWeaknesses: keyWeaknesses || null,
        counterStrategy: counterStrategy || null,
      },
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    console.error("[competitors-post] failed:", error);
    return NextResponse.json({ error: "Failed to create competitor profile" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });

``

## File: src\app\api\composite-indicators\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { calculateAllCompositeIndicators } from "@/lib/indicators-engine";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const data = await calculateAllCompositeIndicators();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[composite-indicators-get] failed:", error);
    return NextResponse.json({ error: "Failed to calculate composite indicators" }, { status: 500 });
  }
}

async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const data = await calculateAllCompositeIndicators();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[composite-indicators-post] failed:", error);
    return NextResponse.json({ error: "Failed to recalculate composite indicators" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "observer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });

``

## File: src\app\api\comprehensive-indicators\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { calculateComprehensiveIndicators } from "@/lib/comprehensive-indicators-engine";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const data = await calculateComprehensiveIndicators();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[comprehensive-indicators-get] failed:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve comprehensive indicators" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "observer"] });

``

## File: src\app\api\dashboard\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    // 1. Core voter aggregates
    const totalVoters = await prisma.voter.count();
    const checkedInCount = await prisma.voter.count({ where: { votedOnDay: true } });
    const votedPercentage = totalVoters > 0 ? Math.round((checkedInCount / totalVoters) * 100) : 0;

    // 2. High confidence count (supportDegree >= 4)
    const highConfidenceCount = await prisma.voter.count({
      where: { supportDegree: { gte: 4 } }
    });

    // 3. District Statistics
    const districtGroups = await prisma.voter.groupBy({
      by: ['district'],
      _count: { id: true }
    });
    const districtVotedGroups = await prisma.voter.groupBy({
      by: ['district'],
      where: { votedOnDay: true },
      _count: { id: true }
    });
    const districtVotedMap = new Map(districtVotedGroups.map(g => [g.district, g._count.id]));

    const districtStats = districtGroups.map(g => {
      const dist = g.district || "غير محدد";
      const count = g._count.id;
      const voted = districtVotedMap.get(g.district) || 0;
      return {
        district: dist,
        totalVoters: count,
        votedCount: voted,
        votedPercentage: count > 0 ? Math.round((voted / count) * 100) : 0,
        confidencePoints: count * 30,
      };
    });

    // 4. Tribe Rankings (grouped by tribe)
    const tribeVoterCounts = await prisma.voter.groupBy({
      by: ['tribeId'],
      _count: { id: true }
    });
    const tribeVotedCounts = await prisma.voter.groupBy({
      by: ['tribeId'],
      where: { votedOnDay: true },
      _count: { id: true }
    });
    const tribes = await prisma.tribe.findMany({
      select: { id: true, name: true }
    });

    const tribeNameMap = new Map(tribes.map(t => [t.id, t.name]));
    const voterCountMap = new Map(tribeVoterCounts.map(g => [g.tribeId, g._count.id]));
    const votedCountMap = new Map(tribeVotedCounts.map(g => [g.tribeId, g._count.id]));

    const tribeRanking = tribes.map((t) => {
      const voterCount = voterCountMap.get(t.id) || 0;
      const votedCount = votedCountMap.get(t.id) || 0;
      return {
        id: t.id,
        name: t.name,
        leaderName: "شيخ العشيرة",
        influence: 3,
        district: "المركز",
        voterCount,
        votedCount,
        votedPercentage: voterCount > 0 ? Math.round((votedCount / voterCount) * 100) : 0,
        avgConfidence: 3,
      };
    }).filter(t => t.voterCount > 0)
      .sort((a, b) => b.voterCount - a.voterCount);

    // Add fallback for unspecified tribe voters
    const unspecifiedVoters = voterCountMap.get(null) || 0;
    const unspecifiedVoted = votedCountMap.get(null) || 0;
    if (unspecifiedVoters > 0) {
      tribeRanking.push({
        id: "unspecified",
        name: "غير محدد",
        leaderName: "غير محدد",
        influence: 0,
        district: "المركز",
        voterCount: unspecifiedVoters,
        votedCount: unspecifiedVoted,
        votedPercentage: unspecifiedVoters > 0 ? Math.round((unspecifiedVoted / unspecifiedVoters) * 100) : 0,
        avgConfidence: 3,
      });
    }

    // 5. Tasks Statistics (Dynamic)
    const totalTasks = await prisma.task.count();
    const taskStatusCounts = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    const taskStatus = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
    taskStatusCounts.forEach(g => {
      if (g.status in taskStatus) {
        taskStatus[g.status as keyof typeof taskStatus] = g._count.id;
      }
    });

    // 6. Confidence Score Distribution
    const confidenceCounts = await prisma.voter.groupBy({
      by: ['supportDegree'],
      _count: { id: true }
    });
    const confidenceDistribution = confidenceCounts.map(g => {
      const score = g.supportDegree || 3;
      const count = g._count.id;
      return {
        score,
        count,
        percentage: totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0
      };
    }).sort((a, b) => b.score - a.score);

    return NextResponse.json({
      totalVoters,
      votedCount: checkedInCount,
      votedPercentage,
      highConfidenceCount,
      totalTribes: tribes.length,
      totalTasks,
      districtStats,
      tribeRanking,
      confidenceDistribution,
      recentAlerts: [],
      taskStatus,
      smsStats: {
        totalTarget: totalVoters,
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
      },
    });
  } catch (error) {
    console.error("[dashboard-get] failed:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });

``

## File: src\app\api\dynamic-indicators\route.ts

``typescript
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ gsi: 0, edri: 0 });
}

``

## File: src\app\api\early-warnings\route.ts

``typescript
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ warnings: [] });
}

``

## File: src\app\api\election-results\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

// GET /api/election-results
// Returns real-time voting turnout aggregated by district and by tribe,
// derived from voter check-ins (votedOnDay flag).
async function getHandler(_req: NextRequest, { user: _user }: { user: AuthenticatedUser }) {
  try {
    const [totalVoters, votedCount, byDistrict, byTribe, byKey] = await Promise.all([
      // Overall totals
      prisma.voter.count(),
      prisma.voter.count({ where: { votedOnDay: true } }),

      // Breakdown by district
      prisma.voter.groupBy({
        by: ['district'],
        _count: { _all: true },
        where: {},
      }).then(async rows => {
        const votedRows = await prisma.voter.groupBy({
          by: ['district'],
          _count: { _all: true },
          where: { votedOnDay: true },
        });
        const votedMap = new Map(votedRows.map(r => [r.district, r._count._all]));
        return rows.map(r => ({
          district: r.district,
          total: r._count._all,
          voted: votedMap.get(r.district) ?? 0,
          turnoutPct: r._count._all > 0
            ? Math.round(((votedMap.get(r.district) ?? 0) / r._count._all) * 100)
            : 0,
        })).sort((a, b) => b.total - a.total);
      }),

      // Breakdown by tribe
      prisma.voter.groupBy({
        by: ['tribeId'],
        _count: { _all: true },
      }).then(async rows => {
        const nonNullRows = rows.filter(r => r.tribeId);
        if (nonNullRows.length === 0) return [];

        const tribeIds = nonNullRows.map(r => r.tribeId as string);
        const [tribes, votedRows] = await Promise.all([
          prisma.tribe.findMany({ where: { id: { in: tribeIds } }, select: { id: true, name: true } }),
          prisma.voter.groupBy({
            by: ['tribeId'],
            _count: { _all: true },
            where: { votedOnDay: true, tribeId: { in: tribeIds } },
          }),
        ]);
        const tribeMap = new Map(tribes.map(t => [t.id, t.name]));
        const votedMap = new Map(votedRows.map(r => [r.tribeId, r._count._all]));
        return nonNullRows.map(r => ({
          tribeId: r.tribeId,
          tribeName: tribeMap.get(r.tribeId as string) ?? 'غير محدد',
          total: r._count._all,
          voted: votedMap.get(r.tribeId) ?? 0,
          turnoutPct: r._count._all > 0
            ? Math.round(((votedMap.get(r.tribeId) ?? 0) / r._count._all) * 100)
            : 0,
        })).sort((a, b) => b.voted - a.voted).slice(0, 20);
      }),

      // Top performing election keys
      prisma.voter.groupBy({
        by: ['keyId'],
        _count: { _all: true },
        where: { votedOnDay: true },
        orderBy: { _count: { keyId: 'desc' } },
        take: 10,
      }).then(async rows => {
        if (rows.length === 0) return [];
        const keyIds = rows.map(r => r.keyId);
        const keys = await prisma.electionKey.findMany({
          where: { id: { in: keyIds } },
          select: {
            id: true,
            firstName: true,
            fatherName: true,
            expectedVotes: true,
            _count: { select: { voters: true } },
          },
        });
        const keyMap = new Map(keys.map(k => [k.id, k]));
        return rows.map(r => {
          const key = keyMap.get(r.keyId);
          return {
            keyId: r.keyId,
            keyName: key ? `${key.firstName} ${key.fatherName}` : 'غير معروف',
            voted: r._count._all,
            totalAssigned: key?._count.voters ?? 0,
            expectedVotes: key?.expectedVotes ?? 0,
          };
        });
      }),
    ]);

    const turnoutPct = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;

    return NextResponse.json({
      summary: {
        totalVoters,
        votedCount,
        notVotedCount: totalVoters - votedCount,
        turnoutPct,
      },
      byDistrict,
      byTribe,
      topKeys: byKey,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[election-results-get] failed:", error);
    return NextResponse.json({ error: "فشل تحميل نتائج الانتخابات" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator"] });

``

## File: src\app\api\electoral-keys\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

function safeJsonParse(val: any) {
  if (!val) return null;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return { text: val };
    }
  }
  return val;
}

// GET /api/electoral-keys - Handles querying electoral keys with matching fields
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const classification = searchParams.get("classification");
    const search = searchParams.get("search");

    const where: Record<string, any> = {};

    if (district) {
      where.district = district;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { fatherName: { contains: q, mode: 'insensitive' } },
        { grandfatherName: { contains: q, mode: 'insensitive' } },
        { fourthName: { contains: q, mode: 'insensitive' } },
        { keyCode: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ];
    }

    // If role is KEY_USER, restrict to their own key
    if (user.role === "KEY_USER") {
      where.phone = user.username;
    }

    const keys = await prisma.electionKey.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tribe: true,
        _count: {
          select: { voters: true }
        }
      }
    });

    const mappedKeys = keys.map((key) => {
      // Calculate weighted score & classification
      const rawScore =
        ((key.loyaltyScore || 3) - 1) * 20 +
        ((key.influenceLevel || 3) - 1) * 20 +
        ((key.mobilizationCap || 3) - 1) * 15 +
        ((key.riskLevel || 3) - 1) * 15 + // Mapping riskLevel or similar fields
        2 * 10 + // default weight placeholder
        2 * 5 + 
        2 * 5 + 
        2 * 5 + 
        2 * 5;

      const score = Math.min(100, Math.round(rawScore / 3.4));
      let classf = "مقبول";
      if (score < 20) classf = "ضعيف";
      else if (score <= 50) classf = "مقبول";
      else if (score <= 100) classf = "جيد";
      else classf = "قوي";

      return {
        id: key.id,
        code: key.keyCode,
        firstName: key.firstName,
        fatherName: key.fatherName,
        grandfatherName: key.grandfatherName,
        fourthName: key.fourthName,
        nickname: key.tribe?.name || "",
        gender: key.gender,
        phone: key.phone,
        educationLevel: key.education,
        profession: key.profession,
        governorate: key.province,
        district: key.district,
        area: key.subDistrict, // SubDistrict maps to area/neighborhood in client context
        pollingCenter: key.pollingCenter,
        totalVotes: key.expectedVotes, // map client expectation
        supportedVotes: Math.round(key.expectedVotes * 0.6), // Mocked breakdown or default distribution if not saved separately
        neutralVotes: Math.round(key.expectedVotes * 0.3),
        weakVotes: Math.round(key.expectedVotes * 0.1),
        netVotes: key.expectedVotes,
        loyaltyLevel: key.loyaltyScore,
        influenceLevel: key.influenceLevel,
        mobilizationAbility: key.mobilizationCap,
        voteProtection: 3,
        supportReason: 3,
        needsLevel: 3,
        politicalNote: 3,
        organizationalNote: 3,
        generalNote: 3,
        weightedScore: score,
        classification: classf,
        tribeId: key.tribeId,
        tribe: key.tribe,
        voterCount: key._count?.voters || 0,
        notes: "",
        socialMedia: key.socialMedia ? (typeof key.socialMedia === "string" ? key.socialMedia : JSON.stringify(key.socialMedia)) : null,
        dateOfBirth: key.birthDate ? key.birthDate.toISOString().split("T")[0] : null,
        createdAt: key.createdAt.toISOString(),
      };
    });

    // Client classification filter
    const finalKeys = classification 
      ? mappedKeys.filter(k => k.classification === classification)
      : mappedKeys;

    return NextResponse.json(finalKeys);
  } catch (error) {
    console.error("[electoral-keys-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve electoral keys" }, { status: 500 });
  }
}

// POST /api/electoral-keys - Create key with full schema
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const {
      code,
      firstName,
      fatherName,
      grandfatherName,
      fourthName,
      gender,
      dateOfBirth,
      phone,
      educationLevel,
      profession,
      governorate,
      district,
      area,
      pollingCenter,
      totalVotes,
      loyaltyLevel,
      influenceLevel,
      mobilizationAbility,
      tribeId,
      socialMedia,
    } = body;

    if (!firstName || !phone) {
      return NextResponse.json({ error: "الاسم الأول ورقم الهاتف حقول مطلوبة" }, { status: 400 });
    }

    const birthDate = dateOfBirth ? new Date(dateOfBirth) : new Date("1980-01-01");

    let generatedCode = "";
    let attempts = 0;
    const maxAttempts = 5;
    let key = null;

    while (attempts < maxAttempts) {
      const maxKey = await prisma.electionKey.aggregate({
        _max: {
          keyCode: true
        }
      });
      const maxCodeStr = maxKey._max.keyCode;
      let maxSeq = 0;
      if (maxCodeStr) {
        const num = parseInt(maxCodeStr, 10);
        if (!isNaN(num)) {
          maxSeq = num;
        }
      }
      generatedCode = String(maxSeq + 1);

      try {
        key = await prisma.electionKey.create({
          data: {
            keyCode: generatedCode,
            firstName,
            fatherName: fatherName || "",
            grandfatherName: grandfatherName || "",
            fourthName: fourthName || "",
            gender: gender || "ذكر",
            birthDate,
            phone,
            education: educationLevel || "",
            profession: profession || "",
            province: governorate || "ذي قار",
            district: district || "الناصرية",
            subDistrict: area || "",
            pollingCenter: pollingCenter || "",
            expectedVotes: parseInt(totalVotes) || 0,
            loyaltyScore: parseInt(loyaltyLevel) || 3,
            influenceLevel: parseInt(influenceLevel) || 3,
            mobilizationCap: parseInt(mobilizationAbility) || 3,
            tribeId: tribeId || null,
            socialMedia: safeJsonParse(socialMedia),
          },
          include: {
            tribe: true,
          }
        });
        break; // Success!
      } catch (error: any) {
        if (error.code === 'P2002' && (error.meta?.target?.includes('keyCode') || error.message?.includes('keyCode'))) {
          attempts++;
          continue; // Retry with a new generated code
        }
        throw error; // Propagate other errors
      }
    }

    if (!key) {
      return NextResponse.json({ error: "فشل توليد كود المفتاح الانتخابي بسبب التزامن، يرجى المحاولة مرة أخرى" }, { status: 500 });
    }

    return NextResponse.json({
      id: key.id,
      code: key.keyCode,
      firstName: key.firstName,
      fatherName: key.fatherName,
      grandfatherName: key.grandfatherName,
      fourthName: key.fourthName,
      nickname: key.tribe?.name || "",
      gender: key.gender,
      phone: key.phone,
      educationLevel: key.education,
      profession: key.profession,
      governorate: key.province,
      district: key.district,
      area: key.subDistrict,
      pollingCenter: key.pollingCenter,
      totalVotes: key.expectedVotes,
      supportedVotes: Math.round(key.expectedVotes * 0.6),
      neutralVotes: Math.round(key.expectedVotes * 0.3),
      weakVotes: Math.round(key.expectedVotes * 0.1),
      netVotes: key.expectedVotes,
      loyaltyLevel: key.loyaltyScore,
      influenceLevel: key.influenceLevel,
      mobilizationAbility: key.mobilizationCap,
      voteProtection: 3,
      supportReason: 3,
      needsLevel: 3,
      politicalNote: 3,
      organizationalNote: 3,
      generalNote: 3,
      weightedScore: 60,
      classification: "جيد",
      tribeId: key.tribeId,
      tribe: key.tribe,
      voterCount: 0,
      notes: "",
      socialMedia: key.socialMedia ? JSON.stringify(key.socialMedia) : null,
      dateOfBirth: key.birthDate ? key.birthDate.toISOString().split("T")[0] : null,
      createdAt: key.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error: any) {
    console.error("[electoral-keys-post] failed:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "كود المفتاح أو رقم الهاتف مسجل مسبقاً" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create electoral key" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });

``

## File: src\app\api\electoral-keys\[id]\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { isValidCuid } from "@/lib/security";

function safeJsonParse(val: any) {
  if (!val) return null;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return { text: val };
    }
  }
  return val;
}

// PUT /api/electoral-keys/[id] - Updates electoral key fields
async function putHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const keyId = params.id;
    if (!isValidCuid(keyId)) {
      return NextResponse.json({ error: "معرف المفتاح الانتخابي غير صالح" }, { status: 400 });
    }
    const body = await request.json();

    const updateData: Record<string, any> = {};

    if (body.code !== undefined) updateData.keyCode = body.code;
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.fatherName !== undefined) updateData.fatherName = body.fatherName;
    if (body.grandfatherName !== undefined) updateData.grandfatherName = body.grandfatherName;
    if (body.fourthName !== undefined) updateData.fourthName = body.fourthName;
    if (body.gender !== undefined) updateData.gender = body.gender;

    if (body.dateOfBirth !== undefined) {
      updateData.birthDate = body.dateOfBirth ? new Date(body.dateOfBirth) : new Date("1980-01-01");
    }

    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.educationLevel !== undefined) updateData.education = body.educationLevel;
    if (body.profession !== undefined) updateData.profession = body.profession;
    if (body.governorate !== undefined) updateData.province = body.governorate;
    if (body.district !== undefined) updateData.district = body.district;
    if (body.area !== undefined) updateData.subDistrict = body.area;
    if (body.pollingCenter !== undefined) updateData.pollingCenter = body.pollingCenter;

    if (body.totalVotes !== undefined) updateData.expectedVotes = parseInt(body.totalVotes) || 0;
    if (body.loyaltyLevel !== undefined) updateData.loyaltyScore = parseInt(body.loyaltyLevel) || 3;
    if (body.influenceLevel !== undefined) updateData.influenceLevel = parseInt(body.influenceLevel) || 3;
    if (body.mobilizationAbility !== undefined) updateData.mobilizationCap = parseInt(body.mobilizationAbility) || 3;

    if (body.tribeId !== undefined) updateData.tribeId = body.tribeId || null;

    if (body.socialMedia !== undefined) {
      updateData.socialMedia = safeJsonParse(body.socialMedia);
    }

    const updated = await prisma.electionKey.update({
      where: { id: keyId },
      data: updateData,
      include: {
        tribe: true,
        _count: {
          select: { voters: true }
        }
      }
    });

    const rawScore =
      ((updated.loyaltyScore || 3) - 1) * 20 +
      ((updated.influenceLevel || 3) - 1) * 20 +
      ((updated.mobilizationCap || 3) - 1) * 15 +
      30; // offset placeholder

    const score = Math.min(100, Math.round(rawScore / 2.5));
    let classf = "مقبول";
    if (score < 20) classf = "ضعيف";
    else if (score <= 50) classf = "مقبول";
    else if (score <= 100) classf = "جيد";
    else classf = "قوي";

    return NextResponse.json({
      id: updated.id,
      code: updated.keyCode,
      firstName: updated.firstName,
      fatherName: updated.fatherName,
      grandfatherName: updated.grandfatherName,
      fourthName: updated.fourthName,
      nickname: updated.tribe?.name || "",
      gender: updated.gender,
      phone: updated.phone,
      educationLevel: updated.education,
      profession: updated.profession,
      governorate: updated.province,
      district: updated.district,
      area: updated.subDistrict,
      pollingCenter: updated.pollingCenter,
      totalVotes: updated.expectedVotes,
      supportedVotes: Math.round(updated.expectedVotes * 0.6),
      neutralVotes: Math.round(updated.expectedVotes * 0.3),
      weakVotes: Math.round(updated.expectedVotes * 0.1),
      netVotes: updated.expectedVotes,
      loyaltyLevel: updated.loyaltyScore,
      influenceLevel: updated.influenceLevel,
      mobilizationAbility: updated.mobilizationCap,
      voteProtection: 3,
      supportReason: 3,
      needsLevel: 3,
      politicalNote: 3,
      organizationalNote: 3,
      generalNote: 3,
      weightedScore: score,
      classification: classf,
      tribeId: updated.tribeId,
      tribe: updated.tribe,
      voterCount: updated._count?.voters || 0,
      notes: "",
      socialMedia: updated.socialMedia ? JSON.stringify(updated.socialMedia) : null,
      dateOfBirth: updated.birthDate ? updated.birthDate.toISOString().split("T")[0] : null,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("[electoral-keys-put] failed:", error);
    return NextResponse.json({ error: "Failed to update electoral key" }, { status: 500 });
  }
}

// DELETE /api/electoral-keys/[id] - Deletes an electoral key
async function deleteHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const keyId = params.id;
    if (!isValidCuid(keyId)) {
      return NextResponse.json({ error: "معرف المفتاح الانتخابي غير صالح" }, { status: 400 });
    }
    await prisma.electionKey.delete({ where: { id: keyId } });
    return NextResponse.json({ success: true, message: "Electoral key deleted successfully" });
  } catch (error) {
    console.error("[electoral-keys-delete] failed:", error);
    return NextResponse.json({ error: "Failed to delete electoral key" }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler, { PUT: ["admin", "operator"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["admin"] });

``

## File: src\app\api\health\route.ts

``typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
}

``

## File: src\app\api\indicators\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { getCachedIndicators } from "@/lib/indicators-cache";
import { withAuth } from "@/lib/auth-guard";

async function getIndicators(_req: NextRequest): Promise<NextResponse> {
  try {
    const indicators = await getCachedIndicators();
    return NextResponse.json(
      {
        success: true,
        data: {
          gsi: {
            value: indicators.gsi.gsi,
            totalVoters: indicators.gsi.totalVoters,
            checkedIn: indicators.gsi.checkedIn,
            byTribe: indicators.gsi.byTribe,
          },
          edri: {
            value: indicators.edri.edri,
            dominantTribe: indicators.edri.dominantTribe,
            dominantShare: Math.round(indicators.edri.dominantShare * 1000) / 10,
            entropyScore: indicators.edri.entropyScore,
          },
          cachedAt: new Date().toISOString(),
        },
      },
      { headers: { "Cache-Control": "public, max-age=10, stale-while-revalidate=20" } }
    );
  } catch (error) {
    console.error("[indicators] computation failed:", error);
    return NextResponse.json({ success: false, error: "Failed to compute indicators" }, { status: 500 });
  }
}

export const GET = withAuth(getIndicators, { GET: ["admin", "viewer", "operator"] });

``

## File: src\app\api\keys\route.ts

``typescript
export { GET, POST } from '../electoral-keys/route';

``

## File: src\app\api\search\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

type SearchEntity = "voters" | "tribes" | "all";

async function searchHandler(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const entity = (searchParams.get("entity") as SearchEntity) ?? "all";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  try {
    const results: any[] = [];
    const perEntity = entity === "all" ? Math.floor(limit / 2) : limit;

    if (entity === "voters" || entity === "all") {
      const voters = await prisma.voter.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { fatherName: { contains: query, mode: "insensitive" } },
            { grandfatherName: { contains: query, mode: "insensitive" } },
            { fourthName: { contains: query, mode: "insensitive" } },
            { nationalId: { contains: query } }
          ]
        },
        take: perEntity,
        select: {
          id: true,
          firstName: true,
          fatherName: true,
          grandfatherName: true,
          fourthName: true,
          nationalId: true,
          votedOnDay: true,
          tribe: { select: { name: true } }
        },
      });
      results.push(...voters.map((v) => {
        const fullName = `${v.firstName} ${v.fatherName} ${v.grandfatherName} ${v.fourthName}`.trim().replace(/\s+/g, " ");
        return {
          entity: "voters",
          id: v.id,
          label: fullName,
          sublabel: `${v.nationalId || ""} — ${v.tribe?.name ?? ""}${v.votedOnDay ? " ✓" : ""}`,
        };
      }));
    }

    if (entity === "tribes" || entity === "all") {
      const tribes = await prisma.tribe.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        take: perEntity,
        select: {
          id: true,
          name: true,
          _count: {
            select: { voters: true }
          }
        },
      });
      results.push(...tribes.map((t) => ({
        entity: "tribes", id: t.id, label: t.name, sublabel: `${t._count.voters} ناخب`,
      })));
    }

    return NextResponse.json({ results, total: results.length, query });
  } catch (error) {
    console.error("[search] failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

export const GET = withAuth(searchHandler, { GET: ["admin", "viewer", "operator"] });

``

## File: src\app\api\services\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// GET /api/services - Returns all service requests
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mapped = services.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      serviceType: s.category,
      priority: s.priority,
      status: s.status,
      assignedTo: s.assignedTo || "",
      estimatedCost: s.cost,
      estimatedVotesImpact: s.estimatedVotesImpact,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[services-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve services" }, { status: 500 });
  }
}

// POST /api/services - Creates a new service request
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { title, description, serviceType, priority, status, assignedTo, estimatedCost, estimatedVotesImpact } = body;

    if (!title) {
      return NextResponse.json({ error: "عنوان الطلب الخدمي حقل مطلوب" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        title,
        description: description || "",
        category: serviceType || "MUNICIPAL",
        priority: priority || "NORMAL",
        status: status || "PENDING",
        assignedTo: assignedTo || null,
        cost: parseFloat(estimatedCost) || 0.0,
        estimatedVotesImpact: parseInt(estimatedVotesImpact) || 0,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("[services-post] failed:", error);
    return NextResponse.json({ error: "Failed to create service request" }, { status: 500 });
  }
}

// PUT /api/services - Updates a service request's status
async function putHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "معرف الخدمة والحالة حقول مطلوبة" }, { status: 400 });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[services-put] failed:", error);
    return NextResponse.json({ error: "Failed to update service status" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });
export const PUT = withAuth(putHandler, { PUT: ["admin", "operator"] });

``

## File: src\app\api\sms\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { auditLog, getClientIp } from "@/lib/security";

// GET /api/sms - Returns mockup campaign counters based on real database records
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const totalVoters = await prisma.voter.count();
    const checkedInCount = await prisma.voter.count({ where: { votedOnDay: true } });
    
    return NextResponse.json({
      sent: totalVoters - checkedInCount,
      pending: checkedInCount,
    });
  } catch (error) {
    console.error("[sms-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve SMS stats" }, { status: 500 });
  }
}

// POST /api/sms - Launches/Simulates a targeted SMS broadcast
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { smsText, selectedDistrict, selectedTribe, confidenceScore } = body;
    const clientIp = getClientIp(request);

    if (!smsText) {
      return NextResponse.json({ error: "نص الرسالة مطلوب" }, { status: 400 });
    }

    // Build filter query for counting target reach
    const where: Record<string, any> = {};
    if (selectedDistrict) {
      where.district = selectedDistrict;
    }
    if (selectedTribe) {
      where.tribeId = selectedTribe;
    }
    if (Array.isArray(confidenceScore) && confidenceScore.length > 0) {
      where.supportDegree = { in: confidenceScore.map((s: any) => parseInt(s) || 3) };
    }

    const reach = await prisma.voter.count({ where });

    // Log the event in our database audit log
    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "SMSCampaign",
      details: {
        textLength: smsText.length,
        estimatedReach: reach,
        district: selectedDistrict || "الكل",
        tribe: selectedTribe || "الكل",
      },
      ipAddress: clientIp,
    });

    return NextResponse.json({
      success: true,
      message: `تم إطلاق حملة البث بنجاح إلى ${reach} ناخب مستهدف`,
      reach,
    });
  } catch (error) {
    console.error("[sms-post] failed:", error);
    return NextResponse.json({ error: "Failed to broadcast SMS campaign" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });

``

## File: src\app\api\stats\route.ts

``typescript
export { GET } from '../voters/stats/route';

``

## File: src\app\api\tasks\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// GET /api/tasks - Returns all tasks matching filters, along with status counts
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const status = searchParams.get("status");

    const where: Record<string, any> = {};
    if (district) {
      where.district = district;
    }
    if (status) {
      where.status = status;
    }

    // Retrieve tasks with related voter and volunteer details
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        targetVoter: {
          select: {
            id: true,
            firstName: true,
            fatherName: true,
            grandfatherName: true,
            fourthName: true,
            phone: true,
            supportDegree: true,
          }
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            district: true,
          }
        }
      }
    });

    // Format tasks for the frontend mapping
    const mappedTasks = tasks.map(t => {
      const voterName = t.targetVoter 
        ? [t.targetVoter.firstName, t.targetVoter.fatherName, t.targetVoter.grandfatherName, t.targetVoter.fourthName].filter(Boolean).join(" ")
        : "";

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        taskType: t.taskType,
        district: t.district,
        impactEstimate: t.impactEstimate,
        targetVoter: t.targetVoter ? {
          id: t.targetVoter.id,
          fullName: voterName,
          phoneNumber: t.targetVoter.phone || "",
          confidenceScore: t.targetVoter.supportDegree,
        } : null,
        assignedTo: t.assignedTo ? {
          id: t.assignedTo.id,
          name: t.assignedTo.fullName,
          district: t.assignedTo.district,
        } : null,
        createdAt: t.createdAt.toISOString(),
      };
    });

    // Retrieve aggregate status counts
    const counts = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const statusCounts = counts.map(c => ({
      status: c.status,
      _count: { id: c._count.id }
    }));

    return NextResponse.json({
      tasks: mappedTasks,
      statusCounts,
    });
  } catch (error) {
    console.error("[tasks-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve tasks" }, { status: 500 });
  }
}

// POST /api/tasks - Creates a new task
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { title, description, priority, status, taskType, district, impactEstimate, targetVoterId, assignedToId } = body;

    if (!title) {
      return NextResponse.json({ error: "عنوان المهمة حقل مطلوب" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || "NORMAL",
        status: status || "PENDING",
        taskType: taskType || "FIELD",
        district: district || null,
        impactEstimate: impactEstimate || null,
        targetVoterId: targetVoterId || null,
        assignedToId: assignedToId || null,
      },
    });

    // Increment assigned task count for volunteer
    if (assignedToId) {
      await prisma.volunteer.update({
        where: { id: assignedToId },
        data: {
          totalAssignedTasks: { increment: 1 }
        }
      });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("[tasks-post] failed:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });

``

## File: src\app\api\tribes\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const tribes = await prisma.tribe.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { voters: true }
        }
      }
    });

    const tribeVotedCounts = await prisma.voter.groupBy({
      by: ['tribeId'],
      where: { votedOnDay: true },
      _count: { id: true }
    });
    const votedMap = new Map(tribeVotedCounts.map(g => [g.tribeId, g._count.id]));

    const mapped = tribes.map((t) => {
      const voterCount = t._count.voters;
      const checkedInCount = votedMap.get(t.id) || 0;
      const votedPercentage = voterCount > 0 ? Math.round((checkedInCount / voterCount) * 100) : 0;

      return {
        id: t.id,
        name: t.name,
        leaderName: "غير محدد",
        leaderPhone: "",
        influence: 3,
        district: "ذي قار",
        notes: "",
        voterCount,
        votedCount: checkedInCount,
        votedPercentage,
        avgConfidence: 3,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[tribes-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve tribes" }, { status: 500 });
  }
}

async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const tribe = await prisma.tribe.create({
      data: {
        name,
      },
    });

    return NextResponse.json(tribe, { status: 201 });
  } catch (error) {
    console.error("[tribes-post] failed:", error);
    return NextResponse.json({ error: "Failed to create tribe" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });

``

## File: src\app\api\volunteers\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// GET /api/volunteers - Returns all volunteers
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const volunteers = await prisma.volunteer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(volunteers);
  } catch (error) {
    console.error("[volunteers-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve volunteers" }, { status: 500 });
  }
}

// POST /api/volunteers - Creates a new volunteer
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { fullName, phone, email, role, district, area, notes } = body;

    if (!fullName || !phone || !role) {
      return NextResponse.json({ error: "الاسم الكامل والهاتف والدور حقول مطلوبة" }, { status: 400 });
    }

    // Check if phone number is already registered to avoid duplication
    const existing = await prisma.volunteer.findUnique({
      where: { phone },
    });
    if (existing) {
      return NextResponse.json({ error: "رقم الهاتف مسجل لمتطوع آخر مسبقاً" }, { status: 400 });
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        fullName,
        phone,
        email: email || null,
        role,
        district: district || null,
        area: area || null,
        notes: notes || null,
        efficiencyScore: 100, // New volunteers start with 100% efficiency
      },
    });

    return NextResponse.json(volunteer, { status: 201 });
  } catch (error) {
    console.error("[volunteers-post] failed:", error);
    return NextResponse.json({ error: "Failed to create volunteer" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });

``

## File: src\app\api\voters\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

function safeJsonParse(val: any) {
  if (!val) return null;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return { text: val };
    }
  }
  return val;
}

// GET /api/voters - Handles pagination, search, and filters matching the full Postgres schema
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));
    const tribeId = searchParams.get("tribeId");
    const district = searchParams.get("district");
    const votedStatus = searchParams.get("votedStatus");
    const search = searchParams.get("search");

    const where: Record<string, any> = {};
    if (tribeId) {
      where.tribeId = tribeId;
    }
    if (district) {
      where.district = district;
    }
    if (votedStatus === "voted") {
      where.votedOnDay = true;
    } else if (votedStatus === "not_voted") {
      where.votedOnDay = false;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { fatherName: { contains: q, mode: 'insensitive' } },
        { grandfatherName: { contains: q, mode: 'insensitive' } },
        { fourthName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { nationalId: { contains: q } },
      ];
    }

    // If role is KEY_USER, they should only see voters assigned to their key
    if (user.role === "KEY_USER") {
      const key = await prisma.electionKey.findFirst({
        where: { phone: user.username }, // username is the identifier / phone
        select: { id: true },
      });
      if (key) {
        where.keyId = key.id;
      }
    }

    const [voters, total] = await Promise.all([
      prisma.voter.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tribe: true,
          electionKey: true,
        },
      }),
      prisma.voter.count({ where }),
    ]);

    const mappedVoters = voters.map((v) => {
      const fullName = [v.firstName, v.fatherName, v.grandfatherName, v.fourthName]
        .filter(Boolean)
        .join(" ")
        .trim();
      return {
        ...v,
        fullName,
        phoneNumber: v.phone || "",
        nickname: v.tribe?.name || "غير محدد",
      };
    });

    return NextResponse.json({ voters: mappedVoters, total, page, limit });
  } catch (error) {
    console.error("[voters-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve voters" }, { status: 500 });
  }
}

// POST /api/voters - Handles creation with full Postgres schema fields
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    
    const {
      firstName,
      fatherName,
      grandfatherName,
      fourthName,
      gender,
      dateOfBirth,
      phoneNumber,
      phone,
      nationalId,
      district,
      subDistrict,
      area,
      pollingCenterName,
      pollingCenter,
      pollingCenterId,
      ballotStation,
      keyId,
      electoralKeyId,
      tribeId,
      subTribeId,
      voterCategory,
      status,
      confidenceScore,
      supportDegree,
      supportReason,
      profession,
      educationLevel,
      education,
      maritalStatus,
      familySize,
      firstContactDate,
      lastContactDate,
      contactResult,
      nextAction,
      followUpDate,
      relationship,
      influenceRate,
      isPrimaryFollow,
      latitude,
      longitude,
      gpsVerified,
      isRegistryVerified,
      registryVoterId,
      socialMedia,
    } = body;

    // Check required fields
    if (!firstName || !gender || (!keyId && !electoralKeyId)) {
      return NextResponse.json({ error: "الاسم الأول والجنس والمفتاح الانتخابي حقول مطلوبة" }, { status: 400 });
    }

    const birthDate = dateOfBirth ? new Date(dateOfBirth) : new Date("1980-01-01");
    const activeKeyId = keyId || electoralKeyId;

    const voter = await prisma.voter.create({
      data: {
        firstName,
        fatherName: fatherName || "",
        grandfatherName: grandfatherName || "",
        fourthName: fourthName || "",
        gender: gender || "ذكر",
        birthDate,
        phone: phone || phoneNumber || null,
        nationalId: nationalId || null,
        district: district || "الغراف",
        subDistrict: subDistrict || "",
        area: area || "",
        pollingCenter: pollingCenterName || pollingCenter || "",
        ballotStation: pollingCenterId || ballotStation || "",
        keyId: activeKeyId,
        tribeId: tribeId || null,
        subTribeId: subTribeId || null,
        status: voterCategory || status || "NEUTRAL",
        supportDegree: parseInt(confidenceScore) || parseInt(supportDegree) || 3,
        supportReason: supportReason || null,
        profession: profession || null,
        education: educationLevel || education || null,
        maritalStatus: maritalStatus || null,
        familySize: parseInt(familySize) || null,
        firstContactDate: firstContactDate ? new Date(firstContactDate) : null,
        lastContactDate: lastContactDate ? new Date(lastContactDate) : null,
        contactResult: contactResult || null,
        nextAction: nextAction || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        relationship: relationship || null,
        influenceRate: parseInt(influenceRate) || 50,
        isPrimaryFollow: isPrimaryFollow !== undefined ? Boolean(isPrimaryFollow) : true,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        gpsVerified: gpsVerified !== undefined ? Boolean(gpsVerified) : false,
        isRegistryVerified: isRegistryVerified !== undefined ? Boolean(isRegistryVerified) : false,
        registryVoterId: registryVoterId || null,
        socialMedia: safeJsonParse(socialMedia),
      },
      include: {
        tribe: true,
      },
    });

    const fullName = [voter.firstName, voter.fatherName, voter.grandfatherName, voter.fourthName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return NextResponse.json({
      ...voter,
      fullName,
      phoneNumber: voter.phone || "",
      nickname: voter.tribe?.name || "غير محدد",
    }, { status: 201 });
  } catch (error) {
    console.error("[voters-post] failed:", error);
    return NextResponse.json({ error: "Failed to create voter" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator", "key_user"] });

``

## File: src\app\api\voters\checkin\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { invalidateIndicatorsCache } from "@/lib/indicators-cache";

async function checkinHandler(req: NextRequest): Promise<NextResponse> {
  let body: { voterId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { voterId } = body;
  if (!voterId || typeof voterId !== "string") {
    return NextResponse.json({ error: "voterId is required" }, { status: 400 });
  }

  try {
    const result = await prisma.voter.updateMany({
      where: { id: voterId, votedOnDay: false },
      data: { votedOnDay: true },
    });

    if (result.count === 0) {
      const voter = await prisma.voter.findUnique({
        where: { id: voterId },
        select: { id: true, votedOnDay: true },
      });
      if (!voter) {
        return NextResponse.json({ error: "Voter not found" }, { status: 404 });
      }
      return NextResponse.json({ status: "already_checked_in", voterId });
    }

    invalidateIndicatorsCache();
    return NextResponse.json({ status: "checked_in", voterId });
  } catch (error) {
    console.error("[checkin] failed:", error);
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}

export const POST = withAuth(checkinHandler, { POST: ["admin", "operator"] });

``

## File: src\app\api\voters\stats\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    // 1. Core aggregates
    const totalVoters = await prisma.voter.count();
    const checkedInCount = await prisma.voter.count({ where: { votedOnDay: true } });
    const votedPercentage = totalVoters > 0 ? Math.round((checkedInCount / totalVoters) * 100) : 0;
    const highConfidenceCount = await prisma.voter.count({ where: { supportDegree: { gte: 4 } } });

    // Calculate average confidence score
    const avgAggregate = await prisma.voter.aggregate({
      _avg: { supportDegree: true }
    });
    const avgConfidence = avgAggregate._avg.supportDegree 
      ? Math.round(avgAggregate._avg.supportDegree * 10) / 10 
      : 3.0;

    // 2. Group by district
    const districtGroups = await prisma.voter.groupBy({
      by: ['district'],
      _count: { id: true },
      _avg: { supportDegree: true }
    });

    const votersByDistrict = districtGroups.map(g => ({
      district: g.district || "غير محدد",
      count: g._count.id,
      avgConfidence: g._avg.supportDegree ? Math.round(g._avg.supportDegree * 10) / 10 : 3.0
    }));

    // 3. Group by tribe
    const tribeGroups = await prisma.voter.groupBy({
      by: ['tribeId'],
      _count: { id: true },
      _avg: { supportDegree: true }
    });
    const tribes = await prisma.tribe.findMany({
      select: { id: true, name: true }
    });
    const tribeNameMap = new Map(tribes.map(t => [t.id, t.name]));

    const votersByTribe = tribeGroups.map(g => {
      const tName = g.tribeId ? tribeNameMap.get(g.tribeId) : "غير محدد";
      return {
        tribe: {
          id: g.tribeId || "unspecified",
          name: tName || "غير محدد",
          influence: 3,
          district: "المركز",
        },
        count: g._count.id,
        avgConfidence: g._avg.supportDegree ? Math.round(g._avg.supportDegree * 10) / 10 : 3.0
      };
    }).sort((a, b) => b.count - a.count);

    // 4. Group by confidence scores
    const confidenceCounts = await prisma.voter.groupBy({
      by: ['supportDegree'],
      _count: { id: true }
    });
    const confidenceDistribution = confidenceCounts.map(g => ({
      score: g.supportDegree || 3,
      count: g._count.id
    })).sort((a, b) => b.score - a.score);

    return NextResponse.json({
      totalVoters,
      votedCount: checkedInCount,
      votedPercentage,
      highConfidenceCount,
      avgConfidence,
      votersByDistrict,
      votersByTribe,
      confidenceDistribution,
    });
  } catch (error) {
    console.error("[voters-stats-get] failed:", error);
    return NextResponse.json({ error: "Failed to load voter stats" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });

``

## File: src\app\api\voters\[id]\route.ts

``typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { isValidCuid } from "@/lib/security";

function safeJsonParse(val: any) {
  if (!val) return null;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return { text: val };
    }
  }
  return val;
}

// PUT /api/voters/[id] - Updates a voter with the full set of fields
async function putHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const voterId = params.id;
    if (!isValidCuid(voterId)) {
      return NextResponse.json({ error: "معرف الناخب غير صالح" }, { status: 400 });
    }
    const body = await request.json();

    // Map field updates (only update fields if they are sent in body)
    const updateData: Record<string, any> = {};

    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.fatherName !== undefined) updateData.fatherName = body.fatherName;
    if (body.grandfatherName !== undefined) updateData.grandfatherName = body.grandfatherName;
    if (body.fourthName !== undefined) updateData.fourthName = body.fourthName;
    if (body.gender !== undefined) updateData.gender = body.gender;
    
    if (body.dateOfBirth !== undefined) {
      updateData.birthDate = body.dateOfBirth ? new Date(body.dateOfBirth) : new Date("1980-01-01");
    } else if (body.birthDate !== undefined) {
      updateData.birthDate = body.birthDate ? new Date(body.birthDate) : new Date("1980-01-01");
    }

    if (body.phoneNumber !== undefined) updateData.phone = body.phoneNumber;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.nationalId !== undefined) updateData.nationalId = body.nationalId;
    if (body.district !== undefined) updateData.district = body.district;
    if (body.subDistrict !== undefined) updateData.subDistrict = body.subDistrict;
    if (body.area !== undefined) updateData.area = body.area;

    if (body.pollingCenterName !== undefined) updateData.pollingCenter = body.pollingCenterName;
    if (body.pollingCenter !== undefined) updateData.pollingCenter = body.pollingCenter;
    
    if (body.pollingCenterId !== undefined) updateData.ballotStation = body.pollingCenterId;
    if (body.ballotStation !== undefined) updateData.ballotStation = body.ballotStation;

    const activeKeyId = body.keyId || body.electoralKeyId;
    if (activeKeyId !== undefined) updateData.keyId = activeKeyId;

    if (body.tribeId !== undefined) updateData.tribeId = body.tribeId || null;
    if (body.subTribeId !== undefined) updateData.subTribeId = body.subTribeId || null;

    if (body.voterCategory !== undefined) updateData.status = body.voterCategory;
    if (body.status !== undefined) updateData.status = body.status;

    if (body.confidenceScore !== undefined) updateData.supportDegree = parseInt(body.confidenceScore) || 3;
    if (body.supportDegree !== undefined) updateData.supportDegree = parseInt(body.supportDegree) || 3;

    if (body.supportReason !== undefined) updateData.supportReason = body.supportReason;
    if (body.profession !== undefined) updateData.profession = body.profession;
    
    if (body.educationLevel !== undefined) updateData.education = body.educationLevel;
    if (body.education !== undefined) updateData.education = body.education;

    if (body.maritalStatus !== undefined) updateData.maritalStatus = body.maritalStatus;
    if (body.familySize !== undefined) updateData.familySize = parseInt(body.familySize) || null;

    if (body.firstContactDate !== undefined) {
      updateData.firstContactDate = body.firstContactDate ? new Date(body.firstContactDate) : null;
    }
    if (body.lastContactDate !== undefined) {
      updateData.lastContactDate = body.lastContactDate ? new Date(body.lastContactDate) : null;
    }

    if (body.contactResult !== undefined) updateData.contactResult = body.contactResult;
    if (body.nextAction !== undefined) updateData.nextAction = body.nextAction;

    if (body.followUpDate !== undefined) {
      updateData.followUpDate = body.followUpDate ? new Date(body.followUpDate) : null;
    }

    if (body.relationship !== undefined) updateData.relationship = body.relationship;
    if (body.influenceRate !== undefined) updateData.influenceRate = parseInt(body.influenceRate) || 50;
    if (body.isPrimaryFollow !== undefined) updateData.isPrimaryFollow = Boolean(body.isPrimaryFollow);

    if (body.latitude !== undefined) updateData.latitude = body.latitude ? parseFloat(body.latitude) : null;
    if (body.longitude !== undefined) updateData.longitude = body.longitude ? parseFloat(body.longitude) : null;
    if (body.gpsVerified !== undefined) updateData.gpsVerified = Boolean(body.gpsVerified);

    if (body.isRegistryVerified !== undefined) updateData.isRegistryVerified = Boolean(body.isRegistryVerified);
    if (body.registryVoterId !== undefined) updateData.registryVoterId = body.registryVoterId || null;

    if (body.socialMedia !== undefined) {
      updateData.socialMedia = safeJsonParse(body.socialMedia);
    }

    // day of day actual voting
    if (body.votedStatus !== undefined) updateData.votedOnDay = Boolean(body.votedStatus);
    if (body.votedOnDay !== undefined) updateData.votedOnDay = Boolean(body.votedOnDay);

    const updated = await prisma.voter.update({
      where: { id: voterId },
      data: updateData,
    });

    const fullName = [updated.firstName, updated.fatherName, updated.grandfatherName, updated.fourthName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return NextResponse.json({
      ...updated,
      fullName,
      phoneNumber: updated.phone || "",
    });
  } catch (error) {
    console.error("[voters-put] failed:", error);
    return NextResponse.json({ error: "Failed to update voter" }, { status: 500 });
  }
}

// DELETE /api/voters/[id] - Deletes a voter
async function deleteHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const voterId = params.id;
    if (!isValidCuid(voterId)) {
      return NextResponse.json({ error: "معرف الناخب غير صالح" }, { status: 400 });
    }
    await prisma.voter.delete({ where: { id: voterId } });
    return NextResponse.json({ success: true, message: "voter deleted successfully" });
  } catch (error) {
    console.error("[voters-delete] failed:", error);
    return NextResponse.json({ error: "Failed to delete voter" }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler, { PUT: ["admin", "operator", "key_user"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["admin"] });

``

## File: src\components\theme-provider.tsx

``typescript
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

``

## File: src\components\election\AdvancedIndicators.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Shield,
  Target,
  AlertTriangle,
  DollarSign,
  MapPin,
  Activity,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Award,
  ChevronDown,
  Info,
  Zap,
} from 'lucide-react';

interface CompositeData {
  governorate: {
    id: string;
    eiiScore: number;
    kriScore: number;
    vpsScore: number;
    drsScore: number;
    campaignROI: number;
    apiScore: number;
    ewliScore: number;
    gsiScore: number;
    edriScore: number;
    efiScore: number;
    totalKeysInArea: number;
    totalNetVotes: number;
    totalSupportedVotes: number;
    totalNeutralVotes: number;
    totalWeakVotes: number;
    totalVotersInArea: number;
    projectedSeats: number;
    calculatedAt: string;
  } | null;
  districts: {
    id: string;
    district: string;
    eiiScore: number;
    kriScore: number;
    vpsScore: number;
    drsScore: number;
    campaignROI: number;
    apiScore: number;
    ewliScore: number;
    gsiScore: number;
    edriScore: number;
    efiScore: number;
    totalKeysInArea: number;
    totalNetVotes: number;
    totalSupportedVotes: number;
    totalNeutralVotes: number;
    totalWeakVotes: number;
    totalVotersInArea: number;
    projectedSeats: number;
  }[];
  lastCalculated: string | null;
}

const INDICATORS = [
  { key: 'eiiScore', name: 'مؤشر النفوذ الانتخابي', abbr: 'EII', icon: Zap, color: '#3b82f6', desc: 'يقيس قدرة المفاتيح على تحويل النفوذ الاجتماعي إلى أصوات فعلية. المعادلة: (التقييم الموزون×30%) + (نسبة الأصوات الصافية×25%) + (التأثير×25%) + (التحشيد×20%)' },
  { key: 'kriScore', name: 'مؤشر موثوقية المفتاح', abbr: 'KRI', icon: Shield, color: '#10b981', desc: 'يقيس مدى إمكانية الاعتماد على المفتاح يوم الاقتراع. المعادلة: (الولاء×25%) + (أسباب الدعم×20%) + (الحماية×20%) + (قلة الاحتياجات×20%) + (الاستقرار×15%)' },
  { key: 'vpsScore', name: 'مؤشر احتمالية التصويت', abbr: 'VPS', icon: Target, color: '#8b5cf6', desc: 'يقدر نسبة الناخبين الذين سيصوتون فعلاً. المعادلة: (المؤيد×80%×50%) + (المحايد×50%×30%) + (الضعيف×30%×20%) مع تعديل المشاركة التاريخية' },
  { key: 'drsScore', name: 'مؤشر خطر الانسحاب', abbr: 'DRS', icon: AlertTriangle, color: '#ef4444', desc: 'يحسب احتمال انقلاب المفتاح أو انسحاب دعمه. المعادلة: (ضعف الولاء×25%) + (ضعف الدعم×20%) + (الاحتياجات×20%) + (ضعف الوعي السياسي×15%) + (ضعف التنظيم×10%) + (انقطاع التواصل×10%). ملاحظة: القيمة الأعلى = خطر أكبر' },
  { key: 'campaignROI', name: 'مؤشر كفاءة الإنفاق', abbr: 'ROI', icon: DollarSign, color: '#f59e0b', desc: 'يقيس العائد الانتخابي مقابل كل دينار مُنفق. المعادلة: (الأصوات الصافية / الإنفاق بالآلاف) × 10' },
  { key: 'apiScore', name: 'مؤشر قابلية الاختراق', abbr: 'API', icon: TrendingUp, color: '#06b6d4', desc: 'يقيس قدرة الحملة على اختراق مناطق الخصوم. المعادلة: (نسبة المحايد×30%) + (فرصة التوسع×25%) + (معدل التحسن×25%) + (القوة الجغرافية×20%)' },
  { key: 'ewliScore', name: 'مؤشر الإنذار المبكر للخسارة', abbr: 'EWLI', icon: AlertTriangle, color: '#dc2626', desc: 'يتنبأ بكمية الأصوات المعرضة للخسارة. المعادلة: (الأصوات الضعيفة×30%) + (خطر الانسحاب×25%) + (التهديدات×20%) + (انخفاض المؤيد×15%) + (قوة الخصوم×10%). ملاحظة: القيمة الأعلى = خطر أكبر' },
  { key: 'gsiScore', name: 'مؤشر القوة الجغرافية', abbr: 'GSI', icon: MapPin, color: '#0ea5e9', desc: 'يقيس التغطية الجغرافية وجودة التوزيع. المعادلة: (التغطية×25%) + (الأصوات الموزعة×25%) + (متوسط التقييم×25%) + (التوازن×25%)' },
  { key: 'edriScore', name: 'مؤشر جاهزية الاقتراع', abbr: 'EDRI', icon: CheckCircle2, color: '#22c55e', desc: 'يقيس استعداد الحملة ليوم التصويت. المعادلة: (المفاتيح المدربة×20%) + (الحماية العالية×20%) + (المندوبون×20%) + (التحقق×20%) + (الولاء العالي×20%)' },
  { key: 'efiScore', name: 'مؤشر التوقع الانتخابي النهائي', abbr: 'EFI', icon: Brain, color: '#7c3aed', desc: 'المؤشر الشامل للتنبؤ بالمقاعد. المعادلة: EII×15% + KRI×15% + VPS×20% + (100-DRS)×10% + API×10% + (100-EWLI)×10% + GSI×10% + EDRI×10%' },
];

function getScoreColor(score: number, isInverted: boolean = false): string {
  const s = isInverted ? 100 - score : score;
  if (s >= 75) return 'text-green-600';
  if (s >= 50) return 'text-blue-600';
  if (s >= 25) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBg(score: number, isInverted: boolean = false): string {
  const s = isInverted ? 100 - score : score;
  if (s >= 75) return 'bg-green-50 border-green-200';
  if (s >= 50) return 'bg-blue-50 border-blue-200';
  if (s >= 25) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

function getBarColor(score: number, isInverted: boolean = false): string {
  const s = isInverted ? 100 - score : score;
  if (s >= 75) return 'bg-green-500';
  if (s >= 50) return 'bg-blue-500';
  if (s >= 25) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function AdvancedIndicators() {
  const [data, setData] = useState<CompositeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/composite-indicators');
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error('Error fetching indicators:', err);
    } finally {
      setLoading(false);
    }
  };

  const recalculate = async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/composite-indicators?recalculate=true', { method: 'POST' });
      const d = await res.json();
      await fetchData();
    } catch (err) {
      console.error('Error recalculating:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-el-on-surface-variant">
        جاري تحميل المؤشرات المركبة...
      </div>
    );
  }

  const gov = data.governorate;
  if (!gov) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Brain className="w-16 h-16 text-el-primary opacity-30" />
        <p className="text-el-on-surface-variant">لم يتم حساب المؤشرات بعد</p>
        <button onClick={recalculate} className="bg-el-primary text-el-on-primary px-6 py-2 rounded hover:opacity-90">
          حساب المؤشرات الآن
        </button>
      </div>
    );
  }

  const activeData = selectedDistrict && data.districts.length > 0
    ? data.districts.find(d => d.district === selectedDistrict) || gov
    : gov;
  const isActiveGov = activeData === gov;

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] leading-[32px] font-bold text-el-primary flex items-center gap-2">
            <Brain className="w-6 h-6" /> المؤشرات المركبة المتقدمة
          </h1>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">
            غرفة العمليات الانتخابية - الذكاء التحليلي والتنبؤ - محافظة ذي قار
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="bg-el-surface-container border border-el-outline-variant text-[12px] rounded px-3 py-1.5 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
          >
            <option value="">محافظة ذي قار (كلي)</option>
            {data.districts.map(d => (
              <option key={d.district} value={d.district}>{d.district}</option>
            ))}
          </select>
          <button
            onClick={recalculate}
            disabled={calculating}
            className="bg-el-primary text-el-on-primary px-4 py-1.5 rounded text-[12px] flex items-center gap-1 hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
            {calculating ? 'جاري الحساب...' : 'إعادة حساب'}
          </button>
        </div>
      </div>

      {/* ═══ المؤشر النهائي + المقاعد المتوقعة ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* التوقع الانتخابي النهائي EFI */}
        <div className="lg:col-span-2 bg-gradient-to-l from-el-primary to-[#0a2a5e] text-white rounded-sm p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/5 rounded-full translate-x-6 translate-y-6" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-el-secondary" />
              <span className="text-[14px] font-bold text-white/80">مؤشر التوقع الانتخابي النهائي (EFI)</span>
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-[56px] font-bold leading-none" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                {activeData.efiScore.toFixed(1)}
              </span>
              <span className="text-[20px] text-white/60">/100</span>
            </div>
            <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-el-secondary transition-all duration-700"
                style={{ width: `${activeData.efiScore}%` }}
              />
            </div>
            <p className="text-[11px] text-white/60">
              EFI = EII×15% + KRI×15% + VPS×20% + (100-DRS)×10% + API×10% + (100-EWLI)×10% + GSI×10% + EDRI×10%
            </p>
          </div>
        </div>

        {/* المقاعد المتوقعة */}
        <div className="bg-el-surface-container-lowest border-2 border-el-secondary/30 rounded-sm p-5 flex flex-col items-center justify-center">
          <Award className="w-8 h-8 text-el-secondary mb-2" />
          <span className="text-[11px] text-el-on-surface-variant uppercase tracking-wider mb-1">المقاعد المتوقعة</span>
          <span className="text-[48px] font-bold text-el-secondary leading-none" style={{ fontFamily: 'var(--font-geist-mono)' }}>
            {activeData.projectedSeats?.toFixed(1) || '0'}
          </span>
          <span className="text-[12px] text-el-on-surface-variant">من أصل 18 مقعد في ذي قار</span>
        </div>
      </section>

      {/* ═══ شبكة المؤشرات العشرة ═══ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {INDICATORS.map(ind => {
          const score = (activeData as any)[ind.key] || 0;
          const isInverted = ind.key === 'drsScore' || ind.key === 'ewliScore';
          const Icon = ind.icon;
          return (
            <div
              key={ind.key}
              className={`border rounded-sm p-3 ${getScoreBg(score, isInverted)} relative cursor-pointer transition-all hover:shadow-md`}
              onClick={() => setShowInfo(showInfo === ind.key ? null : ind.key)}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-4 h-4" style={{ color: ind.color }} />
                <span className="text-[11px] font-bold text-el-on-surface">{ind.abbr}</span>
                <Info className="w-3 h-3 text-el-on-surface-variant opacity-50" />
              </div>
              <div
                className={`${ind.key === 'campaignROI' && score === 0 ? 'text-[14px]' : 'text-[28px]'} font-bold leading-none mb-1 ${getScoreColor(score, isInverted)}`}
                style={{ fontFamily: ind.key === 'campaignROI' && score === 0 ? undefined : 'var(--font-geist-mono)' }}
              >
                {ind.key === 'campaignROI' && score === 0 ? "لا توجد بيانات إنفاق" : score.toFixed(1)}
              </div>
              <div className="text-[10px] text-el-on-surface-variant leading-tight">{ind.name}</div>
              <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full transition-all duration-500 ${getBarColor(score, isInverted)}`}
                  style={{ width: `${isInverted ? 100 - score : score}%` }}
                />
              </div>
              {isInverted && (
                <div className="text-[9px] text-red-500 mt-1">⚠ الأعلى = خطر أكبر</div>
              )}
              
              {/* نافذة المعادلة */}
              {showInfo === ind.key && (
                <div className="absolute top-full right-0 left-0 z-20 mt-1 bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-2 shadow-lg text-[10px] text-el-on-surface-variant leading-relaxed">
                  {ind.desc}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ═══ ملخص إحصائي ═══ */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 text-center">
          <div className="text-[24px] font-bold text-el-primary font-mono">{activeData.totalKeysInArea}</div>
          <div className="text-[10px] text-el-on-surface-variant">مفتاح انتخابي</div>
        </div>
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 text-center">
          <div className="text-[24px] font-bold text-green-600 font-mono">{activeData.totalSupportedVotes}</div>
          <div className="text-[10px] text-el-on-surface-variant">أصوات مؤيدة</div>
        </div>
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 text-center">
          <div className="text-[24px] font-bold text-yellow-600 font-mono">{activeData.totalNeutralVotes}</div>
          <div className="text-[10px] text-el-on-surface-variant">أصوات محايدة</div>
        </div>
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 text-center">
          <div className="text-[24px] font-bold text-red-600 font-mono">{activeData.totalWeakVotes}</div>
          <div className="text-[10px] text-el-on-surface-variant">أصوات ضعيفة</div>
        </div>
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 text-center">
          <div className="text-[24px] font-bold text-el-primary font-mono">{activeData.totalNetVotes}</div>
          <div className="text-[10px] text-el-on-surface-variant">أصوات صافية</div>
        </div>
      </section>

      {/* ═══ مقارنة الأقضية ═══ */}
      {data.districts.length > 0 && (
        <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-4">
          <h3 className="text-[16px] font-semibold text-el-on-surface mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-el-primary" /> مقارنة المؤشرات حسب الأقضية
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[11px] leading-[16px]">
              <thead className="bg-el-surface-container border-b border-el-outline-variant text-el-on-surface-variant text-[10px] font-bold uppercase">
                <tr>
                  <th className="px-2 py-2 font-normal">القضاء</th>
                  <th className="px-2 py-2 font-normal text-center">EFI</th>
                  <th className="px-2 py-2 font-normal text-center">EII</th>
                  <th className="px-2 py-2 font-normal text-center">KRI</th>
                  <th className="px-2 py-2 font-normal text-center">VPS</th>
                  <th className="px-2 py-2 font-normal text-center">DRS</th>
                  <th className="px-2 py-2 font-normal text-center">API</th>
                  <th className="px-2 py-2 font-normal text-center">GSI</th>
                  <th className="px-2 py-2 font-normal text-center">EDRI</th>
                  <th className="px-2 py-2 font-normal text-center">مقاعد</th>
                  <th className="px-2 py-2 font-normal text-center">صافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/50">
                {data.districts
                  .sort((a, b) => b.efiScore - a.efiScore)
                  .map((d, idx) => (
                    <tr key={d.district} className={`hover:bg-el-surface-container-lowest/50 ${idx % 2 === 1 ? 'bg-el-surface-container-low/30' : ''}`}>
                      <td className="px-2 py-1.5 font-semibold text-el-on-surface">{d.district}</td>
                      <td className="px-2 py-1.5 text-center font-mono font-bold">
                        <span className={getScoreColor(d.efiScore)}>{d.efiScore.toFixed(1)}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.eiiScore.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.kriScore.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.vpsScore.toFixed(1)}%</td>
                      <td className="px-2 py-1.5 text-center font-mono">
                        <span className={getScoreColor(d.drsScore, true)}>{d.drsScore.toFixed(1)}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.apiScore.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.gsiScore.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{d.edriScore.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-center font-mono font-bold text-el-secondary">
                        {d.projectedSeats?.toFixed(1) || '-'}
                      </td>
                      <td className="px-2 py-1.5 text-center font-mono text-el-primary">{d.totalNetVotes}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ═══ مخطط المؤشرات الشامل ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-4">
        <h3 className="text-[16px] font-semibold text-el-on-surface mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-el-primary" /> الملف التعريفي الانتخابي - محافظة ذي قار
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {INDICATORS.map(ind => {
            const score = (activeData as any)[ind.key] || 0;
            const isInverted = ind.key === 'drsScore' || ind.key === 'ewliScore';
            const normalizedScore = isInverted ? 100 - score : score;
            return (
              <div key={ind.key} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-el-on-surface-variant">{ind.abbr}</span>
                <div className="w-full bg-el-surface-variant rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-700 rounded-full"
                    style={{
                      width: `${normalizedScore}%`,
                      backgroundColor: ind.color,
                    }}
                  />
                </div>
                <span className={`text-[12px] font-bold font-mono ${getScoreColor(score, isInverted)}`}>
                  {score.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ آخر تحديث ═══ */}
      <div className="text-[10px] text-el-on-surface-variant text-center">
        آخر حساب: {data.lastCalculated ? new Date(data.lastCalculated).toLocaleString('ar-IQ') : 'لم يتم الحساب بعد'}
      </div>
    </div>
  );
}

``

## File: src\components\election\CommissionManagement.tsx

``typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Search,
  ChevronDown,
  X,
  MapPin,
  TrendingUp,
  Award,
  Vote,
  Edit2,
  Trash2,
  Percent,
  Calculator,
} from 'lucide-react';

const DISTRICTS = [
  'الناصرية',
  'الشطرة',
  'سوق الشيوخ',
  'الرفاعي',
  'الجبايش',
  'قلعة سكر',
  'الغراف',
  'النصر',
  'الفجر',
  'الفهود',
  'البطحاء',
  'سيد دخيل',
  'الإصلاح',
  'الدواية',
];

interface CommissionDataRecord {
  id: string;
  province: string;
  district: string;
  subDistrict: string;
  pollingCenter: string;
  ballotStation: string;
  registeredVoters: number;
  historicalTurnout: number;
  expectedTurnout: number | null;
}

const defaultForm = {
  province: 'ذي قار',
  district: 'الناصرية',
  subDistrict: '',
  pollingCenter: '',
  ballotStation: '',
  registeredVoters: 0,
  historicalTurnout: 0,
  expectedTurnout: '',
};

export default function CommissionManagement() {
  const [records, setRecords] = useState<CommissionDataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [form, setForm] = useState(defaultForm);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch('/api/commission');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecords(data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Error fetching commission records:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSaveRecord = async () => {
    try {
      const payload = {
        ...form,
        expectedTurnout: form.expectedTurnout ? parseFloat(form.expectedTurnout) : null,
      };

      const url = editMode ? `/api/commission/${editingId}` : '/api/commission';
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddDialog(false);
        setEditMode(false);
        setEditingId(null);
        setForm(defaultForm);
        fetchRecords();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل في حفظ البيانات');
      }
    } catch (err) {
      console.error('Error saving commission record:', err);
    }
  };

  const handleStartEdit = (rec: CommissionDataRecord) => {
    setForm({
      province: rec.province,
      district: rec.district,
      subDistrict: rec.subDistrict || '',
      pollingCenter: rec.pollingCenter || '',
      ballotStation: rec.ballotStation || '',
      registeredVoters: rec.registeredVoters || 0,
      historicalTurnout: rec.historicalTurnout || 0,
      expectedTurnout: rec.expectedTurnout !== null ? String(rec.expectedTurnout) : '',
    });
    setEditingId(rec.id);
    setEditMode(true);
    setShowAddDialog(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا السجل الانتخابي؟')) return;

    try {
      const res = await fetch(`/api/commission/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRecords();
      } else {
        alert('فشل في حذف السجل');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.district.includes(searchQuery) ||
      r.pollingCenter.includes(searchQuery) ||
      r.subDistrict.includes(searchQuery);
    const matchesDistrict = filterDistrict ? r.district === filterDistrict : true;
    return matchesSearch && matchesDistrict;
  });

  // Calculate totals
  const totalRegistered = filteredRecords.reduce((sum, r) => sum + r.registeredVoters, 0);
  const avgTurnout =
    filteredRecords.length > 0
      ? filteredRecords.reduce((sum, r) => sum + (r.expectedTurnout ?? r.historicalTurnout), 0) /
        filteredRecords.length
      : 0;
  const totalExpectedVoters = Math.round(
    filteredRecords.reduce(
      (sum, r) => sum + r.registeredVoters * ((r.expectedTurnout ?? r.historicalTurnout) / 100),
      0
    )
  );

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] leading-[32px] font-bold text-el-primary flex items-center gap-2">
            <FileText className="w-6 h-6" /> بيانات المفوضية المستقلة للانتخابات
          </h1>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">
            إدارة أعداد الناخبين المسجلين، ونسب المشاركة، ومحطات الاقتراع الموزعة على أقضية ذي قار
          </p>
        </div>
        <button
          onClick={() => {
            setEditMode(false);
            setForm(defaultForm);
            setShowAddDialog(true);
          }}
          className="bg-el-primary text-el-on-primary px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-[18px] h-[18px]" />
          <span className="text-[14px] leading-[20px] font-medium">إضافة مركز/محطة اقتراع</span>
        </button>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-4">
          <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider">الناخبون المسجلون كلياً</div>
          <div
            className="text-[28px] font-bold text-el-primary mt-1"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            {totalRegistered.toLocaleString()}
          </div>
          <div className="text-[10px] text-el-on-surface-variant mt-1">إجمالي الناخبين في السجلات المختارة</div>
        </div>

        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-4">
          <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider">متوسط نسبة المشاركة المتوقعة</div>
          <div
            className="text-[28px] font-bold text-el-secondary mt-1"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            {avgTurnout.toFixed(2)}%
          </div>
          <div className="text-[10px] text-el-on-surface-variant mt-1">بناءً على التحديثات والمشاركة التاريخية</div>
        </div>

        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-4">
          <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider">المصوتون المتوقع حضورهم</div>
          <div
            className="text-[28px] font-bold text-green-600 mt-1"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            {totalExpectedVoters.toLocaleString()}
          </div>
          <div className="text-[10px] text-el-on-surface-variant mt-1">إجمالي الحضور التقريبي يوم الاقتراع</div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-el-outline w-4 h-4" />
          <input
            className="w-full bg-el-surface-container-lowest border border-el-outline-variant rounded h-8 pl-3 pr-8 text-[12px] focus:outline-none focus:border-el-primary"
            placeholder="بحث بالقضاء، اسم المركز أو الناحية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-el-surface-container border border-el-outline-variant text-[12px] rounded pl-8 pr-3 py-1 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
          >
            <option value="">جميع الأقضية</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
      </div>

      {/* Grid of Data */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-el-on-surface-variant">جاري التحميل...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-el-on-surface-variant gap-3">
          <FileText className="w-12 h-12 opacity-30" />
          <p>لا توجد بيانات مسجلة لمفوضية الانتخابات</p>
        </div>
      ) : (
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[12px] leading-[16px]">
              <thead className="bg-el-surface-container border-b border-el-outline-variant text-el-on-surface-variant text-[11px] font-bold">
                <tr>
                  <th className="px-3 py-2">المحافظة</th>
                  <th className="px-3 py-2">القضاء</th>
                  <th className="px-3 py-2">الناحية</th>
                  <th className="px-3 py-2">مركز الاقتراع</th>
                  <th className="px-3 py-2 text-center">المحطة</th>
                  <th className="px-3 py-2 text-center">الناخبون المسجلون</th>
                  <th className="px-3 py-2 text-center">نسبة المشاركة التاريخية</th>
                  <th className="px-3 py-2 text-center">نسبة المشاركة المتوقعة</th>
                  <th className="px-3 py-2 w-16 text-center">خيارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/50">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-el-surface-container-low/20 transition-colors">
                    <td className="px-3 py-2">{rec.province}</td>
                    <td className="px-3 py-2 font-bold text-el-primary">{rec.district}</td>
                    <td className="px-3 py-2">{rec.subDistrict || '-'}</td>
                    <td className="px-3 py-2">{rec.pollingCenter}</td>
                    <td className="px-3 py-2 text-center font-mono">{rec.ballotStation}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold">{rec.registeredVoters.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center font-mono">{rec.historicalTurnout}%</td>
                    <td className="px-3 py-2 text-center font-mono text-el-secondary font-bold">
                      {rec.expectedTurnout !== null ? `${rec.expectedTurnout}%` : '-'}
                    </td>
                    <td className="px-3 py-2 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleStartEdit(rec)}
                        className="text-el-secondary hover:text-el-primary transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest rounded border border-el-outline-variant w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b border-el-outline-variant">
              <h3 className="text-[18px] font-semibold text-el-on-surface flex items-center gap-2">
                <FileText className="w-5 h-5 text-el-primary" />
                {editMode ? 'تعديل السجل الانتخابي' : 'إضافة سجل اقتراع للمفوضية'}
              </h3>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setForm(defaultForm);
                }}
                className="text-el-on-surface-variant hover:text-el-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">المحافظة</label>
                  <input
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">القضاء *</label>
                  <select
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الناحية/المنطقة</label>
                  <input
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                    placeholder="مثال: المركز"
                    value={form.subDistrict}
                    onChange={(e) => setForm({ ...form, subDistrict: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">مركز الاقتراع *</label>
                  <input
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                    placeholder="مثال: مدرسة بابل"
                    value={form.pollingCenter}
                    onChange={(e) => setForm({ ...form, pollingCenter: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">رقم المحطة *</label>
                  <input
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                    placeholder="مثال: 1"
                    value={form.ballotStation}
                    onChange={(e) => setForm({ ...form, ballotStation: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد الناخبين الكلي</label>
                  <input
                    type="number"
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                    value={form.registeredVoters || ''}
                    onChange={(e) => setForm({ ...form, registeredVoters: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">نسبة المشاركة التاريخية (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                    placeholder="مثال: 48.97"
                    value={form.historicalTurnout || ''}
                    onChange={(e) => setForm({ ...form, historicalTurnout: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">نسبة المشاركة المتوقعة (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                    placeholder="اختياري"
                    value={form.expectedTurnout}
                    onChange={(e) => setForm({ ...form, expectedTurnout: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-el-outline-variant bg-el-surface-container-lowest">
              <button
                onClick={handleSaveRecord}
                disabled={!form.pollingCenter || !form.ballotStation}
                className="flex-1 bg-el-primary text-el-on-primary py-2 rounded text-[14px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editMode ? 'حفظ التعديلات' : 'إضافة السجل'}
              </button>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setForm(defaultForm);
                }}
                className="flex-1 border border-el-outline-variant text-el-on-surface-variant py-2 rounded text-[14px] hover:bg-el-surface-container"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

``

## File: src\components\election\CommunicationEngine.tsx

``typescript
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Send,
} from 'lucide-react';

interface Tribe {
  id: string;
  name: string;
  influence: number;
  district: string | null;
  voterCount: number;
}

const DISTRICTS = ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'قلعة سكر', 'عشيرة', 'البطحاء'];

export default function CommunicationEngine() {
  const [confidenceScore, setConfidenceScore] = useState<number[]>([4, 5]);
  const [smsText, setSmsText] = useState('');
  const [influenceValue, setInfluenceValue] = useState(5);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTribe, setSelectedTribe] = useState('');
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const charCount = smsText.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  useEffect(() => {
    let cancelled = false;
    async function loadTribes() {
      try {
        const res = await fetch('/api/tribes');
        const data = await res.json();
        if (!cancelled) setTribes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching tribes:', err);
      }
    }
    loadTribes();
    return () => { cancelled = true; };
  }, []);

  const estimatedReach = useMemo(() => {
    let reach = 50;
    if (selectedDistrict) reach = Math.floor(reach * 0.3);
    if (selectedTribe) reach = Math.floor(reach * 0.1);
    if (confidenceScore.length > 0) reach = Math.floor(reach * (confidenceScore.length / 5));
    return reach;
  }, [selectedDistrict, selectedTribe, confidenceScore]);

  const filteredTribes = tribes.filter(
    (t) => !selectedDistrict || t.district === selectedDistrict
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-el-outline-variant pb-2 mb-4">
        <div>
          <h2 className="text-[18px] leading-[24px] font-semibold text-el-primary">بث رسائل SMS</h2>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">قم بتكوين وإطلاق حملات SMS مستهدفة في ذي قار.</p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Left Column: Filtering (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-el-surface rounded border border-el-outline-variant p-4">
            <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant border-b border-el-outline-variant pb-2 mb-3">استهداف الجمهور</h3>
            <div className="space-y-4">
              {/* Governorate/District */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">المحافظة / القضاء</label>
                <select
                  className="w-full h-8 px-2 bg-el-surface text-el-on-surface border border-el-outline-variant rounded text-[12px] leading-[16px] focus:border-el-primary focus:ring-1 focus:ring-el-primary outline-none cursor-pointer"
                  value={selectedDistrict}
                  onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedTribe(''); }}
                >
                  <option value="">جميع أقضية ذي قار</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Tribe Targeting */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">العشيرة (اختياري)</label>
                <select
                  className="w-full h-8 px-2 bg-el-surface text-el-on-surface border border-el-outline-variant rounded text-[12px] leading-[16px] focus:border-el-primary focus:ring-1 focus:ring-el-primary outline-none cursor-pointer"
                  value={selectedTribe}
                  onChange={(e) => setSelectedTribe(e.target.value)}
                >
                  <option value="">جميع العشائر</option>
                  {filteredTribes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.voterCount} ناخب)</option>
                  ))}
                </select>
              </div>

              {/* Confidence Score */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">درجة الثقة (نجوم)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => {
                        if (confidenceScore.includes(score)) {
                          setConfidenceScore(confidenceScore.filter((s) => s !== score));
                        } else {
                          setConfidenceScore([...confidenceScore, score]);
                        }
                      }}
                      className={`flex-1 h-8 border rounded text-[12px] leading-[16px] font-medium transition-colors ${
                        confidenceScore.includes(score)
                          ? 'border-el-secondary bg-el-secondary-container text-el-on-secondary-container'
                          : 'border-el-secondary text-el-secondary hover:bg-el-secondary-container hover:text-el-on-secondary-container'
                      }`}
                      style={{ fontFamily: 'var(--font-geist-mono)' }}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voted Status */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">حالة التصويت</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-[12px] leading-[16px] cursor-pointer">
                    <input defaultChecked className="rounded-sm border-el-outline-variant h-4 w-4 text-el-primary" type="checkbox" />
                    لم يصوت
                  </label>
                  <label className="flex items-center gap-2 text-[12px] leading-[16px] cursor-pointer">
                    <input className="rounded-sm border-el-outline-variant h-4 w-4 text-el-primary" type="checkbox" />
                    صوّت
                  </label>
                </div>
              </div>

              {/* Influence Weight */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">تأثير الشبكة العشائرية</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={influenceValue}
                  onChange={(e) => setInfluenceValue(Number(e.target.value))}
                  className="w-full h-1 bg-el-outline-variant rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[12px] leading-[16px] font-medium text-el-outline mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  <span>عالي</span>
                  <span>منخفض</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-el-outline-variant flex justify-between items-center">
              <span className="text-[12px] leading-[16px] font-medium text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>الوصول التقديري:</span>
              <span className="text-[12px] leading-[16px] font-bold text-el-primary" style={{ fontFamily: 'var(--font-geist-mono)' }}>{estimatedReach.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Composer & Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-2">
          {/* Top Row: Composer and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Composer */}
            <div className="bg-el-surface rounded border border-el-outline-variant flex flex-col">
              <div className="bg-el-surface-container-lowest px-4 py-2 border-b border-el-outline-variant flex justify-between items-center">
                <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface">منشئ الحملة</h3>
                <div className="flex gap-2">
                  <button className="text-[10px] border border-el-outline-variant px-2 py-1 rounded bg-el-surface hover:bg-el-surface-container text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>{'{voter_name}'}</button>
                  <button className="text-[10px] border border-el-outline-variant px-2 py-1 rounded bg-el-surface hover:bg-el-surface-container text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>{'{polling_center}'}</button>
                </div>
              </div>
              <div className="p-4 flex-1">
                <textarea
                  className="w-full h-32 p-2 border border-el-outline-variant rounded bg-el-surface text-el-on-surface text-[12px] leading-[16px] resize-none focus:border-el-primary focus:ring-1 focus:ring-el-primary outline-none"
                  placeholder="أدخل رسالة SMS هنا... استخدم العلامات أعلاه للتخصيص."
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[12px] leading-[16px] font-medium text-el-outline" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    الأحرف: {charCount} / 160 ({smsCount} SMS)
                  </span>
                </div>
              </div>
            </div>

            {/* Overview / Quota */}
            <div className="bg-el-primary-container text-el-on-primary-container rounded p-4 border border-el-primary-container relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Radio className="w-[120px] h-[120px]" />
              </div>
              <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] mb-4 relative z-10" style={{ color: '#d8e2ff' }}>نظرة عامة على البث</h3>
              <div className="space-y-4 relative z-10">
                <div>
                  <div className="flex justify-between text-[12px] leading-[16px] font-medium mb-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    <span>استخدام الحصة اليومية</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#364768' }}>
                    <div className="bg-el-secondary-container h-1.5 rounded-full" style={{ width: '45%' }} />
                  </div>
                  <div className="text-right text-[10px] leading-[16px] font-medium mt-1" style={{ color: '#b6c6ef', fontFamily: 'var(--font-geist-mono)' }}>
                    45,000 / 100,000 SMS
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2" style={{ borderTop: '1px solid #364768' }}>
                  <div>
                    <div className="text-[18px] leading-[24px] font-semibold">12k</div>
                    <div className="text-[11px] leading-[16px] font-bold tracking-[0.05em]" style={{ color: '#b6c6ef' }}>مرسل</div>
                  </div>
                  <div>
                    <div className="text-[18px] leading-[24px] font-semibold">11.8k</div>
                    <div className="text-[11px] leading-[16px] font-bold tracking-[0.05em]" style={{ color: '#b6c6ef' }}>تم التسليم</div>
                  </div>
                  <div>
                    <div className="text-[18px] leading-[24px] font-semibold" style={{ color: '#ffdad6' }}>200</div>
                    <div className="text-[11px] leading-[16px] font-bold tracking-[0.05em]" style={{ color: '#b6c6ef' }}>فشل</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voter Preview Table */}
          <div className="bg-el-surface rounded border border-el-outline-variant overflow-hidden">
            <div className="bg-el-surface-container-lowest px-4 py-2 border-b border-el-outline-variant flex justify-between items-center">
              <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface">معاينة الناخبين</h3>
              <span className="text-[10px] font-medium text-el-outline" style={{ fontFamily: 'var(--font-geist-mono)' }}>عرض 5 من {estimatedReach.toLocaleString()}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-el-surface-container-low border-b border-el-outline-variant">
                  <tr>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">الاسم (مخفي)</th>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">الهاتف</th>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">القضاء</th>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">مركز الاقتراع</th>
                  </tr>
                </thead>
                <tbody className="text-[12px] leading-[16px] font-medium text-el-on-surface divide-y divide-el-outline-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  <tr className="hover:bg-el-surface-container-lowest transition-colors">
                    <td className="px-4 py-2 h-9">أح*** ***</td>
                    <td className="px-4 py-2 h-9">+964 770 *** ****</td>
                    <td className="px-4 py-2 h-9">الناصرية</td>
                    <td className="px-4 py-2 h-9">مدرسة الناصرية</td>
                  </tr>
                  <tr className="bg-el-surface-container-low hover:bg-el-surface-container-lowest transition-colors">
                    <td className="px-4 py-2 h-9">فاط*** ***</td>
                    <td className="px-4 py-2 h-9">+964 770 *** ****</td>
                    <td className="px-4 py-2 h-9">الشطرة</td>
                    <td className="px-4 py-2 h-9">مدرسة الشطرة</td>
                  </tr>
                  <tr className="hover:bg-el-surface-container-lowest transition-colors">
                    <td className="px-4 py-2 h-9">حس*** ***</td>
                    <td className="px-4 py-2 h-9">+964 770 *** ****</td>
                    <td className="px-4 py-2 h-9">سوق الشيوخ</td>
                    <td className="px-4 py-2 h-9">مركز الشيوخ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 bg-el-primary text-el-on-primary px-6 py-2 rounded shadow-sm hover:opacity-90 transition-all active:scale-95 border border-el-primary-container">
              <Send className="w-[18px] h-[18px]" />
              <span className="text-[18px] leading-[24px] font-semibold">إطلاق البث</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

``

## File: src\components\election\CompetitorsManagement.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Plus, TrendingUp, Users, Target, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CompetitorsManagement() {
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '',
    partyOrList: '',
    strengthLevel: '3',
    district: '',
    primaryArea: '',
    estimatedVotesBase: '',
    keyStrengths: '',
    keyWeaknesses: '',
    counterStrategy: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    try {
      const res = await fetch('/api/competitors');
      const data = await res.json();
      setCompetitors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({ title: 'نجاح', description: 'تم تسجيل المرشح المنافس بنجاح' });
        setShowAddForm(false);
        setFormData({
          candidateName: '',
          partyOrList: '',
          strengthLevel: '3',
          district: '',
          primaryArea: '',
          estimatedVotesBase: '',
          keyStrengths: '',
          keyWeaknesses: '',
          counterStrategy: '',
        });
        fetchCompetitors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[28px] leading-[36px] font-bold text-el-primary">نظام تتبع المنافسين والخصوم</h2>
          <p className="text-el-on-surface-variant text-[14px]">رصد تحركات المرشحين المنافسين في دوائر ذي قار الانتخابية وصياغة الخطط المضادة</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-el-primary text-el-on-primary py-2 px-4 rounded flex items-center gap-2 text-[14px] font-medium shadow active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة مرشح منافس جديد
        </button>
      </div>

      {showAddForm && (
        <Card className="border-el-outline-variant bg-el-surface-container">
          <CardHeader>
            <CardTitle className="text-[18px]">تسجيل مرشح منافس</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">اسم المرشح المنافس *</label>
                <input
                  type="text"
                  required
                  value={formData.candidateName}
                  onChange={e => setFormData({ ...formData, candidateName: e.target.value })}
                  placeholder="الاسم الكامل للمنافس"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">القائمة / الحزب *</label>
                <input
                  type="text"
                  required
                  value={formData.partyOrList}
                  onChange={e => setFormData({ ...formData, partyOrList: e.target.value })}
                  placeholder="اسم القائمة أو التحالف"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">مستوى الخطورة والقوة (1-5)</label>
                <select
                  value={formData.strengthLevel}
                  onChange={e => setFormData({ ...formData, strengthLevel: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                >
                  <option value="1">1 - ضعيف جداً</option>
                  <option value="2">2 - محدود التأثير</option>
                  <option value="3">3 - متوسط القوة</option>
                  <option value="4">4 - قوي ومؤثر</option>
                  <option value="5">5 - خطير جداً (رئيسي)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">القضاء الرئيسي</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  placeholder="مثال: الشطرة، الناصرية"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">المنطقة الجغرافية للنفوذ</label>
                <input
                  type="text"
                  value={formData.primaryArea}
                  onChange={e => setFormData({ ...formData, primaryArea: e.target.value })}
                  placeholder="مثال: حي الحسين، الشرقية"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">خزان الأصوات التقديري</label>
                <input
                  type="number"
                  value={formData.estimatedVotesBase}
                  onChange={e => setFormData({ ...formData, estimatedVotesBase: e.target.value })}
                  placeholder="الأصوات المتوقعة له"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">نقاط القوة لديه</label>
                <input
                  type="text"
                  value={formData.keyStrengths}
                  onChange={e => setFormData({ ...formData, keyStrengths: e.target.value })}
                  placeholder="مثال: نفوذ مالي، حضور عشائري"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">نقاط الضعف</label>
                <input
                  type="text"
                  value={formData.keyWeaknesses}
                  onChange={e => setFormData({ ...formData, keyWeaknesses: e.target.value })}
                  placeholder="مثال: خلافات داخلية، غياب خدمي"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[12px] font-bold">الخطة والتحرك المضاد الموصى به</label>
                <textarea
                  value={formData.counterStrategy}
                  onChange={e => setFormData({ ...formData, counterStrategy: e.target.value })}
                  placeholder="الإجراءات اللازمة لتقليص نفوذه في المنطقة..."
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px] h-20"
                />
              </div>

              <div className="flex justify-end gap-2 md:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-el-outline rounded text-[14px] font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-el-primary text-el-on-primary text-[14px] font-bold rounded"
                >
                  حفظ وتسجيل المنافس
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">جاري تحميل بيانات المنافسين...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {competitors.map((comp: any) => (
            <Card key={comp.id} className="border-el-outline-variant hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="bg-rose-50 text-rose-700 text-[11px] px-2.5 py-1 rounded-full font-bold border border-rose-100 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    مستوى خطورة {comp.strengthLevel}/5
                  </span>
                  <span className="text-[13px] font-bold text-zinc-500">{comp.partyOrList}</span>
                </div>
                <CardTitle className="text-[18px] leading-[26px] mt-3 text-rose-950 font-bold">{comp.candidateName}</CardTitle>
                <CardDescription className="text-[12px]">القضاء: {comp.district || 'غير محدد'} | المنطقة: {comp.primaryArea || 'غير محدد'}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 text-[13px] space-y-3 border-t border-el-outline-variant/60">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <span className="font-bold">قاعدة الأصوات التقديرية:</span>
                  <span className="text-rose-700 font-bold">{(comp.estimatedVotesBase || 0).toLocaleString()} صوت</span>
                </div>

                <div className="bg-zinc-50 p-2.5 rounded border border-zinc-100 space-y-1.5">
                  <div>
                    <span className="text-[11px] text-emerald-600 font-bold">💪 نقاط القوة: </span>
                    <span className="text-[13px] text-zinc-800">{comp.keyStrengths || 'غير موثقة'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-rose-500 font-bold">⚠️ نقاط الضعف: </span>
                    <span className="text-[13px] text-zinc-800">{comp.keyWeaknesses || 'غير موثقة'}</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded border border-amber-100">
                  <span className="text-[12px] font-bold text-amber-900 block mb-1">🎯 الإستراتيجية المضادة:</span>
                  <p className="text-[13px] text-amber-950 leading-[18px] font-medium">{comp.counterStrategy || 'لم تحدد بعد'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

``

## File: src\components\election\DataAnalysis.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, Shield, Activity, TrendingUp, Key,
  Target, AlertTriangle, MapPin, Award, Brain,
  DollarSign, Megaphone, UserCheck, Clock, Zap,
  Crown, Briefcase, Globe, Phone, HelpCircle, FileText, CheckCircle2, ShieldAlert, Vote, Wrench
} from 'lucide-react';

type TabId =
  | 'decisive'
  | 'regions'
  | 'keys'
  | 'audience'
  | 'influence'
  | 'performance'
  | 'media'
  | 'investment'
  | 'pollingDay'
  | 'strategic';

const TABS: { id: TabId; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'decisive', label: 'المؤشرات الحاسمة', icon: Target, description: 'هل نتجه نحو الفوز أو الخسارة؟ (1-12)' },
  { id: 'regions', label: 'مؤشرات المناطق', icon: MapPin, description: 'أين نركز الجهد والمال؟ (13-21)' },
  { id: 'keys', label: 'المفاتيح الانتخابية', icon: Key, description: 'من هم الأشخاص الذين نعتمد عليهم؟ (22-28)' },
  { id: 'audience', label: 'الجمهور والناخبين', icon: Users, description: 'من هو جمهورنا وكيف نستهدفه؟ (29-38)' },
  { id: 'influence', label: 'النفوذ الاجتماعي والسياسي', icon: Crown, description: 'من يؤثر على الناخبين؟ (39-47)' },
  { id: 'performance', label: 'الأداء الميداني والتنظيمي', icon: Activity, description: 'هل تعمل الحملة بكفاءة؟ (48-55)' },
  { id: 'media', label: 'الإعلام والاتصال السياسي', icon: Megaphone, description: 'هل رسائلنا الانتخابية مؤثرة؟ (56-60)' },
  { id: 'investment', label: 'العائد والاستثمار', icon: DollarSign, description: 'هل نصرف الموارد بشكل صحيح؟ (61-65)' },
  { id: 'pollingDay', label: 'يوم الاقتراع', icon: CheckCircle2, description: 'ماذا يحدث الآن داخل مراكز الاقتراع؟ (66-75)' },
  { id: 'strategic', label: 'التخطيط الاستراتيجي والتاريخي', icon: Clock, description: 'إلى أين نتجه مستقبلاً؟ (76-80)' },
];

function ScoreBar({ score, max = 100, color = 'bg-el-primary', height = 'h-2' }: { score: number; max?: number; color?: string; height?: string }) {
  return (
    <div className={`w-full bg-el-surface-variant rounded-full ${height} overflow-hidden`}>
      <div className={`${color} ${height} transition-all rounded-full`} style={{ width: `${Math.min((score / max) * 100, 100)}%` }} />
    </div>
  );
}

function IndicatorCard({ 
  number, 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'text-el-primary',
  bgColor = 'bg-el-primary/5',
  activationGuide 
}: { 
  number: number; 
  title: string; 
  value: any; 
  subtitle?: string; 
  icon: React.ElementType; 
  color?: string;
  bgColor?: string;
  activationGuide?: string;
}) {
  const [showGuide, setShowGuide] = useState(false);
  const isZeroOrEmpty = value === 0 || value === '0' || value === '0%' || value === 'N/A' || (Array.isArray(value) && value.length === 0);

  return (
    <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-3 hover:shadow-md transition-all relative flex flex-col justify-between min-h-[120px]">
      <div>
        <div className="flex justify-between items-start mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${bgColor} ${color}`}>
              {number}
            </div>
            <span className="text-[11px] font-semibold text-el-on-surface-variant line-clamp-1">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon className={`w-4 h-4 ${color}`} />
            {activationGuide && isZeroOrEmpty && (
              <button 
                onClick={() => setShowGuide(!showGuide)}
                title="كيف يتم تفعيل وحساب هذا المؤشر؟" 
                className="text-el-on-surface-variant opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <div className={`text-[22px] font-bold font-mono ${isZeroOrEmpty ? 'text-el-on-surface-variant/40' : color}`}>
            {isZeroOrEmpty ? '0' : value}
          </div>
          {subtitle && !isZeroOrEmpty && (
            <span className="text-[10px] text-el-on-surface-variant line-clamp-1">{subtitle}</span>
          )}
        </div>
      </div>

      {activationGuide && showGuide && (
        <div className="absolute inset-0 bg-el-surface-container border border-el-outline-variant rounded-lg p-2.5 z-10 text-[10px] text-el-on-surface-variant leading-relaxed flex flex-col justify-between">
          <p className="font-semibold text-el-primary flex items-center gap-1">
            <Brain className="w-3 h-3" /> دليل التفعيل البرمجي:
          </p>
          <p className="mt-1">{activationGuide}</p>
          <button 
            onClick={() => setShowGuide(false)} 
            className="text-[9px] text-el-secondary font-bold self-end hover:underline mt-1 cursor-pointer"
          >
            إغلاق المساعدة
          </button>
        </div>
      )}

      {isZeroOrEmpty && activationGuide && !showGuide && (
        <div className="text-[9px] text-el-on-surface-variant/40 italic flex items-center gap-1 mt-1 border-t border-el-outline-variant/30 pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          بانتظار إدخال البيانات الميدانية
        </div>
      )}
    </div>
  );
}

export default function DataAnalysis() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('decisive');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/comprehensive-indicators');
        const d = await res.json();
        setData(d);
      } catch (err) {
        console.error('Error fetching analysis:', err);
      } finally {
        setData((prev: any) => prev || null);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 bg-el-surface-container-lowest border border-el-outline-variant rounded-lg">
        <Brain className="w-6 h-6 text-el-primary animate-pulse" />
        <span className="text-el-on-surface-variant text-[14px]">جاري تشغيل محرك التحليل الشامل (80 مؤشراً)...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* رأس التحليل الفاخر */}
      <div className="bg-gradient-to-l from-el-primary to-[#0a2a5e] text-white rounded-lg p-5 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-10 -translate-y-10" />
        <div className="relative z-10">
          <h1 className="text-[24px] leading-[32px] font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-el-secondary" /> غرفة التحليل والقياس الانتخابي — 80 مؤشرًا
          </h1>
          <p className="text-[12px] leading-[18px] text-white/70 mt-1 max-w-3xl">
            العقل المركزي للحملة الانتخابية: تحويل العمل الميداني من العشوائية والتخمين إلى قرارات إدارية مبنية على البيانات، والتنبؤ الدقيق بالنتائج، وإدارة يوم الاقتراع بكفاءة عالية في محافظة ذي قار.
          </p>
        </div>
      </div>

      {/* التبويبات العشرة */}
      <div className="flex gap-1 overflow-x-auto pb-1.5 border-b border-el-outline-variant scrollbar-thin">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] whitespace-nowrap transition-all cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-el-primary text-el-on-primary font-bold border-el-primary shadow-sm'
                  : 'bg-el-surface-container text-el-on-surface-variant border-transparent hover:bg-el-surface-container-highest'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="text-[12px] text-el-on-surface-variant bg-el-surface-container p-3 rounded-lg border border-el-outline-variant flex items-center gap-2">
        <span>جميع البيانات تم تصفيرها لتجربة إدخال نظيفة 100%. انقر على أيقونة المساعدة <HelpCircle className="w-3.5 h-3.5 inline text-el-primary" /> بجوار أي مؤشر تظهر قيمته كـ (0) لمعرفة نوع البيانات المطلوب إدخالها ميدانياً لتفعيله.</span>
      </div>

      {/* محتوى التبويبات */}
      <div className="min-h-[400px]">
        {activeTab === 'decisive' && <DecisiveTab data={data.decisive} />}
        {activeTab === 'regions' && <RegionsTab data={data.regions} />}
        {activeTab === 'keys' && <KeysTab data={data.keys} />}
        {activeTab === 'audience' && <AudienceTab data={data.audience} />}
        {activeTab === 'influence' && <InfluenceTab data={data.influence} />}
        {activeTab === 'performance' && <PerformanceTab data={data.performance} />}
        {activeTab === 'media' && <MediaTab data={data.media} />}
        {activeTab === 'investment' && <InvestmentTab data={data.investment} />}
        {activeTab === 'pollingDay' && <PollingDayTab data={data.pollingDay} />}
        {activeTab === 'strategic' && <StrategicTab data={data.strategic} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. المؤشرات الحاسمة (1-12)
// ═══════════════════════════════════════════════════════════════
function DecisiveTab({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={1} title="عدد الأصوات المتوقعة" value={data.expectedVotes.toLocaleString()} subtitle="صوت محتمل" icon={Vote} activationGuide="يُحسب تلقائياً من الأصوات الصافية للمفاتيح الانتخابية الموزعة حسب نسبة المشاركة التاريخية لذي قار." />
        <IndicatorCard number={2} title="الأصوات المطلوبة للفوز" value={data.votesNeededToWin.toLocaleString()} subtitle="العتبة المستهدفة للمقعد" icon={Award} color="text-amber-600" bgColor="bg-amber-100" />
        <IndicatorCard number={3} title="مؤشر الفجوة الانتخابية" value={data.electoralGap.toLocaleString()} subtitle="صوت للفوز" icon={AlertTriangle} color="text-red-600" bgColor="bg-red-100" activationGuide="هو الفرق المتبقي بين عدد الأصوات المتوقعة ومستهدف الفوز (12,000 صوت)." />
        <IndicatorCard number={4} title="احتمالية الفوز" value={`${data.winProbability}%`} subtitle="جاهزية الحصول على مقعد" icon={Brain} color="text-purple-600" bgColor="bg-purple-100" activationGuide="يقيس نسبة حصد المقعد بناءً على الأصوات الصافية المتحققة مقارنة بالعتبة المطلوبة." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={5} title="نسبة المشاركة المتوقعة" value={`${data.expectedTurnout}%`} subtitle="معدل مشاركة الناخبين" icon={Activity} activationGuide="يتم قراءته من بيانات سجلات المفوضية الموثقة في جدول IHECData للأقضية." />
        <IndicatorCard number={6} title="المخاطر الانتخابية الشامل" value={data.overallRisk} subtitle="مستوى الخطر الكلي" icon={ShieldAlert} color="text-red-500" bgColor="bg-red-50" activationGuide="مؤشر يدمج متوسط خطرDefection للمفاتيح والتهديدات النشطة غير المعالجة." />
        <IndicatorCard number={7} title="مؤشر الاستقرار الانتخابي" value={data.stability} subtitle="استقرار أصوات المفاتيح" icon={Shield} color="text-green-600" bgColor="bg-green-100" activationGuide="يقيس مدى التزام واستقرار ولاء المفاتيح ومعدلات الزيارات الدورية لهم." />
        <IndicatorCard number={8} title="مؤشر الإنذار المبكر" value={data.earlyWarning} subtitle="التهديدات النشطة" icon={AlertTriangle} color="text-yellow-600" bgColor="bg-yellow-100" activationGuide="يتنبأ بالمشاكل السياسية والميدانية التي تسجلها الفرق الميدانية في قائمة التنبيهات." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* نسبة المؤيدين والمحايدين والمعارضين */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4 lg:col-span-2">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">9</span>
            نسبة المؤيدين والمحايدين والمعارضين
          </h3>
          <div className="h-6 w-full rounded-full overflow-hidden flex bg-el-surface-variant">
            <div className="bg-green-500 h-full transition-all flex items-center justify-center text-white text-[11px] font-bold" style={{ width: `${data.supportersDistribution.supported || 33.3}%` }}>
              {data.supportersDistribution.supported > 0 ? `${data.supportersDistribution.supported}% مؤيد` : 'بدون مؤيد'}
            </div>
            <div className="bg-yellow-400 h-full transition-all flex items-center justify-center text-yellow-900 text-[11px] font-bold" style={{ width: `${data.supportersDistribution.neutral || 33.3}%` }}>
              {data.supportersDistribution.neutral > 0 ? `${data.supportersDistribution.neutral}% محايد` : 'بدون محايد'}
            </div>
            <div className="bg-red-400 h-full transition-all flex items-center justify-center text-white text-[11px] font-bold" style={{ width: `${data.supportersDistribution.opponent || 33.3}%` }}>
              {data.supportersDistribution.opponent > 0 ? `${data.supportersDistribution.opponent}% معارض` : 'بدون ضعيف'}
            </div>
          </div>
          <p className="text-[10px] text-el-on-surface-variant mt-2 italic">
            * يتم الحساب بناءً على تصنيف الناخبCategory في جدول الناخبين (مؤيد، محايد، ضعيف). يرجى تسجيل الناخبين في قائمة "تسجيل الناخبين" لتحديث هذا الشريط.
          </p>
        </div>

        {/* مؤشر خطر التسرب */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-red-50 text-red-500">10</span>
            مؤشر خطر التسرب الانتخابي
          </h3>
          <div className="text-[36px] font-bold font-mono text-red-500 leading-none">{data.defectionRisk}</div>
          <p className="text-[10px] text-el-on-surface-variant mt-1.5">
            يقيس احتمال خروج المفاتيح الانتخابية عن التحالف أو التراجع عن دعم المرشح بسبب الاحتياجات أو انقطاع الاتصال.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 11. خريطة المناطق */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">11</span>
            خريطة المناطق الانتخابية (أخضر / أصفر / أحمر)
          </h3>
          {data.areaMap.length === 0 ? (
            <div className="text-center py-6 text-[12px] text-el-on-surface-variant/50">
              لا توجد مناطق لعرض قوتها. يرجى إدخال بيانات المفاتيح الانتخابية وتخصيص الأقضية لها.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {data.areaMap.map((area: any) => (
                <div key={area.district} className={`p-2.5 border rounded-lg flex justify-between items-center ${
                  area.color === 'green' ? 'bg-green-50 border-green-200 text-green-800' :
                  area.color === 'yellow' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                  'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <span className="font-semibold text-[12px]">{area.district}</span>
                  <span className="font-mono text-[12px] font-bold">{area.strength}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 12. توزيع القوة الجغرافية */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">12</span>
            توزيع القوة الجغرافية (صافي الأصوات ونسبتها)
          </h3>
          {data.geoDistribution.length === 0 ? (
            <div className="text-center py-6 text-[12px] text-el-on-surface-variant/50">
              بانتظار إدخال المفاتيح وتوزيع أصواتهم جغرافياً.
            </div>
          ) : (
            <div className="space-y-2">
              {data.geoDistribution.map((geo: any) => (
                <div key={geo.district} className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold">{geo.district}</span>
                  <span className="font-mono text-el-on-surface-variant">{geo.netVotes} صوت ({geo.percentage}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. مؤشرات المناطق الانتخابية (13-21)
// ═══════════════════════════════════════════════════════════════
function RegionsTab({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* مناطق القوة */}
        <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-green-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-green-100 text-green-600">13</span>
            🟢 مناطق القوة الانتخابية (قوة الأصوات &gt;= 50%)
          </h3>
          {data.strongAreas.length === 0 ? (
            <p className="text-[11px] text-green-800/60 italic">لا توجد أقضية مصنفة كمنطقة قوة حالياً.</p>
          ) : (
            <div className="space-y-1">
              {data.strongAreas.map((a: any) => (
                <div key={a.district} className="flex justify-between text-[12px] font-medium text-green-800">
                  <span>{a.district}</span>
                  <span className="font-mono">{a.strength}% تأييد</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* مناطق الضعف */}
        <div className="bg-red-50/50 border border-red-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-red-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-red-100 text-red-600">14</span>
            🔴 مناطق الضعف الانتخابية (قوة الأصوات &lt; 35%)
          </h3>
          {data.weakAreas.length === 0 ? (
            <p className="text-[11px] text-red-800/60 italic">لا توجد مناطق ضعف (جميعها مستقرة أو لم تسجل بعد).</p>
          ) : (
            <div className="space-y-1">
              {data.weakAreas.map((a: any) => (
                <div key={a.district} className="flex justify-between text-[12px] font-medium text-red-800">
                  <span>{a.district}</span>
                  <span className="font-mono">{a.strength}% تأييد</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <IndicatorCard number={15} title="مؤشر أولوية المنطقة" value={data.priorityIndex.length > 0 ? data.priorityIndex[0]?.district : 'N/A'} subtitle={data.priorityIndex.length > 0 ? `درجة الأولوية: ${data.priorityIndex[0]?.score}` : undefined} icon={MapPin} activationGuide="يحدد أولوية التدخل في المناطق التي تحتوي على كتل أصوات متأرجحة (محايد وضعيف) كبيرة." />
        <IndicatorCard number={16} title="مؤشر القيمة السياسية للمنطقة" value={data.politicalValue.length > 0 ? data.politicalValue[0]?.district : 'N/A'} subtitle={data.politicalValue.length > 0 ? `القيمة: ${data.politicalValue[0]?.score}` : undefined} icon={Award} activationGuide="مؤشر يدمج عدد المسجلين الكليين للمفوضية وحجم التأييد المحرز للحملة." />
        <IndicatorCard number={17} title="مؤشر المنافسة الانتخابية" value={data.competitionIndex.length > 0 ? data.competitionIndex[0]?.district : 'N/A'} subtitle={data.competitionIndex.length > 0 ? `قوة الخصوم: ${data.competitionIndex[0]?.score}` : undefined} icon={ShieldAlert} activationGuide="يُحسب بناءً على تحركات الخصوم المسجلين في قائمة المنافسين وقوتهم في القضاء." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        <IndicatorCard number={18} title="مؤشر تركز الأصوات (HHI)" value={data.concentrationHHI} subtitle="قياس تشتت أو تركز الأصوات" icon={Target} activationGuide="مؤشر هيرفيندال لقياس تركز الأصوات في أيدي مفاتيح معينة. الرقم المنخفض = توازن جيد للأصوات." />
        <IndicatorCard number={19} title="مؤشر التوسع الانتخابي" value={`${data.expansionIndex}%`} subtitle={`صافي التوسع: +${data.expansionPotential} صوت`} icon={TrendingUp} activationGuide="يقيس نسبة النمو التصويتي الممكن إحرازه من تحويل الأصوات المحايدة لداعمة." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* التغير في المشاركة */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">20</span>
            التغير في نسبة المشاركة التاريخية للأقضية
          </h3>
          {data.turnoutChange.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">
              يرجى إضافة نتائج انتخابات سابقة لجدول ElectionResult لعرض التحولات في المشاركة.
            </p>
          ) : (
            <div className="space-y-2">
              {data.turnoutChange.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[12px]">
                  <span>قضاء {item.district} ({item.year})</span>
                  <span className={`font-mono font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? `+${item.change}` : item.change}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* التحول التصويتي */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">21</span>
            التحول في التصويت بين الانتخابات
          </h3>
          {data.votingShift.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">
              بانتظار توثيق تحولات القوى الحزبية التاريخية في قاعدة البيانات.
            </p>
          ) : (
            <div className="space-y-2">
              {data.votingShift.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[12px]">
                  <span>قضاء {item.district} - قائمة {item.party}</span>
                  <span className={`font-mono font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? `+${item.change}` : item.change}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. مؤشرات المفاتيح الانتخابية (22-28)
// ═══════════════════════════════════════════════════════════════
function KeysTab({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-4">
      {/* الترتيب والموثوقية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={23} title="مؤشر دقة المفتاح (KRI)" value={data.accuracy} subtitle="دقة التعهدات والمعلومات" icon={Shield} color="text-green-600" bgColor="bg-green-100" activationGuide="يقيس مصداقية المفتاح ونظافة بياناته المسجلة بناءً على تكرار الزيارات." />
        <IndicatorCard number={24} title="كفاءة المفتاح الانتخابي" value={`${data.efficiency}%`} subtitle="متوسط كفاءة المفاتيح" icon={Award} activationGuide="يمثل نسبة الأصوات الصافية المقنعة من الأصوات التي يزعم المفتاح إحضارها." />
        <IndicatorCard number={25} title="مؤشر الاعتماد على المفتاح" value={`${data.dependency}%`} subtitle="نسبة تشتت القوة التصويتية" icon={AlertTriangle} color="text-yellow-600" bgColor="bg-yellow-100" activationGuide="يقيس مدى تركز الأصوات في يد مفتاح واحد. الرقم المرتفع جدًا يمثل خطورة على استقرار الحملة." />
        <IndicatorCard number={27} title="مؤشر النفوذ الانتخابي للمفتاح" value={data.electoralInfluence} subtitle="EII الموزون العام" icon={Zap} color="text-blue-600" bgColor="bg-blue-100" activationGuide="القدرة الكلية للمفاتيح الاجتماعية على حشد وتحويل العلاقات العامة إلى أصوات." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 22. ترتيب المفاتيح الانتخابية */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">22</span>
              ترتيب المفاتيح الانتخابية (الأعلى وزناً وتأثيراً)
            </h3>
          </div>
          {data.ranking.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
              لا توجد مفاتيح مسجلة بعد. أضف وجهاء ومفاتيح في صفحة "المفاتيح الانتخابية" لتظهر هنا.
            </div>
          ) : (
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 w-8 font-normal">#</th>
                  <th className="px-3 py-2 font-normal">الكود</th>
                  <th className="px-3 py-2 font-normal">الاسم</th>
                  <th className="px-3 py-2 text-center font-normal">صافي الأصوات</th>
                  <th className="px-3 py-2 text-center font-normal">التقييم الموزون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {data.ranking.slice(0, 5).map((item: any) => (
                  <tr key={item.rank} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-mono font-bold text-el-primary">{item.rank}</td>
                    <td className="px-3 py-2 font-mono text-el-on-surface-variant">{item.code}</td>
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-el-primary">{item.netVotes}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.weightedScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 26. مؤشر القيمة الاستراتيجية للمفتاح */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">26</span>
              مؤشر القيمة الاستراتيجية للمفاتيح
            </h3>
          </div>
          {data.strategicValue.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
              بانتظار إدخال المفاتيح الانتخابية وحسابها تلقائياً.
            </div>
          ) : (
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">الكود</th>
                  <th className="px-3 py-2 font-normal">الاسم</th>
                  <th className="px-3 py-2 text-center font-normal">القيمة الاستراتيجية</th>
                  <th className="px-3 py-2 text-center font-normal">القضاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {data.strategicValue.slice(0, 5).map((item: any) => (
                  <tr key={item.code} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-mono text-el-primary">{item.code}</td>
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-el-secondary">{item.value}</td>
                    <td className="px-3 py-2 text-center text-el-on-surface-variant">{item.district}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 28. مؤشر مخاطر فقدان المفتاح */}
      <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
        <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-red-50 text-red-500">28</span>
          مؤشر مخاطر فقدان المفاتيح (الأكثر خطورة بالتسرب)
        </h3>
        {data.lossRisk.length === 0 ? (
          <p className="text-[11px] text-el-on-surface-variant/60 italic">لا توجد مفاتيح في منطقة الخطر.</p>
        ) : (
          <div className="space-y-2">
            {data.lossRisk.slice(0, 5).map((item: any) => (
              <div key={item.code} className="flex justify-between items-center text-[12px] bg-red-50/30 p-2 border border-red-100 rounded-lg">
                <span className="font-semibold text-red-800">{item.name} (قضاء {item.district})</span>
                <span className="font-mono text-red-600 font-bold">خطر الفقدان: {item.risk}/100</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. مؤشرات الجمهور والناخبين (29-38)
// ═══════════════════════════════════════════════════════════════
function AudienceTab({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={32} title="نسبة الذكور" value={`${data.genderRatio.malePercentage}%`} subtitle={`${data.genderRatio.male} ناخب مسجل`} icon={Users} color="text-blue-600" bgColor="bg-blue-100" />
        <IndicatorCard number={32} title="نسبة الإناث" value={`${data.genderRatio.femalePercentage}%`} subtitle={`${data.genderRatio.female} ناخبة مسجلة`} icon={Users} color="text-pink-600" bgColor="bg-pink-100" />
        <IndicatorCard number={33} title="نسبة الجامعيين" value={`${data.graduatesRatio}%`} subtitle="حملة شهادة بكالوريوس وأعلى" icon={Award} color="text-purple-600" bgColor="bg-purple-100" activationGuide="يُقرأ من حقل المستوى التعليمي للناخب والمفتاح." />
        <IndicatorCard number={36} title="شرائح الناخبين المفصلة" value={data.segmentation.length} subtitle="فئة مستهدفة حالياً" icon={UserCheck} activationGuide="شرائح مصنفة بالاعتماد على الأعمار والولاء الميداني." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* الأكثر دعماً */}
        <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-green-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-green-100 text-green-600">29</span>
            🟢 الفئات العمرية الأكثر دعماً للحملة
          </h3>
          {data.topAgeGroups.length === 0 ? (
            <p className="text-[11px] text-green-800/60 italic">لا توجد بيانات كافية للحساب.</p>
          ) : (
            data.topAgeGroups.map((g: any) => (
              <div key={g.group} className="flex justify-between text-[12px] font-semibold text-green-800 mb-1.5">
                <span>فئة {g.group} سنة</span>
                <span className="font-mono">{g.percentage}% تأييد</span>
              </div>
            ))
          )}
        </div>

        {/* الأكثر تردداً */}
        <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-yellow-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-yellow-100 text-yellow-600">30</span>
            🟡 الفئات العمرية الأكثر تردداً (محايدون)
          </h3>
          {data.hesitantAgeGroups.length === 0 ? (
            <p className="text-[11px] text-yellow-800/60 italic">لا توجد بيانات كافية للحساب.</p>
          ) : (
            data.hesitantAgeGroups.map((g: any) => (
              <div key={g.group} className="flex justify-between text-[12px] font-semibold text-yellow-800 mb-1.5">
                <span>فئة {g.group} سنة</span>
                <span className="font-mono">{g.percentage}% حياد</span>
              </div>
            ))
          )}
        </div>

        {/* الأكثر التزاماً بالتصويت */}
        <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-blue-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-blue-100 text-blue-600">31</span>
            🔵 الفئات العمرية الأكثر التزاماً بالتصويت
          </h3>
          {data.votingAgeGroups.length === 0 ? (
            <p className="text-[11px] text-blue-800/60 italic">لا توجد بيانات كافية للحساب.</p>
          ) : (
            data.votingAgeGroups.map((g: any) => (
              <div key={g.group} className="flex justify-between text-[12px] font-semibold text-blue-800 mb-1.5">
                <span>فئة {g.group} سنة</span>
                <span className="font-mono">{g.percentage}% تصويت</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* تأثير التعليم */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">34</span>
            تأثير التعليم على التصويت والتأييد
          </h3>
          {data.educationImpact.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">بانتظار إدخال بيانات التحصيل الدراسي للناخبين.</p>
          ) : (
            <div className="space-y-2">
              {data.educationImpact.filter((e: any) => e.level !== 'غيرحدد' && e.level !== 'غير محدد').map((e: any) => (
                <div key={e.level}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-medium">{e.level}</span>
                    <span className="font-mono text-el-primary font-bold">{e.supportRate}% تأييد</span>
                  </div>
                  <ScoreBar score={e.supportRate} color="bg-purple-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* المهن الأكثر تأييداً */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">35</span>
            المهن الأكثر تأييداً ودعماً للحملة الانتخابية
          </h3>
          {data.topProfessions.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">أدخل مهن الناخبين في لوحة التسجيل لتصنيف الدعم حسب المهنة.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {data.topProfessions.slice(0, 6).map((p: any) => (
                <div key={p.profession} className="bg-el-surface-container p-2 border border-el-outline-variant/60 rounded-lg flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-el-on-surface">{p.profession}</span>
                  <span className="font-mono text-green-600 font-bold">{p.supportRate}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 37. القضايا الأكثر تأثيراً */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">37</span>
            القضايا الأكثر تأثيراً على المزاج الانتخابي للمواطنين
          </h3>
          <div className="space-y-2">
            {data.topIssues.map((issue: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold">{issue.issue}</span>
                  <span className="font-mono text-el-secondary font-bold">الأهمية: {issue.weight}%</span>
                </div>
                <ScoreBar score={issue.weight} color="bg-amber-500" />
              </div>
            ))}
          </div>
        </div>

        {/* 38. نوع الخطاب المناسب لكل شريحة */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">38</span>
            نوع الخطاب المناسب لكل شريحة تصويتية
          </h3>
          <div className="space-y-2">
            {data.segmentMessaging.map((m: any, idx: number) => (
              <div key={idx} className="p-2 border border-el-outline-variant/60 rounded-lg text-[12px] bg-el-surface-container">
                <span className="font-bold text-el-primary">{m.segment}:</span>
                <span className="text-el-on-surface-variant mr-1">{m.messageType}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. النفوذ الاجتماعي والسياسي (39-47)
// ═══════════════════════════════════════════════════════════════
function InfluenceTab({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={43} title="مؤشر النفوذ العشائري" value={data.tribalInfluence} subtitle="متوسط النفوذ الموزون" icon={Crown} color="text-amber-600" bgColor="bg-amber-100" activationGuide="معدل النفوذ العشائري العام محسوباً بناءً على تقييم نفوذ العشائر المضافة في جدول العشائر." />
        <IndicatorCard number={46} title="حجم التأثير الإلكتروني" value={`${data.digitalInfluence}%`} subtitle="التغطية في منصات التواصل" icon={Globe} color="text-blue-600" bgColor="bg-blue-100" activationGuide="يمثل نسبة الناخبين والمفاتيح الذين يملكون روابط حسابات فيسبوك/تليجرام موثقة في النظام." />
        <IndicatorCard number={47} title="القابلون للوصول رقمياً" value={data.digitalReach.toLocaleString()} subtitle="ناخب بهاتف موثق" icon={Phone} activationGuide="العدد الكلي للناخبين الذين يملكون رقم هاتف صحيح وقابل للاستقبال المباشر." />
        <IndicatorCard number={44} title="أقوى نفوذ وظيفي" value={data.professionalInfluence.length > 0 ? data.professionalInfluence[0]?.profession : 'N/A'} subtitle={data.professionalInfluence.length > 0 ? `قوة: ${data.professionalInfluence[0]?.score}` : undefined} icon={Briefcase} color="text-purple-600" bgColor="bg-purple-100" />
      </div>

      {/* 39. التصويت العشائري */}
      <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
        <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
          <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">39</span>
            أداء التصويت العشائري الفعلي في محافظة ذي قار
          </h3>
        </div>
        {data.tribalVoting.length === 0 ? (
          <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
            يرجى إضافة العشائر وتعيين المفاتيح الاجتماعية والناخبين لها في صفحة "إدارة العشائر" لتفعيل هذا التقرير.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">العشيرة</th>
                  <th className="px-3 py-2 text-center font-normal">النفوذ والتأثير</th>
                  <th className="px-3 py-2 text-center font-normal">المفاتيح المنسوبة</th>
                  <th className="px-3 py-2 text-center font-normal">الناخبون المنسوبون</th>
                  <th className="px-3 py-2 text-center font-normal">كفاءة الأصوات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {data.tribalVoting.map((item: any) => (
                  <tr key={item.tribe} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-semibold text-el-primary">{item.tribe}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="text-amber-600">{'★'.repeat(item.influence)}{'☆'.repeat(5 - item.influence)}</span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono">{item.keyCount}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.voterCount}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-green-600">{item.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* العشائر الأكثر دعماً */}
        <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-green-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-green-100 text-green-600">40</span>
            🟢 العشائر الأكثر دعماً (كفاءة &gt;= 50%)
          </h3>
          {data.topSupportingTribes.length === 0 ? (
            <p className="text-[11px] text-green-800/60 italic">لا توجد بيانات عشائر داعمة.</p>
          ) : (
            data.topSupportingTribes.map((t: any) => (
              <div key={t.tribe} className="flex justify-between text-[12px] font-semibold text-green-800 mb-1">
                <span>{t.tribe}</span>
                <span className="font-mono">{t.netVotes} صوت صافي</span>
              </div>
            ))
          )}
        </div>

        {/* العشائر المحايدة */}
        <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-yellow-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-yellow-100 text-yellow-600">41</span>
            🟡 العشائر المحايدة (فرص التحشيد والزيارة)
          </h3>
          {data.neutralTribes.length === 0 ? (
            <p className="text-[11px] text-yellow-800/60 italic">لا توجد عشائر محايدة مسجلة.</p>
          ) : (
            data.neutralTribes.map((t: any) => (
              <div key={t.tribe} className="flex justify-between text-[12px] font-semibold text-yellow-800 mb-1">
                <span>{t.tribe}</span>
                <span className="font-mono">{t.neutralPercentage}% أصوات معلقة</span>
              </div>
            ))
          )}
        </div>

        {/* العشائر المنافسة */}
        <div className="bg-red-50/50 border border-red-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-red-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-red-100 text-red-600">42</span>
            🔴 العشائر المنافسة والمؤثرة بالخصوم
          </h3>
          {data.competingTribes.length === 0 ? (
            <p className="text-[11px] text-red-800/60 italic">لم تسجل عشائر تميل للخصوم.</p>
          ) : (
            data.competingTribes.map((t: any) => (
              <div key={t.tribe} className="flex justify-between text-[12px] font-semibold text-red-800 mb-1">
                <span>{t.tribe}</span>
                <span className="font-mono">مستوى النفوذ: {t.influence}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 45. تحليل قوة المرشحين المنافسين */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">45</span>
              تحليل قوة وتمركز المرشحين المنافسين في ذي قار
            </h3>
          </div>
          {data.competitorStrength.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
              أدخل بيانات المرشحين الخصوم في لوحة "نظام المنافسين والخصوم" لتفعيل هذا التقرير.
            </div>
          ) : (
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">اسم المرشح المنافس</th>
                  <th className="px-3 py-2 font-normal">القائمة / الحزب</th>
                  <th className="px-3 py-2 text-center font-normal">مستوى الخطورة</th>
                  <th className="px-3 py-2 text-center font-normal">التمركز الجغرافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {data.competitorStrength.map((c: any, idx: number) => (
                  <tr key={idx} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-semibold">{c.name}</td>
                    <td className="px-3 py-2 text-el-on-surface-variant">{c.list}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-red-500">{c.strength}/5</td>
                    <td className="px-3 py-2 text-center text-el-on-surface-variant">{c.district}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 44. مؤشر النفوذ الوظيفي */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">44</span>
            مؤشر النفوذ والوزن الاجتماعي للوظائف والمهن
          </h3>
          {data.professionalInfluence.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">بانتظار إدخال المهن للمفاتيح والوجهاء.</p>
          ) : (
            <div className="space-y-2">
              {data.professionalInfluence.slice(0, 4).map((p: any) => (
                <div key={p.profession}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold">{p.profession} ({p.count} وجيه)</span>
                    <span className="font-mono text-el-primary font-bold">نقاط التأثير: {p.score}/100</span>
                  </div>
                  <ScoreBar score={p.score} color="bg-purple-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. الأداء الميداني والتنظيمي (48-55)
// ═══════════════════════════════════════════════════════════════
function PerformanceTab({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={48} title="مؤشر الحشد الميداني" value={data.mobilization} subtitle="قدرة التحشيد للمفاتيح" icon={Megaphone} color="text-blue-600" bgColor="bg-blue-100" activationGuide="متوسط مستوى قدرة المفاتيح على التحشيد الميداني من 100 نقطة." />
        <IndicatorCard number={49} title="مؤشر الجاهزية الميدانية" value={`${data.readiness}%`} subtitle="كفاءة المتطوعين النشطين" icon={UserCheck} color="text-green-600" bgColor="bg-green-100" activationGuide="يتم قراءته من تقييم كفاءة المتطوعين والمهام المكتملة في إدارة الكوادر." />
        <IndicatorCard number={51} title="مؤشر استنزاف الحملة" value={data.exhaustion} subtitle="كفاءة ترشيد النفقات" icon={DollarSign} color="text-red-500" bgColor="bg-red-50" activationGuide="العائد المادي المصروف مقارنة بالأصوات الصافية المحرزة لحساب الفاعلية المالية." />
        <IndicatorCard number={55} title="مؤشر الولاء العام للحملة" value={`${data.overallLoyalty}%`} subtitle="متوسط ولاء المفاتيح" icon={Shield} color="text-teal-600" bgColor="bg-teal-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={52} title="المواطنون المخدومون فعلياً" value={data.servedCitizens.toLocaleString()} subtitle="طلب مكتمل بنجاح" icon={CheckCircle2} color="text-green-600" bgColor="bg-green-100" activationGuide="عدد طلبات الخدمات المنفذة والمكتملة بالكامل للمواطنين." />
        <IndicatorCard number={53} title="أهم ملف خدمي مكرر" value={data.recurringServices.length > 0 ? data.recurringServices[0]?.type : 'لا يوجد'} subtitle={data.recurringServices.length > 0 ? `${data.recurringServices[0]?.count} طلب` : undefined} icon={Wrench} />
        <IndicatorCard number={54} title="أكثر المناطق مراجعة" value={data.frequentAreas.length > 0 ? data.frequentAreas[0]?.district : 'لا يوجد'} subtitle={data.frequentAreas.length > 0 ? `${data.frequentAreas[0]?.count} طلب خدمة` : undefined} icon={MapPin} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* المناطق الأكثر حاجة للجهد الميداني */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">50</span>
            أكثر الأقضية والمناطق حاجة للجهد والتحشيد الميداني
          </h3>
          {data.needingEffort.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">لا توجد أقضية نشطة.</p>
          ) : (
            <div className="space-y-3">
              {data.needingEffort.map((item: any) => (
                <div key={item.district}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold">{item.district} ({item.keyCount} مفتاح)</span>
                    <span className="font-mono text-red-500 font-bold">الحاجة للجهد الميداني: {item.score}/100</span>
                  </div>
                  <ScoreBar score={item.score} color="bg-red-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* تكرار الملفات الخدمية */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">53</span>
            توزيع وتكرار الملفات الخدمية في ذي قار
          </h3>
          {data.recurringServices.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">يرجى إضافة طلبات خدمات للمفاتيح والناخبين في صفحة "نظام الخدمات".</p>
          ) : (
            <div className="space-y-2">
              {data.recurringServices.map((item: any) => (
                <div key={item.type} className="flex justify-between text-[12px] border-b border-el-outline-variant/30 pb-1">
                  <span className="font-medium">{item.type}</span>
                  <span className="font-mono text-el-primary font-bold">{item.count} طلب خدمي</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. الإعلام والاتصال السياسي (56-60)
// ═══════════════════════════════════════════════════════════════
function MediaTab({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={57} title="كفاءة الحملات الرقمية" value={`${data.digitalCampaigns}%`} subtitle="نسبة تسليم الرسائل الموبيل" icon={Globe} color="text-green-600" bgColor="bg-green-100" activationGuide="تُحسب تلقائياً من تقارير توصيل رسائل SMS وبثها المباشر." />
        <IndicatorCard number={58} title="مؤشر النشاط الرقمي اليومي" value={data.dailyDigitalActivity} subtitle="نشاط الزيارات وتحديث البيانات" icon={Activity} activationGuide="نشاط الفرق الانتخابية الميدانية في تدوين وتحديث المهام الانتخابية." />
        <IndicatorCard number={59} title="مؤشر تأثير التواصل المباشر" value={`${data.directContactImpact}%`} subtitle="التواصل الدوري مع الوجهاء" icon={Users} color="text-blue-600" bgColor="bg-blue-100" activationGuide="نسبة الوجهاء والمفاتيح الذين تم التواصل معهم في أخر 14 يوم بنجاح." />
        <IndicatorCard number={60} title="الجمهور القابل للوصول إعلامياً" value={data.mediaReachable.toLocaleString()} subtitle="مستلم رسائل SMS محتمل" icon={Phone} />
      </div>

      <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
        <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
          <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">56</span>
            الرسائل الأكثر تأثيراً وكفاءة التوصيل الرقمي لحملات الـ SMS
          </h3>
        </div>
        {data.topMessages.length === 0 ? (
          <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
            أرسل حملة رسائل SMS في لوحة "بث الرسائل" أو "الاتصالات السياسية" لتنشيط مؤشرات كفاءة المحتوى.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">اسم قالب الرسالة</th>
                  <th className="px-3 py-2 text-center font-normal">عدد المستهدفين</th>
                  <th className="px-3 py-2 text-center font-normal">الرسائل المستلمة</th>
                  <th className="px-3 py-2 text-center font-normal">نسبة التوصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {data.topMessages.map((msg: any, idx: number) => (
                  <tr key={idx} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-semibold text-el-primary">{msg.name}</td>
                    <td className="px-3 py-2 text-center font-mono">{msg.sentCount}</td>
                    <td className="px-3 py-2 text-center font-mono">{msg.deliveredCount}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-green-600">{msg.deliveredPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. العائد والاستثمار (61-65)
// ═══════════════════════════════════════════════════════════════
function InvestmentTab({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <IndicatorCard number={61} title="العائد الانتخابي للخدمات" value={data.serviceROI} subtitle="صوت كسب متوقع / مليون دينار" icon={Wrench} color="text-green-600" bgColor="bg-green-100" activationGuide="يقيس الكسب المتوقع للأصوات بناءً على إجمالي الإنفاق الفعلي المصروف للخدمات." />
        <IndicatorCard number={62} title="العائد الانتخابي المالي للمفاتيح" value={data.financialROI} subtitle="صوت كسب متوقع / 100 ألف دينار" icon={DollarSign} color="text-blue-600" bgColor="bg-blue-100" activationGuide="الأصوات الصافية المتحققة مقارنة بالإنفاق الكلي المخصص لدعم المفاتيح." />
        <IndicatorCard number={63} title="تكلفة الصوت الانتخابي الواحد" value={data.costPerVote > 0 ? `${data.costPerVote.toLocaleString()} د.ع` : '0'} subtitle="إجمالي الإنفاق / الأصوات الصافية" icon={DollarSign} color="text-amber-600" bgColor="bg-amber-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 64. قائمة المفاتيح المستحقة للاستثمار */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">64</span>
              الوجهاء والمفاتيح المستحقون للاستثمار الانتخابي (فرص عالية الكسب)
            </h3>
          </div>
          {data.investmentKeys.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
              أدخل المفاتيح وعرّف أصواتهم المحايدة والإنفاق المالي لتحديث التحليل الاستثماري للأصوات.
            </div>
          ) : (
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">الكود</th>
                  <th className="px-3 py-2 font-normal">الاسم</th>
                  <th className="px-3 py-2 text-center font-normal">الأصوات المحايدة</th>
                  <th className="px-3 py-2 text-center font-normal">الإنفاق الحالي</th>
                  <th className="px-3 py-2 text-center font-normal">نقاط الاستثمار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {data.investmentKeys.slice(0, 5).map((item: any) => (
                  <tr key={item.code} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-mono text-el-primary">{item.code}</td>
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2 text-center font-mono text-yellow-600 font-bold">{item.neutralVotes}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.spent.toLocaleString()} د.ع</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-el-secondary">{item.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 65. أكثر الخدمات تأثيراً انتخابياً */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">65</span>
              الخدمات الأكثر تأثيراً وجذباً للأصوات
            </h3>
          </div>
          {data.impactfulServices.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
              بانتظار إنجاز وتوثيق تأثير طلبات المساعدات الخدمية.
            </div>
          ) : (
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">عنوان الخدمة المنجزة</th>
                  <th className="px-3 py-2 text-center font-normal">الأصوات المتأثرة</th>
                  <th className="px-3 py-2 text-center font-normal">التكلفة</th>
                  <th className="px-3 py-2 text-center font-normal">الكفاءة الميدانية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {data.impactfulServices.slice(0, 5).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-semibold text-el-primary">{item.title}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-green-600">+{item.impact}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.cost.toLocaleString()} د.ع</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-el-secondary">{item.efficiency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 9. يوم الاقتراع (66-75)
// ═══════════════════════════════════════════════════════════════
function PollingDayTab({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={67} title="نسبة حضور مؤيدينا" value={`${data.supportersTurnout}%`} subtitle="من صوتوا من المؤيدين المسجلين" icon={CheckCircle2} color="text-green-600" bgColor="bg-green-100" activationGuide="تُحسب يوم الاقتراع عند تأكيد حضور الناخبين المؤيدين في بوابة المندوب." />
        <IndicatorCard number={68} title="نسبة الحشد المنجز" value={`${data.mobilizationAchieved}%`} subtitle="المصوتون / إجمالي المستهدف الصافي" icon={Users} color="text-blue-600" bgColor="bg-blue-100" activationGuide="نسبة ما تم إنجازه وحشده من كتلتنا التصويتية الصافية المضمونة." />
        <IndicatorCard number={69} title="نسبة التغطية بالمراقبين" value={`${data.observerCoverage}%`} subtitle="مراكز الاقتراع المراقبة بالوكلاء" icon={Shield} color="text-purple-600" bgColor="bg-purple-100" activationGuide="نسبة تغطية مراكز الاقتراع بالوكلاء والمراقبين الانتخابيين المسجلين." />
        <IndicatorCard number={71} title="مؤشر حماية الأصوات" value={data.voteProtection} subtitle="حماية ومنع التلاعب بالأصوات" icon={ShieldAlert} color="text-teal-600" bgColor="bg-teal-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IndicatorCard number={72} title="نسبة الأصوات المحمية" value={`${data.protectedVotes}%`} subtitle="أصوات تحت مراقبة الوكلاء" icon={Shield} color="text-green-600" bgColor="bg-green-100" activationGuide="نسبة الأصوات التابعة لمفوضية الاقتراع المغطاة بالوكلاء المدربين." />
        <IndicatorCard number={73} title="نسبة الشكاوى الانتخابية" value={`${data.complaintsRate}%`} subtitle="خروقات مسجلة لكل مركز" icon={AlertTriangle} color="text-red-500" bgColor="bg-red-50" />
        <IndicatorCard number={74} title="إنذار يوم الاقتراع المبكر" value={data.earlyWarningEDay} subtitle="خطر تسرب أصوات يوم الاقتراع" icon={AlertTriangle} color="text-yellow-600" bgColor="bg-yellow-100" />
        <IndicatorCard number={75} title="مؤشر الجاهزية الشامل ليوم الحسم" value={`${data.readinessEDay}%`} subtitle="جاهزية الماكينة الانتخابية" icon={Zap} color="text-purple-600" bgColor="bg-purple-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 66. نسبة التصويت الفعلية حسب الساعة */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">66</span>
            نسبة المشاركة والتصويت الفعلية حسب ساعة يوم الاقتراع
          </h3>
          <div className="space-y-2">
            {data.hourlyTurnout.map((item: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold">توقيت الساعة {item.hour}</span>
                  <span className="font-mono text-el-primary font-bold">{item.rate}% مشاركة</span>
                </div>
                <ScoreBar score={item.rate} max={100} color="bg-blue-500" />
              </div>
            ))}
          </div>
        </div>

        {/* 70. مؤشر قوة مركز الاقتراع */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">70</span>
              مؤشر قوة مراكز الاقتراع وتراكم أصواتنا فيها
            </h3>
          </div>
          {data.pollingCenterStrength.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
              أدخل مراكز الاقتراع للمفاتيح لتصنيف القوة التصويتية للمراكز.
            </div>
          ) : (
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">مركز الاقتراع</th>
                  <th className="px-3 py-2 text-center font-normal">الوجهاء والمفاتيح</th>
                  <th className="px-3 py-2 text-center font-normal">الأصوات الصافية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {data.pollingCenterStrength.slice(0, 5).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-semibold text-el-primary">{item.name}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.keysCount} وجيه</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-el-secondary">{item.netVotes} صوت</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 10. التخطيط الاستراتيجي والتاريخي (76-80)
// ═══════════════════════════════════════════════════════════════
function StrategicTab({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-4">
      {/* 76. نسبة الفوز لكل حزب */}
      <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
        <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">76</span>
          نسب الفوز التاريخية ومقاعد الكتل والأحزاب في محافظة ذي قار
        </h3>
        {data.partyWinRates.length === 0 ? (
          <p className="text-[11px] text-el-on-surface-variant/60 italic">
            يرجى تعبئة جدول النتائج التاريخية للمفوضية لتفعيل التحليلات الاستراتيجية للأحزاب.
          </p>
        ) : (
          <div className="space-y-2">
            {data.partyWinRates.map((party: any) => (
              <div key={party.party}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold">{party.party}</span>
                  <span className="font-mono text-el-primary font-bold">الأصوات: {party.votes.toLocaleString()} · المقاعد: {party.seats}</span>
                </div>
                <ScoreBar score={party.percentage} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 77. التغيير في قوة الأحزاب */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">77</span>
            التغيير والتحول في قوة ونسب الأحزاب والكتل السياسية
          </h3>
          {data.partyStrengthChange.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">بانتظار إدخال المقارنات التاريخية.</p>
          ) : (
            <div className="space-y-2">
              {data.partyStrengthChange.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[12px]">
                  <span>قائمة {item.party} (قضاء {item.district})</span>
                  <span className={`font-mono font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? `+${item.change}` : item.change}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 78. التغيير في نسب المشاركة */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">78</span>
            التغير التاريخي في نسب إقبال المشاركة للناخبين
          </h3>
          {data.participationChange.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">بانتظار توثيق تباين مشاركة الناخبين بين الانتخابات.</p>
          ) : (
            <div className="space-y-2">
              {data.participationChange.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[12px]">
                  <span>قضاء {item.district} ({item.year})</span>
                  <span className={`font-mono font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? `+${item.change}` : item.change}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 79. التحول التاريخي في التصويت */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">79</span>
            معدل التحول التاريخي وهجرة الأصوات الكلية
          </h3>
          {data.historicalShifts.length === 0 ? (
            <p className="text-[11px] text-el-on-surface-variant/60 italic">لا توجد بيانات كافية.</p>
          ) : (
            <div className="space-y-2">
              {data.historicalShifts.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[12px]">
                  <span>قائمة {item.party} ({item.year})</span>
                  <span className={`font-mono font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? `+${item.change}` : item.change}% انزياح
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 80. توقع اتجاهات الانتخابات القادمة */}
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-el-primary/5 text-el-primary">80</span>
            توقع التوجهات العامة ومشاركة الانتخابات القادمة
          </h3>
          <div className="p-3 border border-el-outline-variant/60 rounded-lg bg-el-surface-container text-[12px]">
            <p className="font-semibold text-el-primary">تحليل الاتجاه المقدر:</p>
            <p className="mt-1 text-el-on-surface-variant leading-relaxed">{data.nextElectionForecast.trend}</p>
            <p className="mt-2 text-[11px] text-el-on-surface-variant/60">
              * نسبة المشاركة المقدرة للدورة القادمة: <b className="font-mono text-el-secondary">{data.nextElectionForecast.predictedTurnout}%</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

``

## File: src\components\election\EarlyWarningMonitor.tsx

``typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  TrendingDown,
  Swords,
  Plus,
  X,
  MapPin,
  Eye,
} from 'lucide-react';

const WARNING_TYPES = [
  { value: 'مهددة_خسارة', label: 'مهددة بخسارة الأصوات', icon: ShieldX, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { value: 'قابلة_لاختراق', label: 'قابلة للاختراق', icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { value: 'آمنة', label: 'آمنة', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { value: 'متأرجحة', label: 'متأرجحة', icon: Shield, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { value: 'مشاركة_منخفضة', label: 'مشاركة منخفضة', icon: TrendingDown, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  { value: 'منافسة_عالية', label: 'منافسة عالية', icon: Swords, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
];

const SEVERITY_LEVELS = ['منخفض', 'متوسط', 'مرتفع', 'حرج'];
const AREA_TYPES = ['محافظة', 'قضاء', 'ناحية', 'مركز اقتراع'];

interface WarningData {
  id: string;
  areaType: string;
  areaName: string;
  warningType: string;
  severity: string;
  description: string | null;
  estimatedVotesAtRisk: number;
  recommendedAction: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function EarlyWarningMonitor() {
  const [warnings, setWarnings] = useState<WarningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [form, setForm] = useState({
    areaType: 'قضاء',
    areaName: '',
    warningType: 'مهددة_خسارة',
    severity: 'متوسط',
    description: '',
    estimatedVotesAtRisk: 0,
    recommendedAction: '',
  });

  const fetchWarnings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType) params.set('warningType', selectedType);
      if (selectedSeverity) params.set('severity', selectedSeverity);
      const res = await fetch(`/api/early-warnings?${params.toString()}`);
      const data = await res.json();
      setWarnings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching warnings:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedSeverity]);

  useEffect(() => { fetchWarnings(); }, [fetchWarnings]);

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/early-warnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAddDialog(false);
        setForm({ areaType: 'قضاء', areaName: '', warningType: 'مهددة_خسارة', severity: 'متوسط', description: '', estimatedVotesAtRisk: 0, recommendedAction: '' });
        fetchWarnings();
      }
    } catch (err) {
      console.error('Error adding warning:', err);
    }
  };

  const getTypeInfo = (type: string) => WARNING_TYPES.find(t => t.value === type) || WARNING_TYPES[0];
  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'حرج': return 'bg-red-100 text-red-800 border-red-300';
      case 'مرتفع': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'متوسط': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // إحصائيات
  const stats = WARNING_TYPES.map(wt => ({
    ...wt,
    count: warnings.filter(w => w.warningType === wt.value).length,
    votesAtRisk: warnings.filter(w => w.warningType === wt.value).reduce((s, w) => s + w.estimatedVotesAtRisk, 0),
  }));

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] leading-[32px] font-bold text-el-primary flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" /> مؤشرات الإنذار المبكر
          </h1>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">
            تصنيف المناطق حسب مستوى الخطر - مهددة / قابلة للاختراق / آمنة / متأرجحة
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-el-primary text-el-on-primary px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-[18px] h-[18px]" />
          <span className="text-[14px] font-medium">إضافة مؤشر جديد</span>
        </button>
      </div>

      {/* بطاقات التصنيف */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.value} className={`border rounded-sm p-3 ${stat.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-[14px] font-semibold">{stat.label}</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-[28px] font-bold font-mono">{stat.count}</div>
                {stat.votesAtRisk > 0 && (
                  <div className="text-[11px] text-el-on-surface-variant">
                    {stat.votesAtRisk.toLocaleString()} صوت مهدد
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* فلاتر */}
      <div className="flex gap-3">
        <select
          className="bg-el-surface-container border border-el-outline-variant text-[12px] rounded px-3 py-1.5 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="">جميع الأنواع</option>
          {WARNING_TYPES.map(wt => <option key={wt.value} value={wt.value}>{wt.label}</option>)}
        </select>
        <select
          className="bg-el-surface-container border border-el-outline-variant text-[12px] rounded px-3 py-1.5 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
          value={selectedSeverity}
          onChange={e => setSelectedSeverity(e.target.value)}
        >
          <option value="">جميع المستويات</option>
          {SEVERITY_LEVELS.map(sl => <option key={sl} value={sl}>{sl}</option>)}
        </select>
      </div>

      {/* قائمة المؤشرات */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-el-on-surface-variant">جاري التحميل...</div>
      ) : warnings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-el-on-surface-variant gap-3">
          <Shield className="w-12 h-12 opacity-30" />
          <p>لا توجد مؤشرات إنذار - أضف أول مؤشر</p>
        </div>
      ) : (
        <div className="space-y-2">
          {warnings.map(w => {
            const typeInfo = getTypeInfo(w.warningType);
            const TypeIcon = typeInfo.icon;
            return (
              <div key={w.id} className={`bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-3 flex items-start gap-3`}>
                <div className={`shrink-0 w-10 h-10 rounded flex items-center justify-center ${typeInfo.bg}`}>
                  <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-el-on-surface">{w.areaName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityColor(w.severity)}`}>
                      {w.severity}
                    </span>
                    <span className="text-[10px] text-el-on-surface-variant">{w.areaType}</span>
                  </div>
                  <div className="text-[12px] text-el-on-surface-variant">{typeInfo.label}</div>
                  {w.description && <div className="text-[11px] text-el-on-surface-variant mt-1">{w.description}</div>}
                  <div className="flex items-center gap-4 mt-1">
                    {w.estimatedVotesAtRisk > 0 && (
                      <span className="text-[11px] text-red-600 font-mono">أصوات مهددة: {w.estimatedVotesAtRisk}</span>
                    )}
                    {w.recommendedAction && (
                      <span className="text-[11px] text-el-primary">الإجراء: {w.recommendedAction}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* نافذة إضافة */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest rounded-sm border border-el-outline-variant w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[18px] font-semibold text-el-on-surface">إضافة مؤشر إنذار جديد</h3>
              <button onClick={() => setShowAddDialog(false)} className="text-el-on-surface-variant hover:text-el-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">نوع المنطقة</label>
                <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                  value={form.areaType} onChange={e => setForm({ ...form, areaType: e.target.value })}>
                  {AREA_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">اسم المنطقة *</label>
                <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                  value={form.areaName} onChange={e => setForm({ ...form, areaName: e.target.value })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">نوع المؤشر</label>
                <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                  value={form.warningType} onChange={e => setForm({ ...form, warningType: e.target.value })}>
                  {WARNING_TYPES.map(wt => <option key={wt.value} value={wt.value}>{wt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">مستوى الخطورة</label>
                <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                  value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                  {SEVERITY_LEVELS.map(sl => <option key={sl} value={sl}>{sl}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد الأصوات المعرضة للخطر</label>
                <input type="number" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                  value={form.estimatedVotesAtRisk} onChange={e => setForm({ ...form, estimatedVotesAtRisk: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">وصف</label>
                <textarea className="w-full bg-el-surface border border-el-outline-variant rounded p-2 text-[12px] h-16 resize-none focus:outline-none focus:border-el-primary"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الإجراء الموصى به</label>
                <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                  value={form.recommendedAction} onChange={e => setForm({ ...form, recommendedAction: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-el-outline-variant">
              <button onClick={handleAdd} disabled={!form.areaName}
                className="flex-1 bg-el-primary text-el-on-primary py-2 rounded text-[14px] font-medium hover:opacity-90 disabled:opacity-50">
                إضافة
              </button>
              <button onClick={() => setShowAddDialog(false)}
                className="flex-1 border border-el-outline-variant text-el-on-surface-variant py-2 rounded text-[14px] hover:bg-el-surface-container">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

``

## File: src\components\election\ElectoralKeyManagement.tsx

``typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Plus,
  Search,
  ChevronDown,
  X,
  Star,
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Phone,
  Calculator,
  Award,
  Filter,
  Eye,
} from 'lucide-react';

const DISTRICTS = ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'قلعة سكر', 'عشيرة', 'البطحاء'];
const EDUCATION_LEVELS = ['يقرا ويكتب', 'ابتدائية', 'متوسطة', 'اعدادية', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'];
const GENDER_OPTIONS = ['ذكر', 'أنثى'];
const MARITAL_STATUS = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];

// جداول التقييم من الوثيقة
const LOYALTY_LABELS = ['متذبذب', 'ولاء ضعيف', 'ولاء متوسط', 'ولاء جيد', 'ولاء قوي'];
const INFLUENCE_LABELS = ['تأثير محدود جدا', 'داخل عائلته فقط', 'داخل عشيرته أو منطقته', 'تأثير واسع', 'شخصية قيادية مؤثرة'];
const MOBILIZATION_LABELS = ['أقل من 10', '10 – 25', '25 – 50', '50 – 100', 'أكثر من 100'];
const VOTE_PROTECTION_LABELS = ['لا يتابع', 'متابعة محدودة', 'متابعة مقبولة', 'متابعة جيدة', 'متابعة ميدانية فعالة'];
const SUPPORT_REASON_LABELS = ['مصلحة مؤقتة', 'معرفة شخصية', 'صداقة', 'عشيرة', 'قناعة سياسية وفكرية'];
const NEEDS_LABELS = ['مطالب مرتفعة جدا', 'مطالب كثيرة', 'مطالب متوسطة', 'مطالب محدودة', 'لا توجد مطالب مؤثرة'];
const POLITICAL_NOTE_LABELS = ['قليل الوعي', 'متذبذب سياسيا', 'محايد', 'داعم', 'ناشط ومدافع'];
const ORGANIZATIONAL_NOTE_LABELS = ['غير متعاون', 'تعاون ضعيف', 'تعاون متوسط', 'متعاون', 'منضبط وملتزم'];
const GENERAL_NOTE_LABELS = ['سلبي جدا', 'سلبي', 'عادي', 'إيجابي', 'إيجابي جدا'];

interface ElectoralKeyData {
  id: string;
  code: string;
  firstName: string;
  fatherName: string | null;
  grandfatherName: string | null;
  fourthName: string | null;
  nickname: string | null;
  gender: string | null;
  phone: string | null;
  educationLevel: string | null;
  profession: string | null;
  governorate: string;
  district: string | null;
  area: string | null;
  pollingCenter: string | null;
  totalVotes: number;
  supportedVotes: number;
  neutralVotes: number;
  weakVotes: number;
  netVotes: number;
  loyaltyLevel: number;
  influenceLevel: number;
  mobilizationAbility: number;
  voteProtection: number;
  supportReason: number;
  needsLevel: number;
  politicalNote: number;
  organizationalNote: number;
  generalNote: number;
  weightedScore: number;
  classification: string;
  tribeId: string | null;
  tribe: { id: string; name: string; influence: number } | null;
  voterCount: number;
  notes: string | null;
  isActive: boolean;
  socialMedia?: string | null;
  dateOfBirth?: string | null;
  specialization?: string | null;
  maritalStatus?: string | null;
  familySize?: number | null;
  firstContactDate?: string | null;
  createdAt: string;
}

const defaultForm = {
  code: '', firstName: '', fatherName: '', grandfatherName: '', fourthName: '',
  nickname: '', gender: 'ذكر', dateOfBirth: '', phone: '', educationLevel: '', profession: '',
  specialization: '', maritalStatus: '', familySize: 0,
  firstContactDate: '', governorate: 'ذي قار', district: 'الناصرية', area: '',
  pollingCenter: '', totalVotes: 0, supportedVotes: 0, neutralVotes: 0, weakVotes: 0,
  loyaltyLevel: 3, influenceLevel: 3, mobilizationAbility: 3, voteProtection: 3,
  supportReason: 3, needsLevel: 3, politicalNote: 3, organizationalNote: 3, generalNote: 3,
  tribeId: '', notes: '', socialFacebook: '', socialTelegram: '', socialWhatsApp: '',
};

const RatingBar = ({ value, onChange, labels, weight }: { value: number; onChange: (v: number) => void; labels: string[]; weight?: number }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2">
      {weight && <span className="text-[10px] bg-el-primary/10 text-el-primary px-1.5 py-0.5 rounded font-bold">الوزن: {weight}</span>}
    </div>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex-1 py-1.5 text-[11px] rounded border transition-all ${
            value >= n
              ? 'bg-el-primary text-white border-el-primary'
              : 'bg-el-surface border-el-outline-variant text-el-on-surface-variant hover:border-el-primary/50'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
    <div className="text-[10px] text-el-on-surface-variant">{labels[value - 1]}</div>
  </div>
);

export default function ElectoralKeyManagement() {
  const [keys, setKeys] = useState<ElectoralKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ElectoralKeyData | null>(null);
  const [activeTab, setActiveTab] = useState<'identity' | 'power' | 'influence'>('identity');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterClassification, setFilterClassification] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [tribes, setTribes] = useState<{ id: string; name: string }[]>([]);

  const fetchKeys = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterDistrict) params.set('district', filterDistrict);
      if (filterClassification) params.set('classification', filterClassification);
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/electoral-keys?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setKeys(data);
      } else {
        console.error('API returned non-array data:', data);
        setKeys([]);
      }
    } catch (err) {
      console.error('Error fetching keys:', err);
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, [filterDistrict, filterClassification, searchQuery]);

  const fetchTribes = useCallback(async () => {
    try {
      const res = await fetch('/api/tribes');
      const data = await res.json();
      setTribes(Array.isArray(data) ? data.map((t: any) => ({ id: t.id, name: t.name })) : []);
    } catch (err) {
      console.error('Error fetching tribes:', err);
      setTribes([]);
    }
  }, []);

  useEffect(() => { fetchKeys(); fetchTribes(); }, [fetchKeys, fetchTribes]);

  const handleSaveKey = async () => {
    try {
      const socialMediaString = JSON.stringify({
        facebook: form.socialFacebook,
        telegram: form.socialTelegram,
        whatsapp: form.socialWhatsApp,
      });

      const payload = {
        ...form,
        socialMedia: socialMediaString,
      };

      const url = editMode ? `/api/electoral-keys/${selectedKey?.id}` : '/api/electoral-keys';
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddDialog(false);
        setEditMode(false);
        setForm(defaultForm);
        fetchKeys();
        if (selectedKey) {
          const updated = await res.json();
          setSelectedKey(updated);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'فشل في حفظ المفتاح الانتخابي');
      }
    } catch (err) {
      console.error('Error saving key:', err);
    }
  };

  const handleStartEdit = (key: ElectoralKeyData) => {
    let fb = '', tg = '', wa = '';
    if (key.socialMedia) {
      try {
        const parsed = JSON.parse(key.socialMedia);
        fb = parsed.facebook || '';
        tg = parsed.telegram || '';
        wa = parsed.whatsapp || '';
      } catch (e) {}
    }

    setForm({
      code: key.code || '',
      firstName: key.firstName || '',
      fatherName: key.fatherName || '',
      grandfatherName: key.grandfatherName || '',
      fourthName: key.fourthName || '',
      nickname: key.nickname || '',
      gender: key.gender || 'ذكر',
      dateOfBirth: key.dateOfBirth || '',
      phone: key.phone || '',
      educationLevel: key.educationLevel || '',
      profession: key.profession || '',
      specialization: key.specialization || '',
      maritalStatus: key.maritalStatus || '',
      familySize: key.familySize || 0,
      firstContactDate: key.firstContactDate || '',
      governorate: key.governorate || 'ذي قار',
      district: key.district || 'الناصرية',
      area: key.area || '',
      pollingCenter: key.pollingCenter || '',
      totalVotes: key.totalVotes || 0,
      supportedVotes: key.supportedVotes || 0,
      neutralVotes: key.neutralVotes || 0,
      weakVotes: key.weakVotes || 0,
      loyaltyLevel: key.loyaltyLevel || 3,
      influenceLevel: key.influenceLevel || 3,
      mobilizationAbility: key.mobilizationAbility || 3,
      voteProtection: key.voteProtection || 3,
      supportReason: key.supportReason || 3,
      needsLevel: key.needsLevel || 3,
      politicalNote: key.politicalNote || 3,
      organizationalNote: key.organizationalNote || 3,
      generalNote: key.generalNote || 3,
      tribeId: key.tribeId || '',
      notes: key.notes || '',
      socialFacebook: fb,
      socialTelegram: tg,
      socialWhatsApp: wa,
    });
    setEditMode(true);
    setShowAddDialog(true);
  };

  const calcNetVotes = (s: number, n: number, w: number) => Math.round(s * 0.8 + n * 0.5 + w * 0.3);
  
  const calcWeighted = () => {
    const rawScore =
      ((form.loyaltyLevel || 3) - 1) * 20 +
      ((form.influenceLevel || 3) - 1) * 20 +
      ((form.mobilizationAbility || 3) - 1) * 15 +
      ((form.voteProtection || 3) - 1) * 15 +
      ((form.supportReason || 3) - 1) * 10 +
      ((form.needsLevel || 3) - 1) * 5 +
      ((form.politicalNote || 3) - 1) * 5 +
      ((form.organizationalNote || 3) - 1) * 5 +
      ((form.generalNote || 3) - 1) * 5;

    return Math.round(rawScore / 2);
  };

  const getClassification = (score: number) => {
    if (score < 20) return 'ضعيف';
    if (score <= 50) return 'مقبول';
    if (score <= 100) return 'جيد';
    return 'قوي';
  };

  const getClassColor = (c: string) => {
    switch (c) {
      case 'قوي': return 'bg-green-100 text-green-800 border-green-300';
      case 'جيد': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'مقبول': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ضعيف': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // ملخص الإحصائيات
  const stats = {
    total: keys.length,
    totalNetVotes: keys.reduce((s, k) => s + k.netVotes, 0),
    avgScore: keys.length ? Math.round(keys.reduce((s, k) => s + k.weightedScore, 0) / keys.length) : 0,
    strongCount: keys.filter(k => k.classification === 'قوي').length,
  };



  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6">
        <div>
          <h1 className="text-[26px] leading-[36px] font-bold text-el-primary flex items-center gap-2.5">
            <Key className="w-6 h-6 text-el-primary" /> المفاتيح الانتخابية
          </h1>
          <p className="text-[12.5px] leading-[18px] text-el-on-surface-variant mt-1.5">
            إدارة وتقييم المفاتيح الانتخابية - نظام التقييم الموزون والتصنيف حسب القوة
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-el-primary text-el-on-primary px-5 py-2.5 rounded-full flex items-center gap-2.5 hover:shadow-lg hover:shadow-el-primary/20 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group"
        >
          <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-90">
            <Plus className="w-[16px] h-[16px]" />
          </span>
          <span className="text-[14px] leading-[20px] font-semibold">إضافة مفتاح جديد</span>
        </button>
      </div>

      {/* بطاقات الإحصائيات - Double-Bezel Architecture */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-2">
        <div className="bg-el-outline-variant/10 border border-el-outline-variant/30 p-1 rounded-[1.25rem] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5">
          <div className="bg-el-surface-container-lowest rounded-[calc(1.25rem-0.25rem)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider font-semibold">إجمالي المفاتيح</div>
            <div className="text-[32px] font-bold text-el-primary mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>{stats.total}</div>
          </div>
        </div>
        <div className="bg-el-outline-variant/10 border border-el-outline-variant/30 p-1 rounded-[1.25rem] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5">
          <div className="bg-el-surface-container-lowest rounded-[calc(1.25rem-0.25rem)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider font-semibold">الأصوات الصافية</div>
            <div className="text-[32px] font-bold text-el-secondary mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>{stats.totalNetVotes.toLocaleString()}</div>
            <div className="text-[10px] text-el-on-surface-variant mt-1">(مؤيد 80% + محايد 50% + ضعيف 30%)</div>
          </div>
        </div>
        <div className="bg-el-outline-variant/10 border border-el-outline-variant/30 p-1 rounded-[1.25rem] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5">
          <div className="bg-el-surface-container-lowest rounded-[calc(1.25rem-0.25rem)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider font-semibold">متوسط التقييم</div>
            <div className="text-[32px] font-bold text-el-on-surface mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>{stats.avgScore}<span className="text-[16px] text-el-on-surface-variant">/100</span></div>
          </div>
        </div>
        <div className="bg-el-outline-variant/10 border border-el-outline-variant/30 p-1 rounded-[1.25rem] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5">
          <div className="bg-el-surface-container-lowest rounded-[calc(1.25rem-0.25rem)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="text-[11px] text-el-on-surface-variant uppercase tracking-wider font-semibold">مفاتيح قوية</div>
            <div className="text-[32px] font-bold text-green-600 mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>{stats.strongCount}</div>
            <div className="text-[10px] text-el-on-surface-variant mt-1">من إجمالي {stats.total}</div>
          </div>
        </div>
      </section>

      {/* فلاتر */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-el-outline w-4 h-4" />
          <input
            className="w-full bg-el-surface-container-lowest border border-el-outline-variant rounded h-8 pl-3 pr-8 text-[12px] focus:outline-none focus:border-el-primary"
            placeholder="بحث بالاسم أو الكود أو اللقب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-el-surface-container border border-el-outline-variant text-[12px] rounded pl-8 pr-3 py-1 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
          >
            <option value="">جميع الأقضية</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-el-surface-container border border-el-outline-variant text-[12px] rounded pl-8 pr-3 py-1 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value)}
          >
            <option value="">جميع التصنيفات</option>
            <option value="قوي">قوي</option>
            <option value="جيد">جيد</option>
            <option value="مقبول">مقبول</option>
            <option value="ضعيف">ضعيف</option>
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
      </div>

      {/* جدول المفاتيح */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-el-on-surface-variant">جاري التحميل...</div>
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-el-on-surface-variant gap-3">
          <Key className="w-12 h-12 opacity-30" />
          <p>لا توجد مفاتيح انتخابية - أضف أول مفتاح</p>
        </div>
      ) : (
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[12px] leading-[16px]">
              <thead className="bg-el-surface-container border-b border-el-outline-variant text-el-on-surface-variant text-[11px] font-bold tracking-wider uppercase">
                <tr>
                  <th className="px-3 py-2 font-normal">الكود</th>
                  <th className="px-3 py-2 font-normal">الاسم</th>
                  <th className="px-3 py-2 font-normal">اللقب/العشيرة</th>
                  <th className="px-3 py-2 font-normal">القضاء</th>
                  <th className="px-3 py-2 font-normal text-center">الأصوات الكلية</th>
                  <th className="px-3 py-2 font-normal text-center">المؤيد</th>
                  <th className="px-3 py-2 font-normal text-center">المحايد</th>
                  <th className="px-3 py-2 font-normal text-center">الضعيف</th>
                  <th className="px-3 py-2 font-normal text-center">الصافي</th>
                  <th className="px-3 py-2 font-normal text-center">التقييم</th>
                  <th className="px-3 py-2 font-normal text-center">التصنيف</th>
                  <th className="px-3 py-2 font-normal w-10">عرض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/50">
                {keys.map((key, idx) => (
                  <tr key={key.id} className={`hover:bg-el-surface-container-lowest/50 transition-colors h-10 ${idx % 2 === 1 ? 'bg-el-surface-container-low/30' : ''}`}>
                    <td className="px-3 py-1 font-mono text-el-primary font-semibold">{key.code}</td>
                    <td className="px-3 py-1 text-el-on-surface font-medium">{key.firstName} {key.fatherName || ''}</td>
                    <td className="px-3 py-1 text-el-on-surface-variant">{key.nickname || key.tribe?.name || '-'}</td>
                    <td className="px-3 py-1 text-el-on-surface-variant">{key.district || '-'}</td>
                    <td className="px-3 py-1 text-center font-mono">{key.totalVotes}</td>
                    <td className="px-3 py-1 text-center font-mono text-green-600">{key.supportedVotes}</td>
                    <td className="px-3 py-1 text-center font-mono text-yellow-600">{key.neutralVotes}</td>
                    <td className="px-3 py-1 text-center font-mono text-red-600">{key.weakVotes}</td>
                    <td className="px-3 py-1 text-center font-mono font-bold text-el-primary">{key.netVotes}</td>
                    <td className="px-3 py-1 text-center">
                      <span className="font-mono font-bold">{key.weightedScore}</span>
                      <span className="text-el-on-surface-variant text-[10px]">/100</span>
                    </td>
                    <td className="px-3 py-1 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getClassColor(key.classification)}`}>
                        {key.classification}
                      </span>
                    </td>
                    <td className="px-3 py-1 text-center">
                      <button onClick={() => setSelectedKey(key)} className="text-el-primary hover:text-el-secondary transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة إضافة مفتاح جديد */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-el-surface-container-lowest rounded-sm border border-el-outline-variant w-full max-w-2xl my-8">
            {/* رأس النافذة */}
            <div className="flex justify-between items-center p-4 border-b border-el-outline-variant sticky top-0 bg-el-surface-container-lowest z-10">
              <h3 className="text-[18px] font-semibold text-el-on-surface flex items-center gap-2">
                <Key className="w-5 h-5 text-el-primary" /> إضافة مفتاح انتخابي جديد
              </h3>
              <button onClick={() => { setShowAddDialog(false); setForm(defaultForm); }} className="text-el-on-surface-variant hover:text-el-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* تبويبات */}
            <div className="flex border-b border-el-outline-variant">
              {[
                { id: 'identity' as const, label: 'الهوية الأساسية', icon: Users },
                { id: 'power' as const, label: 'القوة الانتخابية', icon: Calculator },
                { id: 'influence' as const, label: 'النفوذ والتأثير', icon: Shield },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-[12px] font-medium flex items-center justify-center gap-1 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-el-primary text-el-primary bg-el-primary/5'
                      : 'border-transparent text-el-on-surface-variant hover:text-el-on-surface'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {/* تبويب الهوية */}
              {activeTab === 'identity' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">كود المفتاح (توليد تلقائي)</label>
                      <input className="w-full bg-el-surface-container border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none font-mono opacity-70 cursor-not-allowed" disabled={true}
                        value={editMode ? form.code : 'توليد تلقائي'} onChange={e => setForm({ ...form, code: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الاسم المجرد *</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">اسم الأب</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">اسم الجد</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.grandfatherName} onChange={e => setForm({ ...form, grandfatherName: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الاسم الرابع</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.fourthName} onChange={e => setForm({ ...form, fourthName: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">اللقب / العشيرة</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الجنس</label>
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                        {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">العمر (تاريخ الميلاد)</label>
                      <input type="date" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">رقم الموبايل (11 رقم)</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono" placeholder="07XXXXXXXXX"
                        value={form.phone} onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 11) {
                            setForm({ ...form, phone: val });
                          }
                        }} />
                      {form.phone && form.phone.length !== 11 && (
                        <span className="text-[10px] text-red-500 font-bold block mt-0.5">رقم الهاتف يجب أن يكون 11 رقماً</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">التحصيل الدراسي</label>
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.educationLevel} onChange={e => setForm({ ...form, educationLevel: e.target.value })}>
                        <option value="">اختر</option>
                        {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">التخصص الدقيق</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary" placeholder="بكالوريوس هندسة مثلاً"
                        value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">المهنة الفعلية</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الحالة الاجتماعية</label>
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.maritalStatus} onChange={e => setForm({ ...form, maritalStatus: e.target.value })}>
                        <option value="">اختر</option>
                        {MARITAL_STATUS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد أفراد الأسرة</label>
                      <input type="number" min="0" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                        value={form.familySize || ''} onChange={e => setForm({ ...form, familySize: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">تاريخ أول تواصل</label>
                      <input type="date" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.firstContactDate} onChange={e => setForm({ ...form, firstContactDate: e.target.value })} />
                    </div>
                  </div>
                  
                  {/* مواقع التواصل الاجتماعي */}
                  <div className="border border-el-outline-variant/60 rounded p-3 bg-el-surface-container-low space-y-2">
                    <span className="block text-[11px] font-bold text-el-primary">مواقع التواصل الاجتماعي (رابط الحساب / الرقم)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">فيسبوك</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="رابط الصفحة"
                          value={form.socialFacebook} onChange={e => setForm({ ...form, socialFacebook: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">تلكرام</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="رابط أو معرف"
                          value={form.socialTelegram} onChange={e => setForm({ ...form, socialTelegram: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">واتساب</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="رابط أو رقم"
                          value={form.socialWhatsApp} onChange={e => setForm({ ...form, socialWhatsApp: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">القضاء</label>
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}>
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">المنطقة</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">العشيرة</label>
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.tribeId} onChange={e => setForm({ ...form, tribeId: e.target.value })}>
                        <option value="">بدون عشيرة</option>
                        {tribes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* تبويب القوة الانتخابية */}
              {activeTab === 'power' && (
                <div className="space-y-4">
                  <div className="bg-el-primary/5 border border-el-primary/20 rounded-sm p-3">
                    <h4 className="text-[14px] font-semibold text-el-primary mb-2 flex items-center gap-1">
                      <Calculator className="w-4 h-4" /> معادلة حساب الأصوات الصافية
                    </h4>
                    <p className="text-[12px] text-el-on-surface-variant">
                      الأصوات الصافية = (المؤيدة × 80%) + (المحايدة × 50%) + (الضعيفة × 30%)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد الأصوات المؤيدة</label>
                      <input type="number" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                        value={form.supportedVotes} onChange={e => setForm({ ...form, supportedVotes: parseInt(e.target.value) || 0 })} />
                      <p className="text-[10px] text-green-600 mt-0.5">= {Math.round(form.supportedVotes * 0.8)} صوت فعلي (80%)</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد الأصوات المحايدة</label>
                      <input type="number" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                        value={form.neutralVotes} onChange={e => setForm({ ...form, neutralVotes: parseInt(e.target.value) || 0 })} />
                      <p className="text-[10px] text-yellow-600 mt-0.5">= {Math.round(form.neutralVotes * 0.5)} صوت فعلي (50%)</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">عدد الأصوات الضعيفة</label>
                      <input type="number" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                        value={form.weakVotes} onChange={e => setForm({ ...form, weakVotes: parseInt(e.target.value) || 0 })} />
                      <p className="text-[10px] text-red-600 mt-0.5">= {Math.round(form.weakVotes * 0.3)} صوت فعلي (30%)</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">الأصوات الصافية</label>
                      <div className="bg-el-primary/10 border border-el-primary/30 rounded h-8 px-2 flex items-center text-[16px] font-bold text-el-primary font-mono">
                        {calcNetVotes(form.supportedVotes, form.neutralVotes, form.weakVotes)}
                      </div>
                    </div>
                  </div>
                  {/* مؤشرات ميدانية للمؤيد */}
                  <div className="bg-green-50 border border-green-200 rounded-sm p-2">
                    <p className="text-[11px] font-bold text-green-800 mb-1">مؤشرات الصوت المؤيد:</p>
                    <ul className="text-[10px] text-green-700 space-y-0.5">
                      <li>● صوت للمرشح سابقاً</li>
                      <li>● يشارك في نشاطات الحملة</li>
                      <li>● يدافع عن المرشح أمام الآخرين</li>
                      <li>● يمكن الاعتماد عليه يوم الاقتراع</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* تبويب النفوذ والتأثير */}
              {activeTab === 'influence' && (
                <div className="space-y-4">
                  <div className="bg-el-primary/5 border border-el-primary/20 rounded-sm p-3">
                    <h4 className="text-[14px] font-semibold text-el-primary mb-2 flex items-center gap-1">
                      <Shield className="w-4 h-4" /> نظام التقييم الموزون (من 200)
                    </h4>
                    <p className="text-[12px] text-el-on-surface-variant">
                      كل حقل يُقيّم من 1-5 ويُضرب بالوزن المحدد، المجموع يحدد تصنيف المفتاح
                    </p>
                  </div>

                  <div className="space-y-3">
                    <RatingBar value={form.loyaltyLevel} onChange={v => setForm({ ...form, loyaltyLevel: v })} labels={LOYALTY_LABELS} weight={20} />
                    <RatingBar value={form.influenceLevel} onChange={v => setForm({ ...form, influenceLevel: v })} labels={INFLUENCE_LABELS} weight={20} />
                    <RatingBar value={form.mobilizationAbility} onChange={v => setForm({ ...form, mobilizationAbility: v })} labels={MOBILIZATION_LABELS} weight={15} />
                    <RatingBar value={form.voteProtection} onChange={v => setForm({ ...form, voteProtection: v })} labels={VOTE_PROTECTION_LABELS} weight={15} />
                    <RatingBar value={form.supportReason} onChange={v => setForm({ ...form, supportReason: v })} labels={SUPPORT_REASON_LABELS} weight={10} />
                    <RatingBar value={form.needsLevel} onChange={v => setForm({ ...form, needsLevel: v })} labels={NEEDS_LABELS} weight={5} />
                    <RatingBar value={form.politicalNote} onChange={v => setForm({ ...form, politicalNote: v })} labels={POLITICAL_NOTE_LABELS} weight={5} />
                    <RatingBar value={form.organizationalNote} onChange={v => setForm({ ...form, organizationalNote: v })} labels={ORGANIZATIONAL_NOTE_LABELS} weight={5} />
                    <RatingBar value={form.generalNote} onChange={v => setForm({ ...form, generalNote: v })} labels={GENERAL_NOTE_LABELS} weight={5} />
                  </div>

                  {/* النتيجة النهائية */}
                  <div className="bg-el-surface border border-el-outline-variant rounded-sm p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] font-semibold text-el-on-surface">التقييم الموزون النهائي:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[24px] font-bold text-el-primary font-mono">{calcWeighted()}</span>
                        <span className="text-[12px] text-el-on-surface-variant">/200</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[14px] text-el-on-surface-variant">التصنيف:</span>
                      <span className={`px-3 py-1 rounded text-[12px] font-bold border ${getClassColor(getClassification(calcWeighted()))}`}>
                        {getClassification(calcWeighted())}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${calcWeighted() >= 100 ? 'bg-green-500' : calcWeighted() >= 50 ? 'bg-blue-500' : calcWeighted() >= 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(calcWeighted() / 2, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-el-on-surface-variant mt-1">
                      <span>ضعيف &lt;20</span>
                      <span>مقبول 20-50</span>
                      <span>جيد 50-100</span>
                      <span>قوي 100-200</span>
                    </div>
                  </div>

                  {/* ملاحظات */}
                  <div>
                    <label className="block text-[11px] font-bold text-el-on-surface-variant mb-1">ملاحظات</label>
                    <textarea className="w-full bg-el-surface border border-el-outline-variant rounded p-2 text-[12px] h-16 resize-none focus:outline-none focus:border-el-primary"
                      value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-2 p-4 border-t border-el-outline-variant sticky bottom-0 bg-el-surface-container-lowest">
              <button
                onClick={handleSaveKey}
                disabled={((editMode && !form.code) || !form.firstName || (form.phone ? form.phone.length !== 11 : false))}
                className="flex-1 bg-el-primary text-el-on-primary py-2 rounded text-[14px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editMode ? 'حفظ التعديلات' : 'إضافة المفتاح'}
              </button>
              <button
                onClick={() => { setShowAddDialog(false); setEditMode(false); setForm(defaultForm); }}
                className="flex-1 border border-el-outline-variant text-el-on-surface-variant py-2 rounded text-[14px] hover:bg-el-surface-container"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تفاصيل المفتاح */}
      {selectedKey && (() => {
        let social = { facebook: '', telegram: '', whatsapp: '' };
        if (selectedKey.socialMedia) {
          try {
            social = JSON.parse(selectedKey.socialMedia);
          } catch (e) {}
        }
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-el-surface-container-lowest rounded-sm border border-el-outline-variant w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b border-el-outline-variant">
                <h3 className="text-[18px] font-semibold text-el-on-surface flex items-center gap-2">
                  <Key className="w-5 h-5 text-el-primary" />
                  {selectedKey.code} - {selectedKey.firstName} {selectedKey.fatherName || ''} {selectedKey.grandfatherName || ''} {selectedKey.fourthName || ''}
                </h3>
                <button onClick={() => setSelectedKey(null)} className="text-el-on-surface-variant hover:text-el-on-surface">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* التصنيف والتقييم */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1.5 rounded text-[14px] font-bold border ${getClassColor(selectedKey.classification)}`}>
                    {selectedKey.classification}
                  </span>
                  <span className="text-[16px] font-bold font-mono text-el-primary">{selectedKey.weightedScore}/200</span>
                </div>

                {/* الأصوات */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-el-surface-container rounded">
                    <div className="text-[18px] font-bold font-mono">{selectedKey.totalVotes}</div>
                    <div className="text-[10px] text-el-on-surface-variant">كلية</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-[18px] font-bold font-mono text-green-700">{selectedKey.supportedVotes}</div>
                    <div className="text-[10px] text-green-600">مؤيد</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-[18px] font-bold font-mono text-yellow-700">{selectedKey.neutralVotes}</div>
                    <div className="text-[10px] text-yellow-600">محايد</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-[18px] font-bold font-mono text-red-700">{selectedKey.weakVotes}</div>
                    <div className="text-[10px] text-red-600">ضعيف</div>
                  </div>
                </div>

                {/* الأصوات الصافية */}
                <div className="bg-el-primary/5 border border-el-primary/20 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-el-on-surface-variant">الأصوات الصافية (المعادلة)</span>
                    <span className="text-[20px] font-bold text-el-primary font-mono">{selectedKey.netVotes}</span>
                  </div>
                  <div className="text-[10px] text-el-on-surface-variant mt-1">
                    ({selectedKey.supportedVotes}×80%) + ({selectedKey.neutralVotes}×50%) + ({selectedKey.weakVotes}×30%) = {selectedKey.netVotes}
                  </div>
                </div>

                {/* التفاصيل الأساسية والجغرافية */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] border-t border-el-outline-variant/60 pt-3">
                  {selectedKey.nickname && <div><span className="text-el-on-surface-variant">اللقب/العشيرة:</span> <span className="font-medium">{selectedKey.nickname}</span></div>}
                  {selectedKey.gender && <div><span className="text-el-on-surface-variant">الجنس:</span> <span className="font-medium">{selectedKey.gender}</span></div>}
                  {selectedKey.dateOfBirth && <div><span className="text-el-on-surface-variant">تاريخ الميلاد:</span> <span className="font-medium font-mono">{selectedKey.dateOfBirth}</span></div>}
                  {selectedKey.phone && <div><span className="text-el-on-surface-variant">رقم الموبايل:</span> <span className="font-mono font-medium">{selectedKey.phone}</span></div>}
                  {selectedKey.educationLevel && <div><span className="text-el-on-surface-variant">التحصيل الدراسي:</span> <span className="font-medium">{selectedKey.educationLevel}</span></div>}
                  {selectedKey.specialization && <div><span className="text-el-on-surface-variant">التخصص الدقيق:</span> <span className="font-medium">{selectedKey.specialization}</span></div>}
                  {selectedKey.profession && <div><span className="text-el-on-surface-variant">المهنة الفعلية:</span> <span className="font-medium">{selectedKey.profession}</span></div>}
                  {selectedKey.maritalStatus && <div><span className="text-el-on-surface-variant">الحالة الاجتماعية:</span> <span className="font-medium">{selectedKey.maritalStatus}</span></div>}
                  {selectedKey.familySize !== null && selectedKey.familySize !== undefined && <div><span className="text-el-on-surface-variant">عدد أفراد الأسرة:</span> <span className="font-mono font-medium">{selectedKey.familySize}</span></div>}
                  {selectedKey.firstContactDate && <div><span className="text-el-on-surface-variant">تاريخ أول تواصل:</span> <span className="font-medium font-mono">{selectedKey.firstContactDate}</span></div>}
                  <div><span className="text-el-on-surface-variant">المحافظة:</span> <span className="font-medium">{selectedKey.governorate}</span></div>
                  {selectedKey.district && <div><span className="text-el-on-surface-variant">القضاء:</span> <span className="font-medium">{selectedKey.district}</span></div>}
                  {selectedKey.area && <div><span className="text-el-on-surface-variant">المنطقة:</span> <span className="font-medium">{selectedKey.area}</span></div>}
                  {selectedKey.pollingCenter && <div><span className="text-el-on-surface-variant">مركز الاقتراع:</span> <span className="font-medium">{selectedKey.pollingCenter}</span></div>}
                  {selectedKey.tribe && <div><span className="text-el-on-surface-variant">العشيرة المرتبطة:</span> <span className="font-medium">{selectedKey.tribe.name}</span></div>}
                  <div><span className="text-el-on-surface-variant">الناخبون المسجلون:</span> <span className="font-mono font-bold text-el-secondary">{selectedKey.voterCount}</span></div>
                </div>

                {/* روابط مواقع التواصل الاجتماعي */}
                {(social.facebook || social.telegram || social.whatsapp) && (
                  <div className="border-t border-el-outline-variant/60 pt-3 text-[12px] space-y-1">
                    <span className="text-el-on-surface-variant font-bold block mb-1">التواصل الرقمي:</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {social.facebook && (
                        <a href={social.facebook.startsWith('http') ? social.facebook : `https://facebook.com/${social.facebook}`} target="_blank" rel="noopener noreferrer" className="text-el-primary hover:underline font-medium">
                          🌐 فيسبوك
                        </a>
                      )}
                      {social.telegram && (
                        <a href={social.telegram.startsWith('http') ? social.telegram : `https://t.me/${social.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-el-primary hover:underline font-medium">
                          ✈️ تلكرام
                        </a>
                      )}
                      {social.whatsapp && (
                        <a href={social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-el-primary hover:underline font-medium">
                          💬 واتساب
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* شريط التقييم */}
                <div className="border-t border-el-outline-variant/60 pt-3">
                  <div className="flex justify-between text-[11px] text-el-on-surface-variant mb-1">
                    <span>قوة نفوذ المفتاح</span>
                    <span>{selectedKey.weightedScore}/200</span>
                  </div>
                  <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
                    <div className={`h-full ${selectedKey.weightedScore >= 100 ? 'bg-green-500' : selectedKey.weightedScore >= 50 ? 'bg-blue-500' : selectedKey.weightedScore >= 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(selectedKey.weightedScore / 2, 100)}%` }} />
                  </div>
                </div>

                {/* ملاحظات حرة */}
                {selectedKey.notes && (
                  <div className="border-t border-el-outline-variant/60 pt-3 text-[12px]">
                    <span className="text-el-on-surface-variant font-bold block">ملاحظات:</span>
                    <p className="mt-1 text-el-on-surface bg-el-surface p-2 rounded text-justify">{selectedKey.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex border-t border-el-outline-variant">
                <button
                  onClick={() => { handleStartEdit(selectedKey); setSelectedKey(null); }}
                  className="flex-1 p-3 text-el-secondary text-[14px] font-semibold hover:bg-el-primary/5 border-l border-el-outline-variant transition-colors"
                >
                  تعديل البيانات
                </button>
                <button
                  onClick={() => setSelectedKey(null)}
                  className="flex-1 p-3 text-el-on-surface-variant text-[14px] font-medium hover:bg-el-surface-container transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

``

## File: src\components\election\ExecutiveDashboard.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  Target, Shield, AlertTriangle, MapPin, TrendingUp, TrendingDown,
  Users, Key, BarChart3, Award, Activity, Zap, ChevronDown, ChevronUp,
  Vote, ArrowUp, ArrowDown, Eye, ShieldAlert,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DecisiveData {
  expectedVotesOnDay: number;
  expectedParticipation: number;
  strongAreas: any[];
  weakAreas: any[];
  geoDistribution: any[];
  keyRanking: any[];
  avgKRI: number;
  avgDRS: number;
  supportDistribution: {
    supported: { count: number; percentage: number };
    neutral: { count: number; percentage: number };
    weak: { count: number; percentage: number };
  };
  areaMap: { district: string; color: 'green' | 'yellow' | 'red'; strength: number; netVotes: number; keyCount: number }[];
  totalNetVotes: number;
  totalRegistered: number;
  projectedSeats: number;
  gpsVerificationRate: number;
  registryVerificationRate: number;
  averageKeyAccuracy: number;
  serviceConversionRate: number;
  expectedVotes?: number;
  expectedTurnout?: number;
  votesNeededToWin?: number;
  electoralGap?: number;
  winProbability?: number;
  overallRisk?: number;
}

interface MetaData {
  calculatedAt: string;
  totalKeys: number;
  totalVoters: number;
  totalTribes: number;
  totalDistricts: number;
}

export default function ExecutiveDashboard() {
  const [data, setData] = useState<{ decisive: DecisiveData; meta: MetaData } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/comprehensive-indicators');
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setData({ error: errData.error || `خطأ في الاتصال بالخادم (${res.status})` } as any);
          return;
        }
        const d = await res.json();
        setData(d);
      } catch (err: any) {
        console.error('Error fetching indicators:', err);
        setData({ error: err?.message || 'خطأ غير متوقع في جلب البيانات' } as any);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Activity className="w-6 h-6 text-el-primary animate-pulse" />
        <span className="text-el-on-surface-variant text-[14px]">جاري حساب المؤشرات الحاسمة...</span>
      </div>
    );
  }

  if (!data || 'error' in data) {
    const errorMsg = data ? (data as any).error : 'تعذر تحميل البيانات';
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-8 text-center max-w-[600px] mx-auto mt-12 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-el-primary">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-[18px] font-bold text-el-on-surface">أهلاً بك في الماكينة الانتخابية</h2>
        <p className="text-[14px] text-el-on-surface-variant leading-relaxed">
          {errorMsg === 'غير مسموح' 
            ? 'بصفتك مندوباً ميدانياً، يرجى الانتقال إلى تبويبات "تسجيل الناخبين" أو "بوابة المندوب الميداني" لبدء إدخال وتحديث البيانات.' 
            : `تعذر جلب بيانات لوحة التحكم: ${errorMsg}`}
        </p>
      </div>
    );
  }

  const d = data?.decisive || {} as any;
  const m = data?.meta || {} as any;
  
  const areaMap = d.areaMap || [];
  const greenCount = areaMap.filter((a: any) => a?.color === 'green').length;
  const yellowCount = areaMap.filter((a: any) => a?.color === 'yellow').length;
  const redCount = areaMap.filter((a: any) => a?.color === 'red').length;

  const expectedVotesOnDay = d.expectedVotesOnDay ?? d.expectedVotes ?? 0;
  const expectedParticipation = d.expectedParticipation ?? d.expectedTurnout ?? 0;
  const totalNetVotes = d.totalNetVotes ?? 0;
  const totalRegistered = d.totalRegistered ?? 0;
  const projectedSeats = d.projectedSeats ?? 0;
  const avgKRI = d.avgKRI ?? 0;
  const avgDRS = d.avgDRS ?? 0;
  const gpsVerificationRate = d.gpsVerificationRate ?? 0;
  const registryVerificationRate = d.registryVerificationRate ?? 0;
  const averageKeyAccuracy = d.averageKeyAccuracy ?? 100;
  const serviceConversionRate = d.serviceConversionRate ?? 0;

  const votesNeededToWin = d.votesNeededToWin ?? 12000;
  const electoralGap = d.electoralGap ?? Math.max(0, votesNeededToWin - expectedVotesOnDay);
  const winProbability = d.winProbability ?? Math.min(100, Math.round((expectedVotesOnDay / votesNeededToWin) * 100));
  const overallRisk = d.overallRisk ?? Math.min(100, Math.max(0, Math.round(avgDRS * 0.6 + (100 - avgKRI) * 0.4)));
  
  const supportDistribution = d.supportDistribution || {
    supported: { count: 0, percentage: 0 },
    neutral: { count: 0, percentage: 0 },
    weak: { count: 0, percentage: 0 }
  };
  
  const strongAreas = d.strongAreas || [];
  const weakAreas = d.weakAreas || [];
  const geoDistribution = d.geoDistribution || [];
  const keyRanking = d.keyRanking || [];

  return (
    <div className="flex flex-col gap-3 max-w-[1440px] mx-auto w-full">
      {/* ═══ العنوان ═══ */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[22px] font-bold text-el-primary flex items-center gap-2">
            <Target className="w-6 h-6" /> المؤشرات الحاسمة — ذي قار
          </h1>
          <p className="text-[11px] text-el-on-surface-variant mt-0.5">
            هل نحن متجهون للفوز أم الخسارة؟ — {m.totalKeys ?? 0} مفتاح · {m.totalVoters ?? 0} ناخب · {m.totalDistricts ?? 0} أقضية
          </p>
        </div>
        <div className="text-[10px] text-el-on-surface-variant bg-el-surface-container px-2 py-1 rounded">
          آخر تحديث: {new Date(m.calculatedAt || Date.now()).toLocaleString('ar-IQ')}
        </div>
      </div>

      {/* ═══ Hero: المؤشرات الاستراتيجية ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* المقاعد المتوقعة - بنر عريض فاخر */}
        <div className="bg-gradient-to-r from-el-primary via-[#0f3b7d] to-el-primary text-white rounded-lg p-6 relative overflow-hidden shadow-lg border border-el-primary/30 lg:col-span-3 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-24 -translate-y-24 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-16 translate-y-16 pointer-events-none" />
          
          <div className="relative z-10 flex-1 w-full text-right">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-6 h-6 text-el-secondary animate-pulse" />
              <span className="text-[13px] text-white/80 font-bold uppercase tracking-wider">خلاصة تقدير المقاعد المقترحة</span>
            </div>
            <h2 className="text-[20px] font-bold text-white mb-1">مسار حصد المقاعد النيابية في مجلس محافظة ذي قار</h2>
            <p className="text-[12px] text-white/70">
              يتم تحديث هذا التقدير ديناميكياً بناءً على صافي أصوات المفاتيح الانتخابية ومطابقتها مع نسبة المشاركة المستهدفة.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center md:items-end gap-2 shrink-0 w-full md:w-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-[56px] font-extrabold leading-none font-mono text-el-secondary">{projectedSeats}</span>
              <span className="text-[20px] text-white/60">/ 18 مقعداً</span>
            </div>
            <div className="w-full md:w-64">
              <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-el-secondary transition-all duration-1000 rounded-full" style={{ width: `${(projectedSeats / 18) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* 1. الأصوات المطلوبة للفوز */}
        <div className="bg-gradient-to-br from-el-surface-container-lowest to-el-surface-container/30 dark:from-el-surface-container/30 dark:to-el-surface-container-low/10 border border-amber-500/30 rounded-lg p-5 flex flex-col justify-between hover:shadow-lg hover:border-amber-500/50 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500 animate-pulse" />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">الأصوات المطلوبة للفوز</span>
            </div>
            <span className="text-[10px] text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded font-bold">العتبة المستهدفة للمقعد</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[36px] font-extrabold text-amber-600 leading-none font-mono">{votesNeededToWin.toLocaleString()}</span>
            <span className="text-[12px] text-el-on-surface-variant font-medium">صوت</span>
          </div>
          <div className="mt-3 text-[11px] text-el-on-surface-variant/80 leading-relaxed border-t border-el-outline-variant/20 pt-2">
            الحد الأدنى التقريبي لحسم مقعد في ذي قار
          </div>
        </div>

        {/* 2. عدد الأصوات المتوقعة */}
        <div className="bg-gradient-to-br from-el-surface-container-lowest to-el-surface-container/30 dark:from-el-surface-container/30 dark:to-el-surface-container-low/10 border border-el-outline-variant/60 dark:border-el-outline-variant/30 rounded-lg p-5 flex flex-col justify-between hover:shadow-lg hover:border-el-primary/50 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-el-primary" />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">عدد الأصوات المتوقعة</span>
            </div>
            <span className="text-[10px] text-el-primary bg-el-primary/10 px-2 py-0.5 rounded font-bold">معدل تقديري</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[36px] font-extrabold text-el-primary leading-none font-mono">{expectedVotesOnDay.toLocaleString()}</span>
            <span className="text-[12px] text-el-on-surface-variant font-medium">صوت محتمل</span>
          </div>
          <div className="mt-3 text-[11px] text-el-on-surface-variant/80 border-t border-el-outline-variant/20 pt-2">
            صافي الأصوات: <span className="font-bold text-el-primary font-mono">{totalNetVotes.toLocaleString()}</span> · المسجلون: <span className="font-mono">{totalRegistered.toLocaleString()}</span>
          </div>
        </div>

        {/* 3. مؤشر الفجوة الانتخابية */}
        <div className={`border rounded-lg p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br ${electoralGap > 0 ? 'from-red-500/5 to-red-500/10 border-red-500/30 hover:border-red-500/50' : 'from-green-500/5 to-green-500/10 border-green-500/30 hover:border-green-500/50'}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${electoralGap > 0 ? 'text-red-500' : 'text-green-500'}`} />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">مؤشر الفجوة الانتخابية</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${electoralGap > 0 ? 'text-red-700 bg-red-500/10' : 'text-green-700 bg-green-500/10'}`}>
              {electoralGap > 0 ? 'تحت المستهدف' : 'تم تخطي المستهدف'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-[36px] font-extrabold leading-none font-mono ${electoralGap > 0 ? 'text-red-500' : 'text-green-500'}`}>{electoralGap.toLocaleString()}</span>
            <span className="text-[12px] text-el-on-surface-variant font-medium">صوت متبقي</span>
          </div>
          <div className="mt-3 text-[11px] text-el-on-surface-variant/80 border-t border-el-outline-variant/20 pt-2">
            {electoralGap > 0 ? 'الفارق المطلوب تغطيته لحسم الفوز بالمقعد' : 'أصواتنا الحالية تتجاوز عتبة الفوز الآمنة'}
          </div>
        </div>

        {/* 4. نسبة المشاركة المتوقعة */}
        <div className="bg-gradient-to-br from-el-surface-container-lowest to-el-surface-container/30 dark:from-el-surface-container/30 dark:to-el-surface-container-low/10 border border-el-secondary/30 rounded-lg p-5 flex flex-col justify-between hover:shadow-lg hover:border-el-secondary/60 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-el-secondary" />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">نسبة المشاركة المتوقعة</span>
            </div>
            <span className="text-[10px] text-el-secondary bg-el-secondary/15 px-2 py-0.5 rounded font-bold">تقدير الدائرة الميداني</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[36px] font-extrabold text-el-secondary leading-none font-mono">{expectedParticipation}%</span>
          </div>
          <div className="mt-3 w-full border-t border-el-outline-variant/20 pt-3">
            <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-el-secondary transition-all duration-500" style={{ width: `${expectedParticipation}%` }} />
            </div>
          </div>
        </div>

        {/* 5. إمكانية الفوز */}
        <div className="bg-gradient-to-br from-el-surface-container-lowest to-el-surface-container/30 dark:from-el-surface-container/30 dark:to-el-surface-container-low/10 border border-purple-500/30 rounded-lg p-5 flex flex-col justify-between hover:shadow-lg hover:border-purple-500/60 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500 animate-pulse" />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">إمكانية الفوز</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${winProbability >= 70 ? 'text-green-700 bg-green-500/10' : winProbability >= 40 ? 'text-purple-700 bg-purple-500/10' : 'text-red-700 bg-red-500/10'}`}>
              {winProbability >= 70 ? 'مرتفعة جداً' : winProbability >= 40 ? 'ممكنة' : 'ضعيفة'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[36px] font-extrabold text-purple-500 leading-none font-mono">{winProbability}%</span>
            <span className="text-[12px] text-el-on-surface-variant font-medium">جاهزية حصد المقعد</span>
          </div>
          <div className="mt-3 w-full border-t border-el-outline-variant/20 pt-3">
            <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${winProbability}%` }} />
            </div>
          </div>
        </div>

        {/* 6. مؤشر المخاطر الانتخابية الشامل */}
        <div className={`border rounded-lg p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br ${overallRisk > 50 ? 'from-red-500/5 to-red-500/10 border-red-500/30 hover:border-red-500/50' : overallRisk > 25 ? 'from-yellow-500/5 to-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50' : 'from-green-500/5 to-green-500/10 border-green-500/30 hover:border-green-500/50'}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-5 h-5 ${overallRisk > 50 ? 'text-red-500' : overallRisk > 25 ? 'text-yellow-500' : 'text-green-500'}`} />
              <span className="text-[12px] text-el-on-surface-variant font-semibold">مؤشر المخاطر الشامل</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${overallRisk > 50 ? 'text-red-700 bg-red-500/10' : overallRisk > 25 ? 'text-yellow-700 bg-yellow-500/10' : 'text-green-700 bg-green-500/10'}`}>
              {overallRisk > 50 ? 'خطر مرتفع' : overallRisk > 25 ? 'خطر متوسط' : 'خطر منخفض'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-[36px] font-extrabold leading-none font-mono ${overallRisk > 50 ? 'text-red-500' : overallRisk > 25 ? 'text-yellow-500' : 'text-green-500'}`}>{overallRisk}%</span>
          </div>
          <div className="mt-3 w-full border-t border-el-outline-variant/20 pt-3">
            <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-500 ${overallRisk > 50 ? 'bg-red-500' : overallRisk > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${overallRisk}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ مؤشرا الدقة والخطر + نسب التأييد ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* مؤشرات DRS + KRI */}
        <div className="grid grid-cols-2 gap-3">
          {/* مؤشر دقة المفتاح KRI */}
          <div className={`rounded-lg p-4 border-2 ${avgKRI >= 60 ? 'border-green-200 bg-green-50/50' : avgKRI >= 40 ? 'border-yellow-200 bg-yellow-50/50' : 'border-red-200 bg-red-50/50'}`}>
            <Shield className={`w-5 h-5 mb-1 ${avgKRI >= 60 ? 'text-green-600' : avgKRI >= 40 ? 'text-yellow-600' : 'text-red-600'}`} />
            <div className="text-[10px] text-el-on-surface-variant uppercase tracking-wider">دقة المفتاح</div>
            <div className={`text-[32px] font-bold font-mono leading-none mt-1 ${avgKRI >= 60 ? 'text-green-700' : avgKRI >= 40 ? 'text-yellow-700' : 'text-red-700'}`}>{avgKRI}</div>
            <div className="text-[10px] text-el-on-surface-variant mt-1">KRI — من 100</div>
          </div>
          {/* مؤشر خطر التسرب DRS */}
          <div className={`rounded-lg p-4 border-2 ${avgDRS <= 30 ? 'border-green-200 bg-green-50/50' : avgDRS <= 50 ? 'border-yellow-200 bg-yellow-50/50' : 'border-red-200 bg-red-50/50'}`}>
            <AlertTriangle className={`w-5 h-5 mb-1 ${avgDRS <= 30 ? 'text-green-600' : avgDRS <= 50 ? 'text-yellow-600' : 'text-red-600'}`} />
            <div className="text-[10px] text-el-on-surface-variant uppercase tracking-wider">خطر التسرب</div>
            <div className={`text-[32px] font-bold font-mono leading-none mt-1 ${avgDRS <= 30 ? 'text-green-700' : avgDRS <= 50 ? 'text-yellow-700' : 'text-red-700'}`}>{avgDRS}</div>
            <div className="text-[10px] text-el-on-surface-variant mt-1">DRS — الأقل أفضل</div>
          </div>
        </div>

        {/* نسبة المؤيدين / المحايدين / الضعفاء */}
        <div className="lg:col-span-2 bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[14px] font-bold text-el-on-surface mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-el-primary" /> نسبة المؤيدين والمحايدين والضعفاء
          </h3>
          <div className="flex gap-4 items-center">
            {/* شريط مركب */}
            <div className="flex-1">
              <div className="h-8 w-full rounded-lg overflow-hidden flex">
                <div className="bg-green-500 h-full transition-all flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ width: `${supportDistribution.supported?.percentage ?? 0}%` }}>
                  {(supportDistribution.supported?.percentage ?? 0) > 10 ? `${supportDistribution.supported?.percentage}%` : ''}
                </div>
                <div className="bg-yellow-400 h-full transition-all flex items-center justify-center text-yellow-900 text-[11px] font-bold"
                  style={{ width: `${supportDistribution.neutral?.percentage ?? 0}%` }}>
                  {(supportDistribution.neutral?.percentage ?? 0) > 10 ? `${supportDistribution.neutral?.percentage}%` : ''}
                </div>
                <div className="bg-red-400 h-full transition-all flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ width: `${supportDistribution.weak?.percentage ?? 0}%` }}>
                  {(supportDistribution.weak?.percentage ?? 0) > 10 ? `${supportDistribution.weak?.percentage}%` : ''}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                  <span>مؤيد: <b className="font-mono">{(supportDistribution.supported?.count ?? 0).toLocaleString()}</b></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400" />
                  <span>محايد: <b className="font-mono">{(supportDistribution.neutral?.count ?? 0).toLocaleString()}</b></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                  <span>ضعيف: <b className="font-mono">{(supportDistribution.weak?.count ?? 0).toLocaleString()}</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ غرفة مراقبة موثوقية وجودة البيانات الميدانية (Data Reliability Cockpit) ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-5">
        <h3 className="text-[14px] font-bold text-el-on-surface mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-el-primary" /> غرفة مراقبة جودة وموثوقية البيانات الميدانية (Auditing Cockpit)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. التدقيق الجغرافي */}
          <div className="bg-el-surface-container rounded-lg p-4 flex flex-col justify-between border border-el-outline-variant/60">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-el-on-surface-variant">نسبة التدقيق الجغرافي (GPS)</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">GPS Audited</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-[28px] font-bold text-blue-700 font-mono leading-none">{gpsVerificationRate}%</span>
            </div>
            <div className="w-full mt-2.5">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all rounded-full" style={{ width: `${gpsVerificationRate}%` }} />
              </div>
            </div>
            <p className="text-[9px] text-el-on-surface-variant/75 mt-2">الزيارات الميدانية المؤكدة بموقع جغرافي حقيقي للناخب</p>
          </div>

          {/* 2. مطابقة سجل المفوضية */}
          <div className="bg-el-surface-container rounded-lg p-4 flex flex-col justify-between border border-el-outline-variant/60">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-el-on-surface-variant">التحقق البيومتري (المفوضية)</span>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Registry Match</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-[28px] font-bold text-purple-700 font-mono leading-none">{registryVerificationRate}%</span>
            </div>
            <div className="w-full mt-2.5">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 transition-all rounded-full" style={{ width: `${registryVerificationRate}%` }} />
              </div>
            </div>
            <p className="text-[9px] text-el-on-surface-variant/75 mt-2">نسبة مطابقة كشوف بطاقات الناخب مع السجل الفيدرالي الرسمي</p>
          </div>

          {/* 3. متوسط دقة التقارير الفعلي */}
          <div className="bg-el-surface-container rounded-lg p-4 flex flex-col justify-between border border-el-outline-variant/60">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-el-on-surface-variant">دقة تقارير المفاتيح (Calibrated)</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Report Accuracy</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-[28px] font-bold text-amber-700 font-mono leading-none">{averageKeyAccuracy}%</span>
            </div>
            <div className="w-full mt-2.5">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all rounded-full" style={{ width: `${averageKeyAccuracy}%` }} />
              </div>
            </div>
            <p className="text-[9px] text-el-on-surface-variant/75 mt-2">معيار مصداقية ترشيحات المفاتيح بناءً على عينات التدقيق العشوائية</p>
          </div>

          {/* 4. معدل تحويل الأصوات الخدمي */}
          <div className="bg-el-surface-container rounded-lg p-4 flex flex-col justify-between border border-el-outline-variant/60">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-el-on-surface-variant">معدل كسب الأصوات الخدمي (ROI)</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Service ROI</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-[28px] font-bold text-emerald-700 font-mono leading-none">{serviceConversionRate}%</span>
            </div>
            <div className="w-full mt-2.5">
              <div className="h-2 w-full bg-el-surface rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 transition-all rounded-full" style={{ width: `${serviceConversionRate}%` }} />
              </div>
            </div>
            <p className="text-[9px] text-el-on-surface-variant/75 mt-2">نسبة نجاح تلبية الخدمات في كسب وضمان أصوات المؤيدين</p>
          </div>

        </div>
      </section>

      {/* ═══ خريطة المناطق: أخضر / أصفر / أحمر ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[14px] font-bold text-el-on-surface flex items-center gap-2">
            <MapPin className="w-4 h-4 text-el-primary" /> خريطة المناطق — توزيع القوة جغرافياً
          </h3>
          <div className="flex gap-2 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> قوية ({greenCount})</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400" /> متأرجحة ({yellowCount})</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400" /> ضعيفة ({redCount})</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {areaMap.map((area: any) => (
            <div
              key={area?.district || Math.random().toString()}
              className={`rounded-lg p-3 border-2 transition-all hover:shadow-md ${
                area?.color === 'green' ? 'border-green-300 bg-green-50' :
                area?.color === 'yellow' ? 'border-yellow-300 bg-yellow-50' :
                'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-3 h-3 rounded-full ${
                  area?.color === 'green' ? 'bg-green-500' :
                  area?.color === 'yellow' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`} />
                <span className="text-[13px] font-bold text-el-on-surface">{area?.district || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between text-[11px] text-el-on-surface-variant">
                <span>القوة: <b className="font-mono">{area?.strength ?? 0}%</b></span>
                <span>صافي: <b className="font-mono">{area?.netVotes ?? 0}</b></span>
              </div>
              <div className="text-[10px] text-el-on-surface-variant mt-0.5">{area?.keyCount ?? 0} مفتاح</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ مناطق القوة والضعف جنباً إلى جنب ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* مناطق القوة */}
        <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
          <h3 className="text-[14px] font-bold text-green-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> مناطق القوة
          </h3>
          {strongAreas.length === 0 ? (
            <p className="text-[12px] text-el-on-surface-variant">لا توجد مناطق بقوة ≥ 50%</p>
          ) : (
            <div className="space-y-2">
              {strongAreas.map((a: any) => (
                <div key={a?.district || Math.random().toString()} className="flex justify-between items-center text-[12px] bg-white/60 rounded p-2">
                  <span className="font-semibold text-green-800">{a?.district}</span>
                  <div className="flex gap-3 font-mono text-[11px]">
                    <span>القوة: <b>{a?.strength ?? 0}%</b></span>
                    <span>صافي: <b>{a?.netVotes ?? 0}</b></span>
                    <span>{a?.keyCount ?? 0} مفتاح</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* مناطق الضعف */}
        <div className="bg-red-50/50 border border-red-200 rounded-lg p-4">
          <h3 className="text-[14px] font-bold text-red-800 mb-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> مناطق الضعف
          </h3>
          {weakAreas.length === 0 ? (
            <p className="text-[12px] text-el-on-surface-variant">لا توجد مناطق بقوة &lt; 35%</p>
          ) : (
            <div className="space-y-2">
              {weakAreas.map((a: any) => (
                <div key={a?.district || Math.random().toString()} className="flex justify-between items-center text-[12px] bg-white/60 rounded p-2">
                  <span className="font-semibold text-red-800">{a?.district}</span>
                  <div className="flex gap-3 font-mono text-[11px]">
                    <span>القوة: <b>{a?.strength ?? 0}%</b></span>
                    <span>صافي: <b>{a?.netVotes ?? 0}</b></span>
                    <span>{a?.keyCount ?? 0} مفتاح</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ توزيع القوة جغرافياً ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-5">
        <h3 className="text-[14px] font-bold text-el-on-surface mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-el-primary" /> توزيع القوة والنتائج جغرافياً عبر الأقضية
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* قائمة الأقضية بالتفاصيل */}
          <div className="space-y-3">
            {geoDistribution.map((g: any) => (
              <div key={g?.district || Math.random().toString()} className="bg-el-surface-container/20 border border-el-outline-variant/30 rounded-lg p-3 hover:bg-el-surface-container/30 transition-all">
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="font-bold text-el-on-surface">{g?.district}</span>
                  <span className="font-mono text-el-on-surface-variant font-semibold">
                    {g?.netVotes ?? 0} صوت صافي · {g?.percentage ?? 0}% تأييد · {g?.keyCount ?? 0} مفتاح
                  </span>
                </div>
                <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
                  <div className="bg-el-primary h-full transition-all duration-500 rounded-full" style={{ width: `${g?.percentage ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* مخطط Recharts التفاعلي */}
          <div className="bg-el-surface-container/10 border border-el-outline-variant/40 rounded-xl p-4 h-72 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-el-on-surface-variant mb-2">رسم بياني تفاعلي: الأصوات الصافية لكل قضاء</span>
            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geoDistribution} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--el-outline-variant)" opacity={0.2} vertical={false} />
                  <XAxis dataKey="district" stroke="var(--el-on-surface-variant)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--el-on-surface-variant)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--el-surface-container-lowest)',
                      borderColor: 'var(--el-outline-variant)',
                      borderRadius: '8px',
                      color: 'var(--el-on-surface)',
                      fontSize: '12px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    cursor={{ fill: 'var(--el-surface-container-high)', opacity: 0.2 }}
                  />
                  <Bar dataKey="netVotes" name="الأصوات الصافية" fill="var(--el-primary)" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ترتيب المفاتيح الانتخابية ═══ */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
        <div className="bg-el-surface-container px-4 py-3 border-b border-el-outline-variant">
          <h3 className="text-[14px] font-bold text-el-on-surface flex items-center gap-2">
            <Key className="w-4 h-4 text-el-secondary" /> ترتيب المفاتيح الانتخابية — من الأقوى إلى الأضعف
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[12px]">
            <thead className="bg-el-surface-container border-b border-el-outline-variant text-[10px] font-bold uppercase text-el-on-surface-variant">
              <tr>
                <th className="px-3 py-2 w-10 font-normal">#</th>
                <th className="px-3 py-2 font-normal">الكود</th>
                <th className="px-3 py-2 font-normal">الاسم</th>
                <th className="px-3 py-2 font-normal">القضاء</th>
                <th className="px-3 py-2 font-normal text-center">الأصوات الصافية</th>
                <th className="px-3 py-2 font-normal text-center">التقييم</th>
                <th className="px-3 py-2 font-normal text-center">EII</th>
                <th className="px-3 py-2 font-normal text-center">KRI</th>
                <th className="px-3 py-2 font-normal text-center">DRS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-el-outline-variant/50">
              {keyRanking.map((k: any) => (
                <tr key={k?.code || Math.random().toString()} className={`hover:bg-el-surface-container-low/50 transition-colors ${k?.rank && k.rank <= 3 ? 'bg-el-secondary-container/10' : ''}`}>
                  <td className="px-3 py-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      k?.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                      k?.rank === 2 ? 'bg-gray-300 text-gray-700' :
                      k?.rank === 3 ? 'bg-amber-600 text-white' :
                      'bg-el-surface-variant text-el-on-surface-variant'
                    }`}>
                      {k?.rank ?? '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-el-primary font-semibold">{k?.code}</td>
                  <td className="px-3 py-2 font-medium">
                    {k?.name}
                    {k?.nickname && <span className="text-el-on-surface-variant text-[10px] mr-1">({k.nickname})</span>}
                  </td>
                  <td className="px-3 py-2 text-el-on-surface-variant">{k?.district || '-'}</td>
                  <td className="px-3 py-2 text-center font-mono font-bold text-el-primary">{k?.netVotes ?? 0}</td>
                  <td className="px-3 py-2 text-center font-mono">{k?.weightedScore ?? 0}</td>
                  <td className={`px-3 py-2 text-center font-mono ${(k?.eiiScore ?? 0) >= 60 ? 'text-green-600' : (k?.eiiScore ?? 0) >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {k?.eiiScore ?? 0}
                  </td>
                  <td className={`px-3 py-2 text-center font-mono ${(k?.kriScore ?? 0) >= 60 ? 'text-green-600' : (k?.kriScore ?? 0) >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {k?.kriScore ?? 0}
                  </td>
                  <td className={`px-3 py-2 text-center font-mono ${(k?.drsScore ?? 0) <= 30 ? 'text-green-600' : (k?.drsScore ?? 0) <= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {k?.drsScore ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

``

## File: src\components\election\FieldAgentPortal.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Vote,
  Navigation,
  Camera,
  CheckCircle,
  Map,
  AlertTriangle,
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react';

interface VoterData {
  voters: {
    id: string;
    fullName: string;
    phoneNumber: string;
    district: string;
    confidenceScore: number;
    votedStatus: boolean;
    tribe: { name: string; influence: number } | null;
  }[];
  total: number;
}

interface TaskData {
  tasks: {
    id: string;
    title: string;
    priority: string;
    status: string;
    district: string | null;
  }[];
}

export default function FieldAgentPortal() {
  const [voteStatus, setVoteStatus] = useState(false);
  const [voters, setVoters] = useState<VoterData['voters']>([]);
  const [tasks, setTasks] = useState<TaskData['tasks']>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [voterRes, taskRes] = await Promise.all([
          fetch('/api/voters?limit=10'),
          fetch('/api/tasks?status=PENDING&limit=3'),
        ]);
        const voterData = await voterRes.json();
        const taskData = await taskRes.json();
        setVoters(voterData.voters || []);
        setTasks(taskData.tasks || []);
      } catch (err) {
        console.error('Error fetching field agent data:', err);
      }
    }
    fetchData();
  }, []);

  const currentTask = tasks[0];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Agent Profile & Performance */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-3 mb-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-[18px] leading-[24px] font-semibold text-el-on-surface">مندوب ميداني</h2>
            <p className="text-[12px] leading-[16px] text-el-on-surface-variant">المنطقة المخصصة: ذي قار</p>
          </div>
          <div className="bg-el-primary-container text-el-on-primary-container px-2 py-1 rounded text-[11px] leading-[16px] font-bold tracking-[0.05em]">
            مندوب ميداني
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[12px] leading-[16px] text-el-on-surface-variant mb-1">
            <span>المهام المنجزة اليوم</span>
            <span>3 / 5</span>
          </div>
          <div className="w-full bg-el-surface-container-highest rounded-full h-2">
            <div className="bg-el-primary h-2 rounded-full" style={{ width: '60%' }} />
          </div>
        </div>
      </section>

      {/* Current Task Card */}
      {currentTask && (
        <section className="bg-el-surface-container-lowest border border-el-primary rounded p-3 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden mb-3">
          <div className="absolute top-0 left-0 w-1 h-full bg-el-primary" />
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-el-primary" />
              <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface">المهمة الحالية</h3>
            </div>
            <span className="bg-el-error-container text-el-error text-[11px] leading-[16px] font-bold tracking-[0.05em] px-2 py-1 rounded" style={{ color: '#ba1a1a', backgroundColor: '#ffdad6' }}>
              {currentTask.priority === 'URGENT' ? 'عاجل' : currentTask.priority === 'HIGH' ? 'عالي' : 'عادي'}
            </span>
          </div>
          <p className="text-[14px] leading-[20px] text-el-on-surface mb-3">{currentTask.title}</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-el-primary text-el-on-primary text-[12px] leading-[16px] py-2 rounded flex justify-center items-center gap-1 active:scale-95 transition-transform">
              <Navigation className="w-4 h-4" />
              الحصول على الاتجاهات
            </button>
          </div>
        </section>
      )}

      {/* Voter Search & List */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-3 mb-3">
        <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface mb-2">البحث عن الناخبين</h3>
        <div className="relative mb-3">
          <Search className="absolute right-2 top-2 w-4 h-4 text-el-on-surface-variant" />
          <input
            className="w-full bg-el-surface border border-el-outline-variant rounded h-8 pl-2 pr-8 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
            placeholder="البحث بالاسم أو رقم الهاتف..."
            type="text"
          />
        </div>
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {voters.slice(0, 6).map((voter) => (
            <div key={voter.id} className="flex justify-between items-center p-2 border border-el-outline-variant rounded bg-el-surface-bright">
              <div className="flex flex-col">
                <span className="text-[14px] leading-[20px] text-el-on-surface">{voter.fullName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] leading-[16px] font-medium text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {voter.phoneNumber}
                  </span>
                  {voter.tribe && (
                    <span className="text-[10px] leading-[14px] bg-el-surface-container text-el-on-surface-variant px-1.5 py-0.5 rounded">
                      {voter.tribe.name}
                    </span>
                  )}
                </div>
              </div>
              {voter.votedStatus ? (
                <span className="bg-el-secondary-container text-el-on-secondary-container text-[11px] leading-[16px] font-bold tracking-[0.05em] px-2 py-1 rounded border border-el-secondary">تم التحقق</span>
              ) : (
                <button className="text-el-primary p-1 active:scale-95 transition-transform bg-el-surface-container-high rounded">
                  <Eye className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Verification Flow */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-3 mb-3">
        <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface mb-3 flex items-center gap-2">
          <Vote className="w-5 h-5 text-el-error" />
          تحديث حالة التصويت
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[14px] leading-[20px] text-el-on-surface">حالة الاقتراع</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={voteStatus}
                onChange={(e) => setVoteStatus(e.target.checked)}
              />
              <div className="w-11 h-6 bg-el-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-el-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-el-primary" />
              <span className={`ms-3 text-[12px] leading-[16px] ${voteStatus ? 'text-el-primary font-bold' : 'text-el-on-surface-variant'}`}>
                تم الاقتراع
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 bg-el-surface-container p-2 rounded border border-el-outline-variant">
            <CheckCircle className="w-5 h-5 fill-[#166534] text-white" />
            <div className="flex flex-col">
              <span className="text-[14px] leading-[20px] text-el-on-surface">التحقق من الموقع (GPS)</span>
              <span className="text-[12px] leading-[16px] text-el-on-surface-variant">تطابق الموقع - قرب مركز الاقتراع</span>
            </div>
          </div>

          <div className="border border-dashed border-el-outline-variant rounded p-4 flex flex-col items-center justify-center gap-2 bg-el-surface-bright cursor-pointer hover:bg-el-surface-container-low transition-colors">
            <Camera className="w-8 h-8 text-el-primary" />
            <span className="text-[12px] leading-[16px] text-el-on-surface-variant">تحميل إثبات (صورة الحبر)</span>
          </div>

          <button className="w-full bg-el-primary text-el-on-primary text-[14px] leading-[20px] py-2 rounded active:scale-95 transition-transform mt-2">
            تأكيد وتسجيل
          </button>
        </div>
      </section>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-el-surface-container border-t border-el-outline-variant z-50 flex justify-around items-center h-16 pb-2 pt-2">
        <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold tracking-[0.05em]">الرئيسية</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-el-primary font-bold border-t-2 border-el-primary bg-el-surface-container-high">
          <Vote className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold tracking-[0.05em]">المهام</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors">
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold tracking-[0.05em]">الخريطة</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors relative">
          <AlertTriangle className="w-5 h-5" />
          <span className="absolute top-1 right-3 w-2 h-2 bg-el-error rounded-full" />
          <span className="text-[10px] mt-1 font-bold tracking-[0.05em]">تنبيهات</span>
        </div>
      </nav>
    </div>
  );
}

``

## File: src\components\election\Layout.tsx

``typescript
'use client';

import React, { useState } from 'react';
import Sidebar, { type PageId } from './Sidebar';
import TopBar from './TopBar';

interface LayoutProps {
  activePage: PageId;
  onPageChange: (page: PageId) => void;
  children: React.ReactNode;
  isOwner?: boolean;
  onOwnerPanelOpen?: () => void;
  onLogout?: () => void;
}

export default function Layout({ activePage, onPageChange, children, isOwner, onOwnerPanelOpen, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar
        activePage={activePage}
        onPageChange={onPageChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <TopBar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isOwner={isOwner}
        onOwnerPanelOpen={onOwnerPanelOpen}
        onLogout={onLogout}
      />
      <main className="flex-1 mt-12 md:mr-64 p-4 bg-el-background w-full">
        {children}
      </main>
    </div>
  );
}

``

## File: src\components\election\LoginGate.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Vote, Lock, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginGateProps {
  onLogin: (role: string) => void;
}

export default function LoginGate({ onLogin }: LoginGateProps) {
  const [accessEnabled, setAccessEnabled] = useState<boolean | null>(null);
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch('/api/access');
        const data = await res.json();
        setAccessEnabled(data.enabled);
      } catch {
        setAccessEnabled(true);
      }
    };
    checkAccess();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isOwnerMode
            ? { action: 'owner-login', ownerPassword: password }
            : { action: 'login', password }
        ),
      });
      const data = await res.json();

      if (data.success) {
        // Token is now in httpOnly cookie - no need to store it
        onLogin(data.role || (isOwnerMode ? 'ADMIN' : 'OBSERVER'));
      } else {
        setError(data.message || 'حدث خطأ غير متوقع');
      }
    } catch {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking access
  if (accessEnabled === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Access disabled state
  if (!accessEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-6 max-w-sm">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-card border border-border flex items-center justify-center shadow-lg">
            <Lock className="w-14 h-14 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">النظام معطل حالياً</h1>
          <p className="text-muted-foreground text-base">تم إيقاف الوصول من قبل المالك</p>
          <p className="text-muted-foreground/60 text-sm mt-2 font-mono">يرجى المحاولة لاحقاً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Card Header with subtle background */}
        <div className="px-8 pt-10 pb-6 text-center bg-muted/20 border-b border-border/40">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20 bg-primary/5 text-primary">
            <Vote className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">منصة إدارة الماكينة الانتخابية</h1>
          <p className="text-sm text-muted-foreground font-medium">محافظة ذي قار</p>
        </div>

        {/* Card Body */}
        <div className="px-8 pb-8 pt-6">
          {/* Mode indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {isOwnerMode ? (
              <Shield className="w-4 h-4 text-primary" />
            ) : (
              <Lock className="w-4 h-4 text-secondary" />
            )}
            <span className="text-sm font-medium text-foreground">
              {isOwnerMode ? 'دخول المالك' : 'دخول الزائر'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                {isOwnerMode ? 'كلمة مرور المالك' : 'كلمة المرور'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={isOwnerMode ? 'أدخل كلمة مرور المالك' : 'أدخل كلمة المرور'}
                  className="w-full px-4 py-3 pr-11 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-mono"
                  dir="ltr"
                  autoFocus
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5 text-destructive text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التحقق...
                </span>
              ) : (
                isOwnerMode ? 'دخول كمالك' : 'دخول'
              )}
            </button>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 text-center border-t border-border pt-5">
            {isOwnerMode ? (
              <button
                onClick={() => { setIsOwnerMode(false); setError(''); setPassword(''); }}
                className="text-sm text-primary hover:underline font-semibold transition-colors cursor-pointer"
              >
                دخول الزائر
              </button>
            ) : (
              <button
                onClick={() => { setIsOwnerMode(true); setError(''); setPassword(''); }}
                className="text-sm text-muted-foreground hover:text-foreground font-semibold transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                دخول المالك
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## File: src\components\election\OwnerPanel.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Power, Copy, Eye, EyeOff, LogOut, Check, Loader2, Link as LinkIcon, Key } from 'lucide-react';

interface OwnerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const PASSWORD_MIN_LENGTH = 8;

export default function OwnerPanel({ isOpen, onClose, onLogout }: OwnerPanelProps) {
  const [accessEnabled, setAccessEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAccessStatus = async () => {
    try {
      const res = await fetch('/api/access');
      const data = await res.json();
      setAccessEnabled(data.enabled);
    } catch {
      // default
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccessStatus();
    }
  }, [isOpen]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleAccess = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-access',
          enabled: !accessEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAccessEnabled(data.enabled);
        showMessage('success', data.enabled ? 'تم تفعيل الوصول' : 'تم إيقاف الوصول');
      } else {
        showMessage('error', data.message || 'فشل في تحديث الحالة');
      }
    } catch {
      showMessage('error', 'تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      showMessage('error', 'يرجى إدخال كلمة المرور الحالية');
      return;
    }
    if (!newPassword.trim()) {
      showMessage('error', 'يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      showMessage('error', `كلمة المرور يجب أن تكون ${PASSWORD_MIN_LENGTH} أحرف على الأقل`);
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      showMessage('error', 'كلمة المرور يجب أن تحتوي على أحرف وأرقام');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword,
          newPassword,
        }),
        credentials: 'include', // Send httpOnly cookie
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPassword('');
        setNewPassword('');
        showMessage('success', 'تم تغيير كلمة المرور بنجاح');
      } else {
        showMessage('error', data.message || 'فشل في تغيير كلمة المرور');
      }
    } catch {
      showMessage('error', 'تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel - slides from the right (RTL) */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">لوحة تحكم المالك</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Message Toast */}
          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 border ${
              message.type === 'success'
                ? 'bg-secondary/10 text-secondary border-secondary/20'
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              {message.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          {/* Access Toggle Section */}
          <div className="bg-muted/30 border border-border/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-sm">حالة الوصول</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {accessEnabled ? 'النظام متاح للزوار' : 'النظام معطل عن الزوار'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${accessEnabled ? 'bg-secondary' : 'bg-destructive'} animate-pulse`} />
            </div>

            <button
              onClick={handleToggleAccess}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 border ${
                accessEnabled
                  ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                  : 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20'
              }`}
            >
              <Power className="w-4 h-4" />
              {accessEnabled ? 'إيقاف الوصول' : 'تفعيل الوصول'}
            </button>
          </div>

          {/* Change Password Section */}
          <div className="bg-muted/30 border border-border/50 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">تغيير كلمة مرور المالك</h3>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="كلمة المرور الحالية"
                  className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                  dir="ltr"
                />
                <button
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={`كلمة المرور الجديدة (${PASSWORD_MIN_LENGTH} أحرف على الأقل)`}
                  className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                  dir="ltr"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleChangePassword}
              disabled={loading || !newPassword || !currentPassword}
              className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 hover:opacity-95 transition-colors cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              تغيير كلمة المرور
            </button>
          </div>

          {/* Share Link Section */}
          <div className="bg-muted/30 border border-border/50 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary" />
              رابط المشاركة
            </h3>
            <p className="text-xs text-muted-foreground">شارك هذا الرابط مع الأشخاص الذين تريد منحهم الوصول بعد إعطائهم كلمة المرور</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={typeof window !== 'undefined' ? window.location.href : ''}
                readOnly
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs truncate font-mono"
                dir="ltr"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                  copied
                    ? 'bg-secondary/10 text-secondary border border-secondary/20'
                    : 'bg-primary text-primary-foreground hover:opacity-95'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'تم النسخ' : 'نسخ'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/10">
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm border border-destructive/20 hover:bg-destructive/20 transition-colors cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            تسجيل خروج
          </button>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

``

## File: src\components\election\PublicOpinion.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Heart, TrendingUp, AlertCircle, Plus, Smile, Meh, Frown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PublicOpinion() {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    indicatorType: 'مزاج_شعبي',
    value: '',
    numericValue: '70',
    severity: 'عادي',
    source: 'استبيانات الفرق الميدانية',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchIndicators();
  }, []);

  const fetchIndicators = async () => {
    try {
      const res = await fetch('/api/dynamic-indicators');
      const data = await res.json();
      setIndicators(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/dynamic-indicators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({ title: 'نجاح', description: 'تم تسجيل مؤشر رأي عام جديد' });
        setShowAddForm(false);
        setFormData({
          indicatorType: 'مزاج_شعبي',
          value: '',
          numericValue: '70',
          severity: 'عادي',
          source: 'استبيانات الفرق الميدانية',
        });
        fetchIndicators();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'إيجابي': return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] px-2 py-0.5 rounded font-bold flex items-center gap-1"><Smile className="w-3.5 h-3.5" /> إيجابي</span>;
      case 'سلبي': return <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[11px] px-2 py-0.5 rounded font-bold flex items-center gap-1"><Frown className="w-3.5 h-3.5" /> سلبي</span>;
      default: return <span className="bg-zinc-50 text-zinc-700 border border-zinc-100 text-[11px] px-2 py-0.5 rounded font-bold flex items-center gap-1"><Meh className="w-3.5 h-3.5" /> عادي</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[28px] leading-[36px] font-bold text-el-primary">نظام قياس الرأي العام والنبض</h2>
          <p className="text-el-on-surface-variant text-[14px]">تتبع اتجاهات الشارع في ذي قار، قياس الرضا، والقضايا الخدمية والسياسية المؤثرة</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-el-primary text-el-on-primary py-2 px-4 rounded flex items-center gap-2 text-[14px] font-medium shadow active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          تسجيل مؤشر رأي جديد
        </button>
      </div>

      {showAddForm && (
        <Card className="border-el-outline-variant bg-el-surface-container">
          <CardHeader>
            <CardTitle className="text-[18px]">رصد اتجاه رأي جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">نوع المؤشر *</label>
                <select
                  value={formData.indicatorType}
                  onChange={e => setFormData({ ...formData, indicatorType: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                >
                  <option value="مزاج_شعبي">مزاج شعبي عام</option>
                  <option value="قضايا_ساخنة">قضايا ساخنة ومطالب</option>
                  <option value="اتجاه_رأي">اتجاه رأي حول المرشح</option>
                  <option value="قوة_خصوم">تحركات وقوة الخصوم</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">النسبة التقديرية أو القيمة الرقمية (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.numericValue}
                  onChange={e => setFormData({ ...formData, numericValue: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">التصنيف والاتجاه</label>
                <select
                  value={formData.severity}
                  onChange={e => setFormData({ ...formData, severity: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                >
                  <option value="إيجابي">إيجابي / رضا</option>
                  <option value="عادي">عادي / متأرجح</option>
                  <option value="سلبي">سلبي / استياء</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">مصدر الرصد</label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value })}
                  placeholder="مثال: استبيانات ميدانية، منصات التواصل"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[12px] font-bold">وصف وتفاصيل التوجه العام للرأي</label>
                <textarea
                  required
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  placeholder="وصف تفصيلي لما يطرحه الشارع والناخبين..."
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px] h-20"
                />
              </div>

              <div className="flex justify-end gap-2 md:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-el-outline rounded text-[14px] font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-el-primary text-el-on-primary text-[14px] font-bold rounded"
                >
                  حفظ وتسجيل المؤشر
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">جاري تحميل مؤشرات الرأي العام...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {indicators.map((ind: any) => (
            <Card key={ind.id} className="border-el-outline-variant hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <span className="bg-el-secondary-container text-el-on-secondary-container text-[11px] px-2 py-0.5 rounded font-bold">
                    {ind.indicatorType.replace('_', ' ')}
                  </span>
                  {getSeverityBadge(ind.severity)}
                </div>
                <CardTitle className="text-[16px] leading-[22px] mt-2 font-bold flex justify-between items-center">
                  <span>مستوى الدعم/التأثير:</span>
                  <span className="text-el-primary text-[20px] font-black">{ind.numericValue}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-[13px] space-y-3 border-t border-el-outline-variant mt-2">
                <p className="text-el-on-surface font-medium leading-[20px]">{ind.value}</p>
                <div className="pt-2 flex justify-between text-[11px] text-zinc-400 border-t border-zinc-100">
                  <span>المصدر: {ind.source}</span>
                  <span>{new Date(ind.recordedAt || ind.createdAt).toLocaleDateString('ar-IQ')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

``

## File: src\components\election\ServicesManagement.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wrench, CheckCircle, Clock, AlertCircle, Plus, Users, Landmark, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ServicesManagement() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: 'MUNICIPAL',
    priority: 'NORMAL',
    status: 'PENDING',
    assignedTo: '',
    estimatedCost: '',
    estimatedVotesImpact: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({ title: 'نجاح', description: 'تم تسجيل الطلب الخدمي بنجاح' });
        setShowAddForm(false);
        setFormData({
          title: '',
          description: '',
          serviceType: 'MUNICIPAL',
          priority: 'NORMAL',
          status: 'PENDING',
          assignedTo: '',
          estimatedCost: '',
          estimatedVotesImpact: '',
        });
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        toast({ title: 'نجاح', description: 'تم تحديث حالة الخدمة' });
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'IN_PROGRESS': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <AlertCircle className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MUNICIPAL': return 'بلدية وبنى تحتية';
      case 'HEALTH': return 'رعاية صحية وتأمين طبي';
      case 'EMPLOYMENT': return 'توظيف وتعيينات';
      case 'FINANCIAL': return 'دعم مالي وتسهيلات';
      default: return 'إدارية ومعاملات';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[28px] leading-[36px] font-bold text-el-primary">نظام الخدمات والمساعدات</h2>
          <p className="text-el-on-surface-variant text-[14px]">متابعة وتلبية متطلبات المواطنين لتعزيز الثقة الانتخابية في ذي قار</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-el-primary text-el-on-primary py-2 px-4 rounded flex items-center gap-2 text-[14px] font-medium shadow active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          تسجيل طلب خدمي جديد
        </button>
      </div>

      {showAddForm && (
        <Card className="border-el-outline-variant bg-el-surface-container">
          <CardHeader>
            <CardTitle className="text-[18px]">طلب خدمي جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">عنوان الطلب الخدمي *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: تبليط زقاق أو توفير محولة"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">نوع الخدمة</label>
                <select
                  value={formData.serviceType}
                  onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                >
                  <option value="MUNICIPAL">بلدية وبنى تحتية</option>
                  <option value="HEALTH">رعاية صحية وتأمين طبي</option>
                  <option value="EMPLOYMENT">توظيف وتعيينات</option>
                  <option value="FINANCIAL">دعم مالي وتسهيلات</option>
                  <option value="ADMINISTRATIVE">إدارية ومعاملات</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[12px] font-bold">تفاصيل الطلب والاحتياجات</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="تفاصيل إضافية..."
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px] h-20"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">المسؤول عن المتابعة</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="اسم المشرف أو المندوب"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">الأصوات المتأثرة المتوقعة</label>
                <input
                  type="number"
                  value={formData.estimatedVotesImpact}
                  onChange={e => setFormData({ ...formData, estimatedVotesImpact: e.target.value })}
                  placeholder="عدد الأصوات كسباً"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex justify-end gap-2 md:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-[14px] font-bold border border-el-outline rounded"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-el-primary text-el-on-primary text-[14px] font-bold rounded"
                >
                  حفظ وتسجيل
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">جاري تحميل طلبات الخدمات...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((serv: any) => (
            <Card key={serv.id} className="border-el-outline-variant hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="bg-el-primary-container text-el-on-primary-container text-[11px] px-2 py-0.5 rounded font-bold">
                    {getTypeLabel(serv.serviceType)}
                  </span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(serv.status)}
                    <span className="text-[12px] font-bold">
                      {serv.status === 'COMPLETED' ? 'مكتمل' : serv.status === 'IN_PROGRESS' ? 'قيد التنفيذ' : 'معلق'}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-[16px] leading-[22px] mt-2 font-bold">{serv.title}</CardTitle>
                <CardDescription className="text-[12px]">{serv.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-[13px] space-y-2 border-t border-el-outline-variant mt-2">
                <div className="flex justify-between text-zinc-500">
                  <span>المتابعة:</span>
                  <span className="font-bold text-el-on-surface">{serv.assignedTo || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>التأثير الانتخابي:</span>
                  <span className="font-bold text-emerald-600">{serv.estimatedVotesImpact} صوت</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>التكلفة التقديرية:</span>
                  <span className="font-bold text-amber-700">{serv.estimatedCost.toLocaleString()} د.ع</span>
                </div>

                <div className="pt-3 flex gap-2 justify-end">
                  {serv.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleUpdateStatus(serv.id, 'COMPLETED')}
                      className="bg-emerald-600 text-white text-[12px] font-bold py-1 px-3 rounded hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      تأكيد الإنجاز
                    </button>
                  )}
                  {serv.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(serv.id, 'IN_PROGRESS')}
                      className="bg-amber-600 text-white text-[12px] font-bold py-1 px-3 rounded hover:bg-amber-700 active:scale-95 transition-all"
                    >
                      بدء التنفيذ
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

``

## File: src\components\election\Sidebar.tsx

``typescript
'use client';

import React from 'react';
import {
  LayoutDashboard,
  Network,
  ClipboardList,
  Megaphone,
  Activity,
  MessageSquare,
  Settings,
  HelpCircle,
  Vote,
  Users,
  UserPlus,
  Key,
  BarChart3,
  AlertTriangle,
  Brain,
  Wrench,
  ShieldAlert,
  FileText,
  Users2
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'tribes'
  | 'voters'
  | 'electoral-keys'
  | 'services'
  | 'tasks'
  | 'volunteers'
  | 'public-opinion'
  | 'competitors'
  | 'data-analysis'
  | 'early-warnings'
  | 'advanced-indicators'
  | 'fieldagent'
  | 'comms'
  | 'warroom'
  | 'commission'
  | 'sms';

interface SidebarProps {
  activePage: PageId;
  onPageChange: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { id: PageId; label: string; description: string; icon: React.ElementType; section?: string }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', description: 'نظرة عامة على الانتخابات', icon: LayoutDashboard, section: 'الرئيسية' },
  
  { id: 'voters', label: 'تسجيل الناخبين', description: 'إضافة وبحث الناخبين مع GPS', icon: UserPlus, section: 'العمليات الميدانية' },
  { id: 'electoral-keys', label: 'المفاتيح الانتخابية', description: 'إدارة وتقييم المفاتيح', icon: Key, section: 'العمليات الميدانية' },
  { id: 'tribes', label: 'إدارة العشائر', description: 'العشائر والحمائل في ذي قار', icon: Users, section: 'العمليات الميدانية' },
  { id: 'services', label: 'نظام الخدمات والمساعدات', description: 'تلبية ومتابعة طلبات المواطنين', icon: Wrench, section: 'العمليات الميدانية' },
  { id: 'tasks', label: 'تتبع المهام الميدانية', description: 'إدارة وتوجيه المهام والزيارات', icon: ClipboardList, section: 'العمليات الميدانية' },
  { id: 'volunteers', label: 'إدارة الكوادر والمتطوعين', description: 'تنظيم شؤون المندوبين والمشرفين', icon: Users2, section: 'العمليات الميدانية' },
  
  { id: 'public-opinion', label: 'نظام الرأي العام والنبض', description: 'مؤشرات اتجاه الشارع والرضا', icon: MessageSquare, section: 'التحليل والذكاء' },
  { id: 'competitors', label: 'نظام المنافسين والخصوم', description: 'تتبع الخصوم والخطط المضادة', icon: ShieldAlert, section: 'التحليل والذكاء' },
  { id: 'advanced-indicators', label: 'التنبؤ والذكاء الاصطناعي', description: '70 مؤشر تحليلي ذكي للتوقع', icon: Brain, section: 'التحليل والذكاء' },
  { id: 'data-analysis', label: 'تحليل البيانات الشامل', description: 'منظومة تحليل متكاملة', icon: BarChart3, section: 'التحليل والذكاء' },
  { id: 'commission', label: 'بيانات المفوضية', description: 'السجلات الانتخابية وتوزيع الأقضية', icon: FileText, section: 'التحليل والذكاء' },
  { id: 'early-warnings', label: 'مراقب الإنذار المبكر', description: 'مؤشرات التهديدات والفرص', icon: AlertTriangle, section: 'التحليل والذكاء' },
  
  { id: 'fieldagent', label: 'بوابة المندوب الميداني', description: 'تأكيد الحضور وتحديث الميدان', icon: Network, section: 'الاتصال السياسي' },
  { id: 'comms', label: 'محرك الاتصالات السياسية', description: 'إدارة حملات التواصل السياسي', icon: Megaphone, section: 'الاتصال السياسي' },
  { id: 'warroom', label: 'غرفة عمليات الاقتراع', description: 'متابعة مباشرة ليوم التصويت والفرز', icon: Activity, section: 'يوم الحسم' },
];

export default function Sidebar({ activePage, onPageChange, isOpen, onClose }: SidebarProps) {
  const handleNavClick = (pageId: PageId) => {
    onPageChange(pageId);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed right-0 top-0 h-full z-50 w-64 flex flex-col
          bg-el-surface-container border-l border-el-outline-variant
          pt-12 pb-4 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-el-outline-variant mb-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded bg-el-primary-container text-el-on-primary-container flex items-center justify-center mb-2">
            <Vote className="w-8 h-8" />
          </div>
          <h1 className="text-[24px] leading-[32px] font-semibold text-el-primary text-center">
            الماكينة الانتخابية
          </h1>
          <p className="text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mt-1">
            ذي قار - لوحة التحكم
          </p>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {(() => {
            let lastSection = '';
            const itemsWithHeaders = navItems.map((item) => {
              const showSection = item.section && item.section !== lastSection;
              if (item.section) lastSection = item.section;
              return { ...item, showSection };
            });

            return itemsWithHeaders.map((item) => {
              const isActive = activePage === item.id;
              const Icon = item.icon;
              return (
                <React.Fragment key={item.id}>
                  {item.showSection && (
                    <div className="text-[10px] leading-[14px] font-bold tracking-[0.1em] text-el-on-surface-variant/60 uppercase mt-3 mb-1 px-3">
                      {item.section}
                    </div>
                  )}
                  <button
                    onClick={() => handleNavClick(item.id)}
                    title={item.description}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded w-full text-right cursor-pointer
                      active:scale-95 transition-all
                      ${
                        isActive
                           ? 'bg-el-secondary-container text-el-on-secondary-container font-semibold'
                           : 'text-el-on-surface-variant hover:bg-el-surface-container-highest'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <div className="flex flex-col text-right">
                      <span className="text-[14px] leading-[20px]">{item.label}</span>
                      <span className="text-[10px] leading-[14px] text-el-on-surface-variant opacity-70">{item.description}</span>
                    </div>
                  </button>
                </React.Fragment>
              );
            });
          })()}
        </div>

        {/* Footer */}
        <div className="px-4 mt-auto space-y-4">
          <button
            onClick={() => handleNavClick('sms')}
            className="w-full bg-el-primary text-el-on-primary py-2 px-4 rounded text-[14px] leading-[20px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <MessageSquare className="w-[18px] h-[18px]" />
            بث رسائل
          </button>
          <div className="pt-2 border-t border-el-outline-variant space-y-1">
            <button className="flex items-center gap-3 px-3 py-2 rounded text-el-on-surface-variant hover:bg-el-surface-container-highest transition-all cursor-pointer active:scale-95 w-full">
              <Settings className="w-5 h-5" />
              <span className="text-[14px] leading-[20px]">الإعدادات</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded text-el-on-surface-variant hover:bg-el-surface-container-highest transition-all cursor-pointer active:scale-95 w-full">
              <HelpCircle className="w-5 h-5" />
              <span className="text-[14px] leading-[20px]">المساعدة</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

``

## File: src\components\election\SMSBroadcasting.tsx

``typescript
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Send,
} from 'lucide-react';

interface Tribe {
  id: string;
  name: string;
  influence: number;
  district: string | null;
  voterCount: number;
}

const DISTRICTS = ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'قلعة سكر', 'عشيرة', 'البطحاء'];

export default function SMSBroadcasting() {
  const [confidenceScore, setConfidenceScore] = useState<number[]>([4, 5]);
  const [smsText, setSmsText] = useState('');
  const [influenceValue, setInfluenceValue] = useState(5);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTribe, setSelectedTribe] = useState('');
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const charCount = smsText.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  useEffect(() => {
    let cancelled = false;
    async function loadTribes() {
      try {
        const res = await fetch('/api/tribes');
        const data = await res.json();
        if (!cancelled) setTribes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching tribes:', err);
      }
    }
    loadTribes();
    return () => { cancelled = true; };
  }, []);

  const estimatedReach = useMemo(() => {
    let reach = 50;
    if (selectedDistrict) reach = Math.floor(reach * 0.3);
    if (selectedTribe) reach = Math.floor(reach * 0.1);
    if (confidenceScore.length > 0) reach = Math.floor(reach * (confidenceScore.length / 5));
    return reach;
  }, [selectedDistrict, selectedTribe, confidenceScore]);

  const filteredTribes = tribes.filter(
    (t) => !selectedDistrict || t.district === selectedDistrict
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-el-outline-variant pb-2 mb-4">
        <div>
          <h2 className="text-[18px] leading-[24px] font-semibold text-el-primary">لوحة بث رسائل SMS</h2>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">قم بتكوين وإطلاق حملات SMS المستهدفة في ذي قار.</p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Left Column: Filtering (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-el-surface rounded border border-el-outline-variant p-4">
            <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant border-b border-el-outline-variant pb-2 mb-3">استهداف الجمهور</h3>
            <div className="space-y-4">
              {/* Governorate/District */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">المحافظة / القضاء</label>
                <select
                  className="w-full h-8 px-2 bg-el-surface text-el-on-surface border border-el-outline-variant rounded text-[12px] leading-[16px] focus:border-el-primary focus:ring-1 focus:ring-el-primary outline-none cursor-pointer"
                  value={selectedDistrict}
                  onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedTribe(''); }}
                >
                  <option value="">جميع أقضية ذي قار</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Tribe Targeting */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">العشيرة (اختياري)</label>
                <select
                  className="w-full h-8 px-2 bg-el-surface text-el-on-surface border border-el-outline-variant rounded text-[12px] leading-[16px] focus:border-el-primary focus:ring-1 focus:ring-el-primary outline-none cursor-pointer"
                  value={selectedTribe}
                  onChange={(e) => setSelectedTribe(e.target.value)}
                >
                  <option value="">جميع العشائر</option>
                  {filteredTribes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.voterCount} ناخب)</option>
                  ))}
                </select>
              </div>

              {/* Confidence Score */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">درجة الثقة (نجوم)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => {
                        if (confidenceScore.includes(score)) {
                          setConfidenceScore(confidenceScore.filter((s) => s !== score));
                        } else {
                          setConfidenceScore([...confidenceScore, score]);
                        }
                      }}
                      className={`flex-1 h-8 border rounded text-[12px] leading-[16px] font-medium transition-colors ${
                        confidenceScore.includes(score)
                          ? 'border-el-secondary bg-el-secondary-container text-el-on-secondary-container'
                          : 'border-el-secondary text-el-secondary hover:bg-el-secondary-container hover:text-el-on-secondary-container'
                      }`}
                      style={{ fontFamily: 'var(--font-geist-mono)' }}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voted Status */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">حالة التصويت</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-[12px] leading-[16px] cursor-pointer">
                    <input defaultChecked className="rounded-sm border-el-outline-variant h-4 w-4 text-el-primary" type="checkbox" />
                    لم يصوت
                  </label>
                  <label className="flex items-center gap-2 text-[12px] leading-[16px] cursor-pointer">
                    <input className="rounded-sm border-el-outline-variant h-4 w-4 text-el-primary" type="checkbox" />
                    صوّت
                  </label>
                </div>
              </div>

              {/* Influence Weight */}
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface mb-1">تأثير الشبكة العشائرية</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={influenceValue}
                  onChange={(e) => setInfluenceValue(Number(e.target.value))}
                  className="w-full h-1 bg-el-outline-variant rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[12px] leading-[16px] font-medium text-el-outline mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  <span>عالي</span>
                  <span>منخفض</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-el-outline-variant flex justify-between items-center">
              <span className="text-[12px] leading-[16px] font-medium text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>الوصول التقديري:</span>
              <span className="text-[12px] leading-[16px] font-bold text-el-primary" style={{ fontFamily: 'var(--font-geist-mono)' }}>{estimatedReach.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Composer & Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-2">
          {/* Top Row: Composer and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Composer */}
            <div className="bg-el-surface rounded border border-el-outline-variant flex flex-col">
              <div className="bg-el-surface-container-lowest px-4 py-2 border-b border-el-outline-variant flex justify-between items-center">
                <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface">منشئ الحملة</h3>
                <div className="flex gap-2">
                  <button className="text-[10px] border border-el-outline-variant px-2 py-1 rounded bg-el-surface hover:bg-el-surface-container text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>{'{voter_name}'}</button>
                  <button className="text-[10px] border border-el-outline-variant px-2 py-1 rounded bg-el-surface hover:bg-el-surface-container text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>{'{polling_center}'}</button>
                </div>
              </div>
              <div className="p-4 flex-1">
                <textarea
                  className="w-full h-32 p-2 border border-el-outline-variant rounded bg-el-surface text-el-on-surface text-[12px] leading-[16px] resize-none focus:border-el-primary focus:ring-1 focus:ring-el-primary outline-none"
                  placeholder="أدخل رسالة SMS هنا..."
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[12px] leading-[16px] font-medium text-el-outline" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    الأحرف: {charCount} / 160 ({smsCount} SMS)
                  </span>
                </div>
              </div>
            </div>

            {/* Overview / Quota */}
            <div className="bg-el-primary-container text-el-on-primary-container rounded p-4 border border-el-primary-container relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Radio className="w-[120px] h-[120px]" />
              </div>
              <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] mb-4 relative z-10" style={{ color: '#d8e2ff' }}>نظرة عامة على البث</h3>
              <div className="space-y-4 relative z-10">
                <div>
                  <div className="flex justify-between text-[12px] leading-[16px] font-medium mb-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    <span>استخدام الحصة اليومية</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#364768' }}>
                    <div className="bg-el-secondary-container h-1.5 rounded-full" style={{ width: '45%' }} />
                  </div>
                  <div className="text-right text-[10px] leading-[16px] font-medium mt-1" style={{ color: '#b6c6ef', fontFamily: 'var(--font-geist-mono)' }}>
                    45,000 / 100,000 SMS
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2" style={{ borderTop: '1px solid #364768' }}>
                  <div>
                    <div className="text-[18px] leading-[24px] font-semibold">12k</div>
                    <div className="text-[11px] leading-[16px] font-bold tracking-[0.05em]" style={{ color: '#b6c6ef' }}>مرسل</div>
                  </div>
                  <div>
                    <div className="text-[18px] leading-[24px] font-semibold">11.8k</div>
                    <div className="text-[11px] leading-[16px] font-bold tracking-[0.05em]" style={{ color: '#b6c6ef' }}>تم التسليم</div>
                  </div>
                  <div>
                    <div className="text-[18px] leading-[24px] font-semibold" style={{ color: '#ffdad6' }}>200</div>
                    <div className="text-[11px] leading-[16px] font-bold tracking-[0.05em]" style={{ color: '#b6c6ef' }}>فشل</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voter Preview Table */}
          <div className="bg-el-surface rounded border border-el-outline-variant overflow-hidden">
            <div className="bg-el-surface-container-lowest px-4 py-2 border-b border-el-outline-variant flex justify-between items-center">
              <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface">معاينة الناخبين</h3>
              <span className="text-[10px] font-medium text-el-outline" style={{ fontFamily: 'var(--font-geist-mono)' }}>عرض 5 من {estimatedReach.toLocaleString()}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-el-surface-container-low border-b border-el-outline-variant">
                  <tr>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">الاسم (مخفي)</th>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">الهاتف</th>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">القضاء</th>
                    <th className="px-4 py-2 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant font-normal">مركز الاقتراع</th>
                  </tr>
                </thead>
                <tbody className="text-[12px] leading-[16px] font-medium text-el-on-surface divide-y divide-el-outline-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  <tr className="hover:bg-el-surface-container-lowest transition-colors">
                    <td className="px-4 py-2 h-9">أح*** ***</td>
                    <td className="px-4 py-2 h-9">+964 770 *** ****</td>
                    <td className="px-4 py-2 h-9">الناصرية</td>
                    <td className="px-4 py-2 h-9">مدرسة الناصرية</td>
                  </tr>
                  <tr className="bg-el-surface-container-low hover:bg-el-surface-container-lowest transition-colors">
                    <td className="px-4 py-2 h-9">فاط*** ***</td>
                    <td className="px-4 py-2 h-9">+964 770 *** ****</td>
                    <td className="px-4 py-2 h-9">الشطرة</td>
                    <td className="px-4 py-2 h-9">مدرسة الشطرة</td>
                  </tr>
                  <tr className="hover:bg-el-surface-container-lowest transition-colors">
                    <td className="px-4 py-2 h-9">حس*** ***</td>
                    <td className="px-4 py-2 h-9">+964 770 *** ****</td>
                    <td className="px-4 py-2 h-9">سوق الشيوخ</td>
                    <td className="px-4 py-2 h-9">مركز الشيوخ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 bg-el-primary text-el-on-primary px-6 py-2 rounded shadow-sm hover:opacity-90 transition-all active:scale-95 border border-el-primary-container">
              <Send className="w-[18px] h-[18px]" />
              <span className="text-[18px] leading-[24px] font-semibold">إطلاق البث</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

``

## File: src\components\election\TaskTracking.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  ListChecks,
  Clock,
  CheckCircle,
  Timer,
  PlusCircle,
  Download,
  SlidersHorizontal,
  MoreVertical,
  Search,
  ChevronDown,
} from 'lucide-react';

const DISTRICTS = ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'قلعة سكر', 'عشيرة', 'البطحاء'];

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  taskType: string;
  district: string | null;
  impactEstimate: string | null;
  targetVoter: { id: string; fullName: string; phoneNumber: string; confidenceScore: number } | null;
  assignedTo: { id: string; name: string; district: string | null } | null;
  createdAt: string;
}

interface TaskData {
  tasks: Task[];
  statusCounts: { status: string; _count: { id: number } }[];
}

const priorityLabels: Record<string, string> = {
  URGENT: 'عاجل',
  HIGH: 'عالي',
  NORMAL: 'متوسط',
  LOW: 'عادي',
};

const priorityColors: Record<string, string> = {
  URGENT: 'border-[#dc3545] text-[#dc3545] bg-[#fff5f5]',
  HIGH: 'border-el-secondary text-el-secondary bg-el-secondary-fixed',
  NORMAL: 'border-el-secondary text-el-secondary bg-el-secondary-fixed',
  LOW: 'border-el-outline text-el-on-surface-variant bg-el-surface-container',
};

const statusLabels: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

export default function TaskTracking() {
  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    async function fetchTasks() {
      try {
        const params = new URLSearchParams();
        if (filterDistrict) params.set('district', filterDistrict);
        if (filterStatus) params.set('status', filterStatus);
        const res = await fetch(`/api/tasks?${params.toString()}`);
        const data = await res.json();
        setTaskData(data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [filterDistrict, filterStatus]);

  const tasks = Array.isArray(taskData?.tasks) ? taskData.tasks : [];
  const statusCounts = Array.isArray(taskData?.statusCounts) ? taskData.statusCounts : [];

  const totalTasks = statusCounts.reduce((sum, sc) => sum + sc._count.id, 0);
  const pendingCount = statusCounts.find((sc) => sc.status === 'PENDING')?._count.id || 0;
  const inProgressCount = statusCounts.find((sc) => sc.status === 'IN_PROGRESS')?._count.id || 0;
  const completedCount = statusCounts.find((sc) => sc.status === 'COMPLETED')?._count.id || 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-el-on-surface-variant">جاري التحميل...</div>;
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-[32px] leading-[40px] font-bold text-el-primary mb-1" style={{ letterSpacing: '-0.02em' }}>
            نظام تتبع المهام الميدانية - ذي قار
          </h1>
          <p className="text-[14px] leading-[20px] text-el-on-surface-variant">
            إدارة وتوجيه فرق العمل الميدانية في محافظة ذي قار
          </p>
        </div>
        <button className="bg-el-primary text-el-on-primary px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-all shadow-sm">
          <PlusCircle className="w-[18px] h-[18px]" />
          <span className="text-[14px] leading-[20px] font-medium">إضافة مهمة جديدة</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-el-surface-container-low border border-el-outline-variant p-4 rounded-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[18px] leading-[24px] font-semibold text-el-on-surface">إجمالي المهام</span>
            <div className="p-1.5 bg-el-primary-container text-el-on-primary-container rounded">
              <ListChecks className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] leading-[40px] font-bold text-el-primary" style={{ letterSpacing: '-0.02em' }}>{totalTasks}</span>
            <span className="text-[12px] leading-[16px] text-el-on-surface-variant">في ذي قار</span>
          </div>
        </div>

        <div className="bg-el-surface-container-low border border-el-outline-variant p-4 rounded-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-el-secondary-container opacity-20 rounded-full blur-xl" />
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[18px] leading-[24px] font-semibold text-el-on-surface">مهام قيد التنفيذ</span>
            <div className="p-1.5 bg-el-secondary-container text-el-on-secondary-container rounded">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-[32px] leading-[40px] font-bold text-el-secondary" style={{ letterSpacing: '-0.02em' }}>{inProgressCount + pendingCount}</span>
            <span className="text-[12px] leading-[16px] text-el-outline">تحتاج متابعة</span>
          </div>
        </div>

        <div className="bg-el-surface-container-low border border-el-outline-variant p-4 rounded-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[18px] leading-[24px] font-semibold text-el-on-surface">مهام مكتملة</span>
            <div className="p-1.5 bg-[#d4edda] text-[#155724] rounded">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] leading-[40px] font-bold text-el-on-surface" style={{ letterSpacing: '-0.02em' }}>{completedCount}</span>
            <span className="text-[12px] leading-[16px] text-[#155724]">منجز</span>
          </div>
          <div className="w-full bg-el-surface-variant h-1.5 rounded mt-3 overflow-hidden">
            <div className="bg-el-primary h-full rounded" style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="bg-el-surface-container-low border border-el-outline-variant p-4 rounded-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[18px] leading-[24px] font-semibold text-el-on-surface">نسبة الإنجاز</span>
            <div className="p-1.5 bg-[#ffddb1] text-[#5d4217] rounded">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] leading-[40px] font-bold text-el-on-surface" style={{ letterSpacing: '-0.02em' }}>
              {totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0}%
            </span>
            <span className="text-[12px] leading-[16px] text-el-on-surface-variant">من المهام</span>
          </div>
        </div>
      </div>

      {/* Main Content Area with Table and Filtering Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-el-surface border border-el-outline-variant rounded-sm overflow-hidden flex flex-col">
          <div className="p-3 bg-el-surface-container-lowest border-b border-el-outline-variant flex justify-between items-center bg-opacity-80 backdrop-blur-sm sticky top-0">
            <div className="flex items-center gap-2">
              <span className="text-[18px] leading-[24px] font-semibold">سجل المهام النشطة</span>
              <span className="px-2 py-0.5 bg-el-primary-fixed text-el-on-primary-fixed rounded-full text-[10px] font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>LIVE</span>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 text-el-on-surface-variant border border-el-outline-variant rounded hover:bg-el-surface-container transition-colors">
                <Download className="w-[18px] h-[18px]" />
              </button>
              <button className="p-1.5 text-el-on-surface-variant border border-el-outline-variant rounded hover:bg-el-surface-container transition-colors">
                <SlidersHorizontal className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-el-surface-container-low border-b border-el-outline-variant">
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant w-12 text-center">حالة</th>
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant">الأولوية</th>
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant min-w-[200px]">عنوان المهمة</th>
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant">المندوب / المنطقة</th>
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant">التأثير المتوقع</th>
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant w-10">إجراء</th>
                </tr>
              </thead>
              <tbody className="text-[12px] leading-[16px] divide-y divide-el-outline-variant">
                {tasks.map((task, index) => {
                  const isCompleted = task.status === 'COMPLETED';
                  return (
                    <tr key={task.id} className={`hover:bg-el-surface-container-lowest transition-colors h-9 ${index % 2 === 1 ? 'bg-el-surface-container-low/30' : ''}`}>
                      <td className="py-1 px-3 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : task.status === 'IN_PROGRESS' ? 'bg-el-secondary-container/30 text-el-on-secondary-container' : 'bg-el-surface-variant text-el-on-surface-variant'}`}>
                          {statusLabels[task.status] || task.status}
                        </span>
                      </td>
                      <td className="py-1 px-3">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${priorityColors[task.priority] || ''}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${task.priority === 'URGENT' ? 'bg-[#dc3545]' : task.priority === 'HIGH' ? 'bg-el-secondary' : 'bg-el-outline'}`} />
                          {priorityLabels[task.priority] || task.priority}
                        </span>
                      </td>
                      <td className={`py-1 px-3 font-medium text-el-on-surface ${isCompleted ? 'line-through text-el-outline' : ''}`}>{task.title}</td>
                      <td className="py-1 px-3 text-el-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-el-primary-container text-el-on-primary-container flex items-center justify-center text-[10px] font-bold">
                            {task.assignedTo?.name?.charAt(0) || '؟'}
                          </div>
                          {task.assignedTo?.name || 'غير محدد'} <span className="text-el-outline text-[10px]">({task.district || 'ذي قار'})</span>
                        </div>
                      </td>
                      <td className="py-1 px-3">
                        <span className="text-el-secondary font-medium">{task.impactEstimate || '—'}</span>
                      </td>
                      <td className="py-1 px-3 text-center">
                        <button className="text-el-outline hover:text-el-primary transition-colors"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-el-on-surface-variant">لا توجد مهام</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-el-outline-variant bg-el-surface-container-lowest text-center flex justify-between items-center text-[12px] leading-[16px] text-el-outline">
            <span>عرض {tasks.length} من أصل {totalTasks} مهمة</span>
          </div>
        </div>

        {/* Filtering Sidebar */}
        <aside className="w-full lg:w-72 bg-el-surface border border-el-outline-variant rounded-sm p-4 h-fit sticky top-16">
          <div className="flex items-center gap-2 mb-4 border-b border-el-outline-variant pb-2">
            <SlidersHorizontal className="w-5 h-5 text-el-primary" />
            <h3 className="text-[18px] leading-[24px] font-semibold">عوامل التصفية</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">القضاء</label>
              <div className="relative">
                <select
                  className="w-full bg-el-surface-container-low border border-el-outline-variant rounded p-2 text-[12px] leading-[16px] appearance-none pr-8 cursor-pointer"
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                >
                  <option value="">الكل</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">حالة المهمة</label>
              <div className="relative">
                <select
                  className="w-full bg-el-surface-container-low border border-el-outline-variant rounded p-2 text-[12px] leading-[16px] appearance-none pr-8 cursor-pointer"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">الكل</option>
                  <option value="PENDING">قيد الانتظار</option>
                  <option value="IN_PROGRESS">قيد التنفيذ</option>
                  <option value="COMPLETED">مكتمل</option>
                  <option value="CANCELLED">ملغي</option>
                </select>
                <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-el-outline-variant flex gap-2">
              <button
                onClick={() => { setFilterDistrict(''); setFilterStatus(''); }}
                className="flex-1 border border-el-outline-variant text-el-on-surface-variant py-1.5 rounded text-[12px] leading-[16px] hover:bg-el-surface-container"
              >
                إعادة ضبط
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

``

## File: src\components\election\TopBar.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, Map, Menu, LogOut, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface TopBarProps {
  onMenuToggle: () => void;
  isOwner?: boolean;
  onOwnerPanelOpen?: () => void;
  onLogout?: () => void;
}

export default function TopBar({ onMenuToggle, isOwner, onOwnerPanelOpen, onLogout }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    voters: any[];
    tribes: any[];
    electionKeys: any[];
  }>({ voters: [], tribes: [], electionKeys: [] });
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ voters: [], tribes: [], electionKeys: [] });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleVoterClick = (voter: any) => {
    window.dispatchEvent(
      new CustomEvent('global-search-select', {
        detail: {
          type: 'voter',
          fullName: voter.fullName,
          id: voter.id,
        },
      })
    );
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-30 flex justify-between items-center px-4 h-12 bg-el-surface border-b border-el-outline-variant md:pr-64">
      <div className="flex items-center gap-4 w-full justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuToggle}
            className="md:hidden text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors p-1 rounded cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-[24px] leading-[32px] font-semibold text-el-primary truncate hidden sm:block">
            منصة إدارة الماكينة الانتخابية - ذي قار
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Global Filters */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <div className="relative">
              <select className="appearance-none bg-el-surface-container border border-el-outline-variant text-el-on-surface text-[12px] leading-[16px] rounded pl-8 pr-3 py-1 h-8 focus:outline-none focus:border-el-primary cursor-pointer">
                <option>ذي قار</option>
              </select>
              <Map className="absolute left-2 top-1.5 text-el-on-surface-variant w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="appearance-none bg-el-surface-container border border-el-outline-variant text-el-on-surface text-[12px] leading-[16px] rounded pl-8 pr-3 py-1 h-8 focus:outline-none focus:border-el-primary cursor-pointer">
                <option>جميع الأقضية</option>
                <option>الناصرية</option>
                <option>الشطرة</option>
                <option>سوق الشيوخ</option>
                <option>الرفاعي</option>
                <option>قلعة سكر</option>
                <option>عشيرة</option>
                <option>البطحاء</option>
              </select>
              <Map className="absolute left-2 top-1.5 text-el-on-surface-variant w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-el-outline w-4 h-4" />
            <input
              className="pl-3 pr-8 py-1 rounded bg-el-surface-container-low border border-el-outline-variant text-[12px] leading-[16px] h-8 w-64 focus:ring-el-primary focus:border-el-primary text-right"
              placeholder="البحث السريع..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              onBlur={() => setShowResults(false)}
            />
            {showResults && searchQuery.trim() !== '' && (
              <div className="absolute top-full right-0 w-80 bg-el-surface border border-el-outline-variant shadow-lg rounded-sm mt-1 max-h-96 overflow-y-auto z-50 text-right">
                {searching && (
                  <div className="p-3 text-center text-el-on-surface-variant text-[12px]">
                    جاري البحث...
                  </div>
                )}
                {!searching &&
                  searchResults.voters.length === 0 &&
                  searchResults.electionKeys.length === 0 &&
                  searchResults.tribes.length === 0 && (
                    <div className="p-3 text-center text-el-on-surface-variant text-[12px]">
                      لا توجد نتائج مطابقة
                    </div>
                  )}

                {!searching && searchResults.voters.length > 0 && (
                  <div>
                    <div className="bg-el-surface-container border-b border-el-outline-variant px-3 py-1.5 text-[11px] font-bold text-el-primary">
                      الناخبون ({searchResults.voters.length})
                    </div>
                    <div className="divide-y divide-el-outline-variant/30">
                      {searchResults.voters.map((v) => (
                        <button
                          key={v.id}
                          onMouseDown={() => handleVoterClick(v)}
                          className="w-full text-right px-3 py-2 hover:bg-el-surface-container-high transition-colors flex flex-col gap-0.5 cursor-pointer"
                        >
                          <span className="text-[12px] font-medium text-el-on-surface">
                            {v.fullName}
                          </span>
                          <span className="text-[10px] text-el-on-surface-variant">
                            {v.subtitle}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!searching && searchResults.electionKeys.length > 0 && (
                  <div>
                    <div className="bg-el-surface-container border-b border-el-outline-variant px-3 py-1.5 text-[11px] font-bold text-el-primary">
                      المفاتيح الانتخابية ({searchResults.electionKeys.length})
                    </div>
                    <div className="divide-y divide-el-outline-variant/30">
                      {searchResults.electionKeys.map((k) => (
                        <div
                          key={k.id}
                          className="px-3 py-2 hover:bg-el-surface-container-high transition-colors flex flex-col gap-0.5"
                        >
                          <span className="text-[12px] font-medium text-el-on-surface">
                            {k.fullName}
                          </span>
                          <span className="text-[10px] text-el-on-surface-variant">
                            {k.subtitle}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!searching && searchResults.tribes.length > 0 && (
                  <div>
                    <div className="bg-el-surface-container border-b border-el-outline-variant px-3 py-1.5 text-[11px] font-bold text-el-primary">
                      العشائر ({searchResults.tribes.length})
                    </div>
                    <div className="divide-y divide-el-outline-variant/30">
                      {searchResults.tribes.map((t) => (
                        <div
                          key={t.id}
                          className="px-3 py-2 hover:bg-el-surface-container-high transition-colors flex flex-col gap-0.5"
                        >
                          <span className="text-[12px] font-medium text-el-on-surface">
                            {t.fullName}
                          </span>
                          <span className="text-[10px] text-el-on-surface-variant">
                            {t.subtitle}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors p-1.5 rounded cursor-pointer active:opacity-80 flex items-center justify-center"
              title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-el-primary" />
              )}
            </button>
          )}

          {/* Actions */}
          <button className="text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors p-1 rounded cursor-pointer active:opacity-80 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-el-error rounded-full" />
          </button>
          <button className="text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors p-1 rounded cursor-pointer active:opacity-80">
            <Settings className="w-5 h-5" />
          </button>

          {/* Owner Panel Button */}
          {isOwner && onOwnerPanelOpen && (
            <button
              onClick={onOwnerPanelOpen}
              className="text-amber-600 hover:bg-amber-50 transition-colors p-1 rounded cursor-pointer active:opacity-80"
              title="لوحة تحكم المالك"
            >
              <Shield className="w-5 h-5" />
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-el-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors p-1 rounded cursor-pointer active:opacity-80"
              title="تسجيل خروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          <div className="w-8 h-8 rounded-full bg-el-primary-fixed flex items-center justify-center overflow-hidden border border-el-outline-variant">
            <div className="w-full h-full bg-el-primary-container text-el-on-primary-container flex items-center justify-center text-[12px] font-bold">
              {isOwner ? 'م' : 'ز'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

``

## File: src\components\election\TribalManagement.tsx

``typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Star,
  Plus,
  Search,
  ChevronDown,
  MapPin,
  Phone,
  TrendingUp,
  Crown,
  X,
} from 'lucide-react';

interface Tribe {
  id: string;
  name: string;
  leaderName: string | null;
  leaderPhone: string | null;
  influence: number;
  governorate: string;
  district: string | null;
  notes: string | null;
  voterCount: number;
  votedCount: number;
  votedPercentage: number;
  avgConfidence: number;
  createdAt: string;
}

const DISTRICTS = ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'قلعة سكر', 'عشيرة', 'البطحاء'];

export default function TribalManagement() {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [newTribe, setNewTribe] = useState({
    name: '',
    leaderName: '',
    leaderPhone: '',
    influence: 3,
    district: 'الناصرية',
    notes: '',
  });

  const fetchTribes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDistrict) params.set('district', selectedDistrict);
      const res = await fetch(`/api/tribes?${params.toString()}`);
      const data = await res.json();
      setTribes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tribes:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    fetchTribes();
  }, [fetchTribes]);

  const handleAddTribe = async () => {
    try {
      const res = await fetch('/api/tribes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTribe),
      });
      if (res.ok) {
        setShowAddDialog(false);
        setNewTribe({ name: '', leaderName: '', leaderPhone: '', influence: 3, district: 'الناصرية', notes: '' });
        fetchTribes();
      }
    } catch (err) {
      console.error('Error adding tribe:', err);
    }
  };

  const filteredTribes = tribes.filter(
    (t) => !searchQuery || t.name.includes(searchQuery) || (t.leaderName && t.leaderName.includes(searchQuery))
  );

  const maxInfluence = Math.max(...tribes.map((t) => t.influence), 1);

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] leading-[32px] font-bold text-el-primary">إدارة العشائر</h1>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">
            العشائر والحمائل في محافظة ذي قار - المحرك الرئيسي للانتخابات
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-el-primary text-el-on-primary px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-[18px] h-[18px]" />
          <span className="text-[14px] leading-[20px] font-medium">إضافة عشيرة</span>
        </button>
      </div>

      {/* Influence Ranking Summary */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-4">
        <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface mb-3 flex items-center gap-2">
          <Crown className="w-5 h-5 text-el-secondary" />
          ترتيب التأثير العشائري
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {tribes
            .sort((a, b) => b.influence - a.influence)
            .slice(0, 5)
            .map((tribe, index) => (
              <div
                key={tribe.id}
                className={`p-3 rounded border ${
                  index === 0
                    ? 'border-el-secondary bg-el-secondary-container/10'
                    : 'border-el-outline-variant bg-el-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[12px] leading-[16px] font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      index === 0
                        ? 'bg-el-secondary text-white'
                        : index === 1
                          ? 'bg-el-primary-fixed text-el-on-primary-fixed'
                          : 'bg-el-surface-variant text-el-on-surface-variant'
                    }`}
                    style={{ fontFamily: 'var(--font-geist-mono)' }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-[14px] leading-[20px] font-semibold text-el-on-surface truncate">
                    {tribe.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < tribe.influence ? 'text-el-secondary fill-current' : 'text-el-outline-variant'}`}
                    />
                  ))}
                </div>
                <div className="text-[11px] leading-[16px] text-el-on-surface-variant">
                  {tribe.voterCount} ناخب · {tribe.district}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-el-outline w-4 h-4" />
          <input
            className="w-full bg-el-surface-container-lowest border border-el-outline-variant rounded h-8 pl-3 pr-8 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
            placeholder="البحث عن عشيرة أو شيخ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-el-surface-container border border-el-outline-variant text-el-on-surface text-[12px] leading-[16px] rounded pl-8 pr-3 py-1 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="">جميع الأقضية</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
      </div>

      {/* Tribe Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-el-on-surface-variant">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTribes.map((tribe) => (
            <div
              key={tribe.id}
              className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTribe(tribe)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-[16px] leading-[24px] font-semibold text-el-on-surface">{tribe.name}</h3>
                  {tribe.leaderName && (
                    <p className="text-[12px] leading-[16px] text-el-on-surface-variant flex items-center gap-1">
                      <Crown className="w-3 h-3" /> {tribe.leaderName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < tribe.influence ? 'text-el-secondary fill-current' : 'text-el-outline-variant'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[12px] leading-[16px]">
                  <span className="text-el-on-surface-variant">عدد الناخبين</span>
                  <span className="text-el-on-surface font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {tribe.voterCount}
                  </span>
                </div>
                <div className="flex justify-between text-[12px] leading-[16px]">
                  <span className="text-el-on-surface-variant">صوّتوا</span>
                  <span className="text-el-on-surface font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {tribe.votedCount} ({tribe.votedPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-el-surface-variant h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-el-primary h-full transition-all"
                    style={{ width: `${tribe.votedPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[12px] leading-[16px]">
                  <span className="text-el-on-surface-variant">متوسط الثقة</span>
                  <span className="text-el-secondary font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {tribe.avgConfidence} ⭐
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-el-outline-variant">
                {tribe.district && (
                  <span className="text-[10px] leading-[14px] bg-el-surface-container text-el-on-surface-variant px-2 py-0.5 rounded flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {tribe.district}
                  </span>
                )}
                {tribe.leaderPhone && (
                  <span className="text-[10px] leading-[14px] bg-el-surface-container text-el-on-surface-variant px-2 py-0.5 rounded flex items-center gap-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    <Phone className="w-3 h-3" /> {tribe.leaderPhone}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* District Distribution */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-4">
        <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-el-primary" />
          توزيع العشائر حسب الأقضية
        </h3>
        <div className="space-y-3">
          {DISTRICTS.map((district) => {
            const districtTribes = tribes.filter((t) => t.district === district);
            const totalVotersInDistrict = districtTribes.reduce((sum, t) => sum + t.voterCount, 0);
            const maxVoters = Math.max(...DISTRICTS.map((d) => tribes.filter((t) => t.district === d).reduce((s, t) => s + t.voterCount, 0)), 1);
            return (
              <div key={district}>
                <div className="flex justify-between text-[12px] leading-[16px] mb-1">
                  <span className="text-el-on-surface">{district} ({districtTribes.length} عشيرة)</span>
                  <span className="font-medium text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {totalVotersInDistrict} ناخب
                  </span>
                </div>
                <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
                  <div
                    className="bg-el-primary h-full transition-all"
                    style={{ width: `${(totalVotersInDistrict / maxVoters) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add Tribe Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest rounded-sm border border-el-outline-variant w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface">إضافة عشيرة جديدة</h3>
              <button onClick={() => setShowAddDialog(false)} className="text-el-on-surface-variant hover:text-el-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">اسم العشيرة *</label>
                <input
                  className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
                  value={newTribe.name}
                  onChange={(e) => setNewTribe({ ...newTribe, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">اسم الشيخ</label>
                <input
                  className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
                  value={newTribe.leaderName}
                  onChange={(e) => setNewTribe({ ...newTribe, leaderName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">هاتف الشيخ</label>
                <input
                  className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
                  placeholder="+964"
                  value={newTribe.leaderPhone}
                  onChange={(e) => setNewTribe({ ...newTribe, leaderPhone: e.target.value })}
                  style={{ fontFamily: 'var(--font-geist-mono)' }}
                />
              </div>
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">القضاء</label>
                <div className="relative">
                  <select
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] leading-[16px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                    value={newTribe.district}
                    onChange={(e) => setNewTribe({ ...newTribe, district: e.target.value })}
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">التأثير (1-5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewTribe({ ...newTribe, influence: s })}
                      className={`flex-1 h-8 border rounded text-[12px] leading-[16px] font-medium transition-colors ${
                        newTribe.influence >= s
                          ? 'border-el-secondary bg-el-secondary-container text-el-on-secondary-container'
                          : 'border-el-outline-variant text-el-on-surface-variant'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">ملاحظات</label>
                <textarea
                  className="w-full bg-el-surface border border-el-outline-variant rounded p-2 text-[12px] leading-[16px] h-16 resize-none focus:outline-none focus:border-el-primary"
                  value={newTribe.notes}
                  onChange={(e) => setNewTribe({ ...newTribe, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-el-outline-variant">
              <button
                onClick={handleAddTribe}
                className="flex-1 bg-el-primary text-el-on-primary py-2 rounded text-[14px] leading-[20px] font-medium hover:opacity-90"
              >
                إضافة
              </button>
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 border border-el-outline-variant text-el-on-surface-variant py-2 rounded text-[14px] leading-[20px] hover:bg-el-surface-container"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tribe Detail Dialog */}
      {selectedTribe && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest rounded-sm border border-el-outline-variant w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[20px] leading-[28px] font-semibold text-el-on-surface">{selectedTribe.name}</h3>
              <button onClick={() => setSelectedTribe(null)} className="text-el-on-surface-variant hover:text-el-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-el-secondary" />
                <span className="text-[14px] leading-[20px] text-el-on-surface">{selectedTribe.leaderName || 'غير محدد'}</span>
              </div>
              {selectedTribe.leaderPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-el-on-surface-variant" />
                  <span className="text-[14px] leading-[20px] text-el-on-surface" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {selectedTribe.leaderPhone}
                  </span>
                </div>
              )}
              {selectedTribe.district && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-el-on-surface-variant" />
                  <span className="text-[14px] leading-[20px] text-el-on-surface">{selectedTribe.district}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-[14px] leading-[20px] text-el-on-surface-variant">التأثير:</span>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < selectedTribe.influence ? 'text-el-secondary fill-current' : 'text-el-outline-variant'}`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-el-outline-variant">
                <div className="text-center p-2 bg-el-surface-container rounded">
                  <div className="text-[20px] leading-[28px] font-bold text-el-primary" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {selectedTribe.voterCount}
                  </div>
                  <div className="text-[11px] leading-[16px] text-el-on-surface-variant">ناخب</div>
                </div>
                <div className="text-center p-2 bg-el-surface-container rounded">
                  <div className="text-[20px] leading-[28px] font-bold text-el-on-surface" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {selectedTribe.votedCount}
                  </div>
                  <div className="text-[11px] leading-[16px] text-el-on-surface-variant">صوّت</div>
                </div>
                <div className="text-center p-2 bg-el-surface-container rounded">
                  <div className="text-[20px] leading-[28px] font-bold text-el-secondary" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {selectedTribe.votedPercentage}%
                  </div>
                  <div className="text-[11px] leading-[16px] text-el-on-surface-variant">نسبة</div>
                </div>
              </div>
              {selectedTribe.notes && (
                <div className="pt-3 border-t border-el-outline-variant">
                  <span className="text-[12px] leading-[16px] text-el-on-surface-variant">{selectedTribe.notes}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedTribe(null)}
              className="w-full mt-4 pt-4 border-t border-el-outline-variant border-el-primary text-el-primary py-2 rounded text-[14px] leading-[20px] font-medium hover:bg-el-primary-container"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

``

## File: src\components\election\VolunteersManagement.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users2, Plus, Star, Award, CheckCircle, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VolunteersManagement() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: 'FIELD_AGENT',
    district: '',
    area: '',
    notes: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await fetch('/api/volunteers');
      const data = await res.json();
      setVolunteers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({ title: 'نجاح', description: 'تم تسجيل العضو / المتطوع بنجاح' });
        setShowAddForm(false);
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          role: 'FIELD_AGENT',
          district: '',
          area: '',
          notes: '',
        });
        fetchVolunteers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'FIELD_AGENT': return 'مندوب ميداني';
      case 'LOGISTICS': return 'مسؤول دعم لوجستي';
      case 'MEDIA': return 'إعلام وتواصل رقمي';
      case 'COORDINATOR': return 'منسق جغرافي';
      case 'ELECTION_DAY_OBSERVER': return 'مراقب محطة اقتراع';
      default: return 'عضو كادر';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[28px] leading-[36px] font-bold text-el-primary">نظام إدارة المتطوعين والكوادر</h2>
          <p className="text-el-on-surface-variant text-[14px]">تنظيم الكادر المشرف والمندوبين وتوزيع المهام الميدانية في محافظة ذي قار</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-el-primary text-el-on-primary py-2 px-4 rounded flex items-center gap-2 text-[14px] font-medium shadow active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          تسجيل متطوع/عضو جديد
        </button>
      </div>

      {showAddForm && (
        <Card className="border-el-outline-variant bg-el-surface-container">
          <CardHeader>
            <CardTitle className="text-[18px]">طلب انضمام متطوع</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="اسم المتطوع الثلاثي أو الرباعي"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">رقم الهاتف الجوال *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="رقم الهاتف (11 رقم)"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">الدور التنظيمي</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                >
                  <option value="FIELD_AGENT">مندوب ميداني</option>
                  <option value="LOGISTICS">مسؤول دعم لوجستي</option>
                  <option value="MEDIA">إعلام وتواصل رقمي</option>
                  <option value="COORDINATOR">منسق جغرافي</option>
                  <option value="ELECTION_DAY_OBSERVER">مراقب محطة اقتراع</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">القضاء المكلف به</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  placeholder="الناصرية، الشطرة، الرفاعي..."
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">المنطقة / المحلة</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={e => setFormData({ ...formData, area: e.target.value })}
                  placeholder="اسم الحي أو المنطقة المحددة"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold">البريد الإلكتروني (إن وجد)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="bg-el-surface border border-el-outline rounded p-2 text-[14px]"
                />
              </div>

              <div className="flex justify-end gap-2 md:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-el-outline rounded text-[14px] font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-el-primary text-el-on-primary text-[14px] font-bold rounded"
                >
                  حفظ وتسجيل المتطوع
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">جاري تحميل الكوادر والمتطوعين...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {volunteers.map((vol: any) => (
            <Card key={vol.id} className="border-el-outline-variant hover:shadow-md transition-all">
              <CardContent className="p-5 flex gap-4">
                <div className="w-16 h-16 rounded bg-el-primary-container text-el-on-primary-container flex items-center justify-center shrink-0">
                  <Users2 className="w-8 h-8" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[16px] font-bold">{vol.fullName}</h3>
                      <p className="text-[12px] text-zinc-500">{vol.phone} | {getRoleLabel(vol.role)}</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-0.5 rounded font-bold border border-emerald-100 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      كفاءة {vol.efficiencyScore}%
                    </span>
                  </div>

                  <div className="text-[12px] text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-100 flex justify-between">
                    <div>
                      <span className="font-bold text-zinc-700">المنطقة المكلف بها:</span>{' '}
                      <span>{vol.district ? `${vol.district} (${vol.area || 'المركز'})` : 'غير محدد'}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 text-[12px] pt-1 text-zinc-500">
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-4 h-4 text-zinc-400" />
                      المهام الموكلة: {vol.totalAssignedTasks}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      المهام المنجزة: {vol.totalCompletedTasks}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

``

## File: src\components\election\VoterRegistration.tsx

``typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Search, Star, Phone, MapPin, ChevronDown, CheckCircle, XCircle, X, Users, Eye,
  User, MessageSquare, Key, Calendar, Edit2, ShieldAlert, Award, FileText, Trash2
} from 'lucide-react';

const DISTRICTS = [
  'الناصرية',
  'الشطرة',
  'سوق الشيوخ',
  'الرفاعي',
  'الجبايش',
  'قلعة سكر',
  'الغراف',
  'النصر',
  'الفجر',
  'الفهود',
  'البطحاء',
  'سيد دخيل',
  'الإصلاح',
  'الدواية',
  'الفضلية',
  'العكيكة',
  'الطار',
  'كرمة بني سعيد',
  'أور',
  'المنار',
  'الحمار'
];

interface Tribe {
  id: string;
  name: string;
  influence: number;
  district: string | null;
}

interface Voter {
  id: string;
  firstName: string;
  fatherName: string | null;
  grandfatherName: string | null;
  fourthName: string | null;
  fullName: string;
  phoneNumber: string;
  phone: string | null;
  nationalId: string | null;
  nickname: string | null;
  gender: string | null;
  birthDate: string | null;
  dateOfBirth: string | null;
  educationLevel: string | null;
  education: string | null;
  specialization: string | null;
  profession: string | null;
  maritalStatus: string | null;
  familySize: number | null;
  socialMedia: any;
  firstContactDate: string | null;
  lastContactDate: string | null;
  contactResult: string | null;
  nextAction: string | null;
  followUpDate: string | null;
  relationship: string | null;
  influenceRate: number;
  isPrimaryFollow: boolean;
  supportDegree: number;
  supportReason: string | null;
  governorate: string;
  district: string;
  subDistrict: string | null;
  area: string | null;
  pollingCenter: string | null;
  ballotStation: string | null;
  pollingCenterId: string | null;
  pollingCenterName: string | null;
  tribeId: string | null;
  tribe: { id: string; name: string; influence: number } | null;
  electoralKey?: { id: string; code: string; firstName: string; fatherName: string | null } | null;
  electionKey?: { id: string; code: string; firstName: string; fatherName: string | null; keyCode?: string } | null;
  keyId?: string | null;
  electoralKeyId?: string | null;
  confidenceScore: number;
  confidencePoints: number;
  votedStatus: boolean;
  votedAt: string | null;
  gpsVerified: boolean;
  latitude: number | null;
  longitude: number | null;
  isRegistryVerified: boolean;
  registryVoterId: string | null;
  voterCategory: string;
  registeredBy: { id: string; name: string } | null;
  createdAt: string;
}

const EDUCATION_LEVELS = ['يقرا ويكتب', 'ابتدائية', 'متوسطة', 'اعدادية', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'];
const MARITAL_STATUS = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];
const GENDER_OPTIONS = ['ذكر', 'أنثى'];
const CATEGORY_OPTIONS = ['مؤيد', 'محايد', 'ضعيف'];

const defaultForm = {
  firstName: '', fatherName: '', grandfatherName: '', fourthName: '',
  phoneNumber: '', nationalId: '', district: 'الغراف', subDistrict: '', area: '',
  pollingCenterId: '', pollingCenterName: '', tribeId: '', confidenceScore: 3,
  nickname: '', gender: 'ذكر', dateOfBirth: '', educationLevel: '',
  specialization: '', profession: '', maritalStatus: '', familySize: 0,
  firstContactDate: '', voterCategory: 'محايد', electoralKeyId: '',
  socialFacebook: '', socialTelegram: '', socialWhatsApp: '',
  supportReason: '', relationship: '', influenceRate: 50, isPrimaryFollow: true,
  lastContactDate: '', contactResult: '', nextAction: '', followUpDate: '',
  latitude: '', longitude: '', gpsVerified: false, isRegistryVerified: false,
  registryVoterId: '',
};

export default function VoterRegistration() {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [electoralKeys, setElectoralKeys] = useState<{ id: string; code: string; firstName: string; fatherName: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterVoted, setFilterVoted] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState(defaultForm);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);

  const fetchTribes = useCallback(async () => {
    try {
      const res = await fetch('/api/tribes');
      const data = await res.json();
      setTribes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tribes:', err);
    }
  }, []);

  const fetchElectoralKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/electoral-keys');
      const data = await res.json();
      setElectoralKeys(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching electoral keys:', err);
      setElectoralKeys([]);
    }
  }, []);

  const fetchVoters = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filterDistrict) params.set('district', filterDistrict);
      if (filterVoted) params.set('votedStatus', filterVoted);
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await fetch(`/api/voters?${params.toString()}`);
      const data = await res.json();
      setVoters(data.voters || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching voters:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterDistrict, filterVoted, page, limit]);

  useEffect(() => {
    fetchTribes();
    fetchElectoralKeys();
  }, [fetchTribes, fetchElectoralKeys]);

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterDistrict, filterVoted, limit]);

  useEffect(() => {
    const handleGlobalSelect = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.type === 'voter') {
        setSearchQuery(customEvent.detail.fullName);
      }
    };
    window.addEventListener('global-search-select', handleGlobalSelect);
    return () => window.removeEventListener('global-search-select', handleGlobalSelect);
  }, []);
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filterDistrict) params.set('district', filterDistrict);
      if (filterVoted) params.set('votedStatus', filterVoted);
      params.set('limit', '10000');
      
      const res = await fetch(`/api/voters?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch data for export');
      const data = await res.json();
      const exportVoters = data.voters || [];
      
      if (exportVoters.length === 0) {
        alert('لا توجد بيانات لتصديرها');
        return;
      }

      const headers = [
        'الاسم الكامل',
        'رقم الهاتف',
        'الهوية الوطنية',
        'الجنس',
        'تاريخ الميلاد',
        'التحصيل الدراسي',
        'المهنة',
        'القضاء',
        'الناحية',
        'المنطقة',
        'مركز الاقتراع',
        'المحطة الانتخابية',
        'درجة التأييد',
        'المفتاح المسؤول',
        'حالة التصويت الفعلي'
      ];

      const csvRows: string[] = [];
      csvRows.push('\uFEFF' + headers.join(','));

      exportVoters.forEach((v: any) => {
        const row = [
          `"${(v.fullName || '').replace(/"/g, '""')}"`,
          `"${(v.phone || v.phoneNumber || '').replace(/"/g, '""')}"`,
          `"${(v.nationalId || '').replace(/"/g, '""')}"`,
          `"${(v.gender || 'ذكر').replace(/"/g, '""')}"`,
          `"${v.birthDate || v.dateOfBirth ? new Date(v.birthDate || v.dateOfBirth).toISOString().split('T')[0] : ''}"`,
          `"${(v.education || v.educationLevel || '').replace(/"/g, '""')}"`,
          `"${(v.profession || '').replace(/"/g, '""')}"`,
          `"${(v.district || '').replace(/"/g, '""')}"`,
          `"${(v.subDistrict || '').replace(/"/g, '""')}"`,
          `"${(v.area || '').replace(/"/g, '""')}"`,
          `"${(v.pollingCenter || '').replace(/"/g, '""')}"`,
          `"${(v.ballotStation || '').replace(/"/g, '""')}"`,
          `"${v.supportDegree || v.confidenceScore || 3}"`,
          `"${(v.electionKey ? `${v.electionKey.keyCode || ''} - ${v.electionKey.firstName || ''}` : 'بدون مفتاح').replace(/"/g, '""')}"`,
          `"${v.votedStatus ? 'صوّت فعلياً' : 'لم يصوت بعد'}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `voters_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('حدث خطأ أثناء تصدير البيانات');
    }
  };
  const parseSocialMedia = (socialStr: any) => {
    if (!socialStr) return { facebook: '', telegram: '', whatsapp: '' };
    if (typeof socialStr === 'object') {
      return {
        facebook: socialStr.facebook || '',
        telegram: socialStr.telegram || '',
        whatsapp: socialStr.whatsapp || '',
      };
    }
    try {
      const obj = JSON.parse(socialStr);
      return {
        facebook: obj.facebook || '',
        telegram: obj.telegram || '',
        whatsapp: obj.whatsapp || '',
      };
    } catch {
      return { facebook: '', telegram: '', whatsapp: '' };
    }
  };

  const calculateAge = (dobString: string | null) => {
    if (!dobString) return 'غير محدد';
    try {
      const birthDate = new Date(dobString);
      const difference = Date.now() - birthDate.getTime();
      const ageDate = new Date(difference);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return isNaN(age) ? 'غير محدد' : `${age} سنة`;
    } catch {
      return 'غير محدد';
    }
  };

  const handleEditClick = (voter: Voter) => {
    setIsEditMode(true);
    setEditingId(voter.id);
    const social = parseSocialMedia(voter.socialMedia);
    
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr).toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    setForm({
      firstName: voter.firstName || '',
      fatherName: voter.fatherName || '',
      grandfatherName: voter.grandfatherName || '',
      fourthName: voter.fourthName || '',
      phoneNumber: voter.phone || voter.phoneNumber || '',
      nationalId: voter.nationalId || '',
      district: voter.district || 'الغراف',
      subDistrict: voter.subDistrict || '',
      area: voter.area || '',
      pollingCenterId: voter.pollingCenterId || voter.ballotStation || '',
      pollingCenterName: voter.pollingCenterName || voter.pollingCenter || '',
      tribeId: voter.tribeId || '',
      confidenceScore: voter.supportDegree || voter.confidenceScore || 3,
      nickname: voter.nickname || '',
      gender: voter.gender || 'ذكر',
      dateOfBirth: formatDate(voter.birthDate || voter.dateOfBirth),
      educationLevel: voter.education || voter.educationLevel || '',
      specialization: voter.specialization || '',
      profession: voter.profession || '',
      maritalStatus: voter.maritalStatus || '',
      familySize: voter.familySize || 0,
      firstContactDate: formatDate(voter.firstContactDate),
      voterCategory: voter.voterCategory || 'محايد',
      electoralKeyId: voter.electoralKeyId || '',
      socialFacebook: social.facebook,
      socialTelegram: social.telegram,
      socialWhatsApp: social.whatsapp,
      supportReason: voter.supportReason || '',
      relationship: voter.relationship || '',
      influenceRate: voter.influenceRate || 50,
      isPrimaryFollow: voter.isPrimaryFollow !== undefined ? voter.isPrimaryFollow : true,
      lastContactDate: formatDate(voter.lastContactDate),
      contactResult: voter.contactResult || '',
      nextAction: voter.nextAction || '',
      followUpDate: formatDate(voter.followUpDate),
      latitude: voter.latitude !== null && voter.latitude !== undefined ? String(voter.latitude) : '',
      longitude: voter.longitude !== null && voter.longitude !== undefined ? String(voter.longitude) : '',
      gpsVerified: voter.gpsVerified || false,
      isRegistryVerified: voter.isRegistryVerified || false,
      registryVoterId: voter.registryVoterId || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (voterId: string, voterName: string) => {
    if (!confirm(`هل أنت متأكد من حذف الناخب ${voterName} نهائياً؟`)) return;
    try {
      const res = await fetch(`/api/voters/${voterId}`, { method: 'DELETE' });
      if (res.ok) {
        setFormMessage({ type: 'success', text: `تم حذف الناخب ${voterName} بنجاح` });
        fetchVoters();
      } else {
        setFormMessage({ type: 'error', text: 'فشل في حذف الناخب' });
      }
    } catch {
      setFormMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phoneNumber.length !== 11) {
      setFormMessage({ type: 'error', text: 'رقم الهاتف يجب أن يكون 11 رقماً' });
      return;
    }
    setSubmitting(true);
    setFormMessage(null);

    try {
      const socialMediaString = JSON.stringify({
        facebook: form.socialFacebook,
        telegram: form.socialTelegram,
        whatsapp: form.socialWhatsApp,
      });

      const fullName = [form.firstName, form.fatherName, form.grandfatherName, form.fourthName]
        .filter(Boolean)
        .join(' ')
        .trim();

      const url = isEditMode ? `/api/voters/${editingId}` : '/api/voters';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          fullName,
          socialMedia: socialMediaString,
          governorate: 'ذي قار',
          tribeId: form.tribeId || undefined,
          nationalId: form.nationalId || undefined,
          electoralKeyId: form.electoralKeyId || undefined,
          keyId: form.electoralKeyId || undefined,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
          gpsVerified: Boolean(form.gpsVerified),
          isRegistryVerified: Boolean(form.isRegistryVerified),
          registryVoterId: form.registryVoterId || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFormMessage({
          type: 'success',
          text: isEditMode ? `تم تحديث بيانات الناخب ${fullName} بنجاح` : `تم تسجيل الناخب ${fullName} بنجاح`
        });
        setForm(defaultForm);
        setIsEditMode(false);
        setEditingId(null);
        setShowForm(false);
        fetchVoters();
      } else {
        setFormMessage({ type: 'error', text: data.error || 'فشل الإجراء المطلوبة' });
      }
    } catch {
      setFormMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVote = async (voterId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/voters/${voterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votedStatus: !currentStatus }),
      });
      fetchVoters();
    } catch (err) {
      console.error('Error updating voter status:', err);
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setIsEditMode(false);
    setEditingId(null);
    setFormMessage(null);
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] leading-[32px] font-bold text-el-primary flex items-center gap-2">
            <Users className="w-7 h-7 text-el-primary" /> إدارة وسجل الناخبين
          </h1>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">
            إدخال، تعديل، وتبويب ملفات الناخبين جغرافياً وعشائرياً للتخطيط ليوم الاقتراع بدقة
          </p>
        </div>
        <div className="flex gap-2">
          {showForm && (
            <button
              onClick={resetForm}
              className="bg-el-surface-container border border-el-outline-variant text-el-on-surface px-4 py-2 rounded text-[14px] leading-[20px] font-medium hover:bg-el-surface-container-high transition-all"
            >
              إلغاء وتفريغ الاستمارة
            </button>
          )}
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
                setShowForm(false);
              } else {
                setShowForm(true);
              }
            }}
            className="bg-el-primary text-el-on-primary px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
          >
            <UserPlus className="w-[18px] h-[18px]" />
            <span className="text-[14px] leading-[20px] font-medium">
              {showForm ? (isEditMode ? 'عرض سجل الناخبين' : 'عرض سجل الناخبين') : 'تسجيل ناخب جديد'}
            </span>
          </button>
        </div>
      </div>

      {showForm && (
        <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-5 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-el-outline-variant pb-3">
            <h3 className="text-[18px] leading-[24px] font-bold text-el-primary flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              {isEditMode ? `تعديل استمارة الناخب: ${form.firstName} ${form.fatherName}` : 'استمارة الناخب الشاملة (6 أقسام)'}
            </h3>
            <span className="text-[11px] text-el-on-surface-variant/70 bg-el-surface-container px-3 py-1 rounded">
              محافظة ذي قار
            </span>
          </div>

          {formMessage && (
            <div className={`p-3 rounded flex items-center gap-2 text-[12px] leading-[16px] ${
              formMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {formMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {formMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-el-secondary" /> 1. البيانات الشخصية والأساسية للناخب
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الاسم الأول *</label>
                    <input required className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">اسم الأب</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">اسم الجد</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.grandfatherName} onChange={(e) => setForm({ ...form, grandfatherName: e.target.value })} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الاسم الرابع</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.fourthName} onChange={(e) => setForm({ ...form, fourthName: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">اللقب / الشهرة</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الجنس</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} >
                        {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">تاريخ الميلاد (العمر)</label>
                    <input type="date" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] focus:outline-none focus:border-el-primary"
                      value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الشهادة</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.educationLevel} onChange={(e) => setForm({ ...form, educationLevel: e.target.value })} >
                        <option value="">اختر التحصيل</option>
                        {EDUCATION_LEVELS.map((el) => <option key={el} value={el}>{el}</option>)}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الحالة الاجتماعية</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.maritalStatus} onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })} >
                        <option value="">اختر الحالة</option>
                        {MARITAL_STATUS.map((ms) => <option key={ms} value={ms}>{ms}</option>)}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">المهنة</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">عدد أفراد الأسرة</label>
                    <input type="number" min="0" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                      value={form.familySize || ''} onChange={(e) => setForm({ ...form, familySize: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>

              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-el-secondary" /> 2. السكن والدائرة الانتخابية للناخب
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">القضاء *</label>
                    <div className="relative">
                      <select required className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} >
                        {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الناحية / النافذة</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.subDistrict} onChange={(e) => setForm({ ...form, subDistrict: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">المنطقة (الحي أو القرية)</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="مثال: حي الحسين أو قرية البو صالح" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">رقم مركز الاقتراع</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                      value={form.pollingCenterId} onChange={(e) => setForm({ ...form, pollingCenterId: e.target.value })} placeholder="مثال: 45620" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">اسم مركز الاقتراع</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.pollingCenterName} onChange={(e) => setForm({ ...form, pollingCenterName: e.target.value })} placeholder="مثال: مدرسة بابل الابتدائية" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">العشيرة المرتبطة</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.tribeId} onChange={(e) => setForm({ ...form, tribeId: e.target.value })} >
                        <option value="">اختر العشيرة (تلقائي حسب القضاء)</option>
                        {tribes.filter(t => !form.district || t.district === form.district).map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div className="col-span-2 border-t border-el-outline-variant/40 pt-2 mt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="isRegistryVerified" className="w-4 h-4 rounded text-el-primary focus:ring-el-primary cursor-pointer"
                        checked={form.isRegistryVerified} onChange={(e) => setForm({ ...form, isRegistryVerified: e.target.checked })} />
                      <label htmlFor="isRegistryVerified" className="text-[11px] font-bold text-el-on-surface-variant cursor-pointer select-none">
                        تم التحقق والمطابقة مع سجلات المفوضية الرسمية؟
                      </label>
                    </div>
                    {form.isRegistryVerified && (
                      <div>
                        <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">رقم الناخب الرسمي (المفوضية)</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                          value={form.registryVoterId} onChange={(e) => setForm({ ...form, registryVoterId: e.target.value })} placeholder="مثال: 10984532" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-el-secondary" /> 3. بيانات الاتصال والتواصل للناخب
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">رقم الموبايل *</label>
                    <input required className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                      value={form.phoneNumber} placeholder="07XXXXXXXXX"
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 11) setForm({ ...form, phoneNumber: val });
                      }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">رقم الهوية الوطنية</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                      value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} placeholder="أدخل رقم الهوية" />
                  </div>
                  <div className="border border-el-outline-variant/60 rounded p-3 bg-el-surface space-y-2">
                    <span className="block text-[10px] font-bold text-el-primary">منصات التواصل الاجتماعي للناخب</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">فيسبوك</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="رابط الصفحة"
                          value={form.socialFacebook} onChange={e => setForm({ ...form, socialFacebook: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">تلكرام</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="معرف المستخدم"
                          value={form.socialTelegram} onChange={e => setForm({ ...form, socialTelegram: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[9px] text-el-on-surface-variant mb-0.5">واتساب</label>
                        <input className="w-full bg-el-surface border border-el-outline-variant rounded h-7 px-2 text-[11px] focus:outline-none focus:border-el-primary" placeholder="رقم واتساب"
                          value={form.socialWhatsApp} onChange={e => setForm({ ...form, socialWhatsApp: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-el-secondary" /> 4. التصنيف الانتخابي والتقييم الداخلي
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">فئة الناخب (التصنيف العام)</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.voterCategory} onChange={(e) => setForm({ ...form, voterCategory: e.target.value })} >
                        {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">درجة دعم وتأييد الناخب (1 - 5)</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setForm({ ...form, confidenceScore: s })}
                          className={`flex-1 h-8 border rounded text-[11px] font-medium transition-all ${
                            form.confidenceScore >= s
                              ? 'border-amber-500 bg-amber-500 text-white font-bold'
                              : 'border-el-outline-variant text-el-on-surface-variant'
                          }`} >
                          {s} ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">سبب الدعم أو التحفّظ</label>
                    <textarea className="w-full bg-el-surface border border-el-outline-variant rounded p-2 text-[11px] focus:outline-none focus:border-el-primary h-16 resize-none"
                      value={form.supportReason} onChange={(e) => setForm({ ...form, supportReason: e.target.value })} placeholder="أدخل أسباب تأييده أو تحفظاته الانتخابية..." />
                  </div>
                </div>
              </div>

              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-el-secondary" /> 5. بيانات المفتاح الانتخابي المسؤول
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">المفتاح الانتخابي المسؤول</label>
                    <div className="relative">
                      <select className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                        value={form.electoralKeyId} onChange={(e) => setForm({ ...form, electoralKeyId: e.target.value })} >
                        <option value="">بدون مفتاح (غير مرتبط حالياً)</option>
                        {electoralKeys.map((ek) => (
                          <option key={ek.id} value={ek.id}>{ek.code} - {ek.firstName} {ek.fatherName || ''}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">علاقة المفتاح بالناخب</label>
                      <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                        value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="مثال: قرابة، صداقة، عمل" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">نسبة تأثير المفتاح (0 - 100%)</label>
                      <input type="number" min="0" max="100" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                        value={form.influenceRate} onChange={(e) => setForm({ ...form, influenceRate: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="isPrimaryFollow" className="w-4 h-4 rounded text-el-primary focus:ring-el-primary cursor-pointer"
                      checked={form.isPrimaryFollow} onChange={(e) => setForm({ ...form, isPrimaryFollow: e.target.checked })} />
                    <label htmlFor="isPrimaryFollow" className="text-[11px] font-bold text-el-on-surface-variant cursor-pointer select-none">
                      هل هذا المفتاح هو المتابع الرئيسي والمباشر للناخب؟
                    </label>
                  </div>
                </div>
              </div>

              <div className="border border-el-outline-variant bg-el-surface-container-low rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant/60 pb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-el-secondary" /> 6. سجل التواصل والتحديث والمتابعة
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">أول تواصل تاريخي</label>
                    <input type="date" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] focus:outline-none focus:border-el-primary"
                      value={form.firstContactDate} onChange={(e) => setForm({ ...form, firstContactDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">آخر تواصل فعلي</label>
                    <input type="date" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] focus:outline-none focus:border-el-primary"
                      value={form.lastContactDate} onChange={(e) => setForm({ ...form, lastContactDate: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">نتيجة التواصل الأخير</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.contactResult} onChange={(e) => setForm({ ...form, contactResult: e.target.value })} placeholder="مثال: مضمون التأييد، متردد، يطلب خدمة معينة..." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">الإجراء القادم المطلوب</label>
                    <input className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary"
                      value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="مثال: تلبية طلب الخدمة الصحية، اتصال تذكيري..." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">موعد المتابعة القادمة</label>
                    <input type="date" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[11px] focus:outline-none focus:border-el-primary"
                      value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
                  </div>
                  <div className="col-span-2 border-t border-el-outline-variant/40 pt-2 mt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="gpsVerified" className="w-4 h-4 rounded text-el-primary focus:ring-el-primary cursor-pointer"
                        checked={form.gpsVerified} onChange={(e) => setForm({ ...form, gpsVerified: e.target.checked })} />
                      <label htmlFor="gpsVerified" className="text-[11px] font-bold text-el-on-surface-variant cursor-pointer select-none">
                        تأكيد المطابقة والتدقيق الجغرافي (GPS Verified)؟
                      </label>
                    </div>
                    {form.gpsVerified && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">خط العرض (Latitude)</label>
                          <input type="number" step="any" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                            value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="31.123456" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-el-on-surface-variant mb-1">خط الطول (Longitude)</label>
                          <input type="number" step="any" className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] focus:outline-none focus:border-el-primary font-mono"
                            value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="46.123456" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-el-outline-variant">
              <button
                type="button"
                onClick={resetForm}
                className="bg-el-surface-container border border-el-outline-variant text-el-on-surface px-6 py-2.5 rounded text-[14px] font-medium hover:bg-el-surface-container-high transition-all"
              >
                تفريغ الحقول
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-el-primary text-el-on-primary px-8 py-2.5 rounded flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 font-bold shadow"
              >
                {submitting ? 'جاري الحفظ...' : (isEditMode ? 'حفظ التعديلات' : 'تسجيل الناخب وحفظ البيانات')}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-el-outline w-4 h-4" />
          <input
            className="w-full bg-el-surface-container-lowest border border-el-outline-variant rounded h-9 pl-3 pr-9 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
            placeholder="البحث بالاسم أو رقم الهاتف أو الهوية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-el-surface-container border border-el-outline-variant text-el-on-surface text-[12px] leading-[16px] rounded pl-9 pr-3 py-1 h-9 focus:outline-none focus:border-el-primary cursor-pointer"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
          >
            <option value="">جميع الأقضية</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-el-surface-container border border-el-outline-variant text-el-on-surface text-[12px] leading-[16px] rounded pl-9 pr-3 py-1 h-9 focus:outline-none focus:border-el-primary cursor-pointer"
            value={filterVoted}
            onChange={(e) => setFilterVoted(e.target.value)}
          >
            <option value="">كل حالات التصويت</option>
            <option value="true">صوّت فعلياً</option>
            <option value="false">لم يصوت بعد</option>
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
        <button
          onClick={handleExportCSV}
          disabled={voters.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 h-9 rounded text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          title="تصدير كشوف الناخبين الحالية لملف إكسل"
        >
          <FileText className="w-4 h-4" />
          تصدير Excel
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-el-on-surface-variant font-bold">جاري تحميل سجلات الناخبين...</div>
      ) : voters.length === 0 ? (
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-12 text-center text-el-on-surface-variant">
          <ShieldAlert className="w-12 h-12 text-el-outline/50 mx-auto mb-2" />
          <p className="text-[14px] font-bold">لا يوجد ناخبين متطابقين للبحث</p>
          <p className="text-[11px] mt-1 text-el-on-surface-variant/70">قم بتسجيل ناخب جديد للبدء بالبناء الإحصائي.</p>
        </div>
      ) : (
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-el-surface-container border-b border-el-outline-variant text-[11px] font-bold tracking-[0.05em] text-el-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">الاسم الكامل</th>
                  <th className="px-4 py-3">رقم الهاتف</th>
                  <th className="px-4 py-3">القضاء والسكن</th>
                  <th className="px-4 py-3 text-center">التحصيل والشهادة</th>
                  <th className="px-4 py-3 text-center">درجة التأييد</th>
                  <th className="px-4 py-3 text-center">المفتاح المسؤول</th>
                  <th className="px-4 py-3 text-center">حالة التصويت يوم الاقتراع</th>
                  <th className="px-4 py-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/50 text-[12px] leading-[16px]">
                {voters.map((voter) => (
                  <tr key={voter.id} className="hover:bg-el-surface-container-lowest/50 transition-colors h-11">
                    <td className="px-4 py-2 font-semibold text-el-on-surface">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {voter.fullName}
                        {voter.nickname && <span className="text-el-on-surface-variant text-[10px] mr-1">({voter.nickname})</span>}
                        {voter.gpsVerified && <span className="bg-blue-100 text-blue-800 text-[8px] font-extrabold px-1 rounded" title="موقع جغرافي مؤكد">GPS</span>}
                        {voter.isRegistryVerified && <span className="bg-purple-100 text-purple-800 text-[8px] font-extrabold px-1 rounded" title="سجل المفوضية مؤكد">رسمي</span>}
                      </div>
                      <div className="text-[10px] text-el-on-surface-variant/60 font-normal mt-0.5">
                        {voter.gender} · {calculateAge(voter.birthDate || voter.dateOfBirth)}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-el-on-surface-variant font-mono">{voter.phone || voter.phoneNumber || '—'}</td>
                    <td className="px-4 py-2">
                      <div className="font-medium">{voter.district}</div>
                      <div className="text-[10px] text-el-on-surface-variant/60">{voter.area || voter.subDistrict || '—'}</div>
                    </td>
                    <td className="px-4 py-2 text-center">{voter.education || voter.educationLevel || '—'}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < (voter.supportDegree || voter.confidenceScore || 3) ? 'text-amber-500 fill-amber-500' : 'text-el-outline-variant'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {voter.electoralKey ? (
                        <span className="bg-el-surface-container text-el-on-surface font-semibold px-2 py-0.5 rounded text-[10px]">
                          {voter.electoralKey.code} - {voter.electoralKey.firstName}
                        </span>
                      ) : (
                        <span className="text-el-outline/50 text-[10px]">بدون مفتاح</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {voter.votedStatus ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> صوّت فعلياً
                        </span>
                      ) : (
                        <span className="bg-el-surface-container text-el-on-surface-variant/60 px-3 py-1 rounded-full text-[10px]">
                          لم يصوت بعد
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedVoter(voter)}
                          className="text-el-primary p-1.5 hover:bg-el-surface-container-high rounded transition-all"
                          title="عرض ملف التفاصيل الكامل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(voter)}
                          className="text-el-secondary p-1.5 hover:bg-el-surface-container-high rounded transition-all"
                          title="تعديل بيانات الناخب"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(voter.id, voter.fullName)}
                          className="text-red-500 p-1.5 hover:bg-red-50 rounded transition-all"
                          title="حذف الناخب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleVote(voter.id, voter.votedStatus)}
                          className={`p-1.5 rounded transition-all ${voter.votedStatus ? 'text-el-on-surface-variant hover:bg-el-surface-container-high' : 'text-el-primary hover:bg-el-primary-container'}`}
                          title={voter.votedStatus ? 'إلغاء التصويت' : 'تأكيد التصويت'}
                        >
                          {voter.votedStatus ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-el-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 text-[12px] leading-[16px] text-el-on-surface-variant bg-el-surface-container/5">
            <div>
              الناخبون المعروضون: <span className="font-bold text-el-primary font-mono">{voters.length}</span> من أصل <span className="font-bold text-el-primary font-mono">{total}</span> ناخب مسجل
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded border border-el-outline-variant bg-el-surface-container hover:bg-el-surface-container-high transition-all text-el-on-surface disabled:opacity-50 disabled:pointer-events-none active:scale-95 cursor-pointer"
              >
                السابق
              </button>
              
              <div className="flex items-center gap-1 font-mono">
                <span className="font-bold text-el-primary">{page}</span>
                <span className="text-el-on-surface-variant/60">/</span>
                <span>{Math.ceil(total / limit) || 1}</span>
              </div>

              <button
                type="button"
                onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
                disabled={page >= Math.ceil(total / limit)}
                className="px-3 py-1.5 rounded border border-el-outline-variant bg-el-surface-container hover:bg-el-surface-container-high transition-all text-el-on-surface disabled:opacity-50 disabled:pointer-events-none active:scale-95 cursor-pointer"
              >
                التالي
              </button>
            </div>

            {/* Limit selector */}
            <div className="flex items-center gap-2">
              <span>عرض:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-el-surface-container border border-el-outline-variant text-el-on-surface text-[12px] rounded px-2 py-1 focus:outline-none focus:border-el-primary cursor-pointer"
              >
                <option value={10}>10 صفوف</option>
                <option value={25}>25 صف</option>
                <option value={50}>50 صف</option>
                <option value={100}>100 صف</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {selectedVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-el-outline-variant bg-el-surface-container-low">
              <div>
                <h3 className="text-[20px] font-bold text-el-primary flex items-center gap-2">
                  <User className="w-5 h-5 text-el-secondary" /> ملف الناخب الشامل: {selectedVoter.firstName} {selectedVoter.fatherName || ''} {selectedVoter.grandfatherName || ''} {selectedVoter.fourthName || ''}
                </h3>
                <p className="text-[11px] text-el-on-surface-variant/75 mt-1">
                  الرقم التعريفي للناخب: <span className="font-mono">{selectedVoter.id}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedVoter(null)}
                className="p-1.5 hover:bg-el-surface-container-high rounded-full transition-all text-el-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body - 6 Sections Grid */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. البيانات الشخصية والأساسية */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-el-secondary" /> 1. البيانات الشخصية والأساسية للناخب
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">الاسم الكامل:</span>
                      <span className="font-bold text-el-on-surface">{selectedVoter.firstName} {selectedVoter.fatherName || ''} {selectedVoter.grandfatherName || ''} {selectedVoter.fourthName || ''}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">اللقب / الشهرة:</span>
                      <span className="font-bold text-el-on-surface">{selectedVoter.nickname || selectedVoter.tribe?.name || 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">الجنس:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.gender || 'ذكر'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">العمر:</span>
                      <span className="font-medium text-el-on-surface">{calculateAge(selectedVoter.birthDate || selectedVoter.dateOfBirth)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">التحصيل الدراسي:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.education || selectedVoter.educationLevel || 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">المهنة:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.profession || 'غير محدد'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">الحالة الاجتماعية:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.maritalStatus || 'غير محدد'} {selectedVoter.familySize ? `(عدد أفراد الأسرة: ${selectedVoter.familySize})` : ''}</span>
                    </div>
                  </div>
                </div>

                {/* 2. السكن والدائرة الانتخابية */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-el-secondary" /> 2. السكن والدائرة الانتخابية
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">المحافظة:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.governorate || 'ذي قار'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">القضاء:</span>
                      <span className="font-bold text-el-on-surface">{selectedVoter.district || 'الغراف'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">الناحية:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.subDistrict || 'المركز'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">المنطقة (الحي أو القرية):</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.area || 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">رمز مركز الاقتراع:</span>
                      <span className="font-mono text-el-on-surface">{selectedVoter.pollingCenterId || selectedVoter.ballotStation || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">اسم مركز الاقتراع:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.pollingCenterName || selectedVoter.pollingCenter || '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">العشيرة المرتبطة:</span>
                      <span className="font-bold text-el-primary">{selectedVoter.tribe?.name || 'غير حدد'}</span>
                    </div>
                    <div className="col-span-2 border-t border-el-outline-variant/30 pt-2 mt-1 space-y-1">
                      <span className="block text-[10px] text-el-on-surface-variant/70">تحقق المفوضية:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                        selectedVoter.isRegistryVerified
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-el-surface-container text-el-on-surface-variant/60'
                      }`}>
                        {selectedVoter.isRegistryVerified
                          ? `مؤكد ومطابق (رقم الناخب: ${selectedVoter.registryVoterId || '—'})`
                          : 'غير متحقق منه رسمياً في السجل الفيدرالي'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. بيانات الاتصال والتواصل */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-el-secondary" /> 3. بيانات الاتصال والتواصل
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">رقم الهاتف:</span>
                      <span className="font-mono font-bold text-el-primary">{selectedVoter.phone || selectedVoter.phoneNumber || 'غير متوفر'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">رقم الهوية الوطنية:</span>
                      <span className="font-mono text-el-on-surface">{selectedVoter.nationalId || 'غير متوفر'}</span>
                    </div>
                    <div className="col-span-2 bg-el-surface p-2.5 rounded border border-el-outline-variant/50 space-y-2">
                      <span className="block text-[10px] font-bold text-el-on-surface-variant">حسابات التواصل الاجتماعي:</span>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="block text-[9px] text-el-on-surface-variant/60">فيسبوك:</span>
                          <span className="font-medium text-el-on-surface break-all">{parseSocialMedia(selectedVoter.socialMedia).facebook || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-el-on-surface-variant/60">تليجرام:</span>
                          <span className="font-mono text-el-on-surface break-all">{parseSocialMedia(selectedVoter.socialMedia).telegram || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-el-on-surface-variant/60">واتساب:</span>
                          <span className="font-mono text-el-on-surface break-all">{parseSocialMedia(selectedVoter.socialMedia).whatsapp || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. التصنيف الانتخابي والتقييم الداخلي */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-el-secondary" /> 4. التصنيف الانتخابي والتقييم الداخلي
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">فئة الناخب:</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold inline-block ${
                        selectedVoter.voterCategory === 'مؤيد'
                          ? 'bg-green-100 text-green-800'
                          : selectedVoter.voterCategory === 'ضعيف'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>{selectedVoter.voterCategory || 'محايد'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">درجة الدعم والتأييد:</span>
                      <span className="font-medium text-amber-500 font-bold flex items-center gap-1">
                        {selectedVoter.supportDegree || selectedVoter.confidenceScore || 3} ⭐
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">أسباب الدعم / التحفظات:</span>
                      <span className="font-medium text-el-on-surface block bg-el-surface p-2 rounded border border-el-outline-variant/50 min-h-[50px] leading-relaxed">
                        {selectedVoter.supportReason || 'لا توجد ملاحظات مسجلة حول سبب الدعم.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. بيانات المفتاح الانتخابي */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-el-secondary" /> 5. بيانات المفتاح الانتخابي (المسؤول عن الناخب)
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">المفتاح المسؤول:</span>
                      {selectedVoter.electoralKey || selectedVoter.electionKey ? (
                        <span className="font-bold text-el-primary bg-el-surface-container px-2 py-1 rounded inline-block mt-0.5">
                          {selectedVoter.electoralKey
                            ? `${selectedVoter.electoralKey.code} - ${selectedVoter.electoralKey.firstName} ${selectedVoter.electoralKey.fatherName || ''}`
                            : `${selectedVoter.electionKey?.keyCode || ''} - ${selectedVoter.electionKey?.firstName || ''} ${selectedVoter.electionKey?.fatherName || ''}`
                          }
                        </span>
                      ) : (
                        <span className="text-el-on-surface-variant/50">غير مرتبط بمفتاح انتخابي حالياً</span>
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">علاقة المفتاح بالناخب:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.relationship || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">نسبة التأثير المقدرة:</span>
                      <span className="font-bold text-el-on-surface font-mono">{selectedVoter.influenceRate ?? 50}%</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">المتابعة المباشرة:</span>
                      <span className="font-bold text-el-on-surface">
                        {selectedVoter.isPrimaryFollow ? 'نعم - المفتاح هو المتابع المباشر والرئيسي' : 'لا - توجد قنوات متابعة بديلة'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. سجل التحديث والمتابعة */}
                <div className="border border-el-outline-variant/70 rounded-lg p-4 bg-el-surface-container-low/40 space-y-3">
                  <h4 className="text-[13px] font-bold text-el-primary border-b border-el-outline-variant pb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-el-secondary" /> 6. سجل السجل والتحديث والمتابعة
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">تاريخ أول تواصل:</span>
                      <span className="font-medium text-el-on-surface font-mono">{selectedVoter.firstContactDate ? new Date(selectedVoter.firstContactDate).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">تاريخ آخر تواصل:</span>
                      <span className="font-medium text-el-on-surface font-mono">{selectedVoter.lastContactDate ? new Date(selectedVoter.lastContactDate).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-el-on-surface-variant/70">نتيجة التواصل الأخير:</span>
                      <span className="font-medium text-el-on-surface block bg-el-surface p-2 rounded border border-el-outline-variant/50">
                        {selectedVoter.contactResult || 'لم يتم تسجيل نتائج.'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">الإجراء القادم المطلوب:</span>
                      <span className="font-medium text-el-on-surface">{selectedVoter.nextAction || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-el-on-surface-variant/70">موعد المتابعة القادمة:</span>
                      <span className="font-medium text-el-on-surface font-mono">{selectedVoter.followUpDate ? new Date(selectedVoter.followUpDate).toLocaleDateString('ar-EG') : '—'}</span>
                    </div>
                    <div className="col-span-2 border-t border-el-outline-variant/30 pt-2 mt-1 space-y-1">
                      <span className="block text-[10px] text-el-on-surface-variant/70">التدقيق الجغرافي:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                        selectedVoter.gpsVerified
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-el-surface-container text-el-on-surface-variant/60'
                      }`}>
                        {selectedVoter.gpsVerified
                          ? `موقع مؤكد (GPS Verified - الإحداثيات: Lat: ${selectedVoter.latitude ?? '—'}, Lon: ${selectedVoter.longitude ?? '—'})`
                          : 'لم يتم تدقيق الموقع الجغرافي'
                        }
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t border-el-outline-variant bg-el-surface-container-low text-left">
              <button
                onClick={() => {
                  handleEditClick(selectedVoter);
                  setSelectedVoter(null);
                }}
                className="bg-el-secondary text-el-on-secondary px-4 py-2 rounded text-[13px] font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <Edit2 className="w-4 h-4" /> تعديل البيانات
              </button>
              <button
                onClick={() => setSelectedVoter(null)}
                className="bg-el-primary text-el-on-primary px-6 py-2 rounded text-[13px] font-bold hover:opacity-90 transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

``

## File: src\components\election\WarRoom.tsx

``typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  Phone,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  BarChart3,
} from 'lucide-react';

interface DashboardData {
  totalVoters: number;
  votedCount: number;
  votedPercentage: number;
  districtStats: {
    district: string;
    totalVoters: number;
    votedCount: number;
    votedPercentage: number;
  }[];
  recentAlerts: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    district: string | null;
    createdAt: string;
  }[];
}

interface VoterData {
  voters: {
    id: string;
    fullName: string;
    phoneNumber: string;
    district: string;
    confidenceScore: number;
    votedStatus: boolean;
    tribe: { name: string; influence: number } | null;
    _count: { recruits: number };
  }[];
  total: number;
}

export default function WarRoom() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [highValueVoters, setHighValueVoters] = useState<VoterData['voters']>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, voterRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/voters?votedStatus=false&minConfidence=3&limit=10'),
        ]);
        const dashData = await dashRes.json();
        const voterData = await voterRes.json();
        setDashboardData(dashData);
        setHighValueVoters(Array.isArray(voterData?.voters) ? voterData.voters : []);
      } catch (err) {
        console.error('Error fetching war room data:', err);
      }
    }
    fetchData();
  }, []);

  const votedPercentage = dashboardData?.votedPercentage || 0;
  const districts = dashboardData?.districtStats || [];
  const alerts = dashboardData?.recentAlerts || [];

  return (
    <div
      className="min-h-[calc(100vh-6rem)] -m-4 rounded-sm overflow-hidden"
      style={{ backgroundColor: '#0b1c30', color: '#ffffff' }}
    >
      {/* War Room Header */}
      <div
        className="flex justify-between items-center px-4 h-12"
        style={{ backgroundColor: '#1a2b4b', borderBottom: '1px solid #364768' }}
      >
        <div className="flex items-center gap-4 w-full">
          <h1
            className="text-[20px] leading-[28px] font-semibold whitespace-nowrap"
            style={{ color: '#d8e2ff' }}
          >
            غرفة العمليات - ذي قار
          </h1>

          {/* Massive Horizontal Progress Bar */}
          <div className="flex-grow mx-8 flex flex-col justify-center hidden md:flex">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[11px] leading-[16px] font-bold tracking-[0.05em]" style={{ color: '#d3e4fe' }}>
                نسبة الاقتراع العامة
              </span>
              <span className="text-[12px] leading-[16px] font-bold" style={{ color: '#F59E0B', fontFamily: 'var(--font-geist-mono)' }}>
                {votedPercentage}%
              </span>
            </div>
            <div className="h-4 w-full rounded-full overflow-hidden relative" style={{ backgroundColor: '#4e5e81' }}>
              <div className="h-full transition-all duration-1000 relative" style={{ width: `${votedPercentage}%`, backgroundColor: '#F59E0B' }}>
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="p-2 grid grid-cols-12 gap-2 h-full">
        {/* Left Column: High-Value Targets */}
        <div className="col-span-12 lg:col-span-7 flex flex-col rounded-sm overflow-hidden" style={{ backgroundColor: '#1a2b4b', border: '1px solid #364768' }}>
          <div className="p-3 flex justify-between items-center" style={{ backgroundColor: 'rgba(11,28,48,0.5)', borderBottom: '1px solid #364768' }}>
            <h2 className="text-[18px] leading-[24px] font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: '#F59E0B' }} />
              أهداف عالية القيمة (لم يصوتوا)
            </h2>
            <span className="text-[11px] leading-[16px] font-bold tracking-[0.05em] px-2 py-1 rounded" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>فرز مباشر</span>
          </div>
          <div className="flex-1 overflow-y-auto p-1">
            <table className="w-full text-right">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: '#1a2b4b', borderBottom: '1px solid #364768' }}>
                <tr>
                  <th className="text-[11px] leading-[16px] font-bold tracking-[0.05em] p-2 w-10" style={{ color: '#d3e4fe' }}>الثقة</th>
                  <th className="text-[11px] leading-[16px] font-bold tracking-[0.05em] p-2" style={{ color: '#d3e4fe' }}>الاسم</th>
                  <th className="text-[11px] leading-[16px] font-bold tracking-[0.05em] p-2 text-center w-24" style={{ color: '#d3e4fe' }}>القضاء / العشيرة</th>
                  <th className="text-[11px] leading-[16px] font-bold tracking-[0.05em] p-2 text-center w-32" style={{ color: '#d3e4fe' }}>إجراء</th>
                </tr>
              </thead>
              <tbody style={{ color: '#ffffff' }}>
                {highValueVoters.slice(0, 5).map((voter, index) => (
                  <tr
                    key={voter.id}
                    className="transition-colors h-9"
                    style={{ borderBottom: '1px solid rgba(54,71,104,0.5)', backgroundColor: index % 2 === 1 ? 'rgba(11,28,48,0.3)' : 'transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(11,28,48,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index % 2 === 1 ? 'rgba(11,28,48,0.3)' : 'transparent'; }}
                  >
                    <td className="p-2 text-center">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < voter.confidenceScore ? 'fill-current' : ''}`} style={{ color: i < voter.confidenceScore ? '#F59E0B' : '#d3e4fe' }} />
                        ))}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-[14px] leading-[20px] font-semibold">{voter.fullName}</div>
                      <div className="text-[12px] leading-[16px] font-medium" style={{ color: '#d3e4fe', fontFamily: 'var(--font-geist-mono)' }}>
                        {voter.phoneNumber.replace(/(\+964)(\d{3})(\d{3})(\d{4})/, '$1 $2 *** $4')}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <span className="text-[12px] leading-[16px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: voter.tribe ? '#3e2700' : 'rgba(11,28,48)', color: voter.tribe ? '#F59E0B' : '#d3e4fe', border: voter.tribe ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(117,119,127,0.3)', fontFamily: 'var(--font-geist-mono)' }}>
                        {voter.tribe ? voter.tribe.name : voter.district}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <button className="text-white border px-3 py-1 rounded text-[12px] leading-[16px] flex items-center gap-1 w-full justify-center hover:opacity-90 transition-colors" style={{ backgroundColor: '#031635', borderColor: '#b6c6ef' }}>
                        <Phone className="w-4 h-4" />
                        اتصل
                      </button>
                    </td>
                  </tr>
                ))}
                {highValueVoters.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center" style={{ color: '#d3e4fe' }}>لا توجد أهداف عالية القيمة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-2 h-full">
          {/* District Turnout Leaderboard */}
          <div className="flex-1 rounded-sm overflow-hidden flex flex-col max-h-[60%]" style={{ backgroundColor: '#1a2b4b', border: '1px solid #364768' }}>
            <div className="p-3 flex justify-between items-center" style={{ backgroundColor: 'rgba(11,28,48,0.5)', borderBottom: '1px solid #364768' }}>
              <h2 className="text-[18px] leading-[24px] font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" style={{ color: '#10B981' }} />
                تصدر الأقضية
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {districts
                .sort((a, b) => b.votedPercentage - a.votedPercentage)
                .map((ds, index) => (
                  <div
                    key={ds.district}
                    className="p-2 rounded flex items-center justify-between"
                    style={{
                      border: ds.votedPercentage < 30 ? '1px solid rgba(245,158,11,0.3)' : '1px solid #364768',
                      backgroundColor: ds.votedPercentage < 30 ? 'rgba(62,39,0,0.2)' : 'rgba(11,28,48,0.3)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[12px] leading-[16px] font-bold w-6 text-center"
                        style={{
                          color: index === 0 ? '#10B981' : ds.votedPercentage < 30 ? '#F59E0B' : '#d3e4fe',
                          fontFamily: 'var(--font-geist-mono)',
                        }}
                      >
                        {index + 1}
                      </span>
                      <div
                        className="text-[14px] leading-[20px] font-semibold"
                        style={{ color: ds.votedPercentage < 30 ? '#F59E0B' : '#ffffff' }}
                      >
                        {ds.district}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#4e5e81' }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${ds.votedPercentage}%`,
                            backgroundColor: index === 0 ? '#10B981' : ds.votedPercentage < 30 ? '#F59E0B' : '#b6c6ef',
                          }}
                        />
                      </div>
                      <span
                        className="text-[12px] leading-[16px] font-medium"
                        style={{
                          color: index === 0 ? '#10B981' : ds.votedPercentage < 30 ? '#F59E0B' : '#ffffff',
                          fontFamily: 'var(--font-geist-mono)',
                        }}
                      >
                        {ds.votedPercentage}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Conflict Alerts */}
          <div className="flex-1 rounded-sm flex flex-col overflow-hidden relative" style={{ backgroundColor: '#1a2b4b', border: '1px solid rgba(245,158,11,0.5)' }}>
            {/* Header */}
            <div className="absolute top-0 w-full p-3 backdrop-blur-sm flex justify-between items-center z-10" style={{ backgroundColor: 'rgba(26,43,75,0.8)', borderBottom: '1px solid rgba(245,158,11,0.3)' }}>
              <h2 className="text-[18px] leading-[24px] font-semibold flex items-center gap-2" style={{ color: '#F59E0B' }}>
                <AlertTriangle className="w-5 h-5" />
                سجل التنبيهات المباشر
              </h2>
              <span className="relative flex h-3 w-3">
                <span className="animate-alert-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#F59E0B' }} />
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: '#F59E0B' }} />
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pt-16 p-1 space-y-1">
              {alerts.map((alert) => {
                const isGreen = alert.type === 'INFO';
                const isAmber = alert.type === 'WARNING';
                const borderColor = isGreen ? '#10B981' : isAmber ? '#F59E0B' : '#ffdad6';
                const Icon = isGreen ? ShieldCheck : isAmber ? AlertCircle : AlertTriangle;

                return (
                  <div key={alert.id} className="p-2 rounded-r flex gap-2 items-start" style={{ backgroundColor: 'rgba(11,28,48,0.8)', borderLeft: `2px solid ${borderColor}` }}>
                    <span className="text-[11px] font-medium shrink-0" style={{ color: '#d3e4fe', fontFamily: 'var(--font-geist-mono)' }}>
                      {new Date(alert.createdAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: borderColor }} />
                    <span className="text-[11px] font-medium text-white">
                      {alert.title} {alert.district && `- ${alert.district}`}
                    </span>
                  </div>
                );
              })}
              {alerts.length === 0 && (
                <div className="p-3 text-center" style={{ color: '#d3e4fe' }}>لا توجد تنبيهات</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

``

## File: src\components\ui\accordion.tsx

``typescript
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

``

## File: src\components\ui\alert-dialog.tsx

``typescript
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

``

## File: src\components\ui\alert.tsx

``typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }

``

## File: src\components\ui\aspect-ratio.tsx

``typescript
"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }

``

## File: src\components\ui\avatar.tsx

``typescript
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }

``

## File: src\components\ui\badge.tsx

``typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

``

## File: src\components\ui\breadcrumb.tsx

``typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

``

## File: src\components\ui\button.tsx

``typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

``

## File: src\components\ui\calendar.tsx

``typescript
"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }

``

## File: src\components\ui\card.tsx

``typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

``

## File: src\components\ui\carousel.tsx

``typescript
"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}

``

## File: src\components\ui\chart.tsx

``typescript
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const indicatorColor = color || item.payload.fill || item.color

          return (
            <div
              key={item.dataKey}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center"
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          }
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean
    nameKey?: string
  }) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className={cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}

``

## File: src\components\ui\checkbox.tsx

``typescript
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

``

## File: src\components\ui\collapsible.tsx

``typescript
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

``

## File: src\components\ui\command.tsx

``typescript
"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}

``

## File: src\components\ui\context-menu.tsx

``typescript
"use client"

import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  )
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  )
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  )
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}

``

## File: src\components\ui\dialog.tsx

``typescript
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}

``

## File: src\components\ui\drawer.tsx

``typescript
"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}

``

## File: src\components\ui\dropdown-menu.tsx

``typescript
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}

``

## File: src\components\ui\form.tsx

``typescript
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}

``

## File: src\components\ui\hover-card.tsx

``typescript
"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }

``

## File: src\components\ui\input-otp.tsx

``typescript
"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }

``

## File: src\components\ui\input.tsx

``typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }

``

## File: src\components\ui\label.tsx

``typescript
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }

``

## File: src\components\ui\menubar.tsx

``typescript
"use client"

import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className
      )}
      {...props}
    />
  )
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  )
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        className
      )}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </MenubarPortal>
  )
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}

``

## File: src\components\ui\navigation-menu.tsx

``typescript
import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center"
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}

``

## File: src\components\ui\pagination.tsx

``typescript
import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}

``

## File: src\components\ui\popover.tsx

``typescript
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }

``

## File: src\components\ui\progress.tsx

``typescript
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }

``

## File: src\components\ui\radio-group.tsx

``typescript
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }

``

## File: src\components\ui\resizable.tsx

``typescript
"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

``

## File: src\components\ui\scroll-area.tsx

``typescript
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }

``

## File: src\components\ui\select.tsx

``typescript
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

``

## File: src\components\ui\separator.tsx

``typescript
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }

``

## File: src\components\ui\sheet.tsx

``typescript
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

``

## File: src\components\ui\sidebar.tsx

``typescript
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

``

## File: src\components\ui\skeleton.tsx

``typescript
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }

``

## File: src\components\ui\slider.tsx

``typescript
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }

``

## File: src\components\ui\sonner.tsx

``typescript
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

``

## File: src\components\ui\switch.tsx

``typescript
"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

``

## File: src\components\ui\table.tsx

``typescript
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

``

## File: src\components\ui\tabs.tsx

``typescript
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

``

## File: src\components\ui\textarea.tsx

``typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

``

## File: src\components\ui\toast.tsx

``typescript
"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

``

## File: src\components\ui\toaster.tsx

``typescript
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

``

## File: src\components\ui\toggle-group.tsx

``typescript
"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }

``

## File: src\components\ui\toggle.tsx

``typescript
"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }

``

## File: src\components\ui\tooltip.tsx

``typescript
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

``

## File: src\hooks\use-mobile.ts

``typescript
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

``

## File: src\hooks\use-toast.ts

``typescript
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
    type: ActionType["ADD_TOAST"]
    toast: ToasterToast
  }
  | {
    type: ActionType["UPDATE_TOAST"]
    toast: Partial<ToasterToast>
  }
  | {
    type: ActionType["DISMISS_TOAST"]
    toastId?: ToasterToast["id"]
  }
  | {
    type: ActionType["REMOVE_TOAST"]
    toastId?: ToasterToast["id"]
  }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
              ...t,
              open: false,
            }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

``

## File: src\lib\auth-guard.ts

``typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export interface AuthenticatedUser {
  userId: string;
  role: string;
  username: string;
}

export type AuthenticatedHandler = (
  req: NextRequest,
  context: { params: any; user: AuthenticatedUser }
) => Promise<NextResponse> | Promise<Response>;

export function withAuth(
  handler: AuthenticatedHandler,
  roleConfig: Record<string, string[]>
) {
  return async function (req: NextRequest, context?: any) {
    const method = req.method;
    const allowedRoles = roleConfig[method];
    if (!allowedRoles) {
      return NextResponse.json(
        { error: 'طريقة الطلب غير مسموح بها' },
        { status: 405 }
      );
    }

    const userId = req.headers.get('x-user-id');
    const role = req.headers.get('x-user-role');
    const username = req.headers.get('x-user-name');

    if (!userId || !role || !username) {
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    // Verify the user still exists in DB with matching role/username.
    // This catches: deleted users, role changes, and revoked access — all
    // scenarios the JWT alone cannot detect.
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, role: true },
      });

      if (!dbUser || dbUser.username !== username || dbUser.role !== role.toUpperCase()) {
        return NextResponse.json(
          { error: 'غير مصرح - جلسة منتهية أو صلاحيات تغيرت، يرجى تسجيل الدخول مجدداً' },
          { status: 401 }
        );
      }
    } catch {
      // If DB is temporarily unreachable, fall through — the JWT was already
      // verified cryptographically by middleware. Log the miss for visibility.
      console.warn('[auth-guard] DB user validation skipped (DB unreachable)');
    }

    const normalizedRole = role.toUpperCase();

    const allowed = allowedRoles.map(r => {
      const u = r.toUpperCase();
      if (u === 'VIEWER') return 'OBSERVER';
      return u;
    });

    if (!allowed.includes(normalizedRole)) {
      return NextResponse.json(
        { error: 'غير مصرح - صلاحيات غير كافية' },
        { status: 403 }
      );
    }

    const user: AuthenticatedUser = {
      userId,
      role: normalizedRole,
      username,
    };

    let resolvedParams = {};
    if (context && context.params) {
      resolvedParams = context.params instanceof Promise ? await context.params : context.params;
    }

    return handler(req, { ...context, params: resolvedParams, user });
  };
}

``

## File: src\lib\auth.ts

``typescript
import { SignJWT, jwtVerify } from 'jose';
import { prisma as db } from './prisma';

// JWT Secret - MUST be set via environment variable
// No fallback for security - application will refuse to start without it
let _cachedSecret: Uint8Array | null = null;

const getJwtSecret = (): Uint8Array => {
  if (_cachedSecret) return _cachedSecret;
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'FATAL: JWT_SECRET environment variable must be set and at least 32 characters long. ' +
      'Generate one with: openssl rand -base64 48'
    );
  }
  _cachedSecret = new TextEncoder().encode(secret);
  return _cachedSecret;
};

export interface AuthPayload {
  userId: string;
  username: string;
  role: string; // ADMIN, KEY_USER, OBSERVER
  isOwner: boolean;
}

const TOKEN_EXPIRY = '7d';
const ISSUER = 'electoral-system';
const AUDIENCE = 'electoral-system-users';

/**
 * Create a signed JWT token for an authenticated user
 */
export async function createToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setSubject(payload.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(getJwtSecret());
}

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, null if invalid/expired
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
      isOwner: payload.isOwner as boolean,
    };
  } catch {
    // Token is invalid, expired, or malformed
    return null;
  }
}

/**
 * Validate a token against the database
 * Ensures the user still exists and hasn't been deactivated
 */
export async function validateTokenAgainstDB(payload: AuthPayload): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { username: true, role: true }
    });
    if (!user) return false;
    return user.username === payload.username && user.role === payload.role;
  } catch (error) {
    console.error('Error validating token against DB:', error);
    return false;
  }
}

``

## File: src\lib\campaign.ts

``typescript
export interface ROIResult {
  roi: number;
  label: string;
  hasSpendingData: boolean;
}

/**
 * Calculates Campaign ROI safely
 * If there is no spending data (totalSpent <= 0), it returns hasSpendingData = false.
 */
export function computeCampaignROI(netVotes: number, totalSpent: number): ROIResult {
  if (totalSpent <= 0) {
    return {
      roi: 0,
      label: "لا توجد بيانات إنفاق",
      hasSpendingData: false,
    };
  }

  // Formula: (netVotes / (totalSpent / 1,000,000)) * 10
  const roi = Math.min(200, Math.round((netVotes / (totalSpent / 1000000)) * 10) / 10);
  return {
    roi,
    label: `${roi}%`,
    hasSpendingData: true,
  };
}

``

## File: src\lib\comprehensive-indicators-engine.ts

``typescript
import { prisma } from "./prisma";
import { calculateAllCompositeIndicators } from "./indicators-engine";

export async function calculateComprehensiveIndicators() {
  // 1. Fetch all composite indicators
  const composite = await calculateAllCompositeIndicators();
  const gov = composite.governorate;

  // 2. Fetch voters, keys, tribes, competitors, services, commissionData
  const voters = await prisma.voter.findMany({
    include: { tribe: true, services: true },
  });
  const keys = await prisma.electionKey.findMany({
    include: { tribe: true, services: true },
  });
  const tribes = await prisma.tribe.findMany({
    include: { voters: true },
  });
  const competitors = await prisma.competitor.findMany();
  const commissionData = await prisma.commissionData.findMany();

  const totalVoters = voters.length;
  const totalKeys = keys.length;
  const totalTribes = tribes.length;

  // 3. Calculate voter distributions
  let supportedCount = 0;
  let neutralCount = 0;
  let weakCount = 0;
  voters.forEach((v) => {
    const s = (v.status || "").toUpperCase();
    if (s === "SUPPORTED") supportedCount++;
    else if (s === "WEAK") weakCount++;
    else neutralCount++;
  });

  const totalStatusCount = Math.max(1, totalVoters);
  const supportDistribution = {
    supported: { count: supportedCount, percentage: Math.round((supportedCount / totalStatusCount) * 100) },
    neutral: { count: neutralCount, percentage: Math.round((neutralCount / totalStatusCount) * 100) },
    weak: { count: weakCount, percentage: Math.round((weakCount / totalStatusCount) * 100) },
  };

  // 4. Verification metrics
  const gpsVerifiedCount = voters.filter((v) => v.gpsVerified).length;
  const registryVerifiedCount = voters.filter((v) => v.isRegistryVerified).length;
  const gpsVerificationRate = totalVoters > 0 ? Math.round((gpsVerifiedCount / totalVoters) * 100) : 0;
  const registryVerificationRate = totalVoters > 0 ? Math.round((registryVerifiedCount / totalVoters) * 100) : 0;

  // 5. Accuracy & Services
  const avgAccuracy = keys.length > 0
    ? Math.round((keys.reduce((sum, k) => sum + (k.keyAccuracyScore || 1.0), 0) / keys.length) * 100)
    : 100;

  const servedVoters = voters.filter((v) => v.services.length > 0);
  const servedSupported = servedVoters.filter((v) => (v.status || "").toUpperCase() === "SUPPORTED");
  const serviceConversionRate = servedVoters.length > 0
    ? Math.round((servedSupported.length / servedVoters.length) * 100)
    : 0;

  // 6. Geographic strength & Map
  const districtNames = Array.from(new Set(composite.districts.map((d) => d.name)));
  const geoDistribution = composite.districts.map((d) => ({
    district: d.name,
    netVotes: d.totalNetVotes,
    percentage: d.efiScore,
    keyCount: d.totalKeysInArea,
  }));

  const areaMap = composite.districts.map((d) => {
    let color: "green" | "yellow" | "red" = "yellow";
    if (d.efiScore >= 50) color = "green";
    else if (d.efiScore < 35) color = "red";
    return {
      district: d.name,
      color,
      strength: d.efiScore,
      netVotes: d.totalNetVotes,
      keyCount: d.totalKeysInArea,
    };
  });

  const strongAreas = areaMap.filter((a) => a.color === "green");
  const weakAreas = areaMap.filter((a) => a.color === "red");

  // 7. Key Ranking
  const keyRanking = composite.districts
    .flatMap((d) => {
      // For now, let's fetch enriched keys and rank them globally
      return keys.map((k) => {
        const votersForKey = voters.filter((v) => v.keyId === k.id);
        const kSupported = votersForKey.filter((v) => (v.status || "").toUpperCase() === "SUPPORTED").length;
        const kWeak = votersForKey.filter((v) => (v.status || "").toUpperCase() === "WEAK").length;
        const netVotes = Math.max(0, kSupported - kWeak);

        // weightedScore
        const rawScore =
          ((k.loyaltyScore || 3) - 1) * 20 +
          ((k.influenceLevel || 3) - 1) * 20 +
          ((k.mobilizationCap || 3) - 1) * 15 +
          ((k.riskLevel || 3) - 1) * 15 +
          60;
        const weightedScore = Math.min(100, Math.max(0, Math.round(rawScore / 2)));

        return {
          code: k.keyCode,
          name: `${k.firstName} ${k.fatherName}`,
          nickname: k.tribe?.name || "",
          district: k.district,
          netVotes,
          weightedScore,
          eiiScore: Math.round(weightedScore * 0.8), // approximation for ranking display
          kriScore: Math.round((k.loyaltyScore || 3) * 20),
          drsScore: Math.round((k.riskLevel || 1) * 20),
        };
      });
    })
    // deduplicate by code
    .filter((v, i, self) => self.findIndex((t) => t.code === v.code) === i)
    .sort((a, b) => b.netVotes - a.netVotes)
    .map((k, idx) => ({ ...k, rank: idx + 1 }));

  // Decisive Data Object
  const expectedVotesOnDay = gov.totalSupportedVotes;
  const votesNeededToWin = 12000;
  const electoralGap = Math.max(0, votesNeededToWin - expectedVotesOnDay);
  const winProbability = Math.min(100, Math.round((expectedVotesOnDay / votesNeededToWin) * 100));

  const totalCommissionRegistered = commissionData.reduce((sum, c) => sum + (c.registeredVoters || 0), 0) || 50000;
  const expectedTurnout = commissionData.length > 0
    ? Math.round(commissionData.reduce((sum, c) => {
        const val = c.historicalTurnout || 50;
        return sum + (val > 1 ? val : val * 100);
      }, 0) / commissionData.length)
    : 50;

  const avgKRI = gov.kriScore;
  const avgDRS = gov.drsScore;
  const overallRisk = Math.min(100, Math.max(0, Math.round(avgDRS * 0.6 + (100 - avgKRI) * 0.4)));

  const decisive = {
    expectedVotesOnDay,
    expectedVotes: expectedVotesOnDay,
    votesNeededToWin,
    electoralGap,
    winProbability,
    expectedParticipation: expectedTurnout,
    expectedTurnout,
    overallRisk,
    strongAreas,
    weakAreas,
    geoDistribution,
    keyRanking: keyRanking.slice(0, 10), // return top 10 for dashboard performance
    avgKRI,
    avgDRS,
    stability: `${avgKRI}%`,
    earlyWarning: avgDRS > 50 ? "خطر مرتفع" : avgDRS > 30 ? "تحذير متوسط" : "طبيعي",
    defectionRisk: `${avgDRS}%`,
    supportDistribution,
    supportersDistribution: {
      supported: supportedCount,
      neutral: neutralCount,
      opponent: weakCount,
    },
    areaMap,
    totalNetVotes: gov.totalNetVotes,
    totalRegistered: totalCommissionRegistered,
    projectedSeats: gov.projectedSeats,
    gpsVerificationRate,
    registryVerificationRate,
    averageKeyAccuracy: avgAccuracy,
    serviceConversionRate,
  };

  // Regions Data
  const regions = {
    strongAreas: strongAreas.map((a) => a.district),
    weakAreas: weakAreas.map((a) => a.district),
    priorityIndex: areaMap.map((a) => ({ district: a.district, priority: 100 - a.strength })),
    politicalValue: areaMap.map((a) => ({ district: a.district, value: a.netVotes })),
    competitionIndex: areaMap.map((a) => ({ district: a.district, index: 100 - a.strength })),
    concentrationHHI: 2500, // standard value
    expansionIndex: 65,
    expansionPotential: 35,
    turnoutChange: [],
    votingShift: [],
  };

  // Keys Data
  const keysSection = {
    accuracy: avgAccuracy,
    efficiency: Math.round(gov.campaignROI * 10),
    dependency: 45,
    electoralInfluence: gov.eiiScore,
    ranking: keyRanking,
    strategicValue: keyRanking.map((k) => ({ name: k.name, value: k.weightedScore })),
    lossRisk: keyRanking.map((k) => ({ name: k.name, risk: k.drsScore })),
  };

  // Audience Data
  const maleCount = voters.filter((v) => v.gender === "ذكر").length;
  const femaleCount = voters.filter((v) => v.gender === "أنثى").length;
  const genderRatio = {
    male: maleCount,
    female: femaleCount,
    malePercentage: totalVoters > 0 ? Math.round((maleCount / totalVoters) * 100) : 50,
    femalePercentage: totalVoters > 0 ? Math.round((femaleCount / totalVoters) * 100) : 50,
  };

  const graduatesCount = voters.filter(
    (v) => v.education && ["بكالوريوس", "ماجستير", "دكتوراه", "خريج"].includes(v.education)
  ).length;

  const audience = {
    genderRatio,
    graduatesRatio: totalVoters > 0 ? Math.round((graduatesCount / totalVoters) * 100) : 40,
    segmentation: [],
    topAgeGroups: [],
    hesitantAgeGroups: [],
    votingAgeGroups: [],
    educationImpact: [],
    topProfessions: [],
    topIssues: [],
    segmentMessaging: [],
  };

  // Influence Data
  const tribalVoterCount = voters.filter((v) => v.tribeId).length;
  const tribalInfluence = totalVoters > 0 ? Math.round((tribalVoterCount / totalVoters) * 100) : 60;

  const sortedTribes = tribes
    .map((t) => {
      const tVoters = voters.filter((v) => v.tribeId === t.id);
      const supported = tVoters.filter((v) => (v.status || "").toUpperCase() === "SUPPORTED").length;
      const weak = tVoters.filter((v) => (v.status || "").toUpperCase() === "WEAK").length;
      const net = Math.max(0, supported - weak);
      return { id: t.id, name: t.name, count: tVoters.length, netVotes: net };
    })
    .sort((a, b) => b.count - a.count);

  const influence = {
    tribalInfluence,
    digitalInfluence: 35,
    digitalReach: 40,
    professionalInfluence: [],
    tribalVoting: [],
    topSupportingTribes: sortedTribes.slice(0, 5),
    neutralTribes: sortedTribes.filter((t) => t.netVotes === 0).slice(0, 5),
    competingTribes: sortedTribes.slice(5, 10),
    competitorStrength: competitors.map((c) => ({ competitor: c.name, strength: c.estimatedVotes })),
  };

  // Performance Data
  const performance = {
    mobilization: gov.edriScore,
    readiness: gov.edriScore,
    exhaustion: Math.round(gov.drsScore * 0.8),
    overallLoyalty: gov.kriScore,
    servedCitizens: voters.filter((v) => v.services.length > 0).length,
    recurringServices: [],
    frequentAreas: [],
    needingEffort: [],
  };

  // Investment Data
  const totalSpent = voters.flatMap((v) => v.services).reduce((sum, s) => sum + (s.cost || 0), 0) +
                     keys.flatMap((k) => k.services).reduce((sum, s) => sum + (s.cost || 0), 0);
  const costPerVote = expectedVotesOnDay > 0 ? Math.round(totalSpent / expectedVotesOnDay) : 0;

  const investment = {
    serviceROI: gov.campaignROI,
    financialROI: gov.campaignROI,
    costPerVote,
    investmentKeys: [],
    impactfulServices: [],
  };

  return {
    decisive,
    regions,
    keys: keysSection,
    audience,
    influence,
    performance,
    media: {
      digitalCampaigns: 4,
      dailyDigitalActivity: 75,
      directContactImpact: 85,
      mediaReachable: 60,
      topMessages: [],
    },
    investment,
    pollingDay: {
      supportersTurnout: Math.round(voters.filter((v) => v.votedOnDay).length / Math.max(1, supportedCount) * 100),
      mobilizationAchieved: Math.round(voters.filter((v) => v.votedOnDay).length / Math.max(1, totalVoters) * 100),
      observerCoverage: 95,
      voteProtection: 90,
      protectedVotes: voters.filter((v) => v.votedOnDay && v.gpsVerified).length,
      complaintsRate: 2,
      earlyWarningEDay: 5,
      readinessEDay: gov.edriScore,
      hourlyTurnout: [],
      pollingCenterStrength: [],
    },
    strategic: {
      partyWinRates: [],
      partyStrengthChange: [],
      participationChange: [],
      historicalShifts: [],
      nextElectionForecast: { trend: "صعودي", predictedTurnout: expectedTurnout },
    },
    meta: {
      calculatedAt: new Date().toISOString(),
      totalKeys,
      totalVoters,
      totalTribes,
      totalDistricts: districtNames.length || 1,
    },
  };
}

``

## File: src\lib\config-store.ts

``typescript
import { prisma } from './prisma';

export async function getSystemConfig(): Promise<{ enabled: boolean }> {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 'system' } });
    return config ?? { enabled: true };
  } catch {
    return { enabled: true };
  }
}

export async function setSystemConfig(config: { enabled: boolean }): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { id: 'system' },
    update: { enabled: config.enabled },
    create: { id: 'system', enabled: config.enabled },
  });
}

``

## File: src\lib\indicators-cache.ts

``typescript
import { computeAllIndicators } from "./indicators";

interface CachedIndicators {
  data: Awaited<ReturnType<typeof computeAllIndicators>>;
  timestamp: number;
}

const CACHE_TTL_MS = 15_000;
let cache: CachedIndicators | null = null;
let inFlight: Promise<CachedIndicators["data"]> | null = null;

export async function getCachedIndicators() {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL_MS) return cache.data;
  if (inFlight) return inFlight;
  inFlight = computeAllIndicators()
    .then((data) => { cache = { data, timestamp: Date.now() }; return data; })
    .finally(() => { inFlight = null; });
  return inFlight;
}

export function invalidateIndicatorsCache() {
  cache = null;
}

``

## File: src\lib\indicators-engine.ts

``typescript
import { prisma } from "./prisma";
import { enrichElectoralKey } from "./indicators-helper";
import { allocateSeatsLaguë } from "./seat-projection";

export async function calculateAllCompositeIndicators() {
  // 1. Fetch DB data
  const keys = await prisma.electionKey.findMany({
    include: {
      tribe: true,
      services: true,
    },
  });

  const voters = await prisma.voter.findMany({
    include: {
      tribe: true,
      electionKey: true,
    },
  });

  const sentimentTrends = await prisma.sentimentTrend.findMany();
  const competitors = await prisma.competitor.findMany();
  const commissionData = await prisma.commissionData.findMany();

  // 2. Enrich Keys
  const enrichedKeys = keys.map((key) => enrichElectoralKey(key, voters, sentimentTrends));

  // 3. Define helper to calculate metrics for a subset of keys and voters
  const calculateAreaMetrics = (areaKeys: typeof enrichedKeys, areaVoters: typeof voters, areaName: string) => {
    const totalKeys = areaKeys.length;
    const totalVoters = areaVoters.length;

    // Sum vote counts
    let supportedVotes = 0;
    let neutralVotes = 0;
    let weakVotes = 0;

    if (totalVoters > 0) {
      areaVoters.forEach((v) => {
        const stat = (v.status || "").toUpperCase();
        if (stat === "SUPPORTED") supportedVotes++;
        else if (stat === "WEAK") weakVotes++;
        else neutralVotes++;
      });
    } else {
      // Fallback from keys expected votes
      areaKeys.forEach((k) => {
        supportedVotes += k.supportedVotes;
        neutralVotes += k.neutralVotes;
        weakVotes += k.weakVotes;
      });
    }

    const totalVotes = supportedVotes + neutralVotes + weakVotes;
    const netVotes = Math.max(0, supportedVotes - weakVotes);

    // Weighted averages for key indexes
    const sumVotes = Math.max(1, totalVotes);
    let sumEII = 0;
    let sumKRI = 0;
    let sumVPS = 0;
    let sumDRS = 0;
    let sumROI = 0;
    let sumWeightedScore = 0;

    areaKeys.forEach((k) => {
      const w = k.totalVotes || 1;
      sumEII += k.eiiScore * w;
      sumKRI += k.kriScore * w;
      sumVPS += k.vpsScore * w;
      sumDRS += k.drsScore * w;
      sumROI += k.campaignROI * w;
      sumWeightedScore += k.weightedScore * w;
    });

    const avgEII = Math.round(sumEII / sumVotes);
    const avgKRI = Math.round(sumKRI / sumVotes);
    const avgVPS = Math.round(sumVPS / sumVotes);
    const avgDRS = Math.round(sumDRS / sumVotes);
    const avgROI = Math.round(sumROI / sumVotes);
    const avgWeightedScore = Math.round(sumWeightedScore / sumVotes);

    // API (Area Penetration Index)
    const neutralPercent = totalVotes > 0 ? (neutralVotes / totalVotes) * 100 : 30;
    const expansion = totalVotes > 0 ? (supportedVotes / totalVotes) * 100 : 50;
    const apiScore = Math.round(
      (neutralPercent * 0.3) +
      (expansion * 0.25) +
      (avgKRI * 0.25) +
      (avgWeightedScore * 0.20)
    );

    // EWLI (Early Warning Loss Index)
    const weakVotesRatio = totalVotes > 0 ? (weakVotes / totalVotes) * 100 : 10;
    const threats = avgDRS * 0.8;
    const supportDecline = 100 - avgKRI;
    const competitorStrength = 30; // fallback default
    const ewliScore = Math.round(
      (weakVotesRatio * 0.3) +
      (avgDRS * 0.25) +
      (threats * 0.20) +
      (supportDecline * 0.15) +
      (competitorStrength * 0.10)
    );

    // GSI (Geographic Strength Index)
    const distinctCentersInCommission = Array.from(
      new Set(commissionData.filter((c) => c.district === areaName || areaName === "ذي قار").map((c) => c.pollingCenter))
    );
    const distinctCentersInKeys = Array.from(new Set(areaKeys.map((k) => k.pollingCenter)));
    const coverage = distinctCentersInCommission.length > 0
      ? (distinctCentersInKeys.filter((c) => distinctCentersInCommission.includes(c)).length / distinctCentersInCommission.length) * 100
      : 80; // default coverage if no commission data loaded

    const voteDist = 85;
    const balance = 80;
    const gsiScore = Math.round(
      (coverage * 0.25) +
      (voteDist * 0.25) +
      (avgWeightedScore * 0.25) +
      (balance * 0.25)
    );

    // EDRI (Election Day Readiness Index)
    const trainedKeys = totalKeys > 0
      ? (areaKeys.filter((k) => k.keyAccuracyScore >= 0.8).length / totalKeys) * 100
      : 90;
    const highProtection = totalKeys > 0
      ? (areaKeys.filter((k) => k.riskLevel <= 2).length / totalKeys) * 100
      : 80;
    const gpsVerifiedVoters = areaVoters.filter((v) => v.gpsVerified).length;
    const observers = totalVoters > 0 ? (gpsVerifiedVoters / totalVoters) * 100 : 70;
    const registryVerifiedVoters = areaVoters.filter((v) => v.isRegistryVerified).length;
    const verified = totalVoters > 0 ? (registryVerifiedVoters / totalVoters) * 100 : 60;
    const loyalty = avgKRI;

    const edriScore = Math.round(
      (trainedKeys * 0.2) +
      (highProtection * 0.2) +
      (observers * 0.2) +
      (verified * 0.2) +
      (loyalty * 0.2)
    );

    // EFI (Electoral Forecast Index)
    const efiScore = Math.round(
      (avgEII * 0.15) +
      (avgKRI * 0.15) +
      (avgVPS * 0.20) +
      ((100 - avgDRS) * 0.10) +
      (apiScore * 0.10) +
      ((100 - ewliScore) * 0.10) +
      (gsiScore * 0.10) +
      (edriScore * 0.10)
    );

    // Seat Projection using Saint-Laguë
    // Sum estimated votes of competitors in this area
    const areaCompetitors = competitors.filter(
      (c) => c.baseDistrict === areaName || areaName === "ذي قار"
    );

    const parties = [
      { partyName: "حملتنا الانتخابية", votes: netVotes },
      ...areaCompetitors.map((c) => ({
        partyName: c.party || c.name,
        votes: c.estimatedVotes || 1000,
      })),
    ];

    const totalSeats = 18;
    const allocated = allocateSeatsLaguë(parties, totalSeats);
    const ourSeats = allocated.find((p) => p.partyName === "حملتنا الانتخابية")?.seats || 0;

    return {
      eiiScore: Math.min(100, Math.max(0, avgEII || 70)),
      kriScore: Math.min(100, Math.max(0, avgKRI || 70)),
      vpsScore: Math.min(100, Math.max(0, avgVPS || 70)),
      drsScore: Math.min(100, Math.max(0, avgDRS || 20)),
      campaignROI: Math.min(100, Math.max(0, avgROI || 5)),
      apiScore: Math.min(100, Math.max(0, apiScore || 70)),
      ewliScore: Math.min(100, Math.max(0, ewliScore || 20)),
      gsiScore: Math.min(100, Math.max(0, gsiScore || 70)),
      edriScore: Math.min(100, Math.max(0, edriScore || 75)),
      efiScore: Math.min(100, Math.max(0, efiScore || 70)),
      totalKeysInArea: totalKeys,
      totalNetVotes: netVotes,
      totalSupportedVotes: supportedVotes,
      totalNeutralVotes: neutralVotes,
      totalWeakVotes: weakVotes,
      totalVotersInArea: totalVoters,
      projectedSeats: ourSeats,
    };
  };

  // 4. Calculate governorate (ذي قار) metrics
  const governorateMetrics = calculateAreaMetrics(enrichedKeys, voters, "ذي قار");

  // 5. Calculate per district metrics
  const districtNames = Array.from(new Set(keys.map((k) => k.district || "الغراف")));
  const districts = districtNames.map((dName) => {
    const dKeys = enrichedKeys.filter((k) => k.district === dName);
    const dVoters = voters.filter((v) => v.district === dName);
    const metrics = calculateAreaMetrics(dKeys, dVoters, dName);
    return {
      id: `dist-${dName}`,
      name: dName,
      district: dName,
      ...metrics,
      calculatedAt: new Date().toISOString(),
    };
  });

  return {
    governorate: {
      id: "gov-ذي قار",
      ...governorateMetrics,
      calculatedAt: new Date().toISOString(),
    },
    districts,
    lastCalculated: new Date().toISOString(),
  };
}

``

## File: src\lib\indicators-helper.ts

``typescript
export interface EnrichedKey {
  id: string;
  keyCode: string;
  firstName: string;
  fatherName: string;
  district: string;
  eiiScore: number;
  kriScore: number;
  vpsScore: number;
  drsScore: number;
  campaignROI: number;
  netVotes: number;
  supportedVotes: number;
  neutralVotes: number;
  weakVotes: number;
  totalVotes: number;
  weightedScore: number;
  keyAccuracyScore: number;
  tribeId: string | null;
  subTribeId: string | null;
}

export function enrichElectoralKey(key: any, allVoters: any[] = [], sentimentTrends: any[] = []): any {
  // Filter voters belonging to this key
  const voters = allVoters.filter(v => v.keyId === key.id);
  const services = key.services || [];

  let supportedVotes = 0;
  let neutralVotes = 0;
  let weakVotes = 0;
  let totalVotes = voters.length;

  if (totalVotes > 0) {
    voters.forEach(v => {
      const stat = (v.status || '').toUpperCase();
      if (stat === 'SUPPORTED') {
        supportedVotes++;
      } else if (stat === 'WEAK') {
        weakVotes++;
      } else {
        neutralVotes++;
      }
    });
  } else {
    // Fallback to expectedVotes estimation
    const exp = key.expectedVotes || 0;
    supportedVotes = Math.round(exp * 0.6);
    neutralVotes = Math.round(exp * 0.3);
    weakVotes = Math.round(exp * 0.1);
    totalVotes = exp;
  }

  const netVotes = Math.max(0, supportedVotes - weakVotes);

  // 1. Calculate Weighted Score
  const rawScore =
    ((key.loyaltyScore || 3) - 1) * 20 +
    ((key.influenceLevel || 3) - 1) * 20 +
    ((key.mobilizationCap || 3) - 1) * 15 +
    ((key.riskLevel || 3) - 1) * 15 +
    20 + // placeholder default weight
    10 +
    10 +
    10 +
    10;
  const weightedScore = Math.min(100, Math.max(0, Math.round(rawScore / 2)));

  // 2. EII (Electoral Influence Index)
  const netVotesRatio = totalVotes > 0 ? (netVotes / totalVotes) * 100 : 0;
  const influenceLevelNormalized = ((key.influenceLevel || 3) / 5) * 100;
  const mobilizationCapNormalized = ((key.mobilizationCap || 3) / 5) * 100;
  const eiiScore = Math.round(
    (weightedScore * 0.30) +
    (netVotesRatio * 0.25) +
    (influenceLevelNormalized * 0.25) +
    (mobilizationCapNormalized * 0.20)
  );

  // 3. KRI (Key Reliability Index)
  const loyaltyScoreNormalized = ((key.loyaltyScore || 3) / 5) * 100;
  const supportReasonPresence = totalVotes > 0 
    ? (voters.filter(v => v.supportReason && v.supportReason.trim() !== '').length / totalVotes) * 100 
    : 80;
  const riskLevelInvNormalized = ((6 - (key.riskLevel || 1)) / 5) * 100;
  
  const totalServicesCount = services.length;
  const pendingServicesCount = services.filter((s: any) => s.status === 'قيد المتابعة').length;
  const noRequests = totalServicesCount > 0 
    ? 100 - (pendingServicesCount / totalServicesCount) * 50
    : 100;

  const stability = 100 - (key.riskLevel || 1) * 15;
  const kriScore = Math.round(
    (loyaltyScoreNormalized * 0.25) +
    (supportReasonPresence * 0.20) +
    (riskLevelInvNormalized * 0.20) +
    (noRequests * 0.20) +
    (stability * 0.15)
  );

  // 4. VPS (Vote Probability Score)
  const vpsScore = totalVotes > 0 
    ? Math.round(((supportedVotes * 80 + neutralVotes * 50 + weakVotes * 30) / totalVotes))
    : 80;

  // 5. DRS (Defection Risk Score)
  const loyaltyInv = ((5 - (key.loyaltyScore || 3)) / 4) * 100;
  const weakSupportRatio = totalVotes > 0 ? (weakVotes / totalVotes) * 100 : 10;
  const needsPressure = ((key.riskLevel || 1) / 5) * 100;
  
  const lowEducationRatio = totalVotes > 0
    ? (voters.filter(v => v.education === 'ابتدائي' || v.education === 'أمي' || !v.education).length / totalVotes) * 100
    : 20;
  const lowOrg = (1 - (key.keyAccuracyScore || 1.0)) * 100;
  const noContactRatio = totalVotes > 0
    ? (voters.filter(v => !v.lastContactDate).length / totalVotes) * 100
    : 30;

  const drsScore = Math.round(
    (loyaltyInv * 0.25) +
    (weakSupportRatio * 0.20) +
    (needsPressure * 0.20) +
    (lowEducationRatio * 0.15) +
    (lowOrg * 0.10) +
    (noContactRatio * 0.10)
  );

  // 6. Campaign ROI
  const totalSpent = services.reduce((sum: number, s: any) => sum + (s.cost || 0), 0);
  const campaignROI = totalSpent > 0
    ? Math.round((netVotes / (totalSpent / 1000000)) * 10 * 10) / 10
    : netVotes > 0 ? 10.0 : 0.0;

  return {
    ...key,
    voters,
    services,
    tribe: key.tribe || null,
    subTribe: key.subTribe || null,
    eiiScore: Math.min(100, Math.max(0, eiiScore)),
    kriScore: Math.min(100, Math.max(0, kriScore)),
    vpsScore: Math.min(100, Math.max(0, vpsScore)),
    drsScore: Math.min(100, Math.max(0, drsScore)),
    campaignROI: Math.min(100, Math.max(0, campaignROI)),
    netVotes,
    supportedVotes,
    neutralVotes,
    weakVotes,
    totalVotes,
    weightedScore,
    keyAccuracyScore: key.keyAccuracyScore || 1.0,
  };
}

``

## File: src\lib\indicators.ts

``typescript
import { prisma } from "./prisma";

export async function computeAllIndicators() {
  const totalVoters = await prisma.voter.count();
  const checkedIn = await prisma.voter.count({ where: { votedOnDay: true } });

  // GSI = Checked-In percentage (checkedIn / totalVoters * 100) or default to 0 if totalVoters is 0
  const gsiVal = totalVoters > 0 ? (checkedIn / totalVoters) * 100 : 0;

  // Let's get checked in voters by tribe to satisfy indicators.gsi.byTribe structure
  // and other details:
  // We need indicators.gsi.gsi, indicators.gsi.totalVoters, indicators.gsi.checkedIn, indicators.gsi.byTribe
  const tribes = await prisma.tribe.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          voters: true,
        },
      },
    },
  });

  const checkedInPerTribe = await prisma.voter.groupBy({
    by: ["tribeId"],
    where: { votedOnDay: true },
    _count: {
      id: true,
    },
  });

  const checkedInDict = new Map<string, number>();
  checkedInPerTribe.forEach((g) => {
    if (g.tribeId) {
      checkedInDict.set(g.tribeId, g._count.id);
    }
  });

  const byTribe = tribes.map((t) => {
    const total = t._count.voters;
    const checked = checkedInDict.get(t.id) || 0;
    return {
      tribeId: t.id,
      name: t.name,
      totalVoters: total,
      checkedIn: checked,
      gsi: total > 0 ? (checked / total) * 100 : 0,
    };
  });

  // EDRI computation details:
  // indicators.edri.edri, indicators.edri.dominantTribe, indicators.edri.dominantShare, indicators.edri.entropyScore
  // entropyScore could be computed or static. Let's compute a simple entropy or share.
  // Dominant tribe is the tribe with the highest checked-in voters.
  let dominantTribe = "None";
  let dominantShare = 0;
  let maxChecked = 0;

  byTribe.forEach((bt) => {
    if (bt.checkedIn > maxChecked) {
      maxChecked = bt.checkedIn;
      dominantTribe = bt.name;
    }
  });

  if (checkedIn > 0) {
    dominantShare = maxChecked / checkedIn;
  }

  // Simple Shannon entropy over tribe distributions of checked-in voters
  let entropyScore = 0;
  if (checkedIn > 0) {
    let sum = 0;
    byTribe.forEach((bt) => {
      const p = bt.checkedIn / checkedIn;
      if (p > 0) {
        sum -= p * Math.log2(p);
      }
    });
    entropyScore = Math.round(sum * 100) / 100;
  }

  const edriVal = totalVoters > 0 ? (checkedIn / totalVoters) * 100 : 0;

  return {
    gsi: {
      gsi: Math.round(gsiVal * 10) / 10,
      totalVoters,
      checkedIn,
      byTribe,
    },
    edri: {
      edri: Math.round(edriVal * 10) / 10,
      dominantTribe,
      dominantShare,
      entropyScore,
    },
  };
}

``

## File: src\lib\prisma.ts

``typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

``

## File: src\lib\seat-projection.ts

``typescript
export interface PartyVotes {
  partyName: string;
  votes: number;
}

export interface AllocatedSeats {
  partyName: string;
  seats: number;
}

/**
 * Allocates legislative seats using the Saint-Laguë highest-averages method.
 * Iraqi modified version uses 1.7 as the first divisor.
 */
export function allocateSeatsLaguë(parties: PartyVotes[], totalSeats: number): AllocatedSeats[] {
  if (totalSeats <= 0 || parties.length === 0) {
    return parties.map(p => ({ partyName: p.partyName, seats: 0 }));
  }

  const result: Record<string, number> = {};
  parties.forEach(p => {
    result[p.partyName] = 0;
  });

  // Saint-Laguë highest averages seat allocation loop
  for (let s = 0; s < totalSeats; s++) {
    let maxQuotient = -1;
    let selectedParty = '';

    parties.forEach(p => {
      const seatsAllocated = result[p.partyName];
      // Divisor is 1.7 for first seat (modified Saint-Laguë), then standard 3, 5, 7...
      const divisor = seatsAllocated === 0 ? 1.7 : (2 * seatsAllocated + 1);
      const quotient = p.votes / divisor;

      if (quotient > maxQuotient) {
        maxQuotient = quotient;
        selectedParty = p.partyName;
      }
    });

    if (selectedParty) {
      result[selectedParty]++;
    }
  }

  return parties.map(p => ({
    partyName: p.partyName,
    seats: result[p.partyName] || 0,
  }));
}

``

## File: src\lib\security.ts

``typescript
/**
 * Security utilities library for the Electoral System
 * Provides: RBAC, input sanitization, audit logging, CSRF, rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from './prisma';

// ==================== RBAC (Role-Based Access Control) ====================

export type Role = 'ADMIN' | 'KEY_USER' | 'OBSERVER';

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ['read', 'write', 'delete', 'manage_users', 'change_password', 'toggle_access', 'manage_system'],
  KEY_USER: ['read', 'write', 'manage_own_keys'],
  OBSERVER: ['read'],
};

export function hasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role as Role];
  return perms ? perms.includes(permission) : false;
}

export function getUserFromHeaders(request: NextRequest): {
  userId: string;
  role: string;
  username: string;
} | null {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const username = request.headers.get('x-user-name');

  if (!userId || !role || !username) return null;
  return { userId, role, username };
}

/**
 * Require specific permission - returns error response if not authorized
 */
export function requirePermission(
  request: NextRequest,
  permission: string
): { user: { userId: string; role: string; username: string } } | { error: NextResponse } {
  const user = getUserFromHeaders(request);
  if (!user) {
    return { error: NextResponse.json({ error: 'غير مصرح - يرجى تسجيل الدخول' }, { status: 401 }) };
  }
  if (!hasPermission(user.role, permission)) {
    return { error: NextResponse.json({ error: 'غير مصرح - صلاحيات غير كافية' }, { status: 403 }) };
  }
  return { user };
}

// ==================== Input Sanitization ====================

/**
 * Sanitize string input to prevent XSS and injection
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/['";\\]/g, '')
    .trim()
    .slice(0, 1000);
}

/**
 * Validate and sanitize a CUID ID
 */
export function isValidCuid(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  return /^c[a-z0-9]{20,}$/.test(id);
}

/**
 * Validate phone number (Iraqi format)
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;
  return /^07[3-9]\d{8}$/.test(phone.replace(/\s/g, ''));
}

// ==================== Audit Logging ====================

export type AuditAction = 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'CHANGE_PASSWORD' | 'TOGGLE_ACCESS';

export async function auditLog(params: {
  userId?: string;
  username: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  details?: Record<string, string | number | boolean | null>;
  ipAddress?: string;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId || null,
        username: params.username,
        action: params.action,
        entity: params.entity || null,
        entityId: params.entityId || null,
        details: params.details ? (params.details as any) : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to save audit log to DB:', error);
  }
}

// ==================== CSRF Protection ====================

const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

interface CsrfToken {
  token: string;
  createdAt: number;
}

const csrfTokens = new Map<string, CsrfToken>();

/**
 * Generate a cryptographically secure CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
  // Purge expired tokens
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (now - value.createdAt > CSRF_TOKEN_EXPIRY) {
      csrfTokens.delete(key);
    }
  }

  // Use Web Crypto API (available in both Node.js 19+ and Edge Runtime)
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  csrfTokens.set(sessionId, { token, createdAt: now });
  return token;
}

/**
 * Verify a CSRF token (constant-time comparison to prevent timing attacks)
 */
export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;

  const now = Date.now();
  if (now - stored.createdAt > CSRF_TOKEN_EXPIRY) {
    csrfTokens.delete(sessionId);
    return false;
  }

  // Constant-time comparison
  if (stored.token.length !== token.length) return false;
  let mismatch = 0;
  for (let i = 0; i < stored.token.length; i++) {
    mismatch |= stored.token.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return mismatch === 0;
}

// ==================== Rate Limiting (DB-backed, multi-instance safe) ====================

/**
 * Check rate limit using the database — works across multiple server instances
 * and survives restarts.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): Promise<{ allowed: boolean; remainingAttempts: number; retryAfterMs: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  try {
    const entry = await db.rateLimit.findUnique({ where: { key } });

    if (!entry || entry.lastAttemptAt < windowStart) {
      // First attempt or window expired — reset counter
      await db.rateLimit.upsert({
        where: { key },
        update: { count: 1, lastAttemptAt: now, blockedUntil: null },
        create: { key, count: 1, lastAttemptAt: now },
      });
      return { allowed: true, remainingAttempts: maxAttempts - 1, retryAfterMs: 0 };
    }

    // Still blocked?
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterMs: entry.blockedUntil.getTime() - now.getTime(),
      };
    }

    if (entry.count >= maxAttempts) {
      const blockedUntil = new Date(entry.lastAttemptAt.getTime() + windowMs);
      await db.rateLimit.update({ where: { key }, data: { blockedUntil } });
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterMs: blockedUntil.getTime() - now.getTime(),
      };
    }

    await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 }, lastAttemptAt: now },
    });

    return {
      allowed: true,
      remainingAttempts: maxAttempts - (entry.count + 1),
      retryAfterMs: 0,
    };
  } catch (error) {
    // If DB is temporarily unavailable, fall back to allowing the request
    // rather than locking everyone out
    console.error('Rate limit DB check failed, allowing request:', error);
    return { allowed: true, remainingAttempts: maxAttempts, retryAfterMs: 0 };
  }
}

/**
 * Reset rate limit for a given key (call after successful authentication)
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await db.rateLimit.deleteMany({ where: { key } });
  } catch {
    // non-critical
  }
}

// ==================== Secure Error Handler ====================

/**
 * Handle errors securely - never expose internal details to clients
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  console.error(`API Error${context ? ` (${context})` : ''}:`, error);

  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };

    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'البيانات موجودة مسبقاً - يوجد تكرار في الحقول الفريدة' },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'السجل غير موجود' },
          { status: 404 }
        );
      case 'P2003':
        return NextResponse.json(
          { error: 'مرجع غير صالح - السجل المرتبط غير موجود' },
          { status: 400 }
        );
      default:
        break;
    }
  }

  return NextResponse.json(
    { error: 'حدث خطأ في النظام. يرجى المحاولة لاحقاً' },
    { status: 500 }
  );
}

// ==================== Password Policy ====================

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate password against security policy
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }

  if (password.length > 128) {
    errors.push('كلمة المرور يجب ألا تتجاوز 128 حرف');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على أحرف إنجليزية');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على أرقام');
  }

  const weakPasswords = [
    'password', '12345678', 'qwerty12', 'abc12345',
    'admin2024', 'election2024', 'admin123', 'password1',
  ];
  if (weakPasswords.some(wp => password.toLowerCase().includes(wp))) {
    errors.push('كلمة المرور ضعيفة جداً - يرجى اختيار كلمة مرور أكثر تعقيداً');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

``

## File: src\lib\utils.ts

``typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

``

## File: prisma\schema.prisma

``prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String   @id @default(cuid())
  username      String   @unique
  password      String   // Hashed with bcryptjs
  role          String   // ADMIN, KEY_USER, OBSERVER
  mustChangePwd Boolean  @default(false) // Force password change on first login
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  auditLogs AuditLog[]

  @@index([role])
}

// سجل التدقيق - Audit Logging
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  username  String
  action    String   // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, CHANGE_PASSWORD
  entity    String?  // Tribe, Voter, ElectionKey, Service, etc.
  entityId  String?
  details   Json?    // Additional context
  ipAddress String?
  createdAt DateTime @default(now())
  
  user User? @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@index([entity, entityId])
}

// هيكلة شجرية هرمية لتفكيك النفوذ العشائري بدقة
model Tribe {
  id            String        @id @default(cuid())
  name          String        @unique // اسم العشيرة الرئيسي الموحد
  subTribes     SubTribe[]
  voters        Voter[]
  electionKeys  ElectionKey[]
}

model SubTribe {
  id           String       @id @default(cuid())
  name         String       // اسم الفخذ أو البيت
  tribeId      String
  tribe        Tribe        @relation(fields: [tribeId], references: [id])
  voters       Voter[]
  electionKeys ElectionKey[]
  
  @@unique([name, tribeId])
  @@index([tribeId])
}

model ElectionKey {
  id              String        @id @default(cuid())
  keyCode         String        @unique // كود خاص بكل مفتاح انتخابي
  firstName       String
  fatherName      String
  grandfatherName String
  fourthName      String
  gender          String        // ذكر, أنثى
  birthDate       DateTime
  education       String
  profession      String
  phone           String        @unique
  socialMedia     Json?
  province        String        @default("ذي قار")
  district        String        @default("الغراف")
  subDistrict     String
  pollingCenter   String        // مركز الاقتراع
  expectedVotes   Int           @default(0)
  influenceLevel  Int           @default(1) // (1-5)
  mobilizationCap Int           @default(1) // (1-5)
  loyaltyScore    Int           @default(3) // (1-5)
  riskLevel       Int           @default(1) // (1-5)
  
  // محرك المعايرة الذكية لنسب الانحياز (Dynamic Calibration Engine)
  keyAccuracyScore Float        @default(1.0) // معامل دقة المفتاح التاريخية (0.0 - 1.0)
  reliabilityLogs  Json?        // تتبع منحنى دقة تقارير المفتاح بمرور الوقت
  
  tribeId         String?
  tribe           Tribe?        @relation(fields: [tribeId], references: [id])
  subTribeId      String?
  subTribe        SubTribe?     @relation(fields: [subTribeId], references: [id])
  
  voters          Voter[]
  services        Service[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([tribeId])
  @@index([subTribeId])
  @@index([province])
  @@index([district])
  @@index([influenceLevel])
}

model Voter {
  id              String        @id @default(cuid())
  firstName       String
  fatherName      String
  grandfatherName String
  fourthName      String
  gender          String        // ذكر, أنثى
  birthDate       DateTime
  phone           String?
  education       String?
  profession      String?
  maritalStatus   String?
  familySize      Int?
  nationalId      String?
  area            String?
  socialMedia     Json?
  firstContactDate DateTime?
  province        String        @default("ذي قار")
  district        String        @default("الغراف")
  subDistrict     String
  pollingCenter   String        // مركز الاقتراع الكلي
  ballotStation   String        // رقم المحطة الانتخابية الدقيق (Micro-Targeting)
  status          String        @default("NEUTRAL")
  supportDegree   Int           @default(3) // (1-5)
  supportReason   String?
  voterCategory   String?
  conversionPath  String?
  votedOnDay      Boolean       @default(false) // حالة التصويت الفعلي يوم الاقتراع
  
  // نمذجة الكتلة الصامتة والمترددين (Floating Voters Profile Clustering)
  predictedClusterId String?    // رقم المجموعة الديمغرافية للتنبؤ باتجاه المترددين
  imputationWeights  Json?      // أوزان احتمالية التصويت البديلة
  
  keyId           String
  electionKey     ElectionKey   @relation(fields: [keyId], references: [id])
  
  tribeId         String?
  tribe           Tribe?        @relation(fields: [tribeId], references: [id])
  subTribeId      String?
  subTribe        SubTribe?     @relation(fields: [subTribeId], references: [id])
  
  relationship    String?
  influenceRate   Int           @default(50) // نسبة التأثير المبدئية (0-100%)
  isPrimaryFollow Boolean       @default(true)
  lastContactDate DateTime?
  contactResult   String?
  nextAction      String?
  followUpDate    DateTime?
  
  // حقول التدقيق والتحقق المتقدمة
  latitude        Float?
  longitude       Float?
  gpsVerified     Boolean       @default(false)
  isRegistryVerified Boolean    @default(false)
  registryVoterId String?
  services        Service[]
  tasks           Task[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([keyId])
  @@index([tribeId])
  @@index([subTribeId])
  @@index([province])
  @@index([district])
  @@index([status])
  @@index([votedOnDay])
}

model Service {
  id                   String       @id @default(cuid())
  title                String
  category             String       // صحي، توظيف، رصف، مساعدات...
  description          String
  status               String       // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  cost                 Float        @default(0.0)
  priority             String       @default("NORMAL")
  assignedTo           String?
  estimatedVotesImpact Int          @default(0)
  keyId                String?
  electionKey          ElectionKey? @relation(fields: [keyId], references: [id])
  voterId              String?
  voter                Voter?       @relation(fields: [voterId], references: [id])
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt
  
  @@index([keyId])
  @@index([category])
  @@index([status])
}

model CommissionData {
  id               String  @id @default(cuid())
  province         String
  district         String
  subDistrict      String
  pollingCenter    String  
  ballotStation    String  // المحطة الانتخابية التفصيلية لمطابقة الأرقام
  registeredVoters Int
  historicalTurnout Float
  expectedTurnout  Float?
  
  @@unique([pollingCenter, ballotStation])
  @@index([province])
  @@index([district])
}

model Competitor {
  id              String   @id @default(cuid())
  name            String
  party           String
  tribe           String
  baseDistrict    String
  estimatedVotes  Int      @default(0)
  strengthLevel   Int      @default(3)
  primaryArea     String?
  keyStrengths    String?
  keyWeaknesses   String?
  counterStrategy String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([baseDistrict])
}

model SentimentTrend {
  id          String   @id @default(cuid())
  source      String   // Facebook, Telegram, Local Survey
  sentiment   String   // POSITIVE, NEGATIVE, NEUTRAL
  keywords    String   // stored as JSON string for compatibility
  score       Float
  region      String
  createdAt   DateTime @default(now())
  
  @@index([source])
  @@index([region])
  @@index([createdAt])
}

model Volunteer {
  id                  String   @id @default(cuid())
  fullName            String
  phone               String   @unique
  email               String?
  role                String   // FIELD_AGENT, LOGISTICS, MEDIA, COORDINATOR, ELECTION_DAY_OBSERVER
  district            String?
  area                String?
  notes               String?
  efficiencyScore     Int      @default(100)
  totalAssignedTasks  Int      @default(0)
  totalCompletedTasks Int      @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  tasks               Task[]
}

// إعدادات النظام العامة (تحل محل config.json)
model SystemConfig {
  id        String   @id @default("system")
  enabled   Boolean  @default(true)
  updatedAt DateTime @updatedAt
}

// تحديد معدل الطلبات المحدود (Rate Limiting) — يعمل في بيئات متعددة النسخ
model RateLimit {
  key           String    @id
  count         Int       @default(0)
  lastAttemptAt DateTime  @default(now())
  blockedUntil  DateTime?

  @@index([lastAttemptAt])
}

model Task {
  id             String     @id @default(cuid())
  title          String
  description    String?
  priority       String     @default("NORMAL") // URGENT, HIGH, NORMAL, LOW
  status         String     @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  taskType       String     @default("FIELD")
  district       String?
  impactEstimate String?
  
  targetVoterId  String?
  targetVoter    Voter?     @relation(fields: [targetVoterId], references: [id])
  
  assignedToId   String?
  assignedTo     Volunteer? @relation(fields: [assignedToId], references: [id])
  
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@index([status])
  @@index([priority])
  @@index([district])
}


``

## File: prisma\schema.sqlite.prisma

``prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // Hashed with bcryptjs
  role      String   // ADMIN, KEY_USER, OBSERVER
  createdAt DateTime @default(now())
}

// هيكلة شجرية هرمية لتفكيك النفوذ العشائري بدقة
model Tribe {
  id          String     @id @default(cuid())
  name        String     @unique // اسم العشيرة الرئيسي الموحد
  subTribes   SubTribe[]
  voters      Voter[]
  electionKeys ElectionKey[]
}

model SubTribe {
  id          String      @id @default(cuid())
  name        String      // اسم الفخذ أو البيت
  tribeId     String
  tribe       Tribe       @relation(fields: [tribeId], references: [id])
  voters      Voter[]
  electionKeys ElectionKey[]
  
  @@unique([name, tribeId])
}

model ElectionKey {
  id              String        @id @default(cuid())
  keyCode         String        @unique // كود خاص بكل مفتاح انتخابي
  firstName       String
  fatherName      String
  grandfatherName String
  fourthName      String
  gender          String
  birthDate       DateTime
  education       String
  profession      String
  phone           String        @unique
  socialMedia     Json?
  province        String        @default("ذي قار")
  district        String        @default("الغراف")
  subDistrict     String
  pollingCenter   String        // مركز الاقتراع
  expectedVotes   Int           @default(0)
  influenceLevel  Int           @default(1) // (1-5)
  mobilizationCap Int           @default(1) // (1-5)
  loyaltyScore    Int           @default(3) // (1-5)
  riskLevel       Int           @default(1) // (1-5)
  
  // محرك المعايرة الذكية لنسب الانحياز (Dynamic Calibration Engine)
  keyAccuracyScore Float        @default(1.0) // معامل دقة المفتاح التاريخية (0.0 - 1.0)
  reliabilityLogs  Json?        // تتبع منحنى دقة تقارير المفتاح بمرور الوقت
  
  tribeId         String?
  tribe           Tribe?        @relation(fields: [tribeId], references: [id])
  subTribeId      String?
  subTribe        SubTribe?     @relation(fields: [subTribeId], references: [id])
  
  voters          Voter[]
  services        Service[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model Voter {
  id              String        @id @default(cuid())
  firstName       String
  fatherName      String
  grandfatherName String
  fourthName      String
  gender          String
  birthDate       DateTime
  phone           String?
  education       String?
  profession      String?
  province        String        @default("ذي قار")
  district        String        @default("الغراف")
  subDistrict     String
  pollingCenter   String        // مركز الاقتراع الكلي
  ballotStation   String        // رقم المحطة الانتخابية الدقيق (Micro-Targeting)
  status          String        @default("NEUTRAL")
  supportDegree   Int           @default(3) // (1-5)
  supportReason   String?
  voterCategory   String?
  conversionPath  String?
  votedOnDay      Boolean       @default(false) // حالة التصويت الفعلي يوم الاقتراع
  
  // نمذجة الكتلة الصامتة والمترددين (Floating Voters Profile Clustering)
  predictedClusterId String?    // رقم المجموعة الديمغرافية للتنبؤ باتجاه المترددين
  imputationWeights  Json?      // أوزان احتمالية التصويت البديلة
  
  keyId           String
  electionKey     ElectionKey   @relation(fields: [keyId], references: [id])
  
  tribeId         String?
  tribe           Tribe?        @relation(fields: [tribeId], references: [id])
  subTribeId      String?
  subTribe        SubTribe?     @relation(fields: [subTribeId], references: [id])
  
  relationship    String?
  influenceRate   Int           @default(50) // نسبة التأثير المبدئية (0-100%)
  isPrimaryFollow Boolean       @default(true)
  lastContactDate DateTime?
  contactResult   String?
  nextAction      String?
  followUpDate    DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model Service {
  id              String       @id @default(cuid())
  title           String
  category        String       // صحي، توظيف، رصف، مساعدات...
  description     String
  status          String       // منجزة، قيد المتابعة، مرفوضة
  cost            Float        @default(0.0)
  keyId           String?
  electionKey     ElectionKey? @relation(fields: [keyId], references: [id])
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model CommissionData {
  id               String  @id @default(cuid())
  province         String
  district         String
  subDistrict      String
  pollingCenter    String  
  ballotStation    String  // المحطة الانتخابية التفصيلية لمطابقة الأرقام
  registeredVoters Int
  historicalTurnout Float
  expectedTurnout  Float?
  
  @@unique([pollingCenter, ballotStation])
}

model Competitor {
  id            String @id @default(cuid())
  name          String
  party         String
  tribe         String
  baseDistrict  String
  estimatedVotes Int   @default(0)
}

model SentimentTrend {
  id          String   @id @default(cuid())
  source      String   // Facebook, Telegram, Local Survey
  sentiment   String   // POSITIVE, NEGATIVE, NEUTRAL
  keywords    String
  score       Float
  region      String
  createdAt   DateTime @default(now())
}

``

## File: prisma\seed.js

``javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات (JS)...');

  // Read passwords from environment variables ONLY - no hardcoded defaults
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;

  if (!adminPassword || !userPassword) {
    throw new Error('خطأ حرج: يجب تحديد ADMIN_PASSWORD و USER_PASSWORD في متغيرات البيئة قبل تشغيل الـ seed');
  }

  // Create/Update admin user with mustChangePwd flag
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await bcrypt.hash(adminPassword, 12),
      role: 'ADMIN',
      mustChangePwd: true,
    },
  });

  // Create/Update observer user
  await prisma.user.upsert({
    where: { username: 'observer' },
    update: {},
    create: {
      username: 'observer',
      password: await bcrypt.hash(userPassword, 12),
      role: 'OBSERVER',
      mustChangePwd: true,
    },
  });

  // Create/Update key_user
  await prisma.user.upsert({
    where: { username: 'key_user' },
    update: {},
    create: {
      username: 'key_user',
      password: await bcrypt.hash(userPassword, 12),
      role: 'KEY_USER',
      mustChangePwd: true,
    },
  });

  console.log('🌱 مسح المهام والمتطوعين القدامى لإعادة التهيئة...');
  await prisma.task.deleteMany({});
  await prisma.volunteer.deleteMany({});

  console.log('🌱 تهيئة المتطوعين والكوادر...');
  const vol1 = await prisma.volunteer.create({
    data: {
      fullName: 'علي جاسم محمد',
      phone: '07701234567',
      email: 'ali.jassim@example.com',
      role: 'FIELD_AGENT',
      district: 'الناصرية',
      area: 'الشرقية',
      notes: 'مندوب نشط ذو علاقات واسعة',
      efficiencyScore: 95,
      totalAssignedTasks: 2,
      totalCompletedTasks: 1,
    }
  });

  const vol2 = await prisma.volunteer.create({
    data: {
      fullName: 'فاطمة أحمد حسن',
      phone: '07809876543',
      email: 'fatima.ahmed@example.com',
      role: 'COORDINATOR',
      district: 'الشطرة',
      area: 'المركز',
      notes: 'منسقة متميزة في إدارة الكوادر النسوية',
      efficiencyScore: 88,
      totalAssignedTasks: 1,
      totalCompletedTasks: 1,
    }
  });

  console.log('🌱 تهيئة المهام الميدانية...');
  const firstVoter = await prisma.voter.findFirst();

  await prisma.task.createMany({
    data: [
      {
        title: 'متابعة عائلة آل حسن في الناصرية',
        description: 'التواصل مع الوجيه أبو علي وتأكيد دعمهم الانتخابي وحل مشكلة بطاقاتهم',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        taskType: 'FIELD',
        district: 'الناصرية',
        impactEstimate: '20-30 صوت',
        targetVoterId: firstVoter ? firstVoter.id : null,
        assignedToId: vol1.id,
      },
      {
        title: 'توزيع المنشورات الانتخابية في الشطرة',
        description: 'توزيع البوسترات والبرنامج الانتخابي في السوق المركزي',
        priority: 'NORMAL',
        status: 'COMPLETED',
        taskType: 'FIELD',
        district: 'الشطرة',
        impactEstimate: 'تأثير عام',
        targetVoterId: null,
        assignedToId: vol2.id,
      },
      {
        title: 'حل مشكلة خدمات زقاق 14',
        description: 'متابعة طلب بلدية لتبليط زقاق 14 لضمان كسب 15 ناخب متردد',
        priority: 'HIGH',
        status: 'PENDING',
        taskType: 'FIELD',
        district: 'الناصرية',
        impactEstimate: '15 صوت',
        targetVoterId: null,
        assignedToId: vol1.id,
      }
    ]
  });

  console.log('✅ تم تهيئة قاعدة البيانات بنجاح!');
  console.log('⚠️  جميع المستخدمين مطالبون بتغيير كلمة المرور عند أول دخول');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

``

## File: prisma\seed.postgres.ts

``typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات (PostgreSQL)...');

  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;

  if (!adminPassword || adminPassword.length < 8) {
    console.error('❌ ADMIN_PASSWORD must be set and at least 8 characters long');
    process.exit(1);
  }

  if (!userPassword || userPassword.length < 8) {
    console.error('❌ USER_PASSWORD must be set and at least 8 characters long');
    process.exit(1);
  }

  // Use upsert - non-destructive, won't wipe existing data
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await bcrypt.hash(adminPassword, 12),
      role: 'ADMIN',
      mustChangePwd: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'observer' },
    update: {},
    create: {
      username: 'observer',
      password: await bcrypt.hash(userPassword, 12),
      role: 'OBSERVER',
      mustChangePwd: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'key_user' },
    update: {},
    create: {
      username: 'key_user',
      password: await bcrypt.hash(userPassword, 12),
      role: 'KEY_USER',
      mustChangePwd: true,
    },
  });

  console.log('✅ تم تهيئة قاعدة البيانات بنجاح!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

``

## File: prisma\seed.sqlite.ts

``typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات (SQLite)...');

  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;

  if (!adminPassword || adminPassword.length < 8) {
    console.error('❌ ADMIN_PASSWORD must be set and at least 8 characters long');
    process.exit(1);
  }

  if (!userPassword || userPassword.length < 8) {
    console.error('❌ USER_PASSWORD must be set and at least 8 characters long');
    process.exit(1);
  }

  // Use upsert - non-destructive
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await bcrypt.hash(adminPassword, 12),
      role: 'ADMIN',
      mustChangePwd: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'observer' },
    update: {},
    create: {
      username: 'observer',
      password: await bcrypt.hash(userPassword, 12),
      role: 'OBSERVER',
      mustChangePwd: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'key_user' },
    update: {},
    create: {
      username: 'key_user',
      password: await bcrypt.hash(userPassword, 12),
      role: 'KEY_USER',
      mustChangePwd: true,
    },
  });

  console.log('✅ تم تهيئة قاعدة البيانات بنجاح!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

``

## File: prisma\seed.ts

``typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات بالقبائل والناخبين...');

  const tribesCount = 10;
  const votersPerTribe = 100;

  for (let i = 1; i <= tribesCount; i++) {
    // Check if tribe exists
    let tribe = await prisma.tribe.findUnique({
      where: { id: `tribe_${i}` },
    });

    if (!tribe) {
      tribe = await prisma.tribe.create({
        data: {
          id: `tribe_${i}`,
          name: `قبيلة ${i}`,
        },
      });
    }

    for (let j = 0; j < votersPerTribe; j++) {
      const idx = (i - 1) * votersPerTribe + j;
      const voterId = `voter_${idx}`;
      
      const existingVoter = await prisma.voter.findUnique({
        where: { id: voterId },
      });

      if (!existingVoter) {
        await prisma.voter.create({
          data: {
            id: voterId,
            name: `ناخب ${idx}`,
            nationalId: `NAT-${100000 + idx}`,
            phone: `0770${100000 + idx}`,
            tribeId: tribe.id,
            checkedIn: false,
          },
        });
      }
    }
  }

  console.log('✅ تم تهيئة قاعدة البيانات بنجاح!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

``

## File: docs\api_endpoints.md

``markdown
# دليل نقاط الاتصال وواجهات البرمجة (API Endpoints)

توفر المنظومة الانتخابية مجموعة من واجهات البرمجة RESTful APIs لإدارة وتصفية البيانات الميدانية والتحليلية للمشروع. جميع الطلبات تتطلب ترويسة مصادقة (Bearer JWT Token) أو ملف تعريف ارتباط (Session Cookie) ساري المفعول.

---

## 1. مصادقة الدخول والوصول (`/api/access`)

### تسجيل دخول المستخدمين الميدانيين والمشرفين
- **المسار**: `POST /api/access`
- **الجسم (Body)**:

``

## File: docs\architecture.md

``markdown
# معمارية النظام وهيكلية المنظومة الانتخابية

تحتوي هذه الوثيقة على تفصيل المعمارية التقنية والهيكل العام للماكينة الانتخابية في محافظة ذي قار.

---

## 1. المعمارية العامة (High-Level Architecture)

تعتمد المنظومة على معمارية **Next.js App Router** المتكاملة (Fullstack) حيث يتم الدمج بين الواجهات الأمامية والخدمات الخلفية (API Routes) بشكل متناسق مع الاتصال بقاعدة بيانات **PostgreSQL** مركزية عبر وسيط **Prisma ORM**.


``

## File: docs\developer_guide.md

``markdown
# دليل المطور للأمان، الأداء، والتكامل (Developer Guide)

يركز هذا الدليل على أفضل الممارسات المتبعة في المنظومة لتأمين البيانات الانتخابية، وتحسين استعلامات قاعدة البيانات، وتهيئة بيئة التشغيل اللحظية.

---

## 1. أمان البيانات الانتخابية الحساسة (Data Security)

تمثل البيانات الانتخابية للمواطنين (الهويات الوطنية، أرقام الهواتف، التوجهات السياسية، والتقييم الداخلي) بيانات بالغة الحساسية، لذا تتبع المنظومة المعايير التالية لحمايتها:

### حماية الجلسات والمصادقة
- **عدم استخدام fallback للمفاتيح السرية**: لا يحتوي الكود على أي مفاتيح افتراضية أو نصوص ثابتة لـ `JWT_SECRET`. يتوقف النظام عن الإقلاع فوراً إذا لم يجد متغيراً بيئياً في ملف `.env`.
- **ملفات تعريف الارتباط الآمنة (Secure Cookies)**: يتم ضبط معاملات الكوكي لتستخدم الخصائص التالية تلقائياً في بيئة الإنتاج:
  - `secure: true` (تفرض نقل البيانات عبر HTTPS فقط).
  - `samesite: 'strict'` (تمنع هجمات CSRF).
  - `httpOnly: true` (تمنع قراءة الكوكي عبر سكربتات المتصفح لصد هجمات XSS).

### تعمية كلمات المرور والتحقق
- تشفير كافة كلمات المرور في قاعدة البيانات باستخدام مكتبة `bcryptjs` مع معامل تعقيد (Salt Rounds) ملائم.
- منع استخدام معرفات رقمية متسلسلة للناخبين واستبدالها بـ `CUID` أو `UUID` لمنع هجمات كشف المعرفات العشوائية.

---

## 2. تحسين أداء Prisma مع البيانات الضخمة (Prisma Performance)

عندما يتجاوز سجل الناخبين مئات الآلاف، يصبح أداء الاستعلامات عاملاً حاسماً.

### الفهارس (Database Indexes)
تم وضع فهارس متقاطعة وديناميكية في مخطط Prisma (`schema.prisma`) للاستعلامات الأكثر تكراراً:

``

## File: scenarios\TEST-01.js

``javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    baseline: {
      executor: 'constant-vus',
      vus: 20,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(50)<200', 'p(95)<500', 'p(99)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const roll = Math.random();
  let res;
  if (roll < 0.25) {
    res = http.get(`${BASE}/api/voters?page=1&limit=20`);
  } else if (roll < 0.50) {
    res = http.get(`${BASE}/api/tribes`);
  } else if (roll < 0.75) {
    res = http.get(`${BASE}/api/indicators`);
  } else {
    res = http.post(`${BASE}/api/voters/checkin`,
      JSON.stringify({ voterId: `voter_${randomIntBetween(0, 49999)}` }),
      { headers: { 'Content-Type': 'application/json' } });
  }
  check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 300 });
  sleep(randomIntBetween(1, 3) / 10);
}

``

## File: scenarios\TEST-02.js

``javascript
import http from 'k6/http';
import { check } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    write_spike: {
      executor: 'ramping-arrival-rate',
      startRate: 30,
      timeUnit: '1s',
      preAllocatedVUs: 200,
      maxVUs: 300,
      stages: [
        { target: 30,  duration: '5s' },
        { target: 80,  duration: '5s' },
        { target: 150, duration: '10s' },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.post(`${BASE}/api/voters/checkin`,
    JSON.stringify({ voterId: `voter_${randomIntBetween(0, 49999)}` }),
    { headers: { 'Content-Type': 'application/json' }, timeout: '10s' });

  check(res, {
    'status 2xx': (r) => r.status >= 200 && r.status < 300,
    'no_db_lock': (r) => !String(r.body).includes('SQLITE_BUSY'),
  }, { type: 'no_db_lock' });
}

``

## File: scenarios\TEST-03.js

``javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    dashboard_storm: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '15s',
      preAllocatedVUs: 100,
      maxVUs: 150,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<600'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const ENDPOINTS = [
  '/api/indicators', '/api/stats', '/api/tribes', '/api/voters?page=1',
];

export default function () {
  const ep = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  const res = http.get(`${BASE}${ep}`);
  check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 300 });
}

``

## File: scenarios\TEST-04.js

``javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    mixed_peak: {
      executor: 'per-vu-iterations',
      vus: 200,
      iterations: 5,
      maxDuration: '60s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const roll = Math.random();
  let res, tags;
  if (roll < 0.35) {
    tags = { op: 'write' };
    res = http.post(`${BASE}/api/voters/checkin`,
      JSON.stringify({ voterId: `voter_${randomIntBetween(0, 49999)}` }),
      { headers: { 'Content-Type': 'application/json' }, tags });
  } else if (roll < 0.60) {
    tags = { op: 'read' };
    res = http.get(`${BASE}/api/indicators`, { tags });
  } else if (roll < 0.75) {
    tags = { op: 'read' };
    res = http.get(`${BASE}/api/search?q=${encodeURIComponent('ناخب ' + randomIntBetween(1, 5000))}`, { tags });
  } else {
    tags = { op: 'read' };
    res = http.get(`${BASE}/api/voters?page=${randomIntBetween(1, 50)}`, { tags });
  }
  check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 300 });
  sleep(randomIntBetween(15, 20) / 1000);
}

``

## File: scenarios\TEST-05.js

``javascript
import http from 'k6/http';
import { check } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    search_load: {
      executor: 'constant-arrival-rate',
      rate: 45,            // ~30 search + 15 write per second
      timeUnit: '1s',
      duration: '20s',
      preAllocatedVUs: 100,
      maxVUs: 150,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<600'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const TERMS = ['ناخب 1', 'ناخب 23', '100000', '999', 'ناخب 45', '200'];

export default function () {
  if (Math.random() < 0.67) {
    const q = TERMS[Math.floor(Math.random() * TERMS.length)];
    const res = http.get(`${BASE}/api/search?q=${encodeURIComponent(q)}`, { tags: { op: 'search' } });
    check(res, { 'search 2xx': (r) => r.status >= 200 && r.status < 300 });
  } else {
    const res = http.post(`${BASE}/api/voters/checkin`,
      JSON.stringify({ voterId: `voter_${randomIntBetween(0, 49999)}` }),
      { headers: { 'Content-Type': 'application/json' }, tags: { op: 'write' } });
    check(res, { 'write 2xx': (r) => r.status >= 200 && r.status < 300 });
  }
}

``

## File: scenarios\TEST-06.js

``javascript
import http from 'k6/http';
import { check } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    closing_burst: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 600,
      maxDuration: '90s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const k = __ITER % 4;
  let res;
  if (k === 0) {
    res = http.post(`${BASE}/api/voters/checkin`,
      JSON.stringify({ voterId: `voter_${randomIntBetween(0, 49999)}` }),
      { headers: { 'Content-Type': 'application/json' }, timeout: '15s' });
  } else if (k === 1) {
    res = http.get(`${BASE}/api/indicators`, { timeout: '15s' });
  } else if (k === 2) {
    res = http.get(`${BASE}/api/voters?page=1`, { timeout: '15s' });
  } else {
    res = http.get(`${BASE}/api/tribes`, { timeout: '15s' });
  }
  check(res, { 'served': (r) => r.status !== 0 }, { type: 'served' });
}

``

