import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import {FilterService} from '../../services/filter.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-modals',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    private router: Router,
    private filterService: FilterService
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
    this.setupContactInquiryForm();
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
    const rawCart = this.cartService.getCart();

    this.cartItems = rawCart
      .map(item => {
        const product = this.allProducts.find(p => p.id === item.id);

        if (!product) {
          return null;
        }

        return {
          product: product,
          qty: item.qty
        };
      })
      .filter(item => item !== null);

    this.cartTotal = this.cartItems.reduce(
      (total, item) => total + item.product.price * item.qty,
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

  //========================================
  //        METODO CARRITO EUR
  //========================================

  formatEUR(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value || 0);
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

          select.value = value;
          text.textContent = label;

          btn.classList.remove('is-invalid');

          /* FIX:
             En el modal de la lupa NO queremos tick verde.
             Solo usamos is-valid en Solicitar consulta.
          */
          if (!btn.closest('#filterModal')) {
            btn.classList.toggle('is-valid', select.checkValidity());
          } else {
            btn.classList.remove('is-valid');
          }

          menu.classList.remove('show');
          select.dispatchEvent(new Event('change', { bubbles: true }));
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

        this.filterService.emitirAplicar();
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
        this.filterService.emitirAplicar();


      });
    }
  }

  // =====================================================
//   MODAL SOLICITAR CONSULTA — CLON HTML ORIGINAL
// =====================================================
  private setupContactInquiryForm(): void {
    const modalEl = document.getElementById('contactInquiryModal');
    const formEl = document.getElementById('contactInquiryForm') as HTMLFormElement;
    const listEl = document.getElementById('contactCartSummary');
    const totalEl = document.getElementById('contactCartTotal');
    const hiddenEl = document.getElementById('contactCartHidden') as HTMLInputElement;

    if (!modalEl || !formEl || !listEl || !totalEl || !hiddenEl) return;

    modalEl.addEventListener('show.bs.modal', () => {
      this.fillContactCartSummary(listEl, totalEl, hiddenEl);
      this.resetContactValidation(formEl);
    });

    formEl.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();

      this.validateHiddenDropdowns(formEl);

      if (!formEl.checkValidity()) {
        formEl.classList.add('was-validated');
        return;
      }

      formEl.classList.add('was-validated');

      const modal =
        bootstrap.Modal.getInstance(modalEl) ||
        new bootstrap.Modal(modalEl);

      modal.hide();

      this.showConsultToast(
        'Solicitud enviada correctamente. Nuestro equipo revisará la disponibilidad de las piezas seleccionadas y se pondrá en contacto a la mayor brevedad posible.'
      );

      this.clear();

      setTimeout(() => {
        formEl.reset();
        formEl.classList.remove('was-validated');
        this.resetContactDropdownTexts();
        this.cleanBackdrops();
      }, 300);
    });
  }

// =====================================================
//   RELLENAR PIEZAS SELECCIONADAS EN EL FORMULARIO
// =====================================================
  private fillContactCartSummary(
    listEl: HTMLElement,
    totalEl: HTMLElement,
    hiddenEl: HTMLInputElement
  ): void {
    if (this.cartItems.length === 0) {
      listEl.innerHTML = `
      <div class="text-secondary small p-2">
        No hay productos en el carrito.
      </div>
    `;

      totalEl.textContent = this.formatEUR(0);
      hiddenEl.value = '';
      return;
    }

    listEl.innerHTML = this.cartItems.map(item => `
    <div class="bg-transparent text-light d-flex justify-content-between align-items-start gap-3 p-2 border-bottom border-white border-opacity-10">
      <div>
        <div class="fw-semibold">${item.product.name}</div>
        <div class="small text-secondary">${item.product.brand}</div>
        <div class="small text-secondary">Cantidad: ${item.qty}</div>
      </div>

      <div class="fw-semibold">
        ${this.formatEUR(item.product.price * item.qty)}
      </div>
    </div>
  `).join('');

    totalEl.textContent = this.formatEUR(this.cartTotal);

    hiddenEl.value = this.cartItems.map(item =>
      `${item.product.name} (${item.product.brand}) x${item.qty} — ${this.formatEUR(item.product.price * item.qty)}`
    ).join(' | ');
  }

// =====================================================
//   VALIDAR SELECTS OCULTOS DE LOS DROPDOWNS
// =====================================================
  private validateHiddenDropdowns(formEl: HTMLFormElement): void {
    const selects = formEl.querySelectorAll('select[id$="Select"]');

    selects.forEach(selectElement => {
      const select = selectElement as HTMLSelectElement;
      const base = select.id.replace('Select', '');
      const btn = document.getElementById(base + 'Btn');

      if (!btn) return;

      const isValid = select.checkValidity();

      btn.classList.toggle('is-valid', isValid);
      btn.classList.toggle('is-invalid', !isValid);
    });
  }

// =====================================================
//   RESET VALIDACIÓN
// =====================================================
  private resetContactValidation(formEl: HTMLFormElement): void {
    formEl.classList.remove('was-validated');

    const buttons = formEl.querySelectorAll('.is-valid, .is-invalid');

    buttons.forEach(btn => {
      btn.classList.remove('is-valid');
      btn.classList.remove('is-invalid');
    });
  }

// =====================================================
//   RESET TEXTOS DROPDOWNS FORMULARIO CONSULTA
// =====================================================
  private resetContactDropdownTexts(): void {
    const resetData = [
      { selectId: 'paisSelect', textId: 'paisText', text: 'Selecciona un país' },
      { selectId: 'motivoSelect', textId: 'motivoText', text: 'Selecciona una opción' },
      { selectId: 'horizonteSelect', textId: 'horizonteText', text: 'Selecciona una opción' },
      { selectId: 'experienciaSelect', textId: 'experienciaText', text: 'Prefiero no indicarlo' },
      { selectId: 'relacionSelect', textId: 'relacionText', text: 'Prefiero no indicarlo' }
    ];

    resetData.forEach(item => {
      const select = document.getElementById(item.selectId) as HTMLSelectElement;
      const text = document.getElementById(item.textId);

      if (select) select.selectedIndex = 0;
      if (text) text.textContent = item.text;
    });
  }

// =====================================================
//   TOAST PREMIUM ORIGINAL
// =====================================================
  private showConsultToast(message: string): void {
    const backdrop = document.getElementById('consultToastBackdrop');
    const toastEl = document.getElementById('consultToast');
    const bodyEl = document.getElementById('consultToastBody');

    if (!toastEl || !bodyEl) {
      alert(message);
      return;
    }

    bodyEl.textContent = message;

    if (backdrop) {
      backdrop.classList.remove('d-none');
    }

    const toast = new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: 4500
    });

    toast.show();

    toastEl.addEventListener(
      'hidden.bs.toast',
      () => {
        if (backdrop) {
          backdrop.classList.add('d-none');
        }
      },
      { once: true }
    );
  }

}
