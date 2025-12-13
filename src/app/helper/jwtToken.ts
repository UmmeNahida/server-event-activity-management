import Jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'

export const generateToken = (payload: object, secret: string, expiresIn: string)=>{
   const token =  Jwt.sign(payload, secret, {expiresIn: expiresIn, algorithm: 'HS256'} as SignOptions) 
   return token
}

export const verifyToken = (token: string, secret: string)=>{
    const decoded = Jwt.verify(token, secret) as JwtPayload
    return decoded
}