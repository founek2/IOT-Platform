import { JwtService, UserService } from "common";
import { OAuthService } from "../services/oauthService.js";
import { TemporaryPass } from "../services/TemporaryPass.js";
import Koa from "koa"
import { FormData } from "common/validations";
export interface UpdateThingState {
    _id: string;
    state: any;
}
export type Context = {
    oauthService: OAuthService
    userService: UserService
    jwtService: JwtService
    temporaryPassService: TemporaryPass
}

export type HasContext = {
    context: Context
}

interface KoaRequest<RequestBody = any> extends Koa.Request {
    body: RequestBody;
}

export interface KoaContext<RequestBody = any, ResponseBody = any> extends Koa.ParameterizedContext<Koa.DefaultState, Context, ResponseBody> {
    request: KoaRequest<RequestBody>;
    body: ResponseBody;
}

export interface KoaFormContext<ResponseBody = any> extends Koa.ParameterizedContext<Koa.DefaultState, Context, ResponseBody> {
    request: KoaRequest<{ formData: Record<string, any | undefined> }>;
    body: ResponseBody;
}

export interface KoaResponseContext<ResponseBody> extends KoaContext<any, ResponseBody> { }
