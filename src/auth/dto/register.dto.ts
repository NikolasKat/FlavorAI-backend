import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength
} from "class-validator"

export class RegisterRequest {
	@IsString()
	@IsNotEmpty()
	@MaxLength(50, { message: "Name shouldn`t be bigger than 50 symbols" })
	name: string

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
