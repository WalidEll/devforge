import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              <span className="text-blue-600">Dev</span>Forge
            </span>
            . Free developer tools.
          </div>
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/about" className="hover:text-gray-900 dark:hover:text-white">
              About
            </Link>
            <Link href="/privacy-policy" className="hover:text-gray-900 dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
