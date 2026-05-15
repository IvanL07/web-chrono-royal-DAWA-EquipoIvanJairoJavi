import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { RouterModule } from '@angular/router';
import {ProductoInterface} from '../../common/producto-interface';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {

  producto: ProductoInterface | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cart: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');

    this.productService.getProducts().subscribe(data => {
      this.producto = data.find((p: ProductoInterface) => p.id === id) || null;
    });
  }

  addToCart(): void {
    if (!this.producto) return;

    this.cart.add(this.producto.id);
  }


  seguirComprando() {
    this.router.navigate(['/colecciones']);
  }
}
