import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  enviado = signal(false);
  paisOpen = false;
  motivoOpen = false;

  togglePais()   { this.paisOpen   = !this.paisOpen;   this.motivoOpen = false; }
  toggleMotivo() { this.motivoOpen = !this.motivoOpen; this.paisOpen   = false; }

  seleccionarPais(p: string)   { this.form.pais   = p; this.paisOpen   = false; }
  seleccionarMotivo(m: string) { this.form.motivo = m; this.motivoOpen = false; }

  form = {
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    pais: '',
    ciudad: '',
    motivo: '',
    mensaje: ''
  };

  paises = ['España', 'Portugal', 'Francia', 'Italia', 'Alemania', 'Reino Unido'];
  motivos = ['Compra', 'Información adicional', 'Disponibilidad / Reservas', 'Estado / Documentación'];

  enviar(): void {
    this.enviado.set(true);
    this.form = { nombre: '', apellidos: '', email: '', telefono: '', pais: '', ciudad: '', motivo: '', mensaje: '' };
    setTimeout(() => this.enviado.set(false), 5000);
  }
}
