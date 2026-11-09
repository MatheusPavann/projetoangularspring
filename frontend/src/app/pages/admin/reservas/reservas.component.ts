import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ReservaService } from '../../../services/reserva.service';
import { Reserva, StatusReserva } from '../../../models/reserva';
import { mensagemErro } from '../../../shared/utils';

/** Listagem de reservas (Read + Delete + Cancelar). */
@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './reservas.component.html'
})
export class ReservasComponent implements OnInit {
  private reservaService = inject(ReservaService);

  reservas = signal<Reserva[]>([]);
  carregando = signal(true);
  busca = signal('');
  status = signal<'' | StatusReserva>('');
  mensagem = signal<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  filtradas = computed(() => {
    const t = this.busca().trim().toLowerCase();
    return this.reservas().filter(r =>
      (!this.status() || r.status === this.status()) &&
      (!t || r.codigoComprovante.toLowerCase().includes(t)
          || r.cliente.nome.toLowerCase().includes(t)
          || r.passeio.nome.toLowerCase().includes(t)));
  });

  faturamento = computed(() => this.reservas()
    .filter(r => r.status === 'CONFIRMADA')
    .reduce((soma, r) => soma + r.valorTotal, 0));

  confirmadas = computed(() => this.reservas().filter(r => r.status === 'CONFIRMADA').length);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.reservaService.listar().subscribe({
      next: l => { this.reservas.set(l); this.carregando.set(false); },
      error: (e: HttpErrorResponse) => {
        this.mensagem.set({ tipo: 'danger', texto: mensagemErro(e) });
        this.carregando.set(false);
      }
    });
  }

  cancelar(r: Reserva): void {
    if (!confirm(`Cancelar a reserva ${r.codigoComprovante}?`)) return;
    this.reservaService.cancelar(r.id).subscribe({
      next: () => { this.mensagem.set({ tipo: 'success', texto: 'Reserva cancelada. As vagas foram liberadas.' }); this.carregar(); },
      error: (e: HttpErrorResponse) => this.mensagem.set({ tipo: 'danger', texto: mensagemErro(e) })
    });
  }

  excluir(r: Reserva): void {
    if (!confirm(`Excluir definitivamente a reserva ${r.codigoComprovante}?`)) return;
    this.reservaService.excluir(r.id).subscribe({
      next: () => { this.mensagem.set({ tipo: 'success', texto: 'Reserva excluída.' }); this.carregar(); },
      error: (e: HttpErrorResponse) => this.mensagem.set({ tipo: 'danger', texto: mensagemErro(e) })
    });
  }
}
