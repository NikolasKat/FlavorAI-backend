/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { PrismaService } from "src/prisma/prisma.service"
import { JwtPayload } from "./interfaces/jwt.interface"
import { Request, Response } from "express"
import { isDev } from "src/utils/is-dev.util"
import { RegisterRequest } from "./dto/register.dto"
import { hash, verify } from "argon2"
import { LoginRequest } from "./dto/login.dto"

@Injectable()
export class AuthService {
	private readonly JWT_ACCESS_TOKEN_TTL: string
	private readonly JWT_REFRESH_TOKEN_TTL: string
	private readonly COOKIE_DOMAIN: string

	constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {
		this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>(
			"JWT_ACCESS_TOKEN_TTL"
		)
		this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>(
			"JWT_REFRESH_TOKEN_TTL"
		)
		this.COOKIE_DOMAIN = configService.getOrThrow<string>("COOKIE_DOMAIN")
	}

	async register(res: Response, dto: RegisterRequest) {
		const { email, name, password } = dto

		const existUser = await this.prismaService.user.findUnique({
			where: { email }
		})

		if (existUser)
			throw new ConflictException("User with this email already exist")

		const user = await this.prismaService.user.create({
			data: { name, email, password: await hash(password) }
		})

		return this.auth(res, user.id)
	}

	async login(res: Response, dto: LoginRequest) {
		const { email, password } = dto

		const user = await this.prismaService.user.findUnique({
			where: { email },
			select: { id: true, password: true }
		})

		if (!user) throw new NotFoundException("User is not found!")

		const isValidPassword = await verify(user.password, password)

		if (!isValidPassword) throw new NotFoundException("User is not found!")

		return this.auth(res, user.id)
	}

	async logout(res: Response) {
		this.setCookies(res, "refreshToken", new Date(0))
	}

	async validate(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id }
		})

		if (!user) throw new NotFoundException("User is not found!")

		return user
	}

	async refresh(req: Request, res: Response) {
		const refreshToken = req.cookies["refreshToken"]

		if (!refreshToken) throw new UnauthorizedException()

		const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken)

		if (payload) {
			const user = await this.prismaService.user.findUnique({
				where: { id: payload.id },
				select: { id: true }
			})

			if (!user) throw new NotFoundException("User is not found!")

			return this.auth(res, user.id)
		}
	}

	private generateTokens(id: string) {
		const payload: JwtPayload = { id }

		const accessToken = this.jwtService.sign(payload, {
			expiresIn: this.JWT_ACCESS_TOKEN_TTL
		})

		const refreshToken = this.jwtService.sign(payload, {
			expiresIn: this.JWT_REFRESH_TOKEN_TTL
		})

		return { accessToken, refreshToken }
	}

	private setCookies(res: Response, value: string, expires: Date) {
		res.cookie("refreshToken", value, {
			httpOnly: true,
			domain: this.COOKIE_DOMAIN,
			expires,
			secure: !isDev(this.configService),
			sameSite: isDev(this.configService) ? "none" : "lax"
		})
	}

	private auth(res: Response, id: string) {
		const { accessToken, refreshToken } = this.generateTokens(id)

		this.setCookies(
			res,
			refreshToken,
			new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
		)

		return { accessToken }
	}
}
