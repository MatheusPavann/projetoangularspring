import { Cliente } from './cliente';
import { Passeio } from './passeio';

export type StatusReserva = 'CONFIRMADA' | 'CANCELADA';

export interface Reserva {
  id: number;
  cliente: Cliente;
  passeio: Passeio;
  dataPasseio: string;
  quantidadeParticipantes: number;
  valorTotal: number;
  status: StatusReserva;
  codigoComprovante: string;
  observacoes?: string | null;
  dataCriacao: string;
}

/** Corpo enviado para criar/alterar uma reserva. */
export interface ReservaRequest {
  clienteId: number;
  passeioId: number;
  dataPasseio: string;
  quantidadeParticipantes: number;
  observacoes?: string | null;
}
