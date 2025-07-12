import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lock, Server, Globe, KeyRound } from 'lucide-react';
import Link from 'next/link';

const securityFeatures = [
    {
        icon: Lock,
        title: "Single Sign-On (SSO)",
        description: "Integrate with your existing SAML 2.0 identity provider (like Okta, Azure AD, or Google Workspace) to streamline user access and enforce organizational login policies."
    },
    {
        icon: KeyRound,
        title: "Multi-Factor Authentication (MFA)",
        description: "Add an extra layer of security to user accounts, requiring a second verification step to prevent unauthorized access even if passwords are compromised."
    },
    {
        icon: Users,
        title: "SCIM Provisioning",
        description: "Automate user lifecycle management. Automatically create, update, and deactivate user accounts in Deskwise when they are changed in your identity provider."
    },
    {
        icon: Shield,
        title: "Role-Based Access Control",
        description: "Implement the principle of least privilege with granular, role-based permissions that control exactly what users can see and do within the platform."
    },
    {
        icon: Globe,
        title: "Multi-Region Data Hosting",
        description: "Choose where your data is stored to meet data residency and sovereignty requirements. Our infrastructure is built on globally recognized, secure cloud providers."
    },
    {
        icon: Server,
        title: "Encryption At-Rest and In-Transit",
        description: "All your data is encrypted using industry-standard AES-256 encryption while stored, and protected with TLS 1.2+ while in transit."
    }
];

const complianceBadges = [
    { name: "SOC 2 Type II", status: "Certified", hint: "badge soc2" },
    { name: "ISO 27001", status: "Certified", hint: "badge iso" },
    { name: "GDPR", status: "Compliant", hint: "badge gdpr" },
    { name: "HIPAA", status: "Compliant", hint: "badge hipaa" },
];

export default function SecurityPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <Badge>Enterprise-Grade Security</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-headline mt-4">Security is Our Foundation</h1>
          <p className="text-lg text-muted-foreground mt-4">
            We are committed to protecting your data with a multi-layered security approach, ensuring your information is safe, secure, and compliant.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature) => (
              <div key={feature.title}>
                <div className="bg-primary/10 p-3 rounded-lg w-fit">
                    <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mt-4">{feature.title}</h3>
                <p className="text-muted-foreground mt-2">{feature.description}</p>
              </div>
            ))}
        </div>

        <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold font-headline">Compliance & Certifications</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                We adhere to the highest industry standards to ensure your data is handled responsibly.
            </p>
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
                {complianceBadges.map(badge => (
                    <div key={badge.name} className="flex items-center gap-2 border rounded-full py-2 px-4 bg-secondary/50">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="font-semibold">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{badge.status}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-20 max-w-4xl mx-auto text-center bg-secondary/80 p-8 rounded-lg">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-headline">Have a security question?</h2>
            <p className="text-muted-foreground mt-2">
                Our security team is here to help. Contact us for detailed security documentation or to report a vulnerability.
            </p>
            <Button asChild className="mt-6">
                <Link href="/contact-sales">Contact Security Team</Link>
            </Button>
        </div>

      </div>
    </div>
  );
}
