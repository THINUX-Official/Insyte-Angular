import {Component, EventEmitter, Input, Output} from '@angular/core';
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
export class UserFormModal {
  @Input() isOpen = false;
  @Input() users: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

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

  constructor(private alerts: AlertsService) {
  }


  isDuplicateUsername(): boolean {
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

    return this.users.some(user =>
      String(user.email || '').trim().toLowerCase() === email
    );
  }

  isDuplicatePhone(): boolean {
    const phone = this.form.phone.trim();

    if (!phone) {
      return false;
    }

    return this.users.some(user =>
      String(user.phone || '').trim() === phone
    );
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onRoleChange(roleId: number | null): void {
    this.selectedRoleId = roleId;
    this.form.roleIds = roleId ? [Number(roleId)] : [];
  }

  isInvalidUsername(): boolean {
    return this.submitted && (!this.form.username.trim() || this.isDuplicateUsername());
  }

  isInvalidPassword(): boolean {
    return this.submitted && (!this.form.password || this.form.password.length < 8);
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
    return (
      !!this.form.username.trim() &&
      !this.isDuplicateUsername() &&
      !!this.form.password &&
      this.form.password.length >= 8 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim()) &&
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

    const payload = {
      username: this.form.username.trim(),
      password: this.form.password,
      email: this.form.email.trim(),
      phone: this.form.phone?.trim() || null,
      nickname: this.form.nickname?.trim() || null,
      supervisorId: this.form.supervisorId ? Number(this.form.supervisorId) : null,
      roleIds: this.form.roleIds,
      status: this.form.status
    };

    this.alerts.confirm({
      type: 'warning',
      title: 'Are you sure?',
      message: 'Do you want to create this user with the entered details?',
      confirmText: 'Yes, Save User',
      cancelText: 'No, Continue Editing'
    }).subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      this.save.emit(payload);

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
    this.showPassword = false;
    this.submitted = false;
  }

  onClose(): void {
    this.reset();
    this.close.emit();
  }
}
