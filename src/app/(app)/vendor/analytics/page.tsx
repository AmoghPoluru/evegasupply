import { requireVendor } from '@/lib/middleware/vendor-auth';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

export default async function VendorAnalyticsPage() {
  await requireVendor();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-600 mt-1">
          View your business performance metrics
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
