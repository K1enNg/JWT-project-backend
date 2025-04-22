import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({message: 'Name is required'})
    name: string;

    @IsNotEmpty({message: 'Email is required'})
    @IsEmail()
    email: string;

    @IsNotEmpty({message: 'Password is required'})
    password: string;

    @IsOptional()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    image: string;
}
