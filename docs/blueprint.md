# **App Name**: ServiceFlow AI

## Core Features:

- Dashboard: Dashboard overview of open support tickets, providing a clear view of service load and outstanding issues. The dashboard should have an option to switch between a personal dashboard highlighting the current user's metrics, and a company dashboard showing the tenant data, relevant to the PSA features.
- Client Management: Manage client organizations, allowing for the creation, modification, and deletion of client accounts.
- Contact Management: Manage client contacts, including adding, editing, and removing contact information for each organization.
- Ticket Management: Create and track support tickets, enabling detailed logging, assignment, and status updates for all service requests.
- AI Ticket Insights: AI tool to analyze incoming support tickets and suggest categorization or assignment based on keywords and past data. This is an AI tool.
- RMM Integration: Integration with RMM (Remote Monitoring and Management) platforms for automated data collection and issue detection, device import, and asset management.
- Asset Management: Asset management module, capable of importing devices from the RMM integration or being manually managed inside the app.
- Settings: Comprehensive settings page to manage each module
- Billing: Billing module to track and manage billing with contracts and clients
- AI Assistant: An AI tool copilot using Gemini with CRUD for the modules and voice calling capability. This is an AI tool.
- SLA Management: A customizable SLA Management feature
- Knowledge Base: A comprehensive knowledge base system with nesting categories, with AI tool capabilities to generate user articles, or internal SOP's. The AI component should have web search to accurately generate the article, as an option. This is an AI tool.
- Customizable Dashboard: Drag and Drop widgets on the dashboard, with a customizable selector to hide and show widgets
- Users & Permissions: A comprehensive users & permissions module, with in-depth permissions to delegate, linked to each module in granular detail
- SAML SSO: SAML SSO option for the MSP users, and a client auth process with SAML SSO to configure independently per client. All auth must contain basic Email and Password functionality via Firebase.
- Custom Fields: Custom fields for each module, customizable in Settings
- Loading Screen: A flashy/amimated loading screen during login

## Style Guidelines:

- Primary color: Deep Blue (#3498db) to convey professionalism and trust.
- Background color: Light Gray (#ecf0f1) to provide a clean and modern backdrop with soft gradients.
- Accent color: Sky Blue (#85c1e9) for highlighting interactive elements and calls to action, providing a clear visual hierarchy.
- Body and headline font: 'Inter', a grotesque-style sans-serif with a modern, machined, objective, neutral look, suitable for both headlines and body text.
- Use modern, minimalist icons in a consistent style to represent different features and actions, ensuring clarity and ease of use.
- Implement a 'glassmorphic' design style with blurred backgrounds and subtle transparency to create a modern and visually appealing interface.
- Use subtle animations and transitions to enhance user experience and provide feedback on interactions.