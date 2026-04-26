import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { RulesApiService } from './rules-api.service';
import { RuleApiResponse } from './mappers/rule.mapper';

describe('RulesApiService', () => {
  let service: RulesApiService;
  let httpTesting: HttpTestingController;

  const ruleApiResponse: RuleApiResponse = {
    id: 1,
    ticker: 'PETR4',
    field: 'PRICE',
    operator: 'GREATER_THAN',
    targetValue: 40.0,
    groupId: null,
    active: true,
    triggered: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        RulesApiService,
      ],
    });

    service = TestBed.inject(RulesApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('list', () => {
    it('should GET /api/rules and map response', () => {
      service.list().subscribe((rules) => {
        expect(rules).toHaveLength(1);
        expect(rules[0].id).toBe(1);
        expect(rules[0].ticker).toBe('PETR4');
      });

      const req = httpTesting.expectOne('/api/rules');
      expect(req.request.method).toBe('GET');
      req.flush([ruleApiResponse]);
    });
  });

  describe('create', () => {
    it('should POST /api/rules and map response', () => {
      const command = {
        ticker: 'PETR4',
        field: 'PRICE' as const,
        operator: 'GREATER_THAN' as const,
        targetValue: 40.0,
      };

      service.create(command).subscribe((rule) => {
        expect(rule.id).toBe(1);
        expect(rule.ticker).toBe('PETR4');
      });

      const req = httpTesting.expectOne('/api/rules');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(ruleApiResponse);
    });
  });

  describe('update', () => {
    it('should PUT /api/rules/:id and map response', () => {
      const command = {
        field: 'DIVIDEND_YIELD' as const,
        operator: 'LESS_THAN' as const,
        targetValue: 5.0,
      };

      service.update(1, command).subscribe((rule) => {
        expect(rule.id).toBe(1);
      });

      const req = httpTesting.expectOne('/api/rules/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(ruleApiResponse);
    });
  });

  describe('delete', () => {
    it('should DELETE /api/rules/:id', () => {
      service.delete(1).subscribe();

      const req = httpTesting.expectOne('/api/rules/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
