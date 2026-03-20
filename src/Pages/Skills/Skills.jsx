import { useEffect, useRef } from 'react';
import {
  Atom,
  Braces,
  ChevronRight,
  Code2,
  Database,
  GitFork,
  Globe,
  LayoutGrid,
  Layers,
  Server,
  Square,
  Wrench,
} from 'lucide-react';
import './Skills.css';

const SKILL_CATEGORIES = [
  {
    title: 'Frontend',
    icon: Globe,
    iconClass: 'frontend-icon',
    skills: [
      { name: 'HTML/CSS', level: 95, icon: Square },
      { name: 'JavaScript/TypeScript', level: 80, icon: Braces },
      { name: 'React', level: 85, icon: Atom },
      { name: 'Vue.js', level: 50, icon: Layers },
    ],
  },
  {
    title: 'Backend',
    icon: Server,
    iconClass: 'backend-icon',
    skills: [
      { name: 'Node.js', level: 85, icon: Server },
      { name: 'Python', level: 60, icon: ChevronRight },
      { name: 'MongoDB', level: 55, icon: Database },
      { name: 'Express', level: 60, icon: Database },
      { name: 'PostgreSQL', level: 70, icon: Database },
    ],
  },
];

const TOOL_BADGES = [
  'Git & GitOps', 'Docker', 'SSH', 'Linux', 'Cursor',
  'Webpack', 'Firebase', 'VS Code', 'Copilot',
  'Vercel', 'AWS'
];

export default function Skills() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const progressBars = section.querySelectorAll('.skill-progress');
    const fadeEls = section.querySelectorAll('.skill-category, .stat-item');

    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const target = bar.dataset.level;
            bar.style.width = '0%';
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                bar.style.width = target + '%';
              });
            });
            barObserver.unobserve(bar);
          }
        });
      },
      { threshold: 0.5 }
    );

    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    progressBars.forEach((bar) => barObserver.observe(bar));
    fadeEls.forEach((el) => fadeObserver.observe(el));

    return () => {
      barObserver.disconnect();
      fadeObserver.disconnect();
    };
  }, []);

  return (
    <section id="skills" className="skills" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title">Skills & Technologies</h2>
        <p className="skills-subtitle">
          A comprehensive overview of my technical expertise and the tools I use to build modern web applications.
        </p>
        <div className="skills-grid">
          {SKILL_CATEGORIES.map((cat) => (
            <div className="skill-category" key={cat.title}>
              <div className="category-header">
                <span className={`category-icon ${cat.iconClass}`}>
                  <cat.icon size={18} strokeWidth={2.2} />
                </span>
                <h3>{cat.title}</h3>
              </div>

              <div className="skill-list">
                {cat.skills.map((skill) => (
                  <div className="skill-item" key={skill.name}>
                    <div className="skill-header">
                      <span className="skill-name">
                        <skill.icon className="skill-row-icon" size={13} strokeWidth={2.2} />
                        {skill.name}
                      </span>
                      <span className="skill-percent">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <div
                        className="skill-progress"
                        data-level={skill.level}
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="skill-category tools-category">
            <div className="category-header">
              <span className="category-icon tools-icon">
                <Wrench size={18} strokeWidth={2.2} />
              </span>
              <h3>Tools & Platforms</h3>
            </div>

            <div className="tools-grid">
              {TOOL_BADGES.map((tool) => (
                <span className="tool-badge" key={tool}>{tool}</span>
              ))}
            </div>

            <div className="open-source-block">
              <p className="open-source-title">
                <GitFork size={14} strokeWidth={2.1} />
                OPEN SOURCE
              </p>
              <p className="open-source-copy">
                Active contributor to various open source projects and maintainer of several utility libraries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
