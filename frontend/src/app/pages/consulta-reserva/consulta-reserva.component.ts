import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CampoErroComponent } from '../../shared/campo-erro.component';

/** Consulta de reserva pelo código do comprovante. */
@Component({
  selector: 'app-consulta-reserva',
  standalone: true,
  imports: [ReactiveFormsModule, CampoErroComponent],
  template: `
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-5">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h4 class="mb-1"><i class="bi bi-receipt text-tur"></i> Minha reserva</h4>
            <p class="text-muted small">Informe o código do comprovante para ver os detalhes.</p>
            <form [formGroup]="form" (ngSubmit)="consultar()" novalidate>
              <input class="form-control form-control-lg text-uppercase" formControlName="codigo"
                     placeholder="TUR-XXXXXX" aria-label="Código da reserva"
                     [class.is-invalid]="form.controls.codigo.invalid && form.controls.codigo.touched">
              <app-campo-erro [control]="form.controls.codigo" rotulo="O código" />
              <button class="btn btn-tur w-100 mt-3" type="submit">Consultar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConsultaReservaComponent {
  private router = inject(Router);
  form = inject(FormBuilder).nonNullable.group({
    codigo: ['', [Validators.required, Validators.pattern(/^\s*TUR-[A-Za-z0-9]{6}\s*$/i)]]
  });

  consultar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.router.navigate(['/comprovante', this.form.value.codigo!.trim().toUpperCase()]);
  }
}
