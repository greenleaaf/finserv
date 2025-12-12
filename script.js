// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Calculate the position to scroll to, accounting for fixed header
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.querySelector('.mobile-menu');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                }
            }
        });
    });

    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('active');
            }
        });
    }

    // Form submission handling with EmailJS
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form elements
            const formMessage = document.getElementById('form-message');
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            formMessage.textContent = '';
            formMessage.className = 'form-message';
            
            // Prepare email parameters
            const templateParams = {
                from_name: document.getElementById('from_name').value,
                from_email: document.getElementById('from_email').value,
                to_email: 'info.greenleaaf@gmail.com',
                message: document.getElementById('message').value
            };
            
            // Show sending state
            formMessage.textContent = 'Sending your message...';
            formMessage.className = 'form-message info';
            
            // Verify EmailJS is initialized
            if (!window.emailjsInitialized) {
                formMessage.textContent = 'Email service is not ready. Please refresh the page and try again.';
                formMessage.className = 'form-message error';
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                return;
            }

            // Send email using EmailJS with retry logic
            const sendEmail = (retryCount = 0) => {
                const maxRetries = 2;
                
                // Verify emailjs is available
                if (typeof emailjs === 'undefined' || !emailjs.send) {
                    handleEmailError('Email service not loaded', true);
                    return;
                }

                emailjs.send('service_zz7byob', 'template_gwv7kox', templateParams)
                    .then(function(response) {
                        // Show success message
                        formMessage.textContent = 'Thank you for your message! We will get back to you soon.';
                        formMessage.className = 'form-message success';
                        
                        // Reset form
                        contactForm.reset();
                    }, function(error) {
                        if (retryCount < maxRetries) {
                            // Retry sending
                            return sendEmail(retryCount + 1);
                        }
                        // Show error message after max retries
                        formMessage.textContent = 'Failed to send message. Please try again later or contact us directly at info.greenleaaf@gmail.com';
                        formMessage.className = 'form-message error';
                        console.error('EmailJS Error:', error);
                        
                        // Store the failed message in localStorage
                        const failedMessage = {
                            name: templateParams.from_name,
                            email: templateParams.from_email,
                            message: templateParams.message,
                            timestamp: new Date().toISOString()
                        };
                        localStorage.setItem('failedMessage', JSON.stringify(failedMessage));
                    })
                    .finally(() => {
                        // Reset button state
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                        
                        // Scroll to message
                        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        
                        // Clear message after 10 seconds
                        const clearMessage = setTimeout(() => {
                            formMessage.textContent = '';
                            formMessage.className = 'form-message';
                        }, 10000);
                        
                        // Clear the timeout if the user interacts with the form
                        contactForm.addEventListener('input', function clearTimer() {
                            clearTimeout(clearMessage);
                            contactForm.removeEventListener('input', clearTimer);
                        });
                    });
            };
            
            // Start the email sending process
            sendEmail();
        });
    }
    
    // Add active class to current section in navigation
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    function highlightNavigation() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 200)) {
                current = `#${section.getAttribute('id')}`;
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavigation);
    highlightNavigation(); // Call once on page load
    
    // Add animation on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.service-card, .about p, #contact-form');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial state for animation
    document.addEventListener('DOMContentLoaded', function() {
        const animatedElements = document.querySelectorAll('.service-card, .about p, #contact-form');
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        });
        
        // Trigger initial animation
        setTimeout(animateOnScroll, 100);
    });
    
    window.addEventListener('scroll', animateOnScroll);
    
    // Admin panel functionality
    if (document.body.classList.contains('admin-panel')) {
        // Check authentication
        const isAuthenticated = sessionStorage.getItem('isAuthenticated');
        if (!isAuthenticated) {
            window.location.href = 'admin.html';
        }
        
        // Handle logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                sessionStorage.removeItem('isAuthenticated');
                window.location.href = 'admin.html';
            });
        }
    }
});

// Form validation
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                input.classList.add('error');
            }
        }
    });
    
    return isValid;
}

// Add event listener for form validation
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form:not([novalidate])');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                // Show error message
                const errorDiv = this.querySelector('.error-message') || document.createElement('div');
                if (!errorDiv.classList.contains('error-message')) {
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = 'Please fill in all required fields correctly.';
                    this.insertBefore(errorDiv, this.firstChild);
                }
                errorDiv.style.display = 'block';
            }
        });
    });
});
