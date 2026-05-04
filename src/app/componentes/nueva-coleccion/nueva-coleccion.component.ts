import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-nueva-coleccion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nueva-coleccion.component.html',
  styleUrls: ['./nueva-coleccion.component.css']
})
export class NuevaColeccionComponent implements OnInit {

  productos: any[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.productos = data.filter((p: any) =>
        p.name.includes('Cosmograph Daytona')
      );
    });
  }

  addToCart(product: any) {
    this.cartService.add(product.id);
  }
}
