import { auth } from '@clerk/nextjs/server';
import { Hero } from '@/components/landing/Hero';
import { FeatureExplainer } from '@/components/landing/FeatureExplainer';
import { CityDirectory } from '@/components/landing/CityDirectory';

export default async function Home() {
  const { userId } = await auth();

  return (
    <main>
      <Hero signedIn={!!userId} />
      <FeatureExplainer />
      <CityDirectory />
    </main>
  );
}
