package br.com.turismo.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/** Dados enviados pelo Angular para criar ou alterar uma reserva. */
public record ReservaRequest(
        @NotNull(message = "O cliente é obrigatório")
        Long clienteId,

        @NotNull(message = "O passeio é obrigatório")
        Long passeioId,

        @NotNull(message = "A data do passeio é obrigatória")
        @FutureOrPresent(message = "A data do passeio não pode estar no passado")
        LocalDate dataPasseio,

        @NotNull(message = "A quantidade de participantes é obrigatória")
        @Min(value = 1, message = "Informe pelo menos 1 participante")
        @Max(value = 50, message = "Máximo de 50 participantes por reserva")
        Integer quantidadeParticipantes,

        @Size(max = 500, message = "As observações devem ter no máximo 500 caracteres")
        String observacoes
) {}
