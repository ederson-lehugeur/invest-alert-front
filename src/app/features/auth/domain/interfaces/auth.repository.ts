import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Token } from '../models/token.model';

export interface RegisterCommand {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export interface LoginCommand {
  readonly email: string;
  readonly password: string;
}

export interface AuthRepository {
  register(command: RegisterCommand): Observable<User>;
  login(command: LoginCommand): Observable<Token>;
}
