package br.com.turismo.exception;

/** Lançada quando uma regra de negócio é violada (vira HTTP 422). */
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
