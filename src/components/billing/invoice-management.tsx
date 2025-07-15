'use client';

import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Calendar, DollarSign, Download, Eye, Loader2 } from 'lucide-react';
import type { Invoice } from '@/lib/types';

interface InvoiceManagementProps {
  contractId: string;
  contractName: string;
}

export function InvoiceManagement({ contractId, contractName }: InvoiceManagementProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchInvoices();
  }, [contractId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/billing/${contractId}/invoices`);
      if (response.ok) {
        const invoicesData = await response.json();
        setInvoices(invoicesData);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/billing/${contractId}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingPeriodStart: new Date(billingPeriod.start).toISOString(),
          billingPeriodEnd: new Date(billingPeriod.end).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const newInvoice = await response.json();
      setInvoices(prev => [newInvoice, ...prev]);
      setShowGenerateDialog(false);
      
      // Reset to next month
      const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
      const nextMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0);
      setBillingPeriod({
        start: nextMonth.toISOString().split('T')[0],
        end: nextMonthEnd.toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices
          </CardTitle>
          <CardDescription>Generated invoices for {contractName}</CardDescription>
        </div>
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-1" />
              Generate Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Invoice</DialogTitle>
              <DialogDescription>
                Create a new invoice for the specified billing period.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Billing Period Start</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={billingPeriod.start}
                    onChange={(e) =>
                      setBillingPeriod(prev => ({ ...prev, start: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Billing Period End</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={billingPeriod.end}
                    onChange={(e) =>
                      setBillingPeriod(prev => ({ ...prev, end: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowGenerateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateInvoice}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Invoice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length > 0 ? (
              invoices.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {new Date(invoice.billingPeriodStart).toLocaleDateString()} - {new Date(invoice.billingPeriodEnd).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No invoices generated yet. Click "Generate Invoice" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}