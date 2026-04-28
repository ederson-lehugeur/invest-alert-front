import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { ReusableTableComponent } from './reusable-table.component';
import { CellDefDirective } from './cell-def.directive';
import { ColumnConfig } from './column-config.model';

interface TestRow {
  id: number;
  name: string;
  value: number;
}

const TEST_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'value', header: 'Value', sortable: true, align: 'right' },
];

const TEST_DATA: TestRow[] = [
  { id: 1, name: 'Alpha', value: 100 },
  { id: 2, name: 'Beta', value: 200 },
  { id: 3, name: 'Gamma', value: 300 },
];

@Component({
  standalone: true,
  imports: [ReusableTableComponent, CellDefDirective],
  template: `
    <app-reusable-table
      [columns]="columns"
      [data]="data"
      [sortable]="sortable"
      [paginator]="paginator"
      [pageSize]="pageSize"
      [totalElements]="totalElements"
      [rowClickable]="rowClickable"
      [emptyIcon]="emptyIcon"
      [emptyMessage]="emptyMessage"
      (sortChange)="onSortChange($event)"
      (pageChange)="onPageChange($event)"
      (rowClick)="onRowClick($event)"
    >
      <ng-template appCellDef="name" let-row>
        <span class="custom-name">Custom: {{ row.name }}</span>
      </ng-template>
    </app-reusable-table>
  `,
})
class TestHostComponent {
  columns: ColumnConfig[] = TEST_COLUMNS;
  data: TestRow[] = TEST_DATA;
  sortable = false;
  paginator = false;
  pageSize = 20;
  totalElements = 0;
  rowClickable = false;
  emptyIcon = 'inbox';
  emptyMessage = 'No data found.';

  lastSort: Sort | null = null;
  lastPage: PageEvent | null = null;
  lastRowClick: TestRow | null = null;

  onSortChange(sort: Sort): void {
    this.lastSort = sort;
  }

  onPageChange(event: PageEvent): void {
    this.lastPage = event;
  }

  onRowClick(row: TestRow): void {
    this.lastRowClick = row;
  }
}

function createFixture(
  overrides: Partial<TestHostComponent> = {},
): { fixture: ComponentFixture<TestHostComponent>; host: TestHostComponent } {
  const fixture = TestBed.createComponent(TestHostComponent);
  const host = fixture.componentInstance;
  Object.assign(host, overrides);
  fixture.detectChanges();
  return { fixture, host };
}

describe('ReusableTableComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  describe('column rendering', () => {
    it('should render header cells from ColumnConfig array', () => {
      const { fixture } = createFixture();
      const headers = fixture.debugElement.queryAll(By.css('th'));
      const headerTexts = headers.map((h) => h.nativeElement.textContent.trim());

      expect(headerTexts).toContain('ID');
      expect(headerTexts).toContain('Name');
      expect(headerTexts).toContain('Value');
    });

    it('should render data rows with correct cell values', () => {
      const { fixture } = createFixture();
      const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
      expect(rows.length).toBe(3);

      const firstRowCells = rows[0].queryAll(By.css('td'));
      expect(firstRowCells[0].nativeElement.textContent.trim()).toContain('1');
    });
  });

  describe('empty state', () => {
    it('should show empty state when data is empty', () => {
      const { fixture } = createFixture({ data: [] });
      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
    });

    it('should display the empty icon', () => {
      const { fixture } = createFixture({ data: [] });
      const icon = fixture.debugElement.query(By.css('.empty-state__icon'));
      expect(icon.nativeElement.textContent.trim()).toBe('inbox');
    });

    it('should display the empty message', () => {
      const { fixture } = createFixture({ data: [] });
      const message = fixture.debugElement.query(By.css('.empty-state__message'));
      expect(message.nativeElement.textContent.trim()).toBe('No data found.');
    });

    it('should display custom empty icon and message', () => {
      const { fixture } = createFixture({
        data: [],
        emptyIcon: 'search_off',
        emptyMessage: 'Nothing here.',
      });
      const icon = fixture.debugElement.query(By.css('.empty-state__icon'));
      const message = fixture.debugElement.query(By.css('.empty-state__message'));
      expect(icon.nativeElement.textContent.trim()).toBe('search_off');
      expect(message.nativeElement.textContent.trim()).toBe('Nothing here.');
    });

    it('should not show table when data is empty', () => {
      const { fixture } = createFixture({ data: [] });
      const table = fixture.debugElement.query(By.css('table'));
      expect(table).toBeFalsy();
    });
  });

  describe('sort events', () => {
    it('should emit sortChange when a sort header is clicked', () => {
      const { fixture, host } = createFixture({ sortable: true });

      const tableComp = fixture.debugElement.query(
        By.directive(ReusableTableComponent),
      );
      const sortEvent: Sort = { active: 'value', direction: 'asc' };
      tableComp.componentInstance.onSortChange(sortEvent);

      expect(host.lastSort).toEqual(sortEvent);
    });
  });

  describe('pagination', () => {
    it('should show paginator when paginator input is true', () => {
      const { fixture } = createFixture({
        paginator: true,
        totalElements: 100,
      });
      const paginatorEl = fixture.debugElement.query(By.css('mat-paginator'));
      expect(paginatorEl).toBeTruthy();
    });

    it('should not show paginator when paginator input is false', () => {
      const { fixture } = createFixture({ paginator: false });
      const paginatorEl = fixture.debugElement.query(By.css('mat-paginator'));
      expect(paginatorEl).toBeFalsy();
    });

    it('should emit pageChange when paginator page changes', () => {
      const { fixture, host } = createFixture({
        paginator: true,
        totalElements: 100,
        pageSize: 10,
      });

      const tableComp = fixture.debugElement.query(
        By.directive(ReusableTableComponent),
      );
      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 10,
        length: 100,
      };
      tableComp.componentInstance.onPageChange(pageEvent);

      expect(host.lastPage).toEqual(pageEvent);
    });
  });

  describe('row click', () => {
    it('should emit rowClick when a clickable row is clicked', () => {
      const { fixture, host } = createFixture({ rowClickable: true });
      const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
      rows[0].nativeElement.click();

      expect(host.lastRowClick).toEqual(TEST_DATA[0]);
    });

    it('should not emit rowClick when rowClickable is false', () => {
      const { fixture, host } = createFixture({ rowClickable: false });
      const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
      rows[0].nativeElement.click();

      expect(host.lastRowClick).toBeNull();
    });

    it('should set tabindex and role on rows when rowClickable is true', () => {
      const { fixture } = createFixture({ rowClickable: true });
      const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));

      rows.forEach((row) => {
        expect(row.nativeElement.getAttribute('tabindex')).toBe('0');
        expect(row.nativeElement.getAttribute('role')).toBe('button');
      });
    });

    it('should not set tabindex or role when rowClickable is false', () => {
      const { fixture } = createFixture({ rowClickable: false });
      const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));

      rows.forEach((row) => {
        expect(row.nativeElement.getAttribute('tabindex')).toBeNull();
        expect(row.nativeElement.getAttribute('role')).toBeNull();
      });
    });

    it('should emit rowClick on Enter keydown when rowClickable is true', () => {
      const { fixture, host } = createFixture({ rowClickable: true });
      const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      rows[1].nativeElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(host.lastRowClick).toEqual(TEST_DATA[1]);
    });
  });

  describe('custom cell templates via CellDefDirective', () => {
    it('should render custom template for the name column', () => {
      const { fixture } = createFixture();
      const customCells = fixture.debugElement.queryAll(By.css('.custom-name'));

      expect(customCells.length).toBe(3);
      expect(customCells[0].nativeElement.textContent).toContain('Custom: Alpha');
      expect(customCells[1].nativeElement.textContent).toContain('Custom: Beta');
      expect(customCells[2].nativeElement.textContent).toContain('Custom: Gamma');
    });

    it('should render default cell value for columns without custom template', () => {
      const { fixture } = createFixture();
      const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
      const firstRowCells = rows[0].queryAll(By.css('td'));

      // 'id' column has no custom template, should render raw value
      expect(firstRowCells[0].nativeElement.textContent.trim()).toContain('1');
      // 'name' column has custom template
      expect(firstRowCells[1].query(By.css('.custom-name'))).toBeTruthy();
    });
  });
});
