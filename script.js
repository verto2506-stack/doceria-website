// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Cart counter
let cartCount = 0;
const cartBadge = document.querySelector('.cart-badge');

document.querySelectorAll('.btn-flavor').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        cartCount++;
        cartBadge.textContent = cartCount;
        
        // Animation feedback
        this.style.background = 'green';
        this.textContent = 'ADICIONADO!';
        
        setTimeout(() => {
            this.style.background = '';
            this.textContent = 'COMPRE AGORA';
        }, 2000);
    });
});

// Newsletter subscription
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        if (email) {
            alert(`Obrigado por se inscrever! Confirmação enviada para ${email}`);
            this.reset();
        }
    });
}

// Animação de scroll reveal para elementos
const revealOnScroll = () => {
    const elements = document.querySelectorAll('.flavor-card, .feature, .testimonial');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
};

// Inicializar animações ao carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealOnScroll);
} else {
    revealOnScroll();
}

// Active nav link tracking
const updateActiveLink = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.style.color = 'var(--primary-color)';
            } else {
                link.style.color = 'var(--text-dark)';
            }
        });
    });
};

updateActiveLink();

console.log('✨ Bem-vindo à Doceria Social! 🍰');