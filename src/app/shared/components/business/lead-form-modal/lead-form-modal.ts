import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AlertsService} from '../../../../core/services/alerts.service';
import {OccupationOption, OccupationService} from '../../../../core/services/occupation.service';

@Component({
  selector: 'app-lead-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lead-form-modal.html',
  styleUrls: ['./lead-form-modal.scss']
})
export class LeadFormModal implements OnChanges, OnInit {

  @Input() isOpen = false;
  @Input() selectedLead: any | null = null;
  @Input() loggedUserId: number | null = null;
  @Input() users: any[] = [];
  @Input() assignMode: 'self' | 'manual' = 'self';
  @Input() readOnly = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() update = new EventEmitter<{ id: number; payload: any }>();

  submitted = false;

  occupationOptions: OccupationOption[] = [];
  isOccupationLoading = false;

  leadStatusOptions = ['NEW', 'IN_PROGRESS', 'QUOTATION_SUBMITTED', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
  genderOptions = ['MALE', 'FEMALE', 'OTHER'];
  civilStatusOptions = ['SINGLE', 'MARRIED', 'DIVORCED'];
  raceOptions = ['SINHALESE', 'TAMIL', 'MUSLIM', 'BURGHER', 'OTHER'];

  districtOptions = [
    'AMPARA', 'ANURADHAPURA', 'BADULLA', 'BATTICALOA', 'COLOMBO',
    'GALLE', 'GAMPAHA', 'HAMBANTOTA', 'JAFFNA', 'KALUTARA',
    'KANDY', 'KEGALLE', 'KILINOCHCHI', 'KURUNEGALA', 'MANNAR',
    'MATALE', 'MATARA', 'MONERAGALA', 'MULLAITTIVU', 'NUWARA_ELIYA',
    'POLONNARUWA', 'PUTTALAM', 'RATNAPURA', 'TRINCOMALEE', 'VAVUNIYA'
  ];

  provinceOptions = [
    'CENTRAL', 'EASTERN', 'NORTH_CENTRAL', 'NORTHERN', 'NORTH_WESTERN',
    'SABARAGAMUWA', 'SOUTHERN', 'UVA', 'WESTERN'
  ];

  countryOptions = ['SRI_LANKA', 'SINGAPORE', 'MYANMAR', 'THAILAND', 'OTHER'];
  productTypeOptions = ['LIFE', 'INVESTMENT'];
  leadSourceOptions = ['SOCIAL_MEDIA', 'CAMPAIGN', 'CALL_CENTER', 'WALKING'];
  probabilityOptions = ['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST'];

  form = this.getEmptyForm();

  constructor(
    private alerts: AlertsService,
    private occupationService: OccupationService
  ) {
  }

  ngOnInit(): void {
    this.loadOccupations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] || changes['selectedLead']) {
      if (this.isOpen && !this.occupationOptions.length) {
        this.loadOccupations();
      }

      if (this.isOpen && this.selectedLead) {
        this.patchForm(this.selectedLead);
      }

      if (this.isOpen && !this.selectedLead) {
        this.reset();
      }
    }
  }

  get canEdit(): boolean {
    return !this.readOnly;
  }

  get isEditMode(): boolean {
    return !!this.selectedLead;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Update Lead' : 'Add Lead';
  }

  get modalDescription(): string {
    return this.isEditMode
      ? 'Update customer lead details and follow-up information.'
      : 'Create a new insurance lead assigned to your profile.';
  }

  private loadOccupations(): void {
    if (this.isOccupationLoading) {
      return;
    }

    this.isOccupationLoading = true;

    this.occupationService.getOccupations().subscribe({
      next: (occupations) => {
        this.occupationOptions = occupations || [];
        this.isOccupationLoading = false;
      },
      error: (error) => {
        console.error('Occupation load failed', error);
        this.isOccupationLoading = false;

        this.alerts.errorDialog(
          'Occupation list could not be loaded. Please check backend API.',
          'Occupation Load Failed'
        );
      }
    });
  }

  private getEmptyForm() {
    return {
      status: 'NEW',
      name: '',
      nic: '',
      email: '',
      gender: '',
      civilStatus: '',
      dob: '',
      mobile: '',
      occupationId: null as number | null,
      race: '',

      address1: '',
      address2: '',
      city: '',
      district: '',
      province: '',
      country: 'SRI_LANKA',

      premium: null as number | null,
      productType: '',
      leadSource: '',
      probability: '',
      remindDate: '',
      remark: '',
      attachmentPath: '',

      assignedUserId: null as number | null
    };
  }

  private patchForm(lead: any): void {
    this.form = {
      status: lead.status || 'NEW',
      name: lead.name || lead.customerName || '',
      nic: lead.nic || '',
      email: lead.email || '',
      gender: lead.gender || '',
      civilStatus: lead.civilStatus || '',
      dob: this.toDateInputValue(lead.dob),
      mobile: lead.mobile || '',
      occupationId: lead.occupationId
        ? Number(lead.occupationId)
        : lead.occupation?.id
          ? Number(lead.occupation.id)
          : null,
      race: lead.race || '',

      address1: lead.address1 || '',
      address2: lead.address2 || '',
      city: lead.city || '',
      district: lead.district || '',
      province: lead.province || '',
      country: lead.country || 'SRI_LANKA',

      premium: lead.premium ?? lead.expectedPremium ?? null,
      productType: lead.productType || '',
      leadSource: lead.leadSource || '',
      probability: lead.probability || '',
      remindDate: this.toDateInputValue(lead.remindDate),
      remark: lead.remark || '',
      attachmentPath: lead.attachmentPath || '',

      assignedUserId: lead.assignedUserId || lead.agentId || this.loggedUserId
    };

    this.submitted = false;
  }

  private toDateInputValue(value: any): string {
    if (!value) {
      return '';
    }

    return String(value).slice(0, 10);
  }

  isInvalidName(): boolean {
    return this.submitted && !this.form.name.trim();
  }

  isInvalidNic(): boolean {
    return this.submitted && (!this.form.nic.trim() || this.form.nic.trim().length > 12);
  }

  isInvalidStatus(): boolean {
    return this.submitted && !this.form.status;
  }

  isInvalidEmail(): boolean {
    if (!this.submitted || !this.form.email.trim()) {
      return false;
    }

    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim());
  }

  isInvalidMobile(): boolean {
    if (!this.submitted || !this.form.mobile.trim()) {
      return false;
    }

    return !/^[0-9]{9,15}$/.test(this.form.mobile.trim());
  }

  isInvalidPremium(): boolean {
    if (!this.submitted || this.form.premium === null || this.form.premium === undefined) {
      return false;
    }

    return Number(this.form.premium) < 0;
  }

  isFormValid(): boolean {
    const assignedUserValid =
      this.assignMode === 'manual'
        ? !!this.form.assignedUserId
        : !!this.loggedUserId;

    return (
      !!this.form.status &&
      !!this.form.name.trim() &&
      !!this.form.nic.trim() &&
      this.form.nic.trim().length <= 12 &&
      !this.isInvalidEmail() &&
      !this.isInvalidMobile() &&
      !this.isInvalidPremium() &&
      assignedUserValid
    );
  }

  submit(): void {
    if (this.readOnly) {
      return;
    }

    this.submitted = true;

    if (this.assignMode === 'self' && !this.loggedUserId) {
      this.alerts.errorDialog(
        'Logged user details are missing. Please login again.',
        'Lead Save Failed'
      );
      return;
    }

    if (this.assignMode === 'manual' && !this.form.assignedUserId) {
      this.alerts.errorDialog(
        'Please select an assigned user for this lead.',
        'Lead Save Failed'
      );
      return;
    }

    if (!this.isFormValid()) {
      return;
    }

    const payload = this.buildPayload();

    this.alerts.confirm({
      type: 'warning',
      title: this.isEditMode ? 'Confirm Update' : 'Confirm Save',
      message: this.isEditMode
        ? 'Do you want to update this lead with the entered details?'
        : 'Do you want to create this lead?',
      confirmText: this.isEditMode ? 'Yes, Update Lead' : 'Yes, Save Lead',
      cancelText: 'No, Continue Editing'
    }).subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      if (this.isEditMode) {
        this.update.emit({
          id: Number(this.selectedLead.id),
          payload
        });
      } else {
        this.save.emit(payload);
      }

      this.reset();
      this.close.emit();
    });
  }

  private buildPayload(): any {
    return {
      status: this.emptyToNull(this.form.status),
      name: this.form.name.trim(),
      nic: this.form.nic.trim(),
      email: this.emptyToNull(this.form.email),
      gender: this.emptyToNull(this.form.gender),
      civilStatus: this.emptyToNull(this.form.civilStatus),
      dob: this.emptyToNull(this.form.dob),
      mobile: this.emptyToNull(this.form.mobile),
      occupationId: this.form.occupationId ? Number(this.form.occupationId) : null,
      race: this.emptyToNull(this.form.race),

      address1: this.emptyToNull(this.form.address1),
      address2: this.emptyToNull(this.form.address2),
      city: this.emptyToNull(this.form.city),
      district: this.emptyToNull(this.form.district),
      province: this.emptyToNull(this.form.province),
      country: this.emptyToNull(this.form.country),

      premium: this.form.premium !== null && this.form.premium !== undefined && String(this.form.premium) !== ''
        ? Number(this.form.premium)
        : null,
      productType: this.emptyToNull(this.form.productType),
      leadSource: this.emptyToNull(this.form.leadSource),
      probability: this.emptyToNull(this.form.probability),
      remindDate: this.emptyToNull(this.form.remindDate),
      remark: this.emptyToNull(this.form.remark),
      attachmentPath: this.emptyToNull(this.form.attachmentPath),

      assignedUserId: this.assignMode === 'manual'
        ? Number(this.form.assignedUserId)
        : Number(this.loggedUserId)
    };
  }

  private emptyToNull(value: any): any {
    if (value === undefined || value === null) {
      return null;
    }

    const text = String(value).trim();

    return text === '' ? null : text;
  }

  formatLabel(value: string): string {
    if (!value) {
      return '';
    }

    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  reset(): void {
    this.form = this.getEmptyForm();
    this.form.assignedUserId = this.assignMode === 'self'
      ? this.loggedUserId
      : null;
    this.submitted = false;
  }

  onClose(): void {
    this.reset();
    this.close.emit();
  }
}
