export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-red-600 bg-blue-100 p-4 rounded-lg">
        Tailwind Test - If this is red with blue background, Tailwind works!
      </h1>
      <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
        <p className="font-bold">Test Classes:</p>
        <p className="text-xl">Large text</p>
        <p className="text-sm text-gray-600">Small gray text</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Test Button
        </button>
      </div>
    </div>
  );
}