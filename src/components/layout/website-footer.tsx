
import { Gem } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Security', href: '/security' },
    { label: 'Login', href: '/login' },
    { label: 'Sign Up', href: '/signup' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
  Resources: [
    { label: 'Blog', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'System Status', href: '/portal/status' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

export function WebsiteFooter() {
  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-xl mb-2">
              <Gem className="h-7 w-7 text-primary" />
              <span className="font-headline">Deskwise</span>
            </Link>
            <p className="text-sm text-muted-foreground">The AI-Powered Service Platform</p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Deskwise AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
