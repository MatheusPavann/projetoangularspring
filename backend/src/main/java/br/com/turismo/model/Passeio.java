package br.com.turismo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "passeio")
public class Passeio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nome;

    @NotBlank(message = "A descrição é obrigatória")
    @Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres")
    @Column(nullable = false, length = 1000)
    private String descricao;

    @NotBlank(message = "O destino é obrigatório")
    @Size(max = 100, message = "O destino deve ter no máximo 100 caracteres")
    @Column(nullable = false, length = 100)
    private String destino;

    @NotNull(message = "A duração é obrigatória")
    @Min(value = 1, message = "A duração mínima é 1 hora")
    @Max(value = 72, message = "A duração máxima é 72 horas")
    @Column(name = "duracao_horas", nullable = false)
    private Integer duracaoHoras;

    @NotNull(message = "O preço é obrigatório")
    @DecimalMin(value = "0.01", message = "O preço deve ser maior que zero")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    /** Quantidade máxima de participantes por data. */
    @NotNull(message = "A capacidade é obrigatória")
    @Min(value = 1, message = "A capacidade mínima é 1 pessoa")
    @Column(nullable = false)
    private Integer capacidade;

    @Size(max = 500, message = "A URL da imagem deve ter no máximo 500 caracteres")
    @Column(name = "imagem_url", length = 500)
    private String imagemUrl;

    /** Passeios inativos não aparecem no catálogo nem aceitam reservas. */
    @Column(nullable = false)
    private Boolean ativo = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }
    public Integer getDuracaoHoras() { return duracaoHoras; }
    public void setDuracaoHoras(Integer duracaoHoras) { this.duracaoHoras = duracaoHoras; }
    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }
    public Integer getCapacidade() { return capacidade; }
    public void setCapacidade(Integer capacidade) { this.capacidade = capacidade; }
    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
