import {Component, OnInit, OnDestroy, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { FilterService } from '../../services/filter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-colecciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './colecciones.component.html',
  styleUrls: ['./colecciones.component.css']
})
export class ColeccionesComponent implements OnInit, OnDestroy {

  todosLosProductos: any[] = [];
  productos: any[] = [];
  private sub!: Subscription;

  // ← Usar inject() en lugar de constructor con parámetros
  private productService = inject(ProductService);
  private cart           = inject(CartService);
  private filterService  = inject(FilterService);

  constructor() {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.todosLosProductos = data;
      this.aplicarFiltros();
    });

    // Escucha el evento del modal
    this.sub = this.filterService.onAplicar().subscribe(() => {
      this.aplicarFiltros();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  public aplicarFiltros(): void {
    const brand = sessionStorage.getItem('cr_filter_brand') || '';
    const min   = sessionStorage.getItem('cr_filter_min');
    const max   = sessionStorage.getItem('cr_filter_max');

    this.productos = this.todosLosProductos.filter(p => {
      if (brand && p.brand !== brand)                 return false;
      if (min && min !== '' && p.price < Number(min)) return false;
      if (max && max !== '' && p.price > Number(max)) return false;
      return true;
    });
  }

  addToCart(product: any): void {
    this.cart.add(product.id);
  }
}
