import ImportForm from '@/components/admin/ImportForm';

export default function ImportPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Import Climate Actions</h1>
      <p className="mt-2 text-sm text-gray-600">
        Paste free-text descriptions of climate actions below. The AI will extract
        structured data for your review before importing.
      </p>
      <div className="mt-6">
        <ImportForm />
      </div>
    </main>
  );
}
