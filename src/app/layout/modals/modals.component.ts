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

    // ⭐ FORZAR BACKDROP AL ABRIR
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

    // ⭐ LIMPIAR SIEMPRE AL CERRAR
    el.addEventListener('hidden.bs.offcanvas', () => {
      this.forceCartBackdropCleanup();
    });

    // ⭐ LIMPIEZA EXTRA POR SI BOOTSTRAP FALLA
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
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
      const pass = (document.getElementById('loginPass') as HTMLInputElement).value;

      if (!email || !pass) return;

      this.session.login(email);
      this.closeModal('loginModal');
      form.reset();
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
}
