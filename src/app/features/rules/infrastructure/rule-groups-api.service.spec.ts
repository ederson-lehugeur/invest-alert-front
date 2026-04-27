import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { RuleGroupsApiService } from './rule-groups-api.service';
import { RuleGroupApiResponse } from './mappers/rule-group.mapper';
import { RuleApiResponse } from './mappers/rule.mapper';

describe('RuleGroupsApiService', () => {
  let service: RuleGroupsApiService;
  let httpTesting: HttpTestingController;

  const ruleApi: RuleApiResponse = {
    id: 1,
    ticker: 'PETR4',
    field: 'PRICE',
    operator: 'GREATER_THAN',
    targetValue: 40.0,
    groupId: 10,
    active: true,
    triggered: false,
  };

  const groupApiResponse: RuleGroupApiResponse = {
    id: 10,
    ticker: 'PETR4',
    name: 'Petrobras Alerts',
    rules: [ruleApi],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        RuleGroupsApiService,
      ],
    });

    service = TestBed.inject(RuleGroupsApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('list', () => {
    it('should GET /api/v1/rule-groups and map response with nested rules', () => {
      service.list().subscribe((groups) => {
        expect(groups).toHaveLength(1);
        expect(groups[0].id).toBe(10);
        expect(groups[0].name).toBe('Petrobras Alerts');
        expect(groups[0].rules).toHaveLength(1);
        expect(groups[0].rules[0].id).toBe(1);
      });

      const req = httpTesting.expectOne('/api/v1/rule-groups');
      expect(req.request.method).toBe('GET');
      req.flush([groupApiResponse]);
    });
  });

  describe('create', () => {
    it('should POST /api/v1/rule-groups and map response', () => {
      const command = {
        ticker: 'PETR4',
        name: 'New Group',
        rules: [
          { field: 'PRICE' as const, operator: 'GREATER_THAN' as const, targetValue: 40.0 },
        ],
      };

      service.create(command).subscribe((group) => {
        expect(group.id).toBe(10);
        expect(group.name).toBe('Petrobras Alerts');
      });

      const req = httpTesting.expectOne('/api/v1/rule-groups');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(groupApiResponse);
    });
  });
});
