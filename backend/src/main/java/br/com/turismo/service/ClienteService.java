package br.com.turismo.service;

import br.com.turismo.exception.RecursoNaoEncontradoException;
import br.com.turismo.exception.RegraNegocioException;
import br.com.turismo.model.Cliente;
import br.com.turismo.model.Reserva;
import br.com.turismo.repository.ClienteRepository;
import br.com.turismo.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ReservaRepository reservaRepository;

    public ClienteService(ClienteRepository clienteRepository, ReservaRepository reservaRepository) {
        this.clienteRepository = clienteRepository;
        this.reservaRepository = reservaRepository;
    }

    public List<Cliente> listar() {
        return clienteRepository.findAllByOrderByNomeAsc();
    }

    public Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado: " + id));
    }

    public Cliente buscarPorCpf(String cpf) {
        return clienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Nenhum cliente cadastrado com o CPF " + cpf));
    }

    /** Histórico de reservas do cliente (integração com a entidade Reserva). */
    public List<Reserva> listarReservas(Long clienteId) {
        buscarPorId(clienteId);
        return reservaRepository.findByClienteIdOrderByDataPasseioDesc(clienteId);
    }

    @Transactional
    public Cliente criar(Cliente cliente) {
        if (clienteRepository.existsByCpf(cliente.getCpf())) {
            throw new RegraNegocioException("Já existe um cliente cadastrado com este CPF");
        }
        cliente.setId(null);
        return clienteRepository.save(cliente);
    }

    @Transactional
    public Cliente atualizar(Long id, Cliente dados) {
        Cliente cliente = buscarPorId(id);
        if (clienteRepository.existsByCpfAndIdNot(dados.getCpf(), id)) {
            throw new RegraNegocioException("Já existe outro cliente cadastrado com este CPF");
        }
        cliente.setNome(dados.getNome());
        cliente.setCpf(dados.getCpf());
        cliente.setEmail(dados.getEmail());
        cliente.setTelefone(dados.getTelefone());
        cliente.setDataNascimento(dados.getDataNascimento());
        return clienteRepository.save(cliente);
    }

    @Transactional
    public void excluir(Long id) {
        Cliente cliente = buscarPorId(id);
        if (reservaRepository.existsByClienteId(id)) {
            throw new RegraNegocioException("Este cliente possui reservas e não pode ser excluído");
        }
        clienteRepository.delete(cliente);
    }
}
