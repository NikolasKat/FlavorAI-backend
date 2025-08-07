import { CuisineType } from "@prisma/client"

export interface IRecipe {
	name: string
	rating: number
	ingredients: string[]
	cuisineType: CuisineType
}
