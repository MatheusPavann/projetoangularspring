package br.com.turismo.repository;

import br.com.turismo.model.Passeio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PasseioRepository extends JpaRepository<Passeio, Long> {

    List<Passeio> findByAtivoTrueOrderByNomeAsc();

    List<Passeio> findAllByOrderByNomeAsc();
}
