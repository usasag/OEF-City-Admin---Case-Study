import { getAllPublicCitiesWithStats } from '@/lib/db/queries/cities';
import { EmptyState } from '@/components/admin/EmptyState';
import { CityDirectorySearch } from './CityDirectorySearch';

export async function CityDirectory() {
  const cities = await getAllPublicCitiesWithStats();

  if (cities.length === 0) {
    return (
      <section id="cities" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <EmptyState
            icon="city"
            title="No cities published yet"
            description="Be the first to register your city and start tracking climate action."
            actionLabel="Get started"
            actionHref="/admin"
          />
        </div>
      </section>
    );
  }

  return (
    <section id="cities" className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-h1 text-center mb-8">City Directory</h2>
        <CityDirectorySearch cities={cities} />
      </div>
    </section>
  );
}
