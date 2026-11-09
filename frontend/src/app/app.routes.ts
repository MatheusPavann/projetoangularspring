import { Routes } from '@angular/router';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { PasseioDetalheComponent } from './pages/passeio-detalhe/passeio-detalhe.component';
import { ComprovanteComponent } from './pages/comprovante/comprovante.component';
import { ConsultaReservaComponent } from './pages/consulta-reserva/consulta-reserva.component';
import { PasseiosComponent } from './pages/admin/passeios/passeios.component';
import { PasseioFormComponent } from './pages/admin/passeio-form/passeio-form.component';
import { ClientesComponent } from './pages/admin/clientes/clientes.component';
import { ClienteFormComponent } from './pages/admin/cliente-form/cliente-form.component';
import { ReservasComponent } from './pages/admin/reservas/reservas.component';
import { ReservaFormComponent } from './pages/admin/reserva-form/reserva-form.component';

export const routes: Routes = [
  // Fluxo do cliente: catálogo -> detalhes/data/participantes -> comprovante
  { path: '', component: CatalogoComponent, title: 'Passeios | TurisReserva' },
  { path: 'passeios/:id', component: PasseioDetalheComponent, title: 'Reservar passeio | TurisReserva' },
  { path: 'comprovante/:codigo', component: ComprovanteComponent, title: 'Comprovante | TurisReserva' },
  { path: 'consulta', component: ConsultaReservaComponent, title: 'Minha reserva | TurisReserva' },

  // Gerenciamento (CRUD completo das 3 entidades)
  { path: 'admin/passeios', component: PasseiosComponent, title: 'Gerenciar passeios' },
  { path: 'admin/passeios/novo', component: PasseioFormComponent, title: 'Novo passeio' },
  { path: 'admin/passeios/:id/editar', component: PasseioFormComponent, title: 'Editar passeio' },
  { path: 'admin/clientes', component: ClientesComponent, title: 'Gerenciar clientes' },
  { path: 'admin/clientes/novo', component: ClienteFormComponent, title: 'Novo cliente' },
  { path: 'admin/clientes/:id/editar', component: ClienteFormComponent, title: 'Editar cliente' },
  { path: 'admin/reservas', component: ReservasComponent, title: 'Gerenciar reservas' },
  { path: 'admin/reservas/nova', component: ReservaFormComponent, title: 'Nova reserva' },
  { path: 'admin/reservas/:id/editar', component: ReservaFormComponent, title: 'Editar reserva' },

  { path: '**', redirectTo: '' }
];
