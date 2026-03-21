import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import Hero from '../Hero/Hero.jsx';
import About from '../About/About.jsx';
import Credentials from '../Credentials/Credentials.jsx';
import Projects from '../Projects/Projects.jsx';
import Skills from '../Skills/Skills.jsx';
import Contact from '../Contact/Contact.jsx';
import Footer from '../Footer/Footer.jsx';
import Chatbot from '../../Components/Chatbot/Chatbot.jsx';
import {
  clearScrollIntent,
  getPendingHomeSection,
  SCROLL_INTENT_HOME_SECTION
} from '../../utils/homeNavigation';
import { scrollToSectionById } from '../../utils/scrollToSection';

export default function Portfolio() {
  const location = useLocation();
  const navigate = useNavigate();
  const handledScrollKeyRef = useRef('');

  useEffect(() => {
    document.title = 'Dee - AI Product & Systems Engineer';
  }, []);

  useLayoutEffect(() => {
    const scrollTarget = getPendingHomeSection(location);

    if (!scrollTarget) {
      return undefined;
    }

    const handledKey = `${location.key}:${scrollTarget}`;
    if (handledScrollKeyRef.current === handledKey) {
      return undefined;
    }

    let firstFrameId = 0;
    let secondFrameId = 0;
    const correctionTimeoutIds = [];
    const correctionDelays = [0, 180, 420, 900, 1600];
    let clearedIntent = false;

    const scrollImmediately = () => {
      handledScrollKeyRef.current = handledKey;

      if (scrollToSectionById(scrollTarget, { behavior: 'auto' })) {
        if (!clearedIntent && location.state?.scrollIntent?.type === SCROLL_INTENT_HOME_SECTION) {
          clearedIntent = clearScrollIntent({ location, navigate });
        }
      }
    };

    firstFrameId = window.requestAnimationFrame(() => {
      secondFrameId = window.requestAnimationFrame(() => {
        correctionDelays.forEach((delay) => {
          const timeoutId = window.setTimeout(() => {
            scrollImmediately();
          }, delay);

          correctionTimeoutIds.push(timeoutId);
        });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrameId);
      window.cancelAnimationFrame(secondFrameId);
      correctionTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [location, navigate]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Credentials />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
