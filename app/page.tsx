import GNB from '@/components/layout/GNB';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import InfoCard from '@/components/ui/InfoCard';
import { getSession } from '@/lib/session';

export default async function Home() {
  const session = await getSession();
  const isLoggedIn = !!session.name;

  return (
    <>
      <GNB isLoggedIn={isLoggedIn} />
      <main className="flex-1">
        <HeroSection />
        <section className="max-w-[800px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard
              icon="&#128197;"
              title="연수 일정"
              description="2026년 하반기 오키나와 해외연수 일정을 확인하세요."
              bgColor="bg-pastel-orange"
            />
            <InfoCard
              icon="&#127758;"
              title="목적지 안내"
              description="일본 오키나와에서 진행되는 연수 프로그램을 소개합니다."
              bgColor="bg-pastel-mint"
            />
            <InfoCard
              icon="&#128203;"
              title="준비 사항"
              description="여권 제출, 참석 확인 등 연수 전 필수 준비사항을 안내합니다."
              bgColor="bg-pastel-yellow"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
