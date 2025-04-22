import { IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    image: string;
}
