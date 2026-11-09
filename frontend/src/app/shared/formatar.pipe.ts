import { Pipe, PipeTransform } from '@angular/core';

/** Formata CPF (000.000.000-00) e telefone ((00) 00000-0000) para exibição. */
@Pipe({ name: 'formatar', standalone: true })
export class FormatarPipe implements PipeTransform {
  transform(valor: string | null | undefined, tipo: 'cpf' | 'telefone'): string {
    const v = (valor ?? '').replace(/\D/g, '');
    if (tipo === 'cpf' && v.length === 11) {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (tipo === 'telefone') {
      if (v.length === 11) return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      if (v.length === 10) return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return valor ?? '';
  }
}
