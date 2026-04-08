'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GNB from '@/components/layout/GNB';
import Footer from '@/components/layout/Footer';
import AttendanceSelector from '@/components/ui/AttendanceSelector';

export default function AttendancePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'참석' | '불참' | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);

    try {
      const res = await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selected,
          reason: selected === '불참' ? reason : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '저장에 실패했습니다.');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch {
      alert('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <GNB isLoggedIn={true} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl block mb-4">&#9989;</span>
            <h2 className="text-2xl font-bold text-ok-navy">저장되었습니다!</h2>
            <p className="text-ok-gray-500 mt-2">대시보드로 이동합니다...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <GNB isLoggedIn={true} />
      <main className="flex-1">
        <div className="max-w-[600px] mx-auto px-6 py-10">
          <Link href="/dashboard" className="text-ok-gray-500 text-sm hover:text-ok-orange mb-6 inline-block">
            &larr; 대시보드로 돌아가기
          </Link>

          <h1 className="text-2xl font-extrabold text-ok-navy mb-2">참석 여부 응답</h1>
          <p className="text-ok-gray-500 mb-8">해외연수 참석 의사를 선택해 주세요.</p>

          <AttendanceSelector selected={selected} onSelect={setSelected} />

          {selected === '불참' && (
            <div className="mt-6 animate-[fadeIn_0.3s_ease-out]">
              <label className="block text-sm font-semibold text-ok-navy mb-2">불참 사유</label>
              <textarea
                placeholder="예: 개인 사정, 업무 일정 등"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-ok-gray-300 focus:outline-none focus:border-ok-orange focus:ring-2 focus:ring-ok-orange/20 text-ok-navy placeholder:text-ok-gray-500 resize-none"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selected || loading}
            className="w-full mt-8 py-3 bg-ok-orange text-white font-semibold rounded-xl hover:bg-ok-orange-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
