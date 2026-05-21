import { Hero } from '@/components/landing/Hero';
import { FeatureExplainer } from '@/components/landing/FeatureExplainer';
import { CityDirectory } from '@/components/landing/CityDirectory';
import { getSession } from '@/lib/auth/session';

export default async function Home() {
  const session = await getSession();

  return (
    <main>
      <Hero signedIn={!!session} />
      <FeatureExplainer />
      <CityDirectory />
    </main>
  );
}
