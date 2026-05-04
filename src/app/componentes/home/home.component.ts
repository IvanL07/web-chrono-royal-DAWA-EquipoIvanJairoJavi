import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private router: Router) {}

  goNuevaColeccion() {
    this.router.navigate(['/nueva-coleccion']);
  }

  goProducto(id: string) {
    this.router.navigate(['/producto'], {
      queryParams: { id }
    });
  }

}
