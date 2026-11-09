package br.com.turismo.repository;

import br.com.turismo.model.Reserva;
import br.com.turismo.model.StatusReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findAllByOrderByDataCriacaoDesc();

    List<Reserva> findByClienteIdOrderByDataPasseioDesc(Long clienteId);

    Optional<Reserva> findByCodigoComprovante(String codigoComprovante);

    boolean existsByCodigoComprovante(String codigoComprovante);

    boolean existsByClienteId(Long clienteId);

    boolean existsByPasseioId(Long passeioId);

    /**
     * Soma os participantes das reservas CONFIRMADAS de um passeio numa data,
     * ignorando opcionalmente uma reserva (usado ao editar).
     */
    @Query("""
           SELECT COALESCE(SUM(r.quantidadeParticipantes), 0) FROM Reserva r
           WHERE r.passeio.id = :passeioId AND r.dataPasseio = :data
             AND r.status = :status AND (:ignorarId IS NULL OR r.id <> :ignorarId)
           """)
    int somarParticipantes(@Param("passeioId") Long passeioId,
                           @Param("data") LocalDate data,
                           @Param("status") StatusReserva status,
                           @Param("ignorarId") Long ignorarId);
}
