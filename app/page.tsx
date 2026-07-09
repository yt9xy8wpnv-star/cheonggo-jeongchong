import { RevealOnScroll } from "@/components/common/RevealOnScroll";
import { HomeNoticeCalendar } from "@/components/home/HomeNoticeCalendar";
import { MainHero } from "@/components/home/MainHero";
import { MainServices } from "@/components/home/MainServices";
import { NumbersSection } from "@/components/home/NumbersSection";

export default function Home() {
  return (
    <main>
      <MainHero />
      <RevealOnScroll y={30}>
        <MainServices />
      </RevealOnScroll>
      <RevealOnScroll y={40}>
        <HomeNoticeCalendar />
      </RevealOnScroll>
      <RevealOnScroll y={60}>
        <NumbersSection />
      </RevealOnScroll>
    </main>
  );
}
