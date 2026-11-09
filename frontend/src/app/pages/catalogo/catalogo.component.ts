import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PasseioService } from '../../services/passeio.service';
import { Passeio } from '../../models/passeio';
import { mensagemErro } from '../../shared/utils';

/** TELA 1 — Catálogo de passeios. */
@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './catalogo.component.html'
})
export class CatalogoComponent implements OnInit {
  private passeioService = inject(PasseioService);

  passeios = signal<Passeio[]>([]);
  carregando = signal(true);
  erro = signal('');
  busca = signal('');
  ordem = signal<'nome' | 'menor' | 'maior'>('nome');

  filtrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const lista = this.passeios().filter(p =>
      !termo || p.nome.toLowerCase().includes(termo) || p.destino.toLowerCase().includes(termo));
    if (this.ordem() === 'menor') return [...lista].sort((a, b) => a.preco - b.preco);
    if (this.ordem() === 'maior') return [...lista].sort((a, b) => b.preco - a.preco);
    return lista;
  });

  ngOnInit(): void {
    this.passeioService.listar(true).subscribe({
      next: lista => { this.passeios.set(lista); this.carregando.set(false); },
      error: (e: HttpErrorResponse) => { this.erro.set(mensagemErro(e)); this.carregando.set(false); }
    });
  }

  imagemPadrao(evento: Event): void {
    const img = evento.target as HTMLImageElement;
    if (!img.src.endsWith('/sem-imagem.svg')) img.src = '/sem-imagem.svg';
  }
}
