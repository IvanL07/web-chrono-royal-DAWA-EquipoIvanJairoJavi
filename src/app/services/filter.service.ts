import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FilterService {
  private aplicar$ = new Subject<void>();

  /** El modal llama esto al pulsar "Aplicar filtros" */
  emitirAplicar(): void {
    this.aplicar$.next();
  }

  /** ColeccionesComponent se suscribe a esto */
  onAplicar() {
    return this.aplicar$.asObservable();
  }
}
