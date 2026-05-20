import { requireAuth } from '@/lib/auth/permissions';
import { getCityByOrgId } from '@/lib/db/queries/cities';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let authCtx;
  try {
    authCtx = await requireAuth();
  } catch {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-gray-600">
          You must be signed in with an active organization to access the admin workspace.
        </p>
      </div>
    );
  }

  const city = await getCityByOrgId(authCtx.organizationId);
  if (!city) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600">Organization Not Registered</h1>
        <p className="mt-4 text-gray-600">
          Your organization is not registered in the system. Please contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold">{city.name} Admin</h1>
          <div className="flex gap-4">
            <a href="/admin/settings" className="text-gray-600 hover:text-gray-900">Settings</a>
            <a href="/admin/actions" className="text-gray-600 hover:text-gray-900">Actions</a>
            <a href="/admin/import" className="text-gray-600 hover:text-gray-900">Import</a>
            <a href="/admin/analytics" className="text-gray-600 hover:text-gray-900">Analytics</a>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
