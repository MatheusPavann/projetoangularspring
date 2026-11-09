package br.com.turismo.dto;

import java.time.LocalDate;

/** Quantas vagas ainda restam em um passeio numa data específica. */
public record DisponibilidadeResponse(Long passeioId, LocalDate data, int capacidade, int vagasOcupadas, int vagasDisponiveis) {}
