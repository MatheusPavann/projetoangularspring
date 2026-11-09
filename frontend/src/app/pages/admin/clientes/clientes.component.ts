import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente';
import { Reserva } from '../../../models/reserva';
import { FormatarPipe } from '../../../shared/formatar.pipe';
import { mensagemErro } from '../../../shared/utils';

/** Listagem de clientes (Read + Delete) com histórico de reservas. */
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [RouterLink, FormsModule, FormatarPipe, DatePipe, CurrencyPipe],
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);

  clientes = signal<Cliente[]>([]);
  busca = signal('');
  carregando = signal(true);
  mensagem = signal<{ tipo: 'success' | 'danger'; texto: string } | null>(null);
  selecionado = signal<Cliente | null>(null);
  historico = signal<Reserva[]>([]);

  filtrados = computed(() => {
    const t = this.busca().trim().toLowerCase();
    const num = t.replace(/\D/g, '');
    return this.clientes().filter(c => !t
      || c.nome.toLowerCase().includes(t)
      || c.email.toLowerCase().includes(t)
      || (num && c.cpf.includes(num)));
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.clienteService.listar().subscribe({
      next: l => { this.clientes.set(l); this.carregando.set(false); },
      error: (e: HttpErrorResponse) => {
        this.mensagem.set({ tipo: 'danger', texto: mensagemErro(e) });
        this.carregando.set(false);
      }
    });
  }

  verReservas(c: Cliente): void {
    if (this.selecionado()?.id === c.id) {
      this.selecionado.set(null);
      return;
    }
    this.selecionado.set(c);
    this.historico.set([]);
    this.clienteService.reservas(c.id!).subscribe(l => this.historico.set(l));
  }

  excluir(c: Cliente): void {
    if (!confirm(`Excluir o cliente "${c.nome}"?`)) return;
    this.clienteService.excluir(c.id!).subscribe({
      next: () => {
        this.mensagem.set({ tipo: 'success', texto: 'Cliente excluído.' });
        this.selecionado.set(null);
        this.carregar();
      },
      error: (e: HttpErrorResponse) => this.mensagem.set({ tipo: 'danger', texto: mensagemErro(e) })
    });
  }
}
