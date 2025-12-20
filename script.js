// ========== PARTICLE BACKGROUND ==========
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const particleCount = 100;
const mouse = { x: null, y: null, radius: 150 };

// Particle class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.1})`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Boundary check
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                const angle = Math.atan2(dy, dx);
                const force = (mouse.radius - distance) / mouse.radius;
                this.x -= Math.cos(angle) * force * 8;
                this.y -= Math.sin(angle) * force * 8;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Initialize particles
function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

// Animate particles
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // Connect particles with lines
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance/100)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    
    requestAnimationFrame(animateParticles);
}

// Handle mouse movement
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Handle resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

// ========== SLIDER FUNCTIONALITY ==========
class Slider {
    constructor(containerSelector, sliderSelector, prevBtnSelector, nextBtnSelector, dotsSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;
        
        this.slider = this.container.querySelector(sliderSelector);
        this.prevBtn = this.container.querySelector(prevBtnSelector);
        this.nextBtn = this.container.querySelector(nextBtnSelector);
        this.dots = this.container.querySelectorAll(dotsSelector);
        this.slides = this.slider.querySelectorAll('.slide');
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.autoSlideInterval = null;
        this.autoSlideDelay = 5000;

        this.init();
    }

    init() {
        if (!this.slider || this.totalSlides === 0) return;
        
        this.updateSlider();
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        
        this.dots?.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        this.startAutoSlide();
        
        // Pause auto-slide on hover
        this.container?.addEventListener('mouseenter', () => this.stopAutoSlide());
        this.container?.addEventListener('mouseleave', () => this.startAutoSlide());
    }

    updateSlider() {
        this.slider.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        this.dots?.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateSlider();
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
    }

    startAutoSlide() {
        if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
        this.autoSlideInterval = setInterval(() => this.nextSlide(), this.autoSlideDelay);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// Initialize web slider only
const webSlider = new Slider(
    '#web-projects .slider-container',
    '.web-slider',
    '#web-projects .prev-btn',
    '#web-projects .next-btn',
    '#web-projects .dot'
);

// ========== FORMSPREE FORM SUBMISSION ==========
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Clear previous status
        if (formStatus) {
            formStatus.textContent = '';
            formStatus.className = 'form-status';
        }
        
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success
                if (formStatus) {
                    formStatus.textContent = 'Thank you! Your message has been sent successfully.';
                    formStatus.className = 'form-status success';
                }
                
                // Show alert as fallback
                alert('Thank you! Your message has been sent successfully. I\'ll get back to you soon.');
                
                // Reset form
                contactForm.reset();
                
                // Hide success message after 5 seconds
                if (formStatus) {
                    setTimeout(() => {
                        formStatus.textContent = '';
                        formStatus.className = 'form-status';
                    }, 5000);
                }
            } else {
                // Server error
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server error occurred');
            }
        } catch (error) {
            // Network or other error
            console.error('Form submission error:', error);
            
            if (formStatus) {
                formStatus.textContent = 'Oops! There was a problem sending your message. Please try again.';
                formStatus.className = 'form-status error';
            }
            
            // Show error alert
            alert('Oops! There was a problem sending your message. Please try again or contact me directly via email.');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}

// ========== MOBILE MENU TOGGLE ==========
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.innerHTML = navLinks.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

// ========== SMOOTH SCROLLING ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const navHeight = document.querySelector('.glass-nav').offsetHeight;
            window.scrollTo({
                top: targetElement.offsetTop - navHeight - 20,
                behavior: 'smooth'
            });
        }
    });
});

// ========== SET CURRENT YEAR IN FOOTER ==========
const currentYearElement = document.getElementById('current-year');
if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

// ========== BACK TO TOP BUTTON ==========
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
}

// ========== SCROLL ANIMATIONS ==========
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe sections for scroll animations
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// ========== INITIALIZE EVERYTHING ==========
window.addEventListener('DOMContentLoaded', () => {
    initParticles();
    animateParticles();
    
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    console.log('Portfolio loaded successfully! 🚀');
});

// ========== TOUCH SUPPORT FOR SLIDERS ==========
let touchStartX = 0;
let touchEndX = 0;

if (webSlider.container) {
    webSlider.container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    webSlider.container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const difference = touchStartX - touchEndX;
        
        if (Math.abs(difference) > swipeThreshold) {
            if (difference > 0) {
                webSlider.nextSlide();
            } else {
                webSlider.prevSlide();
            }
        }
    }
}