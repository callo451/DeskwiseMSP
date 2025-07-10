# Guide: Next Steps for Multi-Tenancy & SSO

This guide outlines the necessary next steps to fully implement multi-tenant subdomains and Single Sign-On (SSO) in your Deskwise application. The UI for managing your company subdomain is in place; this document covers the required infrastructure and application logic.

## Part 1: Wildcard DNS for Per-Tenant Subdomains

To allow each of your clients to have their own subdomain (e.g., `client-a.deskwise.app`, `client-b.deskwise.app`), you need to configure a wildcard DNS record.

### What is a Wildcard DNS Record?

A wildcard record directs requests for non-existent subdomains to a specific server. By setting up a `*` record, you tell the DNS system that any subdomain under your primary domain should point to your application.

### How to Configure It (High-Level Steps)

This configuration is done with your DNS provider (e.g., Google Domains, Cloudflare, Namecheap, GoDaddy).

1.  **Log in** to your DNS provider's dashboard.
2.  Navigate to the DNS management page for your domain (e.g., `deskwise.app`).
3.  **Create a new DNS record** with the following settings:
    *   **Type:** `A` (if you have a static IP address) or `CNAME` (if your hosting provider gives you a target hostname, like Vercel or Firebase App Hosting).
    *   **Name/Host:** `*` (this single character represents the wildcard).
    *   **Value/Points to:**
        *   For an `A` record: The IP address of your application server.
        *   For a `CNAME` record: The target hostname provided by your hosting platform (e.g., `cname.vercel-dns.com`).
    *   **TTL (Time to Live):** You can usually leave this at the default setting (e.g., 1 hour).

**Example (CNAME):**
`*.deskwise.app  ->  cname.your-hosting-provider.com`

After saving, any request to a subdomain like `random-client.deskwise.app` will be routed to your application server.

---

## Part 2: Application Logic with Next.js Middleware

Once DNS is configured, your Next.js application will receive requests for all subdomains. The next step is to handle these requests using middleware.

### Create a `middleware.ts` File

Create a file named `middleware.ts` in the `src` directory of your project (`src/middleware.ts`). This file will intercept every incoming request.

### Middleware Implementation

Here is a conceptual example of what the middleware code would look like. This code inspects the hostname, extracts the subdomain, and rewrites the URL internally to load the correct tenant's content.

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the URL to modify it
  const url = request.nextUrl.clone();
  
  // Extract the hostname (e.g., 'client-a.deskwise.app')
  const hostname = request.headers.get('host');
  if (!hostname) {
    return new Response(null, { status: 400, statusText: 'No hostname found' });
  }

  // Define your main domain
  const mainDomain = 'deskwise.app';

  // Extract the subdomain by removing the main domain part
  const subdomain = hostname.replace(`.${mainDomain}`, '');

  // If it's a subdomain request and not the main domain itself
  if (subdomain !== hostname) {
    // Here, you would typically look up the subdomain in your database
    // to verify it belongs to a valid tenant.
    // For this example, we'll assume it's valid.

    // Rewrite the path to include the subdomain as a parameter,
    // which can then be used by your pages.
    // e.g., 'client-a.deskwise.app/dashboard' becomes '/portal/client-a/dashboard'
    url.pathname = `/portal/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Allow all other requests to pass through
  return NextResponse.next();
}

export const config = {
  // Define which paths the middleware should run on.
  // This helps avoid running it on static files or API routes unnecessarily.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

This setup allows you to build your client portal pages under a structure like `src/app/portal/[tenant]/dashboard/page.tsx`, where `[tenant]` is the dynamic subdomain.

---

## Part 3: Connecting to Multi-Tenant SAML SSO

With per-tenant subdomains in place, you can now implement a robust multi-tenant SSO system.

1.  **Identity Provider (IdP) Configuration:** Each of your clients will configure their IdP (like Okta, Azure AD, etc.) to point to your application. A key part of this is the **Assertion Consumer Service (ACS) URL**. Because of your subdomain setup, you can provide a tenant-specific ACS URL:
    `https://client-a.deskwise.app/api/auth/saml/callback`

2.  **Application Logic:** When your application receives a SAML response at the callback URL, it can identify the tenant from the subdomain (`client-a`). This allows you to:
    *   Look up the correct SSO configuration for that specific tenant (e.g., their X.509 certificate, Entity ID).
    *   Validate the SAML assertion using the tenant's unique credentials.
    *   Provision or log in the user under the correct tenant account.

This architecture ensures that each tenant's authentication flow is securely isolated. The **SSO Settings** page in your Deskwise app is where you would store the IdP details (SSO URL, certificate) for each tenant, which your API would retrieve during the SAML callback process.
