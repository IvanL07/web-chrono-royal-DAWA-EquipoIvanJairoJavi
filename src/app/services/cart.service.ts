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

  private cartSubject = new BehaviorSubject<CartItem[]>(this.getCart());
  cart$ = this.cartSubject.asObservable();

  cartCount$ = new BehaviorSubject<number>(this.countItems());

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
    return this.getCart().reduce((total, item) => total + item.qty, 0);
  }

  add(productId: string): void {
    const cart = this.getCart();
    const item = cart.find(p => p.id === productId);

    if (item) {
      item.qty++;
    } else {
      cart.push({
        id: productId,
        qty: 1
      });
    }

    this.saveCart(cart);
  }

  increment(productId: string): void {
    const cart = this.getCart();
    const item = cart.find(p => p.id === productId);

    if (!item) return;

    item.qty++;
    this.saveCart(cart);
  }

  decrement(productId: string): void {
    const cart = this.getCart();
    const item = cart.find(p => p.id === productId);

    if (!item) return;

    item.qty--;

    if (item.qty <= 0) {
      this.remove(productId);
      return;
    }

    this.saveCart(cart);
  }

  remove(productId: string): void {
    const cart = this.getCart().filter(p => p.id !== productId);
    this.saveCart(cart);
  }

  clear(): void {
    this.saveCart([]);
  }
}
