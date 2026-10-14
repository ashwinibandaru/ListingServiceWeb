import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ListingSearchService } from './listing-search.service';

describe('ListingSearchService', () => {
  let service: ListingSearchService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ListingSearchService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('sends supported filters and pagination to the listing API', () => {
    service.search({
      minPrice: 300000,
      maxPrice: 600000,
      minBedrooms: 3,
      city: 'Reston',
      keyword: 'fenced yard',
      targetBudget: 500000
    }, 2, 6).subscribe();

    const request = httpTestingController.expectOne(request => request.url === '/api/Search');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('minPrice')).toBe('300000');
    expect(request.request.params.get('maxPrice')).toBe('600000');
    expect(request.request.params.get('minBedrooms')).toBe('3');
    expect(request.request.params.get('city')).toBe('Reston');
    expect(request.request.params.get('keyword')).toBe('fenced yard');
    expect(request.request.params.get('targetBudget')).toBe('500000');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('6');
    request.flush({ page: 2, pageSize: 6, total: 0, items: [] });
  });

  it('omits filters that are not set', () => {
    service.search({}, 1, 6).subscribe();

    const request = httpTestingController.expectOne(request => request.url === '/api/Search');
    expect(request.request.params.keys().sort()).toEqual(['page', 'pageSize']);
    request.flush({ page: 1, pageSize: 6, total: 0, items: [] });
  });
});
