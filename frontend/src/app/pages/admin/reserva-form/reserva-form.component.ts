import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { ReservaService } from '../../../services/reserva.service';
import { PasseioService } from '../../../services/passeio.service';
import { ClienteService } from '../../../services/cliente.service';
import { Passeio } from '../../../models/passeio';
import { Cliente } from '../../../models/cliente';
import { CampoErroComponent } from '../../../shared/campo-erro.component';
import { FormatarPipe } from '../../../shared/formatar.pipe';
import { aplicarErrosApi, dataFuturaOuHoje, hojeIso, mensagemErro } from '../../../shared/utils';

/** Formulário de reserva para o administrador (Create + Update). */
@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, CampoErroComponent, FormatarPipe],
  templateUrl: './reserva-form.component.html'
})
export class ReservaFormComponent implements OnInit {
  @Input() id?: string;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private reservaService = inject(ReservaService);
  private passeioService = inject(PasseioService);
  private clienteService = inject(ClienteService);

  hoje = hojeIso();
  passeios = signal<Passeio[]>([]);
  clientes = signal<Cliente[]>([]);
  codigo = signal('');
  salvando = signal(false);
  erro = signal('');

  form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, Validators.required),
    passeioId: this.fb.control<number | null>(null, Validators.required),
    dataPasseio: ['', [Validators.required, dataFuturaOuHoje]],
    quantidadeParticipantes: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
    observacoes: ['', Validators.maxLength(500)]
  });

  private valores = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  valorTotal = computed(() => {
    const v = this.valores();
    const p = this.passeios().find(x => x.id === Number(v.passeioId));
    return (p?.preco ?? 0) * (Number(v.quantidadeParticipantes) || 0);
  });

  ngOnInit(): void {
    forkJoin({ passeios: this.passeioService.listar(), clientes: this.clienteService.listar() })
      .subscribe({
        next: ({ passeios, clientes }) => {
          this.clientes.set(clientes);
          // na criação só mostra passeios ativos; na edição mantém o passeio atual
          this.passeios.set(this.id ? passeios : passeios.filter(p => p.ativo));
          if (this.id) this.carregarReserva();
        },
        error: (e: HttpErrorResponse) => this.erro.set(mensagemErro(e))
      });
  }

  private carregarReserva(): void {
    this.reservaService.buscar(Number(this.id)).subscribe({
      next: r => {
        this.codigo.set(r.codigoComprovante);
        this.form.patchValue({
          clienteId: r.cliente.id!,
          passeioId: r.passeio.id!,
          dataPasseio: r.dataPasseio,
          quantidadeParticipantes: r.quantidadeParticipantes,
          observacoes: r.observacoes ?? ''
        });
      },
      error: (e: HttpErrorResponse) => this.erro.set(mensagemErro(e))
    });
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.salvando.set(true);
    this.erro.set('');
    const v = this.form.getRawValue();
    const dados = {
      clienteId: Number(v.clienteId),
      passeioId: Number(v.passeioId),
      dataPasseio: v.dataPasseio!,
      quantidadeParticipantes: v.quantidadeParticipantes!,
      observacoes: v.observacoes || null
    };
    const req = this.id
      ? this.reservaService.atualizar(Number(this.id), dados)
      : this.reservaService.criar(dados);
    req.subscribe({
      next: () => this.router.navigate(['/admin/reservas']),
      error: (e: HttpErrorResponse) => {
        this.salvando.set(false);
        aplicarErrosApi(this.form, e);
        this.erro.set(mensagemErro(e));
      }
    });
  }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }
}
