import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SettingsOverviewPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Welcome to the settings page. Please select a category from the sidebar to view and manage settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          This is the central hub for configuring your application. You can manage everything from company information and user permissions to integrations and automation.
        </p>
      </CardContent>
    </Card>
  );
}
