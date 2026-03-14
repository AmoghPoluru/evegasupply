import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function VendorSuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle>Vendor Account Suspended</CardTitle>
          </div>
          <CardDescription>
            Your vendor account has been suspended
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Your vendor account is currently suspended. Please contact support for more information.
          </p>
          <a
            href="/"
            className="text-sm text-blue-600 hover:underline"
          >
            Return to Home
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
