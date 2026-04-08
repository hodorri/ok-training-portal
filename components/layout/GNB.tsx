'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GNB({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-ok-gray-100">
      <div className="max-w-[800px] mx-auto flex items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ok-orange rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">OK</span>
          </div>
          <span className="font-bold text-ok-navy text-lg">해외연수 포털</span>
        </Link>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-full border-2 border-ok-gray-300 text-ok-gray-700 font-semibold text-sm hover:bg-ok-gray-100"
          >
            로그아웃
          </button>
        ) : (
          <Link
            href="/login"
            className="px-5 py-2 rounded-full border-2 border-ok-orange text-ok-orange font-semibold text-sm hover:bg-ok-orange hover:text-white"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
