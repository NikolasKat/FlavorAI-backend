/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe
} from "@nestjs/common"
import { RecipeService } from "./recipe.service"
import { CuisineType } from "@prisma/client"
import { Authorization } from "src/auth/decorators/authorization.decorator"
import { RecipeDto } from "./dto/recipe.dto"

@Controller("recipe")
export class RecipeController {
	constructor(private readonly recipeService: RecipeService) {}

	@Get("all")
	async getAll() {
		return this.recipeService.getAll()
	}

	@Get("by-cuisine/:cuisine")
	async getByCuisineType(@Param("cuisineType") cuisineType: CuisineType) {
		return this.recipeService.getByCuisineType(cuisineType)
	}

	@Get("by-ingredients/:ingredients")
	async getByIngredients(@Param("ingredients") ingredients: string[]) {
		return this.recipeService.getByIngredients(ingredients)
	}

	@Get("favorites")
	async getFavorites() {
		return this.recipeService.getFavorites()
	}

	@Get("by-name/:name")
	async getByName(@Param("name") name: string) {
		return this.recipeService.getByName(name)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Authorization()
	async create(@Body() dto: RecipeDto) {
		return await this.recipeService.create(dto)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put("id")
	@Authorization()
	async addToFavorites(@Param("id") id: string) {
		return this.recipeService.addToFavorites(id)
	}

	@HttpCode(200)
	@Delete(":id")
	@Authorization()
	async removeFromFavorites(@Param("id") id: string) {
		return this.recipeService.removeFromFavorites(id)
	}
}
