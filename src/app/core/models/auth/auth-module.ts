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
  id: number;
  username: string;
  email: string;
  fullName: string;
  status: string;
}

export interface LoginResponse {
  token: string;
  user: UserDto;
  roles: string[];
}
