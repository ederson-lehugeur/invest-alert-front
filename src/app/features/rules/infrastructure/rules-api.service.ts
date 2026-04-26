import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RuleRepository, CreateRuleCommand, UpdateRuleCommand } from '../domain/interfaces/rule.repository';
import { Rule } from '../domain/models/rule.model';
import { RuleApiResponse, mapRuleResponse } from './mappers/rule.mapper';

@Injectable({ providedIn: 'root' })
export class RulesApiService implements RuleRepository {
  private readonly http = inject(HttpClient);

  list(): Observable<Rule[]> {
    return this.http
      .get<RuleApiResponse[]>('/api/rules')
      .pipe(map((responses) => responses.map(mapRuleResponse)));
  }

  create(command: CreateRuleCommand): Observable<Rule> {
    return this.http
      .post<RuleApiResponse>('/api/rules', command)
      .pipe(map(mapRuleResponse));
  }

  update(id: number, command: UpdateRuleCommand): Observable<Rule> {
    return this.http
      .put<RuleApiResponse>(`/api/rules/${id}`, command)
      .pipe(map(mapRuleResponse));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/rules/${id}`);
  }
}
