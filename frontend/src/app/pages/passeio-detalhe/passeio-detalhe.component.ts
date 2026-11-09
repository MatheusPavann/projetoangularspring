import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { PasseioService } from '../../services/passeio.service';
import { ClienteService } from '../../services/cliente.service';
import { ReservaService } from '../../services/reserva.service';
import { Disponibilidade, Passeio } from '../../models/passeio';
import { Cliente } from '../../models/cliente';
import { CampoErroComponent } from '../../shared/campo-erro.component';
import { FormatarPipe } from '../../shared/formatar.pipe';
import {
  aplicarErrosApi, cpfValido, dataFuturaOuHoje, dataPassada, hojeIso, mensagemErro, somenteNumeros
} from '../../shared/utils';

/**
 * TELA 2 — Detalhes do passeio, escolha de data/participantes e identificação do cliente.
 * Integra as três entidades: Passeio (dados e vagas), Cliente (busca/cadastro) e Reserva (criação).
 */
@Component({
  selector: 'app-passeio-detalhe',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, CampoErroComponent, FormatarPipe],
  templateUrl: './passeio-detalhe.component.html'
})
export class PasseioDetalheComponent implements OnInit {
  @Input() id!: string; // vem da rota /passeios/:id

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private passeioService = inject(PasseioService);
  private clienteService = inject(ClienteService);
  private reservaService = inject(ReservaService);

  hoje = hojeIso();
  passeio = signal<Passeio | null>(null);
  disponibilidade = signal<Disponibilidade | null>(null);
  cliente = signal<Cliente | null>(null);
  novoCliente = signal(false);   // true quando o CPF não está cadastrado
  carregando = signal(true);
  buscandoCpf = signal(false);
  enviando = signal(false);
  erro = signal('');
  erroEnvio = signal('');

  reservaForm = this.fb.nonNullable.group({
    dataPasseio: ['', [Validators.required, dataFuturaOuHoje]],
    quantidadeParticipantes: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
    observacoes: ['', [Validators.maxLength(500)]]
  });

  cpfForm = this.fb.nonNullable.group({
    cpf: ['', [Validators.required, cpfValido]]
  });

  clienteForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    telefone: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)]],
    dataNascimento: ['', [Validators.required, dataPassada]]
  });

  private quantidade = toSignal(this.reservaForm.controls.quantidadeParticipantes.valueChanges,
    { initialValue: 1 });

  valorTotal = computed(() => (this.passeio()?.preco ?? 0) * (Number(this.quantidade()) || 0));

  ngOnInit(): void {
    this.passeioService.buscar(Number(this.id)).subscribe({
      next: p => {
        this.passeio.set(p);
        this.carregando.set(false);
        if (!p.ativo) this.erro.set('Este passeio não está disponível para reservas no momento.');
      },
      error: (e: HttpErrorResponse) => { this.erro.set(mensagemErro(e)); this.carregando.set(false); }
    });

    // Sempre que a data muda, consulta as vagas restantes na API
    this.reservaForm.controls.dataPasseio.valueChanges.subscribe(data => {
      this.disponibilidade.set(null);
      if (data && this.reservaForm.controls.dataPasseio.valid) {
        this.passeioService.disponibilidade(Number(this.id), data).subscribe(d => {
          this.disponibilidade.set(d);
          this.validarVagas();
        });
      }
    });
    this.reservaForm.controls.quantidadeParticipantes.valueChanges.subscribe(() => this.validarVagas());
  }

  imagemPadrao(evento: Event): void {
    const img = evento.target as HTMLImageElement;
    if (!img.src.endsWith('/sem-imagem.svg')) img.src = '/sem-imagem.svg';
  }

  /** Marca erro no campo de participantes se exceder as vagas da data. */
  private validarVagas(): void {
    const ctrl = this.reservaForm.controls.quantidadeParticipantes;
    const disp = this.disponibilidade();
    const { semVagas, ...outros } = ctrl.errors ?? {};
    if (disp && ctrl.value > disp.vagasDisponiveis) {
      ctrl.setErrors({ ...outros, semVagas: disp.vagasDisponiveis === 0
        ? 'Não há vagas nesta data.' : `Restam apenas ${disp.vagasDisponiveis} vaga(s) nesta data.` });
      ctrl.markAsTouched();
    } else if (semVagas) {
      ctrl.setErrors(Object.keys(outros).length ? outros : null);
    }
  }

  buscarCliente(): void {
    this.cpfForm.markAllAsTouched();
    if (this.cpfForm.invalid) return;
    const cpf = somenteNumeros(this.cpfForm.value.cpf);
    this.buscandoCpf.set(true);
    this.cliente.set(null);
    this.novoCliente.set(false);
    this.clienteService.buscarPorCpf(cpf).subscribe({
      next: c => { this.cliente.set(c); this.buscandoCpf.set(false); },
      error: (e: HttpErrorResponse) => {
        this.buscandoCpf.set(false);
        if (e.status === 404) {
          this.novoCliente.set(true); // não encontrado -> exibe cadastro rápido
        } else {
          this.erroEnvio.set(mensagemErro(e));
        }
      }
    });
  }

  trocarCliente(): void {
    this.cliente.set(null);
    this.novoCliente.set(false);
    this.cpfForm.reset();
    this.clienteForm.reset();
  }

  podeConfirmar(): boolean {
    const clienteOk = !!this.cliente() || (this.novoCliente() && this.clienteForm.valid);
    return this.reservaForm.valid && clienteOk && !this.enviando() && !!this.passeio()?.ativo;
  }

  confirmar(): void {
    this.reservaForm.markAllAsTouched();
    this.cpfForm.markAllAsTouched();
    if (this.novoCliente()) this.clienteForm.markAllAsTouched();
    if (!this.podeConfirmar()) return;

    this.enviando.set(true);
    this.erroEnvio.set('');

    // 1) obtém o cliente (existente ou recém-cadastrado)  2) cria a reserva
    const cliente$: Observable<Cliente> = this.cliente()
      ? of(this.cliente()!)
      : this.clienteService.criar({
          ...this.clienteForm.getRawValue(),
          cpf: somenteNumeros(this.cpfForm.value.cpf),
          telefone: somenteNumeros(this.clienteForm.value.telefone)
        });

    cliente$.pipe(
      switchMap(c => {
        this.cliente.set(c);
        this.novoCliente.set(false);
        const f = this.reservaForm.getRawValue();
        return this.reservaService.criar({
          clienteId: c.id!,
          passeioId: this.passeio()!.id!,
          dataPasseio: f.dataPasseio,
          quantidadeParticipantes: f.quantidadeParticipantes,
          observacoes: f.observacoes || null
        });
      })
    ).subscribe({
      next: reserva => this.router.navigate(['/comprovante', reserva.codigoComprovante]),
      error: (e: HttpErrorResponse) => {
        this.enviando.set(false);
        aplicarErrosApi(this.reservaForm, e);
        aplicarErrosApi(this.clienteForm, e);
        this.erroEnvio.set(mensagemErro(e));
      }
    });
  }
}
