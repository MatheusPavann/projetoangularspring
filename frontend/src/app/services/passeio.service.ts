import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Disponibilidade, Passeio } from '../models/passeio';

@Injectable({ providedIn: 'root' })
export class PasseioService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/passeios`;

  listar(somenteAtivos = false): Observable<Passeio[]> {
    const params = new HttpParams().set('ativos', somenteAtivos);
    return this.http.get<Passeio[]>(this.url, { params });
  }

  buscar(id: number): Observable<Passeio> {
    return this.http.get<Passeio>(`${this.url}/${id}`);
  }

  disponibilidade(id: number, data: string): Observable<Disponibilidade> {
    return this.http.get<Disponibilidade>(`${this.url}/${id}/disponibilidade`, { params: { data } });
  }

  criar(passeio: Passeio): Observable<Passeio> {
    return this.http.post<Passeio>(this.url, passeio);
  }

  atualizar(id: number, passeio: Passeio): Observable<Passeio> {
    return this.http.put<Passeio>(`${this.url}/${id}`, passeio);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
