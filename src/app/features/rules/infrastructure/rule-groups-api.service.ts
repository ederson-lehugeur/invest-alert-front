import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RuleGroupRepository, CreateRuleGroupCommand } from '../domain/interfaces/rule-group.repository';
import { RuleGroup } from '../domain/models/rule-group.model';
import { RuleGroupApiResponse, mapRuleGroupResponse } from './mappers/rule-group.mapper';

@Injectable({ providedIn: 'root' })
export class RuleGroupsApiService implements RuleGroupRepository {
  private readonly http = inject(HttpClient);

  list(): Observable<RuleGroup[]> {
    return this.http
      .get<RuleGroupApiResponse[]>('/api/rule-groups')
      .pipe(map((responses) => responses.map(mapRuleGroupResponse)));
  }

  create(command: CreateRuleGroupCommand): Observable<RuleGroup> {
    return this.http
      .post<RuleGroupApiResponse>('/api/rule-groups', command)
      .pipe(map(mapRuleGroupResponse));
  }
}
