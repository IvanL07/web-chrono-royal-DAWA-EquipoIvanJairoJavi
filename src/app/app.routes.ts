import { Routes } from '@angular/router';

import { HomeComponent } from './componentes/home/home.component';
import { AutenticidadComponent } from './componentes/autenticidad/autenticidad.component';
import { ColeccionesComponent } from './componentes/colecciones/colecciones.component';
import { ContactoComponent } from './componentes/contacto/contacto.component';
import { NuevaColeccionComponent } from './componentes/nueva-coleccion/nueva-coleccion.component';
import { ProductoComponent } from './componentes/producto/producto.component';
import { SobreNosotrosComponent } from './componentes/sobre-nosotros/sobre-nosotros.component';
import { PageNotFoundComponent } from './layout/page-not-found/page-not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  {
    path: 'home',
    component: HomeComponent
  },

  {
    path: 'autenticidad',
    component: AutenticidadComponent
  },
  {
    path: 'colecciones',
    component: ColeccionesComponent
  },
  {
    path: 'contacto',
    component: ContactoComponent
  },
  {
    path: 'nueva-coleccion',
    component: NuevaColeccionComponent
  },
  {
    path: 'producto',
    component: ProductoComponent
  },
  {
    path: 'sobre-nosotros',
    component: SobreNosotrosComponent
  },

  // ⭐ Página 404
  {
    path: '**',
    component: PageNotFoundComponent
  }
];
