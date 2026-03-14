import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function VendorPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <CardTitle>Vendor Profile Pending</CardTitle>
          </div>
          <CardDescription>
            Your vendor profile is being reviewed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            You need to create a vendor profile before accessing the vendor dashboard.
            Please complete your vendor registration or wait for approval.
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
