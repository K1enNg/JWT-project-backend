import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { hashPassword } from 'src/utils/utils';
import aqp from 'api-query-params';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>
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
      image
    });
    return {
      _id: user._id
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const {filter, sort} = aqp(query);
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

    return {result, totalPages};
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

