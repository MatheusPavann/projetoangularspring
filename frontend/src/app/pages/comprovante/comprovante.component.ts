import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ReservaService } from '../../services/reserva.service';
import { Reserva } from '../../models/reserva';
import { FormatarPipe } from '../../shared/formatar.pipe';
import { mensagemErro } from '../../shared/utils';

/** TELA 3 — Reserva confirmada e comprovante. */
@Component({
  selector: 'app-comprovante',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, FormatarPipe],
  templateUrl: './comprovante.component.html'
})
export class ComprovanteComponent implements OnChanges {
  @Input() codigo!: string; // vem da rota /comprovante/:codigo

  private reservaService = inject(ReservaService);

  reserva = signal<Reserva | null>(null);
  carregando = signal(true);
  erro = signal('');
  cancelando = signal(false);

  ngOnChanges(): void {
    this.carregando.set(true);
    this.reservaService.buscarPorCodigo(this.codigo).subscribe({
      next: r => { this.reserva.set(r); this.carregando.set(false); },
      error: (e: HttpErrorResponse) => { this.erro.set(mensagemErro(e)); this.carregando.set(false); }
    });
  }

  imprimir(): void {
    window.print();
  }

  cancelar(): void {
    const r = this.reserva();
    if (!r || !confirm('Deseja realmente cancelar esta reserva? As vagas serão liberadas.')) return;
    this.cancelando.set(true);
    this.reservaService.cancelar(r.id).subscribe({
      next: atualizada => { this.reserva.set(atualizada); this.cancelando.set(false); },
      error: (e: HttpErrorResponse) => { alert(mensagemErro(e)); this.cancelando.set(false); }
    });
  }
}
