export interface Passeio {
  id?: number;
  nome: string;
  descricao: string;
  destino: string;
  duracaoHoras: number;
  preco: number;
  capacidade: number;
  imagemUrl?: string | null;
  ativo: boolean;
}

export interface Disponibilidade {
  passeioId: number;
  data: string;
  capacidade: number;
  vagasOcupadas: number;
  vagasDisponiveis: number;
}
