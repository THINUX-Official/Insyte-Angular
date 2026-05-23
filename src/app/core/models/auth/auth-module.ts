import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class AuthModule {
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface UserDto {
  id?: number;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  fullName?: string;
  status?: string;
  roles?: string[];
  supervisorId?: number;
  supervisorUsername?: string;
}

export interface LoginResponse {
  id?: number;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  status?: string;
  roles?: string[];

  token: string;
  tokenType?: string;
  message?: string;

  // old response support
  user?: UserDto;
}
