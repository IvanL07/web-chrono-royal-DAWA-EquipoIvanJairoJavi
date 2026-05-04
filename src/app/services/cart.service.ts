import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string;
  qty: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private STORAGE_KEY = 'cr_cart';

  // Lista cruda de items (id + qty)
  private cartSubject = new BehaviorSubject<CartItem[]>(this.getCart());
  cart$ = this.cartSubject.asObservable();

  // Contador total (para el badge del navbar)
  cartCount$ = new BehaviorSubject<number>(0);

  constructor() {
    this.cartCount$.next(this.countItems());
  }

  getCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveCart(cart: CartItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.cartSubject.next(cart);
    this.cartCount$.next(this.countItems());
  }

  countItems(): number {
    return this.getCart().reduce((acc, it) => acc + (it.qty || 0), 0);
  }

  add(productId: string): void {
    const cart = this.getCart();
    const found = cart.find(i => i.id === productId);

    if (found) {
      found.qty += 1;
    } else {
      cart.push({ id: productId, qty: 1 });
    }

    this.saveCart(cart);
  }

  increment(productId: string): void {
    const cart = this.getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += 1;
    this.saveCart(cart);
  }

  decrement(productId: string): void {
    const cart = this.getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.qty = Math.max(1, item.qty - 1);
    this.saveCart(cart);
  }

  setQty(productId: string, qty: number): void {
    const cart = this.getCart();
    const item = cart.find(i => i.id === productId);

    if (!item) return;

    item.qty = Math.max(1, qty);
    this.saveCart(cart);
  }

  remove(productId: string): void {
    const cart = this.getCart().filter(i => i.id !== productId);
    this.saveCart(cart);
  }

  clear(): void {
    this.saveCart([]);
  }
}
