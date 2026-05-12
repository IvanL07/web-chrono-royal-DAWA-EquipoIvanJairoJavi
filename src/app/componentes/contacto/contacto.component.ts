import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  enviado = signal(false);
  submitted = false;

  paisOpen = false;
  motivoOpen = false;

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

  togglePais(): void {
    this.paisOpen = !this.paisOpen;
    this.motivoOpen = false;
  }

  toggleMotivo(): void {
    this.motivoOpen = !this.motivoOpen;
    this.paisOpen = false;
  }

  seleccionarPais(pais: string): void {
    this.form.pais = pais;
    this.paisOpen = false;
  }

  seleccionarMotivo(motivo: string): void {
    this.form.motivo = motivo;
    this.motivoOpen = false;
  }

  enviar(f: NgForm): void {
    this.submitted = true;

    if (
      f.invalid ||
      !this.form.nombre ||
      !this.form.apellidos ||
      !this.form.email ||
      !this.form.telefono ||
      !this.form.pais ||
      !this.form.ciudad ||
      !this.form.motivo ||
      !this.form.mensaje
    ) {
      return;
    }

    this.enviado.set(true);
    this.submitted = false;

    this.form = {
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      pais: '',
      ciudad: '',
      motivo: '',
      mensaje: ''
    };

    f.resetForm(this.form);

    setTimeout(() => this.enviado.set(false), 5000);
  }
}
