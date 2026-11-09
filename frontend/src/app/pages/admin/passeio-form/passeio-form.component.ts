import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PasseioService } from '../../../services/passeio.service';
import { Passeio } from '../../../models/passeio';
import { CampoErroComponent } from '../../../shared/campo-erro.component';
import { aplicarErrosApi, mensagemErro } from '../../../shared/utils';

/** Formulário de passeio (Create + Update). */
@Component({
  selector: 'app-passeio-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CampoErroComponent],
  templateUrl: './passeio-form.component.html'
})
export class PasseioFormComponent implements OnInit {
  @Input() id?: string;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private passeioService = inject(PasseioService);

  salvando = signal(false);
  erro = signal('');

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    destino: ['', [Validators.required, Validators.maxLength(100)]],
    descricao: ['', [Validators.required, Validators.maxLength(1000)]],
    duracaoHoras: [1, [Validators.required, Validators.min(1), Validators.max(72)]],
    preco: [0, [Validators.required, Validators.min(0.01)]],
    capacidade: [10, [Validators.required, Validators.min(1)]],
    imagemUrl: ['', [Validators.maxLength(500), Validators.pattern(/^(https?:\/\/.+)?$/)]],
    ativo: [true]
  });

  ngOnInit(): void {
    if (this.id) {
      this.passeioService.buscar(Number(this.id)).subscribe({
        next: p => this.form.patchValue({ ...p, imagemUrl: p.imagemUrl ?? '' }),
        error: (e: HttpErrorResponse) => this.erro.set(mensagemErro(e))
      });
    }
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.salvando.set(true);
    const dados: Passeio = { ...this.form.getRawValue(), imagemUrl: this.form.value.imagemUrl || null };
    const req = this.id
      ? this.passeioService.atualizar(Number(this.id), dados)
      : this.passeioService.criar(dados);
    req.subscribe({
      next: () => this.router.navigate(['/admin/passeios']),
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
