package br.com.turismo.service;

import br.com.turismo.dto.DisponibilidadeResponse;
import br.com.turismo.exception.RecursoNaoEncontradoException;
import br.com.turismo.exception.RegraNegocioException;
import br.com.turismo.model.Passeio;
import br.com.turismo.model.StatusReserva;
import br.com.turismo.repository.PasseioRepository;
import br.com.turismo.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PasseioService {

    private final PasseioRepository passeioRepository;
    private final ReservaRepository reservaRepository;

    public PasseioService(PasseioRepository passeioRepository, ReservaRepository reservaRepository) {
        this.passeioRepository = passeioRepository;
        this.reservaRepository = reservaRepository;
    }

    public List<Passeio> listar(boolean somenteAtivos) {
        return somenteAtivos
                ? passeioRepository.findByAtivoTrueOrderByNomeAsc()
                : passeioRepository.findAllByOrderByNomeAsc();
    }

    public Passeio buscarPorId(Long id) {
        return passeioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Passeio não encontrado: " + id));
    }

    @Transactional
    public Passeio criar(Passeio passeio) {
        passeio.setId(null);
        if (passeio.getAtivo() == null) {
            passeio.setAtivo(true);
        }
        return passeioRepository.save(passeio);
    }

    @Transactional
    public Passeio atualizar(Long id, Passeio dados) {
        Passeio passeio = buscarPorId(id);
        passeio.setNome(dados.getNome());
        passeio.setDescricao(dados.getDescricao());
        passeio.setDestino(dados.getDestino());
        passeio.setDuracaoHoras(dados.getDuracaoHoras());
        passeio.setPreco(dados.getPreco());
        passeio.setCapacidade(dados.getCapacidade());
        passeio.setImagemUrl(dados.getImagemUrl());
        passeio.setAtivo(dados.getAtivo() == null || dados.getAtivo());
        return passeioRepository.save(passeio);
    }

    @Transactional
    public void excluir(Long id) {
        Passeio passeio = buscarPorId(id);
        if (reservaRepository.existsByPasseioId(id)) {
            throw new RegraNegocioException(
                    "Este passeio possui reservas e não pode ser excluído. Desative-o para retirá-lo do catálogo.");
        }
        passeioRepository.delete(passeio);
    }

    /** Calcula quantas vagas ainda existem no passeio para a data informada. */
    public DisponibilidadeResponse disponibilidade(Long id, LocalDate data) {
        Passeio passeio = buscarPorId(id);
        int ocupadas = reservaRepository.somarParticipantes(id, data, StatusReserva.CONFIRMADA, null);
        int disponiveis = Math.max(passeio.getCapacidade() - ocupadas, 0);
        return new DisponibilidadeResponse(id, data, passeio.getCapacidade(), ocupadas, disponiveis);
    }
}
