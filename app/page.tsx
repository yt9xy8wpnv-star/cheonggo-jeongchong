import { HomeNoticeCalendar } from "@/components/home/HomeNoticeCalendar";
import { MainHero } from "@/components/home/MainHero";
import { MainServices } from "@/components/home/MainServices";
import { NumbersSection } from "@/components/home/NumbersSection";

export default function Home() {
  return (
    <main>
      <MainHero />
      <MainServices />
      <HomeNoticeCalendar />
      <NumbersSection />
    </main>
  );
}
