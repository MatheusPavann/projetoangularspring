import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

/** Extrai a mensagem de erro devolvida pela API (GlobalExceptionHandler). */
export function mensagemErro(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'Não foi possível conectar à API. Verifique se o backend está rodando em localhost:8080.';
  }
  const corpo = err.error;
  if (corpo?.campos) {
    return Object.values(corpo.campos).join(' | ');
  }
  return corpo?.mensagem ?? 'Ocorreu um erro inesperado.';
}

/** Mostra no formulário os erros de campo devolvidos pela API. */
export function aplicarErrosApi(form: FormGroup, err: HttpErrorResponse): void {
  const campos = err.error?.campos as Record<string, string> | undefined;
  if (!campos) return;
  for (const [campo, msg] of Object.entries(campos)) {
    form.get(campo)?.setErrors({ api: msg });
  }
}

/** Data de hoje no formato yyyy-MM-dd (usada em inputs type=date). */
export function hojeIso(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().substring(0, 10);
}

/** Validador: data não pode estar no passado. */
export function dataFuturaOuHoje(control: AbstractControl): ValidationErrors | null {
  return control.value && control.value < hojeIso() ? { dataPassada: true } : null;
}

/** Validador: data deve estar no passado (ex.: nascimento). */
export function dataPassada(control: AbstractControl): ValidationErrors | null {
  return control.value && control.value >= hojeIso() ? { dataFutura: true } : null;
}

/** Validador de CPF com cálculo dos dígitos verificadores. */
export function cpfValido(control: AbstractControl): ValidationErrors | null {
  const cpf = (control.value ?? '').replace(/\D/g, '');
  if (!cpf) return null;
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return { cpf: true };
  const digito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (pesoInicial - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const d1 = digito(cpf.substring(0, 9), 10);
  const d2 = digito(cpf.substring(0, 10), 11);
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]) ? null : { cpf: true };
}

export function somenteNumeros(valor: string | null | undefined): string {
  return (valor ?? '').replace(/\D/g, '');
}
