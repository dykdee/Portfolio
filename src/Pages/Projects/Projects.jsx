import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ExternalLink, Github } from 'lucide-react';
import { usePortfolioProjects } from '../../hooks/useBlogPosts';
import { createMediaPlaceholderUrl } from '../../utils/blogUtils';
import './Projects.css';

const PROJECT_PLACEHOLDER_IMAGE = createMediaPlaceholderUrl({
  label: 'Project Preview',
  width: 1200,
  height: 630
});

function resolveProjectImage(project) {
  const image = typeof project?.image === 'string' ? project.image.trim() : '';

  if (!image || /via\.placeholder\.com/i.test(image)) {
    return PROJECT_PLACEHOLDER_IMAGE;
  }

  return image;
}

export default function Projects() {
  const { projects, loading } = usePortfolioProjects();
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasProjects = projects.length > 0;

  const nextProject = useCallback(() => {
    if (!projects.length) return;
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  }, [projects.length]);

  const prevProject = useCallback(() => {
    if (!projects.length) return;
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  }, [projects.length]);

  useEffect(() => {
    if (projects.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(nextProject, 5000);
    return () => window.clearInterval(intervalId);
  }, [nextProject, projects.length]);

  useEffect(() => {
    if (!projects.length) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prev) => (prev >= projects.length ? 0 : prev));
  }, [projects.length]);

  const currentProject = hasProjects ? projects[currentIndex] : null;

  const projectTags = currentProject
    ? [
        ...(currentProject.tags || []),
      ].filter(Boolean)
    : [];

  const projectAccent = 'var(--primary-color)';
  const currentProjectImage = resolveProjectImage(currentProject);

  return (
    <section
      id="projects"
      className="projects"
    >
      <div className="container">
        <div className="projects-heading">
          <h2 className="section-title">Featured Projects</h2>
        </div>

        <div className="projects-carousel" role="region" aria-label="Featured projects carousel">
          <button className="slider-btn slider-btn-prev" type="button" aria-label="Previous project" onClick={prevProject} disabled={projects.length <= 1}>
            <ChevronLeft size={24} />
          </button>

          <div className="projects-stage">
            {loading ? (
              <div className="project-card is-center">
                <div className="project-content">
                  <h4 className="project-name">Loading projects...</h4>
                </div>
              </div>
            ) : !currentProject ? (
              <div className="project-card is-center">
                <div className="project-content">
                  <h4 className="project-name">No projects yet</h4>
                  <p className="project-description">Add projects from the admin dashboard and they will appear here automatically.</p>
                </div>
              </div>
            ) : (
              <motion.article
                key={currentProject.id}
                animate={{
                  opacity: 1,
                  scale: 1,
                  zIndex: 10,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="project-card is-center"
              >
                <div className="project-media" style={{ '--project-accent': projectAccent }}>
                  {currentProject.category ? (
                    <span className="project-category-badge">{currentProject.category}</span>
                  ) : null}
                  {currentProject.status ? (
                    <span className="project-status-badge">{currentProject.status}</span>
                  ) : null}
                  {currentProject.video ? (
                    <video
                      src={currentProject.video}
                      poster={currentProjectImage}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="project-media-asset"
                    />
                  ) : (
                    <img
                      src={currentProjectImage}
                      alt={currentProject.title || 'Project'}
                      className="project-media-asset"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="project-media-overlay"></div>
                  <h3 className="project-media-title">{currentProject.title || 'Featured Project'}</h3>
                </div>

                <div className="project-content">
                  <h4 className="project-name">{currentProject.title || 'Untitled Project'}</h4>
                  <p className="project-description">{currentProject.description || 'No description provided yet.'}</p>

                  <div className="project-tags">
                    {projectTags.map((tag) => (
                      <span key={tag} className="project-chip">{tag}</span>
                    ))}
                  </div>

                  <div className="project-links">
                    {currentProject.liveUrl ? (
                      <a href={currentProject.liveUrl} className="project-link" target="_blank" rel="noreferrer">
                        View Project <ExternalLink size={14} />
                      </a>
                    ) : null}
                    {currentProject.githubUrl ? (
                      <a href={currentProject.githubUrl} className="project-link" target="_blank" rel="noreferrer">
                        GitHub <Github size={14} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            )}
          </div>

          <button className="slider-btn slider-btn-next" type="button" aria-label="Next project" onClick={nextProject} disabled={projects.length <= 1}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="projects-pagination" aria-label="Project navigation dots">
          {projects.map((project, index) => (
            <button
              key={project.id}
              type="button"
              className={`projects-dot${index === currentIndex ? ' is-active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to ${project.title || 'project'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
