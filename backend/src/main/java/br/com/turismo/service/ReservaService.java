package br.com.turismo.service;

import br.com.turismo.dto.ReservaRequest;
import br.com.turismo.exception.RecursoNaoEncontradoException;
import br.com.turismo.exception.RegraNegocioException;
import br.com.turismo.model.Cliente;
import br.com.turismo.model.Passeio;
import br.com.turismo.model.Reserva;
import br.com.turismo.model.StatusReserva;
import br.com.turismo.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Regras do fluxo de reserva:
 * - o passeio precisa estar ativo;
 * - a data não pode estar no passado;
 * - a soma de participantes confirmados na data não pode passar da capacidade;
 * - o valor total é calculado aqui (preço x participantes);
 * - cada reserva recebe um código de comprovante único.
 */
@Service
public class ReservaService {

    private static final String CARACTERES = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom random = new SecureRandom();

    private final ReservaRepository reservaRepository;
    private final ClienteService clienteService;
    private final PasseioService passeioService;

    public ReservaService(ReservaRepository reservaRepository, ClienteService clienteService, PasseioService passeioService) {
        this.reservaRepository = reservaRepository;
        this.clienteService = clienteService;
        this.passeioService = passeioService;
    }

    public List<Reserva> listar() {
        return reservaRepository.findAllByOrderByDataCriacaoDesc();
    }

    public Reserva buscarPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Reserva não encontrada: " + id));
    }

    public Reserva buscarPorCodigo(String codigo) {
        return reservaRepository.findByCodigoComprovante(codigo.toUpperCase())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Nenhuma reserva com o código " + codigo));
    }

    @Transactional
    public Reserva criar(ReservaRequest req) {
        Cliente cliente = clienteService.buscarPorId(req.clienteId());
        Passeio passeio = passeioService.buscarPorId(req.passeioId());

        validar(passeio, req.dataPasseio(), req.quantidadeParticipantes(), null);

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setPasseio(passeio);
        reserva.setDataPasseio(req.dataPasseio());
        reserva.setQuantidadeParticipantes(req.quantidadeParticipantes());
        reserva.setObservacoes(req.observacoes());
        reserva.setValorTotal(calcularValor(passeio, req.quantidadeParticipantes()));
        reserva.setStatus(StatusReserva.CONFIRMADA);
        reserva.setCodigoComprovante(gerarCodigo());
        reserva.setDataCriacao(LocalDateTime.now());
        return reservaRepository.save(reserva);
    }

    @Transactional
    public Reserva atualizar(Long id, ReservaRequest req) {
        Reserva reserva = buscarPorId(id);
        if (reserva.getStatus() == StatusReserva.CANCELADA) {
            throw new RegraNegocioException("Reservas canceladas não podem ser alteradas");
        }
        Cliente cliente = clienteService.buscarPorId(req.clienteId());
        Passeio passeio = passeioService.buscarPorId(req.passeioId());

        validar(passeio, req.dataPasseio(), req.quantidadeParticipantes(), id);

        reserva.setCliente(cliente);
        reserva.setPasseio(passeio);
        reserva.setDataPasseio(req.dataPasseio());
        reserva.setQuantidadeParticipantes(req.quantidadeParticipantes());
        reserva.setObservacoes(req.observacoes());
        reserva.setValorTotal(calcularValor(passeio, req.quantidadeParticipantes()));
        return reservaRepository.save(reserva);
    }

    /** Cancela a reserva: as vagas voltam a ficar disponíveis. */
    @Transactional
    public Reserva cancelar(Long id) {
        Reserva reserva = buscarPorId(id);
        if (reserva.getStatus() == StatusReserva.CANCELADA) {
            throw new RegraNegocioException("Esta reserva já está cancelada");
        }
        reserva.setStatus(StatusReserva.CANCELADA);
        return reservaRepository.save(reserva);
    }

    @Transactional
    public void excluir(Long id) {
        reservaRepository.delete(buscarPorId(id));
    }

    private void validar(Passeio passeio, LocalDate data, int quantidade, Long reservaIgnorada) {
        if (!Boolean.TRUE.equals(passeio.getAtivo())) {
            throw new RegraNegocioException("Este passeio não está disponível para reservas");
        }
        if (data.isBefore(LocalDate.now())) {
            throw new RegraNegocioException("A data do passeio não pode estar no passado");
        }
        int ocupadas = reservaRepository.somarParticipantes(
                passeio.getId(), data, StatusReserva.CONFIRMADA, reservaIgnorada);
        int disponiveis = passeio.getCapacidade() - ocupadas;
        if (quantidade > disponiveis) {
            throw new RegraNegocioException(disponiveis <= 0
                    ? "Não há mais vagas para este passeio nesta data"
                    : "Restam apenas " + disponiveis + " vaga(s) para este passeio nesta data");
        }
    }

    private BigDecimal calcularValor(Passeio passeio, int quantidade) {
        return passeio.getPreco().multiply(BigDecimal.valueOf(quantidade));
    }

    private String gerarCodigo() {
        String codigo;
        do {
            StringBuilder sb = new StringBuilder("TUR-");
            for (int i = 0; i < 6; i++) {
                sb.append(CARACTERES.charAt(random.nextInt(CARACTERES.length())));
            }
            codigo = sb.toString();
        } while (reservaRepository.existsByCodigoComprovante(codigo));
        return codigo;
    }
}
