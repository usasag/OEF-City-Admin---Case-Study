import { requireAuth } from '@/lib/auth/permissions';
import { getCityByOrgId } from '@/lib/db/queries/cities';
import { getActionsByCity } from '@/lib/db/queries/climate-actions';
import ActionsTable from '@/components/admin/ActionsTable';

export default async function ActionsPage() {
  const authCtx = await requireAuth();
  const city = await getCityByOrgId(authCtx.organizationId);

  if (!city) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Climate Actions</h1>
        <p className="mt-4 text-gray-600">
          No city has been configured for this organization. Please set up your
          city in Settings first.
        </p>
      </main>
    );
  }

  const actions = await getActionsByCity(city.id);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Climate Actions — {city.name}
      </h1>
      <div className="mt-6">
        <ActionsTable actions={actions} />
      </div>
    </main>
  );
}
