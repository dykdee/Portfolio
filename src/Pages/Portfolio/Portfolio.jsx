import Navbar from '../../Components/Navbar/Navbar.jsx';
import Hero from '../Hero/Hero.jsx';
import About from '../About/About.jsx';
import Credentials from '../Credentials/Credentials.jsx';
import Projects from '../Projects/Projects.jsx';
import Skills from '../Skills/Skills.jsx';
import Contact from '../Contact/Contact.jsx';
import Footer from '../Footer/Footer.jsx';
import Chatbot from '../../Components/Chatbot/Chatbot.jsx';
import { useEffect } from 'react';

export default function Portfolio() {
  useEffect(() => {
    document.title = 'Dee - AI Product & Systems Engineer';
  }, []);

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
