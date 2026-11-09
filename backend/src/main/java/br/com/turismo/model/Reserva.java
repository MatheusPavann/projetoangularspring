package br.com.turismo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade que liga o Cliente ao Passeio: é o centro do fluxo de negócio.
 * Valor total, código do comprovante e status são definidos pelo ReservaService.
 */
@Entity
@Table(name = "reserva")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "passeio_id", nullable = false)
    private Passeio passeio;

    @Column(name = "data_passeio", nullable = false)
    private LocalDate dataPasseio;

    @Column(name = "quantidade_participantes", nullable = false)
    private Integer quantidadeParticipantes;

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusReserva status;

    @Column(name = "codigo_comprovante", nullable = false, unique = true, length = 20)
    private String codigoComprovante;

    @Column(length = 500)
    private String observacoes;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Passeio getPasseio() { return passeio; }
    public void setPasseio(Passeio passeio) { this.passeio = passeio; }
    public LocalDate getDataPasseio() { return dataPasseio; }
    public void setDataPasseio(LocalDate dataPasseio) { this.dataPasseio = dataPasseio; }
    public Integer getQuantidadeParticipantes() { return quantidadeParticipantes; }
    public void setQuantidadeParticipantes(Integer quantidadeParticipantes) { this.quantidadeParticipantes = quantidadeParticipantes; }
    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
    public StatusReserva getStatus() { return status; }
    public void setStatus(StatusReserva status) { this.status = status; }
    public String getCodigoComprovante() { return codigoComprovante; }
    public void setCodigoComprovante(String codigoComprovante) { this.codigoComprovante = codigoComprovante; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
}
