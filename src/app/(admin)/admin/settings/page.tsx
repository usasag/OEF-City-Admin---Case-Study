import { requireAuth } from '@/lib/auth/permissions';
import { getCityByOrgId } from '@/lib/db/queries/cities';
import { CitySettingsForm } from '@/components/admin/CitySettingsForm';

export default async function SettingsPage() {
  const authCtx = await requireAuth();
  const city = await getCityByOrgId(authCtx.organizationId);

  if (!city) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">City Not Found</h2>
        <p className="mt-2 text-gray-600">
          No city is configured for your organization.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">City Settings</h2>
      <CitySettingsForm
        initialData={{
          name: city.name,
          baselineEmissions: city.baselineEmissions,
          targetYear: city.targetYear,
        }}
      />
    </div>
  );
}
