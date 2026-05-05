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
