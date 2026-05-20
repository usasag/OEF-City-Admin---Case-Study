'use client';

import { useState } from 'react';
import { CreateCityForm } from './CreateCityForm';
import { JoinCityForm } from './JoinCityForm';

type Tab = 'create' | 'join';

export function OnboardingTabsClient() {
  const [activeTab, setActiveTab] = useState<Tab>('create');

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex rounded-lg border border-border overflow-hidden mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-forest-600 text-white'
              : 'bg-surface-card text-ink-muted hover:bg-forest-50 hover:text-forest-700'
          }`}
        >
          Create New City
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('join')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-l border-border ${
            activeTab === 'join'
              ? 'bg-forest-600 text-white'
              : 'bg-surface-card text-ink-muted hover:bg-forest-50 hover:text-forest-700'
          }`}
        >
          Join Existing City
        </button>
      </div>

      {/* Tab content */}
      <div className="card p-6">
        {activeTab === 'create' ? (
          <CreateCityForm />
        ) : (
          <JoinCityForm />
        )}
      </div>
    </div>
  );
}
