'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lock, Server, Globe, KeyRound, Shield, Users, FileCheck, AlertTriangle, Eye, Database, CloudSnow, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const securityFeatures = [
    {
        icon: Lock,
        title: "Single Sign-On (SSO)",
        description: "Integrate with your existing SAML 2.0 identity provider (like Okta, Azure AD, or Google Workspace) to streamline user access and enforce organizational login policies.",
        category: "Authentication"
    },
    {
        icon: KeyRound,
        title: "Multi-Factor Authentication (MFA)",
        description: "Add an extra layer of security to user accounts, requiring a second verification step to prevent unauthorized access even if passwords are compromised.",
        category: "Authentication"
    },
    {
        icon: Users,
        title: "SCIM Provisioning",
        description: "Automate user lifecycle management. Automatically create, update, and deactivate user accounts in Deskwise when they are changed in your identity provider.",
        category: "Identity Management"
    },
    {
        icon: Shield,
        title: "Role-Based Access Control",
        description: "Implement the principle of least privilege with granular, role-based permissions that control exactly what users can see and do within the platform.",
        category: "Authorization"
    },
    {
        icon: Globe,
        title: "Multi-Region Data Hosting",
        description: "Choose where your data is stored to meet data residency and sovereignty requirements. Our infrastructure is built on globally recognized, secure cloud providers.",
        category: "Infrastructure"
    },
    {
        icon: Server,
        title: "Encryption At-Rest and In-Transit",
        description: "All your data is encrypted using industry-standard AES-256 encryption while stored, and protected with TLS 1.3 while in transit.",
        category: "Encryption"
    },
    {
        icon: Database,
        title: "Zero-Trust Architecture",
        description: "Every request is authenticated and authorized, with no implicit trust granted based on network location or user credentials alone.",
        category: "Architecture"
    },
    {
        icon: Eye,
        title: "Continuous Monitoring",
        description: "24/7 security monitoring with automated threat detection and incident response capabilities powered by AI and security experts.",
        category: "Monitoring"
    },
    {
        icon: CloudSnow,
        title: "Data Loss Prevention",
        description: "Advanced DLP policies prevent sensitive data from leaving your organization through automated scanning and policy enforcement.",
        category: "Data Protection"
    }
];

const complianceBadges = [
    { name: "SOC 2 Type II", status: "Certified", description: "Annual security audit by independent third party" },
    { name: "ISO 27001", status: "Certified", description: "International standard for information security management" },
    { name: "GDPR", status: "Compliant", description: "European data protection regulation compliance" },
    { name: "HIPAA", status: "Compliant", description: "Healthcare data protection standards" },
    { name: "PCI DSS", status: "Compliant", description: "Payment card industry data security standards" },
    { name: "CCPA", status: "Compliant", description: "California consumer privacy act compliance" }
];

const securityPractices = [
    {
        title: "Vulnerability Management",
        description: "Regular security assessments, penetration testing, and vulnerability scanning",
        frequency: "Weekly"
    },
    {
        title: "Security Training",
        description: "Mandatory security awareness training for all employees",
        frequency: "Quarterly"
    },
    {
        title: "Incident Response",
        description: "24/7 security operations center with defined incident response procedures",
        frequency: "24/7"
    },
    {
        title: "Data Backups",
        description: "Automated, encrypted backups with point-in-time recovery capabilities",
        frequency: "Continuous"
    }
];

export default function SecurityPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Enterprise-Grade Security
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-headline mb-6">
            Security You Can Trust
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            Built with security at its core, Deskwise meets the highest industry standards to protect your most sensitive data and ensure compliance with global regulations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/contact" className="flex items-center gap-2">
                Get Security Documentation
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
              <Link href="/signup" className="flex items-center gap-2">
                Start Secure Trial
                <Lock className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Comprehensive Security Controls</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Multi-layered security architecture designed to protect against modern threats
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="text-xs mb-2">{feature.category}</Badge>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Certifications */}
      <section className="py-24 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Compliance & Certifications</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We adhere to the highest industry standards and undergo regular audits to ensure your data is handled responsibly
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {complianceBadges.map((badge, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{badge.name}</h3>
                <Badge variant="secondary" className="mb-3">{badge.status}</Badge>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground mb-6">All certifications are independently verified and audited annually</p>
            <Button asChild variant="outline">
              <Link href="/contact" className="flex items-center gap-2">
                Download Compliance Reports
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Security Operations</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Proactive security measures and continuous monitoring to protect your data
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {securityPractices.map((practice, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold">{practice.title}</h3>
                  <Badge>{practice.frequency}</Badge>
                </div>
                <p className="text-muted-foreground">{practice.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Security */}
      <section className="py-24 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6">Infrastructure Security</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <Server className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Cloud-Native Architecture</h4>
                    <p className="text-muted-foreground">Built on AWS and Google Cloud with automatic scaling, redundancy, and disaster recovery</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Network Security</h4>
                    <p className="text-muted-foreground">Private networks, VPCs, and firewall rules limit access to authorized traffic only</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Intrusion Detection</h4>
                    <p className="text-muted-foreground">Real-time monitoring and automated threat response using AI-powered security tools</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform rotate-6"></div>
              <div className="relative bg-background border-2 border-primary/10 rounded-2xl p-2 shadow-2xl">
                <Image 
                  src="https://placehold.co/600x400/1e40af/ffffff.png" 
                  width={600} 
                  height={400} 
                  alt="Security infrastructure diagram" 
                  className="rounded-xl" 
                  data-ai-hint="modern cloud security architecture diagram with shields and locks"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Transparency & Trust</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We believe in complete transparency about our security practices and incident handling
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Security Documentation</h3>
              <p className="text-muted-foreground mb-6">Comprehensive security documentation available to enterprise customers</p>
              <Button variant="outline" size="sm">
                <Link href="/contact">Request Access</Link>
              </Button>
            </Card>
            
            <Card className="p-8 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Incident Response</h3>
              <p className="text-muted-foreground mb-6">Transparent communication during security incidents with detailed post-mortems</p>
              <Button variant="outline" size="sm">
                <Link href="/status">Status Page</Link>
              </Button>
            </Card>
            
            <Card className="p-8 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Bug Bounty Program</h3>
              <p className="text-muted-foreground mb-6">Reward security researchers who help us identify vulnerabilities</p>
              <Button variant="outline" size="sm">
                <Link href="/contact">Report Vulnerability</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Security Team */}
      <section className="py-24 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Have Security Questions?</h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12">
            Our security team is here to help. Contact us for detailed security documentation, to report a vulnerability, or to discuss your specific compliance requirements.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
              <Link href="/contact" className="flex items-center gap-2">
                Contact Security Team
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
              <Link href="mailto:security@deskwise.com" className="flex items-center gap-2">
                Report Vulnerability
                <AlertTriangle className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}