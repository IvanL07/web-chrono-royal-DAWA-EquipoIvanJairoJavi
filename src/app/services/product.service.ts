import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {ProductoInterface} from '../common/producto-interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private url = 'assets/data/products.json';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductoInterface[]> {
    return this.http.get<ProductoInterface[]>(this.url);
  }

  getProductById(id: string): Observable<ProductoInterface | undefined> {
    return this.http.get<ProductoInterface[]>(this.url).pipe(
      map(products => products.find(p => p.id === id))
    );
  }
}

