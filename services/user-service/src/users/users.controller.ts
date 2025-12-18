import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/education')
  addEducation(@Param('id') id: string, @Body() educationData: any) {
    return this.usersService.addEducation(id, educationData);
  }

  @Post(':id/experience')
  addExperience(@Param('id') id: string, @Body() experienceData: any) {
    return this.usersService.addExperience(id, experienceData);
  }

  @Post(':id/portfolio')
  addPortfolio(@Param('id') id: string, @Body() portfolioData: any) {
    return this.usersService.addPortfolio(id, portfolioData);
  }

  @Post(':id/kyc')
  submitKyc(@Param('id') id: string, @Body() kycData: { idDocument: string }) {
    return this.usersService.submitKyc(id, kycData.idDocument);
  }

  @Post(':id/stats')
  updateStats(@Param('id') id: string, @Body() statsData: { rating: number }) {
    return this.usersService.updateStats(id, statsData.rating);
  }

  @Post(':id/suspend')
  suspendUser(@Param('id') id: string) {
    return this.usersService.suspendUser(id);
  }

  @Post(':id/ban')
  banUser(@Param('id') id: string) {
    return this.usersService.banUser(id);
  }

  @Post(':id/activate')
  activateUser(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }
}
