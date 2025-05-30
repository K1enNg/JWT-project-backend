import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { hashPassword } from 'src/utils/utils';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly mailerService: MailerService

  ) { }
  isEmailExist = async (email: string) => {
    const user = await this.userModel.findOne({ email });
    if (user) return true;
    return false;
  }
  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException('Email already exists. Please use another email');
    }
    const hash = await hashPassword(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hash,
      phone,
      address,
      image,
      createdAt: new Date()
    });
    return {
      _id: user._id
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const result = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);

    return { result, totalPages };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne({ _id: updateUserDto }, { ...updateUserDto });
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('Invalid ID');
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException('Email already exists. Please use another email');
    }
    const hash = await hashPassword(password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      name,
      email,
      password: hash,
      isActive: false,
      createdAt: dayjs(),
      codeId: codeId,
      codeExpired: dayjs().add(1, 'hour')
    });
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      from: 'noreply@nestjs.com', // sender address
      subject: 'Activate your account', // Subject line
      template: 'register.hbs',
      context: {
        name: user.name,
        activationCode: codeId
      }
    })
    return {
      _id: user._id
    };



  }


}

