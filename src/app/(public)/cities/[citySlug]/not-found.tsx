import Link from 'next/link';

export default function CityNotFound() {
  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">City Not Found</h1>
      <p className="text-gray-600 mb-8">
        The city you are looking for does not exist or may have been removed.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Go Home
      </Link>
    </main>
  );
}
