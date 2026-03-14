import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function BuyerSuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle>Buyer Account Suspended</CardTitle>
          </div>
          <CardDescription>
            Your buyer account has been suspended
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Your buyer account is currently suspended. Please contact support for assistance.
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
