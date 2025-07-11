
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { assets as allAssets, contracts } from '@/lib/placeholder-data';
import type { Contract, Asset } from '@/lib/types';
import {
  FileText,
  DollarSign,
  Calendar,
  ChevronLeft,
  Link as LinkIcon,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const DetailRow = ({ label, value, icon: Icon }: { label: string; value?: React.ReactNode, icon?: React.ElementType }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
      <div className="font-medium text-right">{value}</div>
    </div>
  );
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
};

const AssetRow = ({ asset }: { asset: Asset }) => (
    <TableRow>
      <TableCell><Link href={`/assets/${asset.id}`} className="font-medium text-primary hover:underline">{asset.name}</Link></TableCell>
      <TableCell>{asset.type}</TableCell>
      <TableCell>{asset.os}</TableCell>
      <TableCell className="text-right"><Button variant="ghost" size="icon" asChild><Link href={`/assets/${asset.id}`}><ChevronRight className="h-4 w-4" /></Link></Button></TableCell>
    </TableRow>
);


export default function ContractDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  
  const contract = contracts.find(c => c.id === params.id);
  const coveredAssets = contract ? allAssets.filter(a => a.contractId === contract.id) : [];

  if (!contract) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Contract Not Found</CardTitle>
            <CardDescription>The requested contract could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link href="/billing">Back to Billing</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleGenerateInvoice = () => {
    toast({
      title: "Invoice Generated (Simulated)",
      description: `An invoice for ${contract.name} has been created.`,
    });
  };

  const getStatusVariant = (status: Contract['status']) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Expired': return 'destructive';
      case 'Pending': return 'secondary';
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
               <Button asChild variant="outline" size="icon" className="h-8 w-8">
                  <Link href="/billing"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Back to billing</span></Link>
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">{contract.name}</h1>
                <Badge variant={getStatusVariant(contract.status)}>{contract.status}</Badge>
            </div>
            <p className="text-muted-foreground ml-12">
              For <Link href={`/clients/${contract.clientId}`} className="font-medium text-primary hover:underline">{contract.clientName}</Link>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Edit Contract</Button>
            <Button onClick={handleGenerateInvoice}>Generate Invoice</Button>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
                 <Card>
                    <CardHeader><CardTitle>Contract Details</CardTitle></CardHeader>
                    <CardContent className="divide-y divide-border -mt-2">
                        <DetailRow label="Monthly Recurring Revenue" value={formatCurrency(contract.mrr)} icon={DollarSign} />
                        <DetailRow label="Term Start Date" value={new Date(contract.startDate).toLocaleDateString()} icon={Calendar} />
                        <DetailRow label="Term End Date" value={new Date(contract.endDate).toLocaleDateString()} icon={Calendar} />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>Recurring Services</CardTitle>
                        <CardDescription>Services included in this contract's monthly recurring revenue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Qty</TableHead><TableHead>Rate</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {contract.services.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <div className="font-medium">{s.name}</div>
                                            <div className="text-xs text-muted-foreground">{s.description}</div>
                                        </TableCell>
                                        <TableCell>{s.quantity}</TableCell>
                                        <TableCell>{formatCurrency(s.rate)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(s.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><HardDrive className="h-5 w-5"/>Covered Assets</CardTitle>
                        <CardDescription>Assets that are covered under this service agreement.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>OS</TableHead><TableHead><span className="sr-only">View</span></TableHead></TableRow></TableHeader>
                            <TableBody>
                                {coveredAssets.length > 0 ? (
                                    coveredAssets.map(asset => <AssetRow key={asset.id} asset={asset} />)
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No assets are currently covered by this contract.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
  );
}
