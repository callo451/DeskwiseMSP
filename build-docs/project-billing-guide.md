# Guide: Next Steps for Project Billing & Invoicing

This guide outlines the necessary next steps to build upon the foundational project billing features in your Deskwise application. The UI for manually generating an invoice from a contract and the settings page for future automation are now in place. This document covers the required backend logic and integration points to create a fully automated, end-to-end billing system.

## Part 1: Implement Invoice Generation Logic

The "Generate Invoice" button on the contract details page currently simulates the action. To make this functional, you need to implement the backend logic to create an invoice record.

### High-Level Steps:

1.  **Create an Invoice Data Model:** Define a new `Invoice` model in your database. It should include fields like `invoiceId`, `contractId`, `clientId`, `status` (e.g., Draft, Sent, Paid, Overdue), `issueDate`, `dueDate`, `totalAmount`, and a list of line items.

2.  **Develop an Invoice Service:** Create a backend service (`/src/services/invoice-service.ts`) that contains a `createInvoiceFromContract` function. This function should:
    *   Accept a `contractId` as an argument.
    *   Retrieve the contract and its associated services.
    *   Create a new invoice record in your database.
    *   Populate the invoice with line items based on the services in the contract.
    *   Return the newly created invoice object.

3.  **Connect the Frontend Button:** Update the `handleGenerateInvoice` function in `src/app/(app)/billing/[id]/page.tsx` to call this new backend service. Upon success, you could navigate the user to a new invoice details page or show a success message with a link to the invoice.

---

## Part 2: Enable Automated Billing Workflows

The **Settings > Billing & Subscriptions** page has a disabled "Enable Automated Billing" switch. To activate this, you'll need a background process that can run on a schedule.

### High-Level Steps:

1.  **Scheduled Job/Cron Job:** Set up a scheduled task that runs periodically (e.g., daily). This can be a cron job on your server or a scheduled cloud function (like Google Cloud Scheduler).

2.  **Workflow Logic:** The scheduled job will execute a function that:
    *   Queries for all active contracts where automated billing is enabled.
    *   For each contract, it checks for billing triggers:
        *   **Recurring Invoices:** Checks if the next invoice date based on the contract's term (e.g., the 1st of every month) has arrived.
        *   **Milestone-Based Invoices:** If the project is billed per milestone, it checks if any associated `ProjectMilestone` records (flagged as `isBillable`) have been marked "Completed" since the last check.
    *   If a billing trigger is met, the job calls the `createInvoiceFromContract` service (from Part 1) to generate the new invoice.
    *   Optionally, it could also trigger an email notification to the client with the new invoice attached.

---

## Part 3: Integrate with Accounting Platforms (Xero, QuickBooks)

The settings page includes placeholders for Xero and QuickBooks integrations. This is the most complex part but offers the most value.

### High-Level Steps:

1.  **Authentication (OAuth 2.0):**
    *   For both Xero and QuickBooks, you will need to register your application to get API keys.
    *   Implement the OAuth 2.0 flow. The "Connect" button on the settings page will initiate this flow, redirecting the user to the accounting platform to authorize your application's access.
    *   Securely store the access and refresh tokens for each user/tenant.

2.  **API Integration:**
    *   Develop services to interact with the APIs of the respective platforms (e.g., `quickbooks-service.ts`, `xero-service.ts`).
    *   These services should have functions to:
        *   `createInvoice`: Takes your internal invoice data and creates a corresponding invoice in the accounting platform.
        *   `syncCustomer`: Matches or creates a customer in the accounting platform corresponding to your client in Deskwise.
        *   `getInvoiceStatus`: (Optional) Periodically fetches the status of an invoice (e.g., to see if it's been paid).

3.  **Update Workflow:** Modify your invoice generation logic (from both manual and automated flows) to include an extra step: if an integration is active, call the `createInvoice` function for the connected platform after the invoice is created in your own database.

By completing these three parts, you will transform the current UI into a powerful, automated billing engine that streamlines the entire process from project completion to getting paid.
