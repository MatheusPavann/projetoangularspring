package br.com.turismo.controller;

import br.com.turismo.dto.ReservaRequest;
import br.com.turismo.model.Reserva;
import br.com.turismo.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Integrante 3 — Reservas e comprovante. */
@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public List<Reserva> listar() {
        return reservaService.listar();
    }

    @GetMapping("/{id}")
    public Reserva buscar(@PathVariable Long id) {
        return reservaService.buscarPorId(id);
    }

    /** Consulta do comprovante pelo código (ex.: TUR-AB12CD). */
    @GetMapping("/codigo/{codigo}")
    public Reserva buscarPorCodigo(@PathVariable String codigo) {
        return reservaService.buscarPorCodigo(codigo);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Reserva criar(@Valid @RequestBody ReservaRequest request) {
        return reservaService.criar(request);
    }

    @PutMapping("/{id}")
    public Reserva atualizar(@PathVariable Long id, @Valid @RequestBody ReservaRequest request) {
        return reservaService.atualizar(id, request);
    }

    @PatchMapping("/{id}/cancelar")
    public Reserva cancelar(@PathVariable Long id) {
        return reservaService.cancelar(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        reservaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
