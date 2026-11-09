import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PasseioService } from '../../../services/passeio.service';
import { Passeio } from '../../../models/passeio';
import { mensagemErro } from '../../../shared/utils';

/** Listagem de passeios (Read + Delete). */
@Component({
  selector: 'app-passeios',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './passeios.component.html'
})
export class PasseiosComponent implements OnInit {
  private passeioService = inject(PasseioService);

  passeios = signal<Passeio[]>([]);
  carregando = signal(true);
  mensagem = signal<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.passeioService.listar().subscribe({
      next: l => { this.passeios.set(l); this.carregando.set(false); },
      error: (e: HttpErrorResponse) => {
        this.mensagem.set({ tipo: 'danger', texto: mensagemErro(e) });
        this.carregando.set(false);
      }
    });
  }

  excluir(p: Passeio): void {
    if (!confirm(`Excluir o passeio "${p.nome}"?`)) return;
    this.passeioService.excluir(p.id!).subscribe({
      next: () => { this.mensagem.set({ tipo: 'success', texto: 'Passeio excluído.' }); this.carregar(); },
      error: (e: HttpErrorResponse) => this.mensagem.set({ tipo: 'danger', texto: mensagemErro(e) })
    });
  }
}
