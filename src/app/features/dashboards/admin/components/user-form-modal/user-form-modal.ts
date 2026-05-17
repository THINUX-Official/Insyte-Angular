import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AlertsService} from '../../../../../core/services/alerts.service';

interface RoleOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form-modal.html',
  styleUrls: ['./user-form-modal.scss']
})
export class UserFormModal implements OnChanges {
  @Input() isOpen = false;
  @Input() users: any[] = [];
  @Input() selectedUser: any | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() update = new EventEmitter<{
    originalUsername: string;
    payload: any;
  }>();

  showPassword = false;
  submitted = false;

  roleOptions: RoleOption[] = [
    {id: 1, name: 'ADMIN'},
    {id: 2, name: 'SH'},
    {id: 3, name: 'ZO'},
    {id: 4, name: 'RM'},
    {id: 5, name: 'BM'},
    {id: 6, name: 'UL'},
    {id: 7, name: 'IC'}
  ];

  form = {
    username: '',
    password: '',
    email: '',
    phone: '',
    nickname: '',
    supervisorId: null as number | null,
    roleIds: [] as number[],
    status: 'ACTIVE'
  };

  selectedRoleId: number | null = null;
  originalUsername = '';

  constructor(private alerts: AlertsService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedUser'] || changes['isOpen']) {
      if (this.isOpen && this.selectedUser) {
        this.patchFormForEdit(this.selectedUser);
      }

      if (this.isOpen && !this.selectedUser) {
        this.reset();
      }
    }
  }

  get isEditMode(): boolean {
    return !!this.selectedUser;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Update User' : 'Add User';
  }

  get modalDescription(): string {
    return this.isEditMode
      ? 'Update user details and role hierarchy.'
      : 'Create a new system user and assign role hierarchy.';
  }

  private patchFormForEdit(user: any): void {
    const roleName = Array.isArray(user.roles) && user.roles.length
      ? user.roles[0]
      : null;

    const matchedRole = this.roleOptions.find(role => role.name === roleName);

    this.originalUsername = user.username;

    this.form = {
      username: user.username || '',
      password: '',
      email: user.email || '',
      phone: user.phone || '',
      nickname: user.nickname || '',
      supervisorId: user.supervisorId || null,
      roleIds: matchedRole ? [matchedRole.id] : [],
      status: user.status || 'ACTIVE'
    };

    this.selectedRoleId = matchedRole ? matchedRole.id : null;
    this.showPassword = false;
    this.submitted = false;
  }

  isDuplicateUsername(): boolean {
    if (this.isEditMode) {
      return false;
    }

    const username = this.form.username.trim().toLowerCase();

    if (!username) {
      return false;
    }

    return this.users.some(user =>
      String(user.username || '').trim().toLowerCase() === username
    );
  }

  isDuplicateEmail(): boolean {
    const email = this.form.email.trim().toLowerCase();

    if (!email) {
      return false;
    }

    return this.users.some(user => {
      const existingUsername = String(user.username || '').trim().toLowerCase();
      const existingEmail = String(user.email || '').trim().toLowerCase();

      if (this.isEditMode && existingUsername === this.originalUsername.toLowerCase()) {
        return false;
      }

      return existingEmail === email;
    });
  }

  isDuplicatePhone(): boolean {
    const phone = this.form.phone.trim();

    if (!phone) {
      return false;
    }

    return this.users.some(user => {
      const existingUsername = String(user.username || '').trim().toLowerCase();
      const existingPhone = String(user.phone || '').trim();

      if (this.isEditMode && existingUsername === this.originalUsername.toLowerCase()) {
        return false;
      }

      return existingPhone === phone;
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onRoleChange(roleId: number | null): void {
    this.selectedRoleId = roleId;
    this.form.roleIds = roleId ? [Number(roleId)] : [];
  }

  isInvalidUsername(): boolean {
    if (this.isEditMode) {
      return false;
    }

    return this.submitted && (!this.form.username.trim() || this.isDuplicateUsername());
  }

  isInvalidPassword(): boolean {
    if (!this.submitted) {
      return false;
    }

    if (this.isEditMode && !this.form.password) {
      return false;
    }

    return !this.form.password || this.form.password.length < 8;
  }

  isInvalidEmail(): boolean {
    if (!this.submitted) {
      return false;
    }

    const email = this.form.email.trim();

    if (!email) {
      return true;
    }

    const invalidFormat = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    return invalidFormat || this.isDuplicateEmail();
  }

  isInvalidPhone(): boolean {
    if (!this.submitted || !this.form.phone) {
      return false;
    }

    const invalidFormat = !/^[0-9]{9,15}$/.test(this.form.phone.trim());

    return invalidFormat || this.isDuplicatePhone();
  }

  isInvalidRole(): boolean {
    return this.submitted && !this.selectedRoleId;
  }

  isFormValid(): boolean {
    const passwordValid = this.isEditMode
      ? !this.form.password || this.form.password.length >= 8
      : !!this.form.password && this.form.password.length >= 8;

    const email = this.form.email.trim();

    return (
      !!this.form.username.trim() &&
      !this.isDuplicateUsername() &&
      passwordValid &&
      !!email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      !this.isDuplicateEmail() &&
      !this.isInvalidPhone() &&
      !!this.selectedRoleId
    );
  }

  submit(): void {
    this.submitted = true;

    if (!this.isFormValid()) {
      return;
    }

    const payload: any = {
      username: this.form.username.trim(),
      email: this.form.email.trim(),
      phone: this.form.phone?.trim() || null,
      nickname: this.form.nickname?.trim() || null,
      supervisorId: this.form.supervisorId ? Number(this.form.supervisorId) : null,
      roleIds: this.form.roleIds,
      status: this.form.status
    };

    if (!this.isEditMode || this.form.password?.trim()) {
      payload.password = this.form.password;
    }

    this.alerts.confirm({
      type: 'warning',
      title: this.isEditMode ? 'Confirm Update' : 'Confirm Save',
      message: this.isEditMode
        ? 'Do you want to update this user with the entered details?'
        : 'Do you want to create this user with the entered details?',
      confirmText: this.isEditMode ? 'Yes, Update User' : 'Yes, Save User',
      cancelText: 'No, Continue Editing'
    }).subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      if (this.isEditMode) {
        this.update.emit({
          originalUsername: this.originalUsername,
          payload
        });
      } else {
        this.save.emit(payload);
      }

      this.reset();
      this.close.emit();
    });
  }

  reset(): void {
    this.form = {
      username: '',
      password: '',
      email: '',
      phone: '',
      nickname: '',
      supervisorId: null,
      roleIds: [],
      status: 'ACTIVE'
    };

    this.selectedRoleId = null;
    this.originalUsername = '';
    this.showPassword = false;
    this.submitted = false;
  }

  onClose(): void {
    this.reset();
    this.close.emit();
  }
}
