import { Icon, type IconName } from '@/components/ui/Icon';

interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: 'city',
    title: 'Public Dashboards',
    description:
      'Give citizens transparent access to your city\u2019s climate progress with interactive charts and KPI summaries.',
  },
  {
    icon: 'cloud',
    title: 'AI-Assisted Import',
    description:
      'Paste free-text climate action descriptions and let AI extract structured data for quick, accurate imports.',
  },
  {
    icon: 'gauge',
    title: 'Multi-Tenant Analytics',
    description:
      'Manage multiple cities under one organization with isolated data, role-based access, and cross-city insights.',
  },
];

export function FeatureExplainer() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-h1 text-center mb-12">
          Everything you need to track climate action
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card flex flex-col items-center text-center">
              <div className="mb-4 text-forest-600">
                <Icon name={feature.icon} size={40} />
              </div>
              <h3 className="text-h3 mb-2">{feature.title}</h3>
              <p className="text-body text-ink-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
