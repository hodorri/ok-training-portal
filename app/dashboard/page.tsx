import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import GNB from '@/components/layout/GNB';
import Footer from '@/components/layout/Footer';
import TaskList from '@/components/sections/TaskList';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session.name) {
    redirect('/login');
  }

  const tasks = [
    {
      icon: '\u{1F6EB}',
      title: '참석 여부 응답',
      description: '연수 참석 의사를 알려주세요',
      href: '/dashboard/attendance',
      status: (session.attendanceStatus ? 'complete' : 'pending') as 'complete' | 'pending',
      buttonText: session.attendanceStatus ? '수정하기 \u2192' : '응답하기 \u2192',
    },
    {
      icon: '\u{1F6C2}',
      title: '여권 제출',
      description: '여권 사진 페이지를 업로드해주세요',
      href: '/dashboard/passport',
      status: (session.passportStatus === '제출' ? 'complete' : 'pending') as 'complete' | 'pending',
      buttonText: session.passportStatus === '제출' ? '확인하기 \u2192' : '제출하기 \u2192',
    },
  ];

  return (
    <>
      <GNB isLoggedIn={true} />
      <main className="flex-1">
        <div className="max-w-[800px] mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-ok-navy">
              안녕하세요, {session.name}님! &#128075;
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {session.department && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-pastel-lavender text-purple-700">
                  {session.department}
                </span>
              )}
              {session.team && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-pastel-mint text-green-700">
                  {session.team}
                </span>
              )}
              {session.title && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-pastel-orange text-orange-700">
                  {session.title}
                </span>
              )}
            </div>
          </div>

          <h2 className="font-bold text-ok-navy mb-4">할 일 목록</h2>
          <TaskList tasks={tasks} />
        </div>
      </main>
      <Footer />
    </>
  );
}
