import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsPasswordStrong } from 'src/utils/decorators/isPasswordStrong';

export class CreateUserDto {
  @IsEmail(
    {},
    {
      message: 'Please provide a valid email address',
    },
  )
  @IsNotEmpty({
    message: 'Email is required to create an account',
  })
  email: string;

  @IsString()
  @IsNotEmpty({
    message: 'Name is required to create an account',
  })
  name: string;

  @IsString()
  @IsNotEmpty({
    message: 'Password is required to create and account',
  })
  @IsPasswordStrong({
    message:
      'Password must be 8 characters long with atleast 1 letter, 1 number, and 1 special character',
  })
  password: string;
}
