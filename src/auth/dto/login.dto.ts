import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength
} from "class-validator"

export class LoginRequest {
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email: string

	@IsString()
	@IsNotEmpty()
	@MinLength(6, { message: "Password shouldn`t be smaller than 6 symbols" })
	@MaxLength(128, { message: "Password shouldn`t be bigger than 128 symbols" })
	password: string
}
