import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private url = 'assets/data/products.json';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<any[]>(this.url).pipe(
      map(products => products.find(p => p.id === id))
    );
  }
}

