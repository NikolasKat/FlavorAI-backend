import { CuisineType } from "@prisma/client"
import { IsArray, IsEnum, IsNumber, IsString } from "class-validator"

export class RecipeDto {
	@IsString()
	name: string

	@IsArray()
	ingredients: string[]

	@IsNumber()
	rating: number

	@IsEnum(CuisineType)
	cuisineType: CuisineType
}
