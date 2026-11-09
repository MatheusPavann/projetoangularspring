package br.com.turismo.controller;

import br.com.turismo.dto.DisponibilidadeResponse;
import br.com.turismo.model.Passeio;
import br.com.turismo.service.PasseioService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/** Integrante 1 — Passeios (catálogo e disponibilidade). */
@RestController
@RequestMapping("/api/passeios")
public class PasseioController {

    private final PasseioService passeioService;

    public PasseioController(PasseioService passeioService) {
        this.passeioService = passeioService;
    }

    /** GET /api/passeios?ativos=true  -> catálogo (somente ativos). */
    @GetMapping
    public List<Passeio> listar(@RequestParam(defaultValue = "false") boolean ativos) {
        return passeioService.listar(ativos);
    }

    @GetMapping("/{id}")
    public Passeio buscar(@PathVariable Long id) {
        return passeioService.buscarPorId(id);
    }

    /** GET /api/passeios/1/disponibilidade?data=2026-12-20 */
    @GetMapping("/{id}/disponibilidade")
    public DisponibilidadeResponse disponibilidade(@PathVariable Long id,
                                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return passeioService.disponibilidade(id, data);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Passeio criar(@Valid @RequestBody Passeio passeio) {
        return passeioService.criar(passeio);
    }

    @PutMapping("/{id}")
    public Passeio atualizar(@PathVariable Long id, @Valid @RequestBody Passeio passeio) {
        return passeioService.atualizar(id, passeio);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        passeioService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
