// Navigation functionality
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll effect for navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scroll for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) {
            return;
        }

        e.preventDefault();
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');

function highlightActiveSection() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightActiveSection);

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
const animateElements = document.querySelectorAll('.project-card:not(.blog-card), .skill-category, .stat-item');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Skill bar animation
const skillBars = document.querySelectorAll('.skill-progress');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const width = entry.target.style.width;
            entry.target.style.width = '0%';
            setTimeout(() => {
                entry.target.style.width = width;
            }, 100);
        }
    });
}, { threshold: 0.5 });

skillBars.forEach(bar => {
    skillObserver.observe(bar);
});

// Contact form handling
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Here you would typically send the data to a server
    // For now, we'll just show an alert
    alert(`Thank you for your message, ${name}! I'll get back to you soon.`);
    
    // Reset form
    contactForm.reset();
});

// Add smooth fade-in on scroll for hero description
window.addEventListener('load', () => {
    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription) {
        setTimeout(() => {
            heroDescription.style.opacity = '1';
            heroDescription.style.transform = 'translateY(0)';
        }, 300);
    }
});

// Code typing animation
const codeLines = [
    '<span class="keyword">const</span> <span class="variable">developer</span> <span class="operator">=</span> {',
    '  <span class="variable">name</span>: <span class="string">\'Your Name\'</span>,',
    '  <span class="variable">role</span>: <span class="string">\'Full Stack Developer\'</span>,',
    '  <span class="variable">skills</span>: [<span class="string">\'JavaScript\'</span>, <span class="string">\'React\'</span>, <span class="string">\'Node.js\'</span>],',
    '  <span class="function">build</span>() {',
    '    <span class="keyword">return</span> <span class="string">\'Amazing Products\'</span>;',
    '  }',
    '};',
    '<span class="comment">// Passionate about creating elegant solutions</span>'
];

let currentLine = 0;
let currentChar = 0;
let isDeleting = false;
let animationStarted = false;

function typeCode() {
    const codeContainer = document.querySelector('.code-animation-container');
    if (!codeContainer) return;

    // Check if code animation is visible
    const codeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animationStarted) {
                animationStarted = true;
                startTyping();
            }
        });
    }, { threshold: 0.3 });

    codeObserver.observe(codeContainer);
}

function startTyping() {
    const lineElements = [
        document.getElementById('code-line-1'),
        document.getElementById('code-line-2'),
        document.getElementById('code-line-3'),
        document.getElementById('code-line-4'),
        document.getElementById('code-line-5'),
        document.getElementById('code-line-6'),
        document.getElementById('code-line-7'),
        document.getElementById('code-line-8'),
        document.getElementById('code-line-9')
    ];

    function type() {
        if (currentLine >= codeLines.length) {
            // Animation complete, restart after a pause
            setTimeout(() => {
                currentLine = 0;
                currentChar = 0;
                lineElements.forEach(el => {
                    if (el) el.innerHTML = '';
                });
                startTyping();
            }, 5000);
            return;
        }

        const currentLineElement = lineElements[currentLine];
        if (!currentLineElement) {
            currentLine++;
            setTimeout(type, 100);
            return;
        }

        const targetText = codeLines[currentLine];
        const displayText = targetText.substring(0, currentChar);

        if (displayText) {
            currentLineElement.innerHTML = displayText;
        }

        if (currentChar < targetText.length) {
            currentChar++;
            setTimeout(type, 30 + Math.random() * 40); // Vary typing speed
        } else {
            // Move to next line
            currentLine++;
            currentChar = 0;
            setTimeout(type, 200); // Pause between lines
        }
    }

    // Start typing after a short delay
    setTimeout(type, 500);
}

// Initialize code animation when page loads
document.addEventListener('DOMContentLoaded', () => {
    typeCode();
    initHeroCanvas();
    initProjectsSlider();
    initChatbot();
});

// Canvas Background Animation
function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const config = {
        particleCount: 400,
        particleMinSize: 0.5,
        particleMaxSize: 2,
        breathingCycleDuration: 30000,
    };
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.depth = Math.random();
            
            this.size = config.particleMinSize + this.depth * (config.particleMaxSize - config.particleMinSize);
            this.vx = (Math.random() - 0.5) * 0.04;
            this.vy = (Math.random() - 0.5) * 0.04;
            
            this.driftPhase = Math.random() * Math.PI * 2;
            this.driftSpeed = 0.001 + Math.random() * 0.001;
            this.baseBrightness = 0.3 + this.depth * 0.5;
        }
        
        update(breathingIntensity, globalTime) {
            this.driftPhase += this.driftSpeed;
            this.x += this.vx + Math.sin(this.driftPhase) * 0.03;
            this.y += this.vy + Math.cos(this.driftPhase * 0.7) * 0.03;
            
            const twinkle = Math.sin(globalTime * 0.003 + this.driftPhase) * 0.3;
            this.currentBrightness = (this.baseBrightness + twinkle) * (0.7 + breathingIntensity * 0.3);
            
            if (this.x < -20) this.x = canvas.width + 20;
            if (this.x > canvas.width + 20) this.x = -20;
            if (this.y < -20) this.y = canvas.height + 20;
            if (this.y > canvas.height + 20) this.y = -20;
        }
        
        draw(ctx) {
            ctx.save();
            
            const glow = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size * 5
            );
            glow.addColorStop(0, `rgba(96, 165, 250, ${this.currentBrightness * 0.4})`);
            glow.addColorStop(1, 'rgba(96, 165, 250, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = `rgba(200, 230, 255, ${Math.min(this.currentBrightness, 1)})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    const particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        time++;
        
        const breathingIntensity = Math.sin(time / config.breathingCycleDuration * Math.PI * 2) * 0.5 + 0.5;
        
        ctx.fillStyle = '#0a1423';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update(breathingIntensity, time);
            particle.draw(ctx);
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle video background
    const video = document.getElementById('hero-video');
    if (video) {
        video.addEventListener('loadeddata', () => {
            video.classList.add('loaded');
            canvas.style.opacity = '0.5';
        });
        
        video.addEventListener('error', () => {
            console.log('Video failed to load, using canvas animation only');
            canvas.style.opacity = '1';
        });
    }
}

// Projects Slider Functionality - Accessible looping carousel
function initProjectsSlider() {
    const slider = document.querySelector('.projects-slider');
    if (!slider) return;

    const track = slider.querySelector('.projects-track');
    const viewport = slider.querySelector('.projects-viewport');
    const prevBtn = slider.querySelector('[data-direction="prev"]');
    const nextBtn = slider.querySelector('[data-direction="next"]');

    if (!track || !viewport || !prevBtn || !nextBtn) return;

    let slidesPerView = getSlidesPerView();
    let index = slidesPerView;
    let slideSize = 0;
    let autoPlayTimer = null;
    let resumeTimer = null;
    let isTransitioning = false;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function getSlidesPerView() {
        return window.matchMedia('(min-width: 900px)').matches ? 2 : 1;
    }

    function getGapSize() {
        const styles = window.getComputedStyle(track);
        const gapValue = parseFloat(styles.columnGap || styles.gap || '0');
        return Number.isNaN(gapValue) ? 0 : gapValue;
    }

    function getSlideSize() {
        const slide = track.querySelector('.project-card');
        if (!slide) return 0;
        const width = slide.getBoundingClientRect().width;
        return width + getGapSize();
    }

    function removeClones() {
        track.querySelectorAll('.is-clone').forEach((clone) => clone.remove());
    }

    function cloneSlides() {
        const originals = Array.from(track.children).filter((el) => el.classList.contains('project-card') && !el.classList.contains('is-clone'));
        if (originals.length === 0) return;

        const headClones = originals.slice(0, slidesPerView).map((slide) => {
            const clone = slide.cloneNode(true);
            clone.classList.add('is-clone');
            clone.setAttribute('aria-hidden', 'true');
            return clone;
        });

        const tailClones = originals.slice(-slidesPerView).map((slide) => {
            const clone = slide.cloneNode(true);
            clone.classList.add('is-clone');
            clone.setAttribute('aria-hidden', 'true');
            return clone;
        });

        const tailFragment = document.createDocumentFragment();
        tailClones.forEach((clone) => tailFragment.appendChild(clone));
        track.insertBefore(tailFragment, track.firstChild);

        const headFragment = document.createDocumentFragment();
        headClones.forEach((clone) => headFragment.appendChild(clone));
        track.appendChild(headFragment);
    }

    function setPosition(withTransition = true) {
        slideSize = getSlideSize();
        if (!withTransition) {
            track.style.transition = 'none';
        }
        track.style.transform = `translateX(${-index * slideSize}px)`;

        if (!withTransition) {
            requestAnimationFrame(() => {
                track.style.transition = 'transform 0.6s ease';
            });
        }
    }

    function moveToIndex(targetIndex) {
        if (isTransitioning) return;
        isTransitioning = true;
        index = targetIndex;
        setPosition(true);
    }

    function moveNext() {
        moveToIndex(index + 1);
    }

    function movePrev() {
        moveToIndex(index - 1);
    }

    function handleLooping() {
        const originalsCount = track.querySelectorAll('.project-card:not(.is-clone)').length;
        if (index >= originalsCount + slidesPerView) {
            index = slidesPerView;
            setPosition(false);
        }

        if (index < slidesPerView) {
            index = originalsCount + slidesPerView - 1;
            setPosition(false);
        }

        isTransitioning = false;
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    function startAutoPlay() {
        if (prefersReducedMotion) return;
        stopAutoPlay();
        autoPlayTimer = setInterval(() => {
            moveNext();
        }, 5000);
    }

    function pauseAutoPlay() {
        stopAutoPlay();
        if (resumeTimer) {
            clearTimeout(resumeTimer);
        }
    }

    function resumeAutoPlay(delay = 5000) {
        if (prefersReducedMotion) return;
        if (resumeTimer) {
            clearTimeout(resumeTimer);
        }
        resumeTimer = setTimeout(() => {
            startAutoPlay();
        }, delay);
    }

    function setupSlider() {
        slidesPerView = getSlidesPerView();
        removeClones();
        cloneSlides();
        index = slidesPerView;
        setPosition(false);
    }

    prevBtn.addEventListener('click', () => {
        pauseAutoPlay();
        movePrev();
        resumeAutoPlay(5000);
    });

    nextBtn.addEventListener('click', () => {
        pauseAutoPlay();
        moveNext();
        resumeAutoPlay(5000);
    });

    slider.addEventListener('mouseenter', pauseAutoPlay);
    slider.addEventListener('mouseleave', () => resumeAutoPlay(5000));
    slider.addEventListener('focusin', pauseAutoPlay);
    slider.addEventListener('focusout', () => resumeAutoPlay(5000));

    track.addEventListener('transitionend', handleLooping);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const updatedSlidesPerView = getSlidesPerView();
            if (updatedSlidesPerView !== slidesPerView) {
                setupSlider();
            } else {
                setPosition(false);
            }
        }, 200);
    });

    setupSlider();
    startAutoPlay();
}


// Chatbot functionality
function initChatbot() {
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotMessages = document.getElementById('chatbot-messages');

    if (!chatbotContainer || !chatbotToggle || !chatbotWindow) return;

    // Toggle chatbot
    chatbotToggle.addEventListener('click', () => {
        chatbotContainer.classList.toggle('active');
        if (chatbotContainer.classList.contains('active')) {
            chatbotInput.focus();
        }
    });

    chatbotClose.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
    });

    // Send message function
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatbotInput.value = '';

        // Simulate thinking delay
        setTimeout(() => {
            const response = getResponse(message);
            addMessage(response.text, 'bot', response.action);
        }, 500);
    }

    // Send on button click
    chatbotSend.addEventListener('click', sendMessage);

    // Send on Enter key
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Add message to chat
    function addMessage(text, type, action = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message chatbot-message-${type}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (typeof text === 'string') {
            // Handle multiline text with proper formatting
            const lines = text.split('\n');
            let currentParagraph = null;
            let listContainer = null;

            lines.forEach((line, index) => {
                const trimmedLine = line.trim();
                
                if (trimmedLine === '') {
                    // Empty line - close current paragraph/list if exists
                    if (currentParagraph) {
                        contentDiv.appendChild(currentParagraph);
                        currentParagraph = null;
                    }
                    if (listContainer && listContainer.children.length > 0) {
                        contentDiv.appendChild(listContainer);
                        listContainer = null;
                    }
                } else if (trimmedLine.startsWith('•')) {
                    // Bullet point - add to list (CSS handles the bullet via ::before)
                    if (!listContainer) {
                        listContainer = document.createElement('ul');
                    }
                    const li = document.createElement('li');
                    li.textContent = trimmedLine.replace('•', '').trim();
                    listContainer.appendChild(li);
                } else {
                    // Regular text line
                    if (listContainer && listContainer.children.length > 0) {
                        contentDiv.appendChild(listContainer);
                        listContainer = null;
                    }
                    if (!currentParagraph) {
                        currentParagraph = document.createElement('p');
                        currentParagraph.style.margin = '0';
                    }
                    if (currentParagraph.textContent) {
                        currentParagraph.innerHTML += '<br>' + trimmedLine;
                    } else {
                        currentParagraph.textContent = trimmedLine;
                    }
                }
            });

            // Append any remaining elements
            if (currentParagraph) {
                contentDiv.appendChild(currentParagraph);
            }
            if (listContainer && listContainer.children.length > 0) {
                contentDiv.appendChild(listContainer);
            }
        } else {
            contentDiv.appendChild(text);
        }

        if (action) {
            const button = document.createElement('button');
            button.className = 'chatbot-action-button';
            button.textContent = action.label;
            button.onclick = () => {
                if (action.type === 'scroll') {
                    const section = document.querySelector(action.target);
                    if (section) {
                        const offsetTop = section.offsetTop - 70;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                        chatbotContainer.classList.remove('active');
                    }
                } else if (action.type === 'link') {
                    window.open(action.target, '_blank');
                }
            };
            contentDiv.appendChild(button);
        }

        messageDiv.appendChild(contentDiv);
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Get response based on user input
    function getResponse(input) {
        const lowerInput = input.toLowerCase();

        // Skills
        if (lowerInput.includes('skill') || lowerInput.includes('technology') || lowerInput.includes('tech stack')) {
            return {
                text: 'I specialize in:\n\n• Frontend: React, Vue.js, JavaScript, TypeScript, HTML/CSS\n• Backend: Python, Node.js, FastAPI, Django\n• Databases: MongoDB, MySQL, PostgreSQL\n• AI/ML: LLM, Machine Learning, AI Integration\n• Tools: Git, Docker, AWS\n\nWould you like to see more details?',
                action: {
                    type: 'scroll',
                    target: '#skills',
                    label: 'View Skills Section'
                }
            };
        }

        // Contact
        if (lowerInput.includes('contact') || lowerInput.includes('reach') || lowerInput.includes('email') || 
            lowerInput.includes('linkedin') || lowerInput.includes('github') || lowerInput.includes('telegram') || 
            lowerInput.includes('whatsapp')) {
            return {
                text: 'You can reach me through:\n\n• Email: Click the email button below\n• LinkedIn: Professional networking\n• GitHub: Check out my code\n• Telegram: @dee_aanalyst\n• WhatsApp: Direct messaging\n\nI\'d love to hear from you!',
                action: {
                    type: 'scroll',
                    target: '#contact',
                    label: 'Go to Contact Section'
                }
            };
        }

        // Projects
        if (lowerInput.includes('project') || lowerInput.includes('work') || lowerInput.includes('portfolio') || 
            lowerInput.includes('build') || lowerInput.includes('created')) {
            return {
                text: 'I have 6 featured projects:\n\n• E-Commerce Platform (React, Node.js, MongoDB)\n• Task Management App (Vue.js, Firebase)\n• Weather Dashboard (JavaScript, API)\n• AI Chat Application (Python, LLM)\n• Data Analytics Platform (Python, Django)\n• Mobile-First Web App (React, TypeScript)\n\nCheck them out below!',
                action: {
                    type: 'scroll',
                    target: '#projects',
                    label: 'View Projects'
                }
            };
        }

        // About
        if (lowerInput.includes('about') || lowerInput.includes('who') || lowerInput.includes('background') || 
            lowerInput.includes('experience')) {
            return {
                text: 'I\'m Agoma Divine E., an LLM Engineer & Full Stack Developer. I build intelligent systems with AI, machine learning, and cutting-edge technologies. With 3+ years of experience and 50+ completed projects, I\'m passionate about creating elegant solutions.',
                action: {
                    type: 'scroll',
                    target: '#about',
                    label: 'Learn More About Me'
                }
            };
        }

        // Resume
        if (lowerInput.includes('resume') || lowerInput.includes('cv') || lowerInput.includes('download')) {
            return {
                text: 'You can download my resume from the About Me section. It contains all my experience, skills, and achievements.',
                action: {
                    type: 'scroll',
                    target: '#about',
                    label: 'Download Resume'
                }
            };
        }

        // Greeting
        if (lowerInput.includes('hi') || lowerInput.includes('hello') || lowerInput.includes('hey') || 
            lowerInput.match(/^(hi|hello|hey)$/)) {
            return {
                text: 'Hello! I\'m here to help you learn more about Dee. You can ask me about:\n\n• Skills and technologies\n• Projects\n• How to contact\n• Experience and background'
            };
        }

        // Help
        if (lowerInput.includes('help') || lowerInput.includes('what can you')) {
            return {
                text: 'I can help you with:\n\n• Information about Dee\'s skills and tech stack\n• Details about featured projects\n• Contact information and social links\n• Background and experience\n• Resume download\n\nJust ask me anything!'
            };
        }

        // Default response
        return {
            text: 'I\'m not sure I understand that. Try asking about:\n\n• Skills\n• Projects\n• Contact information\n• Experience\n\nOr type "help" for more options.'
        };
    }
}

