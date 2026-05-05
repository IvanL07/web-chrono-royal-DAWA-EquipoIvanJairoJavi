import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-colecciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './colecciones.component.html',
  styleUrls: ['./colecciones.component.css']
})
export class ColeccionesComponent implements OnInit {

  todosLosProductos: any[] = [];
  productos: any[] = [];

  constructor(
    private productService: ProductService,
    private cart: CartService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.todosLosProductos = data;
      this.aplicarFiltros();
    });
  }

  private aplicarFiltros(): void {
    const brand = sessionStorage.getItem('cr_filter_brand') || '';
    const min   = sessionStorage.getItem('cr_filter_min');
    const max   = sessionStorage.getItem('cr_filter_max');

    this.productos = this.todosLosProductos.filter(p => {
      if (brand && p.brand !== brand)                     return false;
      if (min && min !== '' && p.price < Number(min))     return false;
      if (max && max !== '' && p.price > Number(max))     return false;
      return true;
    });
  }

  addToCart(product: any): void {
    this.cart.add(product.id);
  }

}
