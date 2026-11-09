import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** Exibe a mensagem de validação de um campo do formulário. */
@Component({
  selector: 'app-campo-erro',
  standalone: true,
  template: `
    @if (control && control.invalid && (control.touched || control.dirty)) {
      <div class="invalid-feedback d-block">{{ mensagem() }}</div>
    }
  `
})
export class CampoErroComponent {
  @Input() control: AbstractControl | null = null;
  @Input() rotulo = 'Campo';

  mensagem(): string {
    const e = this.control?.errors ?? {};
    if (e['required']) return 'Este campo é obrigatório.';
    if (e['minlength']) return `${this.rotulo} deve ter no mínimo ${e['minlength'].requiredLength} caracteres.`;
    if (e['maxlength']) return `${this.rotulo} deve ter no máximo ${e['maxlength'].requiredLength} caracteres.`;
    if (e['min']) return `${this.rotulo} deve ser no mínimo ${e['min'].min}.`;
    if (e['max']) return `${this.rotulo} deve ser no máximo ${e['max'].max}.`;
    if (e['email']) return 'Informe um e-mail válido.';
    if (e['cpf']) return 'CPF inválido.';
    if (e['pattern']) return `${this.rotulo} está em formato inválido.`;
    if (e['dataPassada']) return 'A data não pode estar no passado.';
    if (e['dataFutura']) return 'A data deve estar no passado.';
    if (e['semVagas']) return e['semVagas'];
    if (e['api']) return e['api'];
    return `${this.rotulo} inválido.`;
  }
}
