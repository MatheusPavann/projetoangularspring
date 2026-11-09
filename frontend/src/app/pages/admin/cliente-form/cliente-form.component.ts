import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente';
import { CampoErroComponent } from '../../../shared/campo-erro.component';
import { FormatarPipe } from '../../../shared/formatar.pipe';
import { aplicarErrosApi, cpfValido, dataPassada, hojeIso, mensagemErro, somenteNumeros } from '../../../shared/utils';

/** Formulário de cliente (Create + Update). */
@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CampoErroComponent],
  templateUrl: './cliente-form.component.html'
})
export class ClienteFormComponent implements OnInit {
  @Input() id?: string;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private clienteService = inject(ClienteService);
  private formatar = new FormatarPipe();

  hoje = hojeIso();
  salvando = signal(false);
  erro = signal('');

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    cpf: ['', [Validators.required, cpfValido]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    telefone: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)]],
    dataNascimento: ['', [Validators.required, dataPassada]]
  });

  ngOnInit(): void {
    if (this.id) {
      this.clienteService.buscar(Number(this.id)).subscribe({
        next: c => this.form.patchValue({
          ...c,
          cpf: this.formatar.transform(c.cpf, 'cpf'),
          telefone: this.formatar.transform(c.telefone, 'telefone')
        }),
        error: (e: HttpErrorResponse) => this.erro.set(mensagemErro(e))
      });
    }
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.salvando.set(true);
    const v = this.form.getRawValue();
    const dados: Cliente = { ...v, cpf: somenteNumeros(v.cpf), telefone: somenteNumeros(v.telefone) };
    const req = this.id
      ? this.clienteService.atualizar(Number(this.id), dados)
      : this.clienteService.criar(dados);
    req.subscribe({
      next: () => this.router.navigate(['/admin/clientes']),
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
