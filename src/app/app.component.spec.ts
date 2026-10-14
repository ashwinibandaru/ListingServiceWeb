import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ListingSearchService } from './listing-search.service';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('AppComponent', () => {
  const listingSearch = jasmine.createSpyObj<ListingSearchService>('ListingSearchService', ['search']);

  beforeEach(() => {
    listingSearch.search.and.returnValue(of({ page: 1, pageSize: 6, total: 0, items: [] }));
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: ListingSearchService, useValue: listingSearch }]
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads listings with a sensible initial page and target budget', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(listingSearch.search).toHaveBeenCalledWith(
      jasmine.objectContaining({ targetBudget: 500000 }),
      1,
      6
    );
  });

  it('does not search with an invalid price range', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.searchForm.controls.minPrice.setValue(700000);
    fixture.componentInstance.searchForm.controls.maxPrice.setValue(500000);
    fixture.detectChanges();
    listingSearch.search.calls.reset();
    fixture.componentInstance.submitSearch();
    expect(listingSearch.search).not.toHaveBeenCalled();
    expect(fixture.componentInstance.searchForm.hasError('priceRange')).toBeTrue();
  });

  it('rejects a page size of zero', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.searchForm.controls.pageSize.setValue(0);
    fixture.detectChanges();
    listingSearch.search.calls.reset();
    fixture.componentInstance.submitSearch();
    expect(listingSearch.search).not.toHaveBeenCalled();
    expect(fixture.componentInstance.searchForm.controls.pageSize.hasError('min')).toBeTrue();
  });

  it('shows the backend validation message from its error response', () => {
    listingSearch.search.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: { error: 'pageSize must be >= 1' }
    })));

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage).toBe('pageSize must be >= 1');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('pageSize must be >= 1');
  });

  it('shows a no-results state when the search returns no listings', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.hasSearched).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('No homes found just yet');
  });
});
