import Link from "next/link";
import MegaMenu from "./components/MegaMenu";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <MegaMenu />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            404
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
          <p className="text-sm text-slate-500 mb-6">
            The examination track, test series, or page you are looking for does not exist or has been relocated.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition"
            >
              Back to Home
            </Link>
            <Link
              href="/exams"
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition"
            >
              Browse Exams
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
