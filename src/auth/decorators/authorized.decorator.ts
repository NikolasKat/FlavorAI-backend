/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, type ExecutionContext } from "@nestjs/common"
import { User } from "@prisma/client"
import { Request } from "express"

export const Authorized = createParamDecorator(
	(data: keyof User, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest() as Request

		const user = request.user

		return data ? user![data] : user
	}
)
