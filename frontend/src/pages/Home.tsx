import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import OurStory from "../components/OurStory";
import BiblePassage from "../components/BiblePassage";
import EventInfo from "../components/EventInfo";
import Gallery from "../components/Gallery";
import Countdown from "../components/Countdown";
import VerifyInvitation from "../components/VerifyInvitation";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <OurStory />
        <BiblePassage />
        <EventInfo />
        <Gallery />
        <Countdown />
        <VerifyInvitation />
      </main>
      <Footer />
    </div>
  );
}
