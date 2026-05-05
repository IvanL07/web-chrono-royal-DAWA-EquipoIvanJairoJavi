import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css']
})
export class ModalsComponent implements OnInit {

  cartItems: any[] = [];
  cartTotal: number = 0;
  allProducts: any[] = [];

  constructor(
    private session: SessionService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupLoginForm();
    this.setupLogoutButton();
    this.setupCustomDropdowns();
    this.setupFilters();           // ← AÑADIDO

    // Limpieza SOLO al cerrar
    this.setupCartCleanup();
    this.setupFilterModalCleanup();
    this.setupContactModalCleanup();
    this.setupLoginModalCleanup();

    // Cargar productos primero
    this.productService.getProducts().subscribe(products => {
      this.allProducts = products;

      this.syncCart();

      this.cartService.cart$.subscribe(() => {
        this.syncCart();
      });
    });
  }

  // =====================================================
  //   SINCRONIZAR CARRITO
  // =====================================================
  private syncCart(): void {
    const raw = this.cartService.getCart();

    this.cartItems = raw.map(item => {
      const product = this.allProducts.find(p => p.id === item.id);
      return {
        product,
        qty: item.qty
      };
    });

    this.cartTotal = this.cartItems.reduce(
      (acc, it) => acc + it.product.price * it.qty,
      0
    );
  }

  // =====================================================
  //   ACCIONES DEL CARRITO
  // =====================================================
  increment(id: string): void {
    this.cartService.increment(id);
  }

  decrement(id: string): void {
    this.cartService.decrement(id);
  }

  remove(id: string): void {
    this.cartService.remove(id);
  }

  clear(): void {
    this.cartService.clear();
  }

  // =====================================================
  //   NAVEGAR A COLECCIONES DESDE EL OFFCANVAS
  // =====================================================
  goToColecciones(): void {
    const offcanvasEl = document.getElementById('cartOffcanvas');

    if (offcanvasEl) {
      const offcanvas =
        bootstrap.Offcanvas.getInstance(offcanvasEl) ||
        new bootstrap.Offcanvas(offcanvasEl);

      offcanvas.hide();
    }

    setTimeout(() => {
      this.forceCartBackdropCleanup();
      this.router.navigate(['/colecciones']);
    }, 150);
  }

  // =====================================================
  //   LIMPIAR BACKDROPS
  // =====================================================
  private cleanBackdrops(): void {
    document.querySelectorAll('.modal-backdrop')
      .forEach(b => b.remove());

    document.querySelectorAll('.offcanvas-backdrop')
      .forEach(b => b.remove());

    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('overflow');
  }

  // =====================================================
  //   LIMPIEZA ESPECIAL PARA EL CARRITO
  // =====================================================
  private forceCartBackdropCleanup(): void {
    document.querySelectorAll('.offcanvas-backdrop')
      .forEach(b => b.remove());

    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('overflow');
  }

  // =====================================================
  //   OFFCANVAS CARRITO — FORZAR BACKDROP + LIMPIAR AL CERRAR
  // =====================================================
  private setupCartCleanup(): void {
    const el = document.getElementById('cartOffcanvas');
    if (!el) return;

    el.addEventListener('shown.bs.offcanvas', () => {
      let backdrop = document.querySelector('.offcanvas-backdrop');

      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'offcanvas-backdrop fade show';
        document.body.appendChild(backdrop);
      }

      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    });

    el.addEventListener('hidden.bs.offcanvas', () => {
      this.forceCartBackdropCleanup();
    });

    el.addEventListener('hide.bs.offcanvas', () => {
      setTimeout(() => this.forceCartBackdropCleanup(), 200);
    });
  }

  // =====================================================
  //   MODAL LUPA — FORZAR BACKDROP
  // =====================================================
  private setupFilterModalCleanup(): void {
    const el = document.getElementById('filterModal');
    if (!el) return;

    el.addEventListener('shown.bs.modal', () => {
      let backdrop = document.querySelector('.modal-backdrop');

      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
      }

      document.body.classList.add('modal-open');
    });

    el.addEventListener('hidden.bs.modal', () => {
      this.cleanBackdrops();
    });
  }

  // =====================================================
  //   MODAL CONSULTA — LIMPIAR AL CERRAR
  // =====================================================
  private setupContactModalCleanup(): void {
    const el = document.getElementById('contactInquiryModal');
    if (!el) return;

    el.addEventListener('hidden.bs.modal', () => {
      this.cleanBackdrops();
    });
  }

  // =====================================================
  //   MODAL LOGIN — FORZAR BACKDROP + LIMPIAR AL CERRAR
  // =====================================================
  private setupLoginModalCleanup(): void {
    const el = document.getElementById('loginModal');
    if (!el) return;

    el.addEventListener('shown.bs.modal', () => {
      let backdrop = document.querySelector('.modal-backdrop');

      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
      }

      document.body.classList.add('modal-open');
    });

    el.addEventListener('hidden.bs.modal', () => {
      this.cleanBackdrops();
    });
  }

  // =====================================================
  //   CERRAR MODAL DE FORMA SEGURA
  // =====================================================
  private closeModal(id: string): void {
    const modalEl = document.getElementById(id);
    if (!modalEl) return;

    let modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) modal = new bootstrap.Modal(modalEl);

    modal.hide();

    setTimeout(() => this.cleanBackdrops(), 150);
  }

  // =====================================================
  //   LOGIN
  // =====================================================
  private setupLoginForm(): void {
    const form = document.getElementById('loginForm') as HTMLFormElement;
    const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
    const registerBtn = document.getElementById('registerBtn') as HTMLButtonElement;

    if (!form || !loginBtn || !registerBtn) return;

    const getData = () => {
      const email = (document.getElementById('loginEmail') as HTMLInputElement).value.trim();
      const pass = (document.getElementById('loginPass') as HTMLInputElement).value.trim();
      return { email, pass };
    };

    loginBtn.addEventListener('click', () => {
      const { email, pass } = getData();

      if (!email || !pass) {
        alert('Debes escribir email y contraseña.');
        return;
      }

      if (!this.session.userExists(email)) {
        alert('Este correo no está registrado. Primero debes pulsar "Registrar usuario".');
        return;
      }

      const ok = this.session.loginWithPassword(email, pass);

      if (!ok) {
        alert('La contraseña no es correcta.');
        return;
      }

      alert('Sesión iniciada correctamente.');
      this.closeModal('loginModal');
      form.reset();
    });

    registerBtn.addEventListener('click', () => {
      const { email, pass } = getData();

      if (!email || !pass) {
        alert('Debes escribir email y contraseña.');
        return;
      }

      if (this.session.userExists(email)) {
        alert('Este correo ya existe. No puedes registrarlo otra vez. Usa "Iniciar sesión".');
        return;
      }

      const ok = this.session.register(email, pass);

      if (!ok) {
        alert('No se pudo registrar el usuario.');
        return;
      }

      alert('Usuario registrado correctamente. Sesión iniciada.');
      this.closeModal('loginModal');
      form.reset();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  // =====================================================
  //   LOGOUT
  // =====================================================
  private setupLogoutButton(): void {
    const btn = document.getElementById('logoutBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      this.session.logout();
      this.closeModal('loginModal');
    });
  }

  // =====================================================
  //   DROPDOWNS PERSONALIZADOS
  // =====================================================
  private setupCustomDropdowns(): void {
    const dropdowns = [
      { btnId: 'paisBtn',        textId: 'paisText',        selectId: 'paisSelect',        target: 'pais'        },
      { btnId: 'motivoBtn',      textId: 'motivoText',      selectId: 'motivoSelect',      target: 'motivo'      },
      { btnId: 'horizonteBtn',   textId: 'horizonteText',   selectId: 'horizonteSelect',   target: 'horizonte'   },
      { btnId: 'experienciaBtn', textId: 'experienciaText', selectId: 'experienciaSelect', target: 'experiencia' },
      { btnId: 'relacionBtn',    textId: 'relacionText',    selectId: 'relacionSelect',    target: 'relacion'    },
      { btnId: 'filterBrandBtn', textId: 'filterBrandText', selectId: 'filterBrand',       target: 'filterBrand' }
    ];

    dropdowns.forEach(drop => {
      const btn    = document.getElementById(drop.btnId)    as HTMLButtonElement;
      const text   = document.getElementById(drop.textId)   as HTMLElement;
      const select = document.getElementById(drop.selectId) as HTMLSelectElement;

      if (!btn || !text || !select) return;

      const menu = btn.parentElement?.querySelector('.dropdown-menu') as HTMLElement;
      if (!menu) return;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        document.querySelectorAll('.dropdown-menu.show').forEach(openMenu => {
          if (openMenu !== menu) openMenu.classList.remove('show');
        });

        menu.classList.toggle('show');
      });

      menu.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const button = item as HTMLButtonElement;
          const value  = button.getAttribute('data-value') || '';
          const label  = button.textContent?.trim() || '';

          select.value     = value;
          text.textContent = label;

          menu.classList.remove('show');
          select.dispatchEvent(new Event('change'));
        });
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    });
  }

  // =====================================================
  //   FILTROS — Aplicar y Limpiar
  // =====================================================
  private setupFilters(): void {
    const applyBtn = document.getElementById('applyFiltersBtn');
    const clearBtn = document.getElementById('clearFiltersBtn');

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const brandSelect = document.getElementById('filterBrand') as HTMLSelectElement;
        const minInput    = document.getElementById('filterMin')   as HTMLInputElement;
        const maxInput    = document.getElementById('filterMax')   as HTMLInputElement;

        const brand = brandSelect?.value || '';
        const min   = minInput?.value    ? Number(minInput.value) : null;
        const max   = maxInput?.value    ? Number(maxInput.value) : null;

        sessionStorage.setItem('cr_filter_brand', brand);
        sessionStorage.setItem('cr_filter_min',   min !== null ? String(min) : '');
        sessionStorage.setItem('cr_filter_max',   max !== null ? String(max) : '');

        this.closeModal('filterModal');
        setTimeout(() => this.router.navigate(['/colecciones']), 200);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        // Limpiar sessionStorage
        sessionStorage.removeItem('cr_filter_brand');
        sessionStorage.removeItem('cr_filter_min');
        sessionStorage.removeItem('cr_filter_max');

        // Resetear select y texto del dropdown de marca
        const brandSelect = document.getElementById('filterBrand') as HTMLSelectElement;
        if (brandSelect) brandSelect.value = '';

        const brandText = document.getElementById('filterBrandText');
        if (brandText) brandText.textContent = 'Todas';

        // Resetear inputs de precio
        const minInput = document.getElementById('filterMin') as HTMLInputElement;
        const maxInput = document.getElementById('filterMax') as HTMLInputElement;
        if (minInput) minInput.value = '';
        if (maxInput) maxInput.value = '';

        this.closeModal('filterModal');
        setTimeout(() => this.router.navigate(['/colecciones']), 200);
      });
    }
  }

}
