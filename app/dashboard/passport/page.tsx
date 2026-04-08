'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GNB from '@/components/layout/GNB';
import Footer from '@/components/layout/Footer';
import FileUpload from '@/components/ui/FileUpload';

export default function PassportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/passport')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/passport', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '업로드에 실패했습니다.');
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
            <h2 className="text-2xl font-bold text-ok-navy">여권이 제출되었습니다!</h2>
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

          <h1 className="text-2xl font-extrabold text-ok-navy mb-2">여권 제출</h1>
          <p className="text-ok-gray-500 mb-8">여권 사진 페이지를 업로드해 주세요.</p>

          {/* 현재 상태 배너 */}
          <div className={`rounded-2xl p-4 mb-6 text-center font-semibold ${
            status === '제출'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-50 text-ok-red'
          }`}>
            {status === '제출' ? '\u{1F7E2} 제출 완료' : '\u{1F534} 미제출'}
          </div>

          {status !== '제출' && (
            <>
              <FileUpload onFileSelect={setFile} />

              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="w-full mt-6 py-3 bg-ok-orange text-white font-semibold rounded-xl hover:bg-ok-orange-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '업로드 중...' : '여권 제출하기'}
              </button>
            </>
          )}

          {status === '제출' && (
            <p className="text-center text-ok-gray-500 text-sm mt-4">
              이미 여권이 제출되었습니다. 재제출이 필요한 경우 담당자에게 문의해 주세요.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
