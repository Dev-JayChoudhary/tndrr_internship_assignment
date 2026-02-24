/**
 * Homepage JavaScript - VeggieTrack
 * Handles navigation, carousel, forms, and animations
 */

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const scrollToTopBtn = document.getElementById('scrollToTop');

    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Show/hide scroll to top button
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

// Scroll to top button click
document.getElementById('scrollToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Mobile menu toggle
document.getElementById('mobileToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('show');
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('navLinks').classList.remove('show');
        }
    });
});

// Testimonial 3D Carousel
const slides = document.querySelectorAll('.testimonial-card');
const dotsContainer = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slideCount = slides.length;
let currentSlide = 0;

// Create dots
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('slider-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.slider-dot');

// Position cards in 3D carousel
function updateCarousel() {
    slides.forEach((slide, index) => {
        // Remove all position classes
        slide.classList.remove('position-far-left', 'position-left', 'position-center', 'position-right', 'position-far-right');

        // Calculate relative position from current slide
        let diff = index - currentSlide;

        // Handle wrapping for infinite loop
        if (diff > Math.floor(slideCount / 2)) {
            diff -= slideCount;
        } else if (diff < -Math.floor(slideCount / 2)) {
            diff += slideCount;
        }

        // Assign position class based on relative position
        if (diff === 0) {
            slide.classList.add('position-center');
        } else if (diff === -1) {
            slide.classList.add('position-left');
        } else if (diff === 1) {
            slide.classList.add('position-right');
        } else if (diff === -2 || diff < -1) {
            slide.classList.add('position-far-left');
        } else if (diff === 2 || diff > 1) {
            slide.classList.add('position-far-right');
        }
    });

    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slideCount;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
    updateCarousel();
}

// Initialize carousel
updateCarousel();

// Event listeners
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Click on side cards to navigate
slides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
        if (slide.classList.contains('position-left')) {
            prevSlide();
        } else if (slide.classList.contains('position-right')) {
            nextSlide();
        }
    });
});

// Auto play
let slideInterval = setInterval(nextSlide, 4000);

// Pause on hover
const sliderContainer = document.querySelector('.testimonial-slider-container');
sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
sliderContainer.addEventListener('mouseleave', () => slideInterval = setInterval(nextSlide, 4000));

// Touch/Swipe support
let touchStartX = 0;
let touchEndX = 0;

sliderContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

sliderContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        nextSlide();
    } else if (touchEndX > touchStartX + swipeThreshold) {
        prevSlide();
    }
}


// Form validation - check if fields are empty and add error styling
function isValidEmail(email) {
    // Check if email has @ and . in it
    return email.includes('@') && email.includes('.');
}

function validateFeedbackForm() {
    let isValid = true;

    const feedbackName = document.getElementById('feedbackName');
    const feedbackEmail = document.getElementById('feedbackEmail');
    const feedbackRating = document.getElementById('feedbackRating');
    const feedbackMessage = document.getElementById('feedbackMessage');

    // Reset errors
    feedbackName.classList.remove('input-error');
    feedbackEmail.classList.remove('input-error');
    feedbackRating.classList.remove('input-error');
    feedbackMessage.classList.remove('input-error');

    // Check if empty
    if (feedbackName.value.trim() === '') {
        feedbackName.classList.add('input-error');
        isValid = false;
    }

    // Check if empty or invalid email
    if (feedbackEmail.value.trim() === '' || !isValidEmail(feedbackEmail.value.trim())) {
        feedbackEmail.classList.add('input-error');
        isValid = false;
    }

    // Check if rating is selected
    if (feedbackRating.value === '0') {
        feedbackRating.classList.add('input-error');
        isValid = false;
    }

    if (feedbackMessage.value.trim() === '') {
        feedbackMessage.classList.add('input-error');
        isValid = false;
    }

    return isValid;
}

function validateContactForm() {
    let isValid = true;

    const contactName = document.getElementById('contactName');
    const contactEmail = document.getElementById('contactEmail');
    const contactSubject = document.getElementById('contactSubject');
    const contactMessage = document.getElementById('contactMessage');

    // Reset errors
    contactName.classList.remove('input-error');
    contactEmail.classList.remove('input-error');
    contactSubject.classList.remove('input-error');
    contactMessage.classList.remove('input-error');

    // Check if empty
    if (contactName.value.trim() === '') {
        contactName.classList.add('input-error');
        isValid = false;
    }

    // Check if empty or invalid email
    if (contactEmail.value.trim() === '' || !isValidEmail(contactEmail.value.trim())) {
        contactEmail.classList.add('input-error');
        isValid = false;
    }

    // Check if subject is empty
    if (contactSubject.value.trim() === '') {
        contactSubject.classList.add('input-error');
        isValid = false;
    }

    if (contactMessage.value.trim() === '') {
        contactMessage.classList.add('input-error');
        isValid = false;
    }

    return isValid;
}

// Remove error state on input
document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
    input.addEventListener('input', function () {
        this.classList.remove('input-error');
    });
});

// Remove error state on select change
document.querySelectorAll('.form-group select').forEach(select => {
    select.addEventListener('change', function () {
        this.classList.remove('input-error');
    });
});

// Form submissions with validation
document.getElementById('feedbackForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateFeedbackForm()) {
        return;
    }

    alert('Thank you for your feedback! We appreciate it. 🌿');
    this.reset();
});

document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateContactForm()) {
        return;
    }

    alert('Message sent successfully! We will get back to you within 24 hours. 📧');
    this.reset();
});

// Scroll animation observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .plan-card, .testimonial-card, .contact-item').forEach(el => {
    observer.observe(el);
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Subscribe button toggle functionality
document.addEventListener("DOMContentLoaded", () => {
    const subscribeBtn = document.getElementById("subscribeBtn");
    const toast = document.getElementById("toast");
    const emailInput = document.getElementById("subscribeEmail");

    subscribeBtn.addEventListener("click", () => {
        const email = emailInput.value.trim();

        emailInput.classList.remove("input-error");

        if (email === "") {
            emailInput.classList.add("input-error");
            showToast("⚠️ Please enter email");
            return;
        }

        if (!isValidEmail(email)) {
            emailInput.classList.add("input-error");
            showToast("❌ Invalid email format");
            return;
        }

        showToast(" Subscribed successfully!");
        emailInput.value = "";
    });

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }
});



