import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { SessionService } from '../../services/session.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  cartCount = 0;
  isLogged = false;
  userEmail = '';

  constructor(
    private cart: CartService,
    private session: SessionService
  ) {}

  ngOnInit(): void {

    this.cart.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.session.session$.subscribe(s => {
      this.isLogged = s.isLogged;
      this.userEmail = s.userEmail;
    });
  }
}
