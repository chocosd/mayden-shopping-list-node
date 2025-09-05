import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export const PasswordRequirements: RegExp =
  /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export default class UsersDto {
  @IsString()
  @IsEmail()
  public email: string = "";

  @IsString()
  @MinLength(8)
  @Matches(PasswordRequirements, { message: "password too weak" })
  public readonly password: string = "";
}
