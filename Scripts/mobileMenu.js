class MobileMenu {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.menuToggle = document.getElementById('mobileMenuToggle');
            this.menuItems = document.getElementById('menuItems');
            this.menuOverlay = document.getElementById('menuOverlay');
            
            if (this.menuToggle && this.menuItems) {
                this.isOpen = false;
                this.init();
            } else {
                console.warn('Menu elements not found');
            }
        });
    }

    init() {
        this.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        this.menuOverlay.addEventListener('click', () => {
            this.closeMenu();
        });

        document.addEventListener('click', (e) => {
            if (!this.menuItems.contains(e.target) && 
                !this.menuToggle.contains(e.target) && 
                this.isOpen) {
                this.closeMenu();
            }
        });

        this.menuItems.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-item')) {
                this.closeMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.menuItems.classList.toggle('show');
        this.menuOverlay.classList.toggle('show');
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
        this.menuToggle.setAttribute('aria-expanded', this.isOpen);
    }

    closeMenu() {
        this.isOpen = false;
        this.menuItems.classList.remove('show');
        this.menuOverlay.classList.remove('show');
        document.body.style.overflow = '';
        this.menuToggle.setAttribute('aria-expanded', 'false');
    }
}

new MobileMenu();