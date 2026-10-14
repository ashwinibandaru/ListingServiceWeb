import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ListingSearchService } from './listing-search.service';
import { ScoredListing, SearchFilters } from './listing.models';

const priceRangeValidator: ValidatorFn = (control): ValidationErrors | null => {
  const minPrice = control.get('minPrice')?.value;
  const maxPrice = control.get('maxPrice')?.value;
  return minPrice !== null && maxPrice !== null && minPrice > maxPrice
    ? { priceRange: true }
    : null;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  readonly searchForm = new FormGroup({
    city: new FormControl('', { nonNullable: true }),
    keyword: new FormControl('', { nonNullable: true }),
    minPrice: new FormControl<number | null>(null, Validators.min(0)),
    maxPrice: new FormControl<number | null>(null, Validators.min(0)),
    minBedrooms: new FormControl<number | null>(null, [Validators.min(0), Validators.pattern(/^\d+$/)]),
    targetBudget: new FormControl<number | null>(500000, Validators.min(0)),
    pageSize: new FormControl(6, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern(/^\d+$/)] })
  }, { validators: priceRangeValidator });

  listings: ScoredListing[] = [];
  currentPage = 1;
  total = 0;
  loading = false;
  hasSearched = false;
  errorMessage = '';

  constructor(
    private readonly listingSearch: ListingSearchService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchListings(1);
  }

  get totalPages(): number {
    return this.pageSize > 0 && Number.isInteger(this.pageSize)
      ? Math.max(1, Math.ceil(this.total / this.pageSize))
      : 1;
  }

  get pageSize(): number {
    return this.searchForm.controls.pageSize.value;
  }

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.total);
  }

  submitSearch(): void {
    if (this.loading) {
      return;
    }
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.searchListings(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || this.loading) {
      return;
    }
    this.searchListings(page);
  }

  scorePercent(score: number): number {
    return Math.max(0, Math.min(100, score * 100));
  }

  trackListing(_index: number, result: ScoredListing): string {
    return `${result.listing.source ?? ''}:${result.listing.id ?? ''}`;
  }

  private searchListings(page: number): void {
    if (this.loading) {
      return;
    }
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const values = this.searchForm.getRawValue();
    const filters: SearchFilters = {
      minPrice: values.minPrice ?? undefined,
      maxPrice: values.maxPrice ?? undefined,
      minBedrooms: values.minBedrooms ?? undefined,
      city: values.city.trim() || undefined,
      keyword: values.keyword.trim() || undefined,
      targetBudget: values.targetBudget ?? undefined
    };

    this.loading = true;
    this.errorMessage = '';
    this.listingSearch.search(filters, page, values.pageSize)
      .pipe(finalize(() => {
        this.loading = false;
        this.changeDetector.markForCheck();
      }))
      .subscribe({
        next: result => {
          this.listings = result.items ?? [];
          this.total = result.total;
          this.currentPage = result.page;
          this.hasSearched = true;
        },
        error: (error: HttpErrorResponse) => {
          this.listings = [];
          this.total = 0;
          this.hasSearched = true;
          this.errorMessage = this.describeError(error);
        }
      });
  }

  private describeError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'The listing service could not be reached. Check that the backend is running and try again.';
    }

    const body = error.error as { detail?: unknown; title?: unknown; message?: unknown } | string | null;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object') {
      const detail = body.detail ?? body.title ?? body.message;
      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }
    }
    return `The listing service returned HTTP ${error.status}${error.statusText ? ` (${error.statusText})` : ''}.`;
  }
}
