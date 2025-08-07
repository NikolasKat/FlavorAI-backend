/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
	BadRequestException,
	Injectable,
	NotFoundException
} from "@nestjs/common"
import { CuisineType } from "@prisma/client"
import { PrismaService } from "src/prisma/prisma.service"
import { IRecipe } from "./interfaces/recipe.interface"

@Injectable()
export class RecipeService {
	constructor(private prisma: PrismaService) {}

	async getAll() {
		return await this.prisma.recipe.findMany()
	}

	async getByCuisineType(cuisineType: CuisineType) {
		const recipes = await this.prisma.recipe.findMany({
			where: { cuisineType }
		})

		if (!recipes) throw new NotFoundException("Recipes not found")

		return recipes
	}

	async getByIngredients(ingredients: string[]) {
		const recipes = await this.prisma.recipe.findMany({
			where: { ingredients: { hasEvery: ingredients } }
		})

		if (!recipes) throw new NotFoundException("Recipes not found")

		return recipes
	}

	async getFavorites() {
		return this.prisma.favorite.findMany()
	}

	async getByName(name: string) {
		const recipes = this.prisma.recipe.findMany({ where: { name } })

		if (!recipes) throw new NotFoundException("Recipes not found")

		return recipes
	}

	async create(data: IRecipe) {
		const { name, rating, ingredients, cuisineType } = data
		return this.prisma.recipe.create({
			data: {
				name,
				rating,
				ingredients,
				cuisineType,
				image: ""
			}
		})
	}

	async addToFavorites(recipeId: string) {
		const recipe = await this.prisma.recipe.findUnique({
			where: { id: recipeId }
		})

		if (!recipe) throw new NotFoundException("Recipe not found")

		const isExist = await this.prisma.favorite.findUnique({
			where: { recipeId }
		})

		if (isExist)
			throw new BadRequestException(
				"You have already added this recipe in favorites"
			)

		return this.prisma.favorite.create({
			data: {
				recipeId,
				recipeName: recipe.name
			}
		})
	}

	async removeFromFavorites(recipeId: string) {
		return this.prisma.favorite.delete({ where: { recipeId } })
	}
}
