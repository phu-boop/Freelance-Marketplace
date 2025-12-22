import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll(page, limit, role);
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

  @Patch('education/:eduId')
  updateEducation(@Param('eduId') eduId: string, @Body() educationData: any) {
    return this.usersService.updateEducation(eduId, educationData);
  }

  @Delete('education/:eduId')
  deleteEducation(@Param('eduId') eduId: string) {
    return this.usersService.deleteEducation(eduId);
  }

  @Post(':id/experience')
  addExperience(@Param('id') id: string, @Body() experienceData: any) {
    return this.usersService.addExperience(id, experienceData);
  }

  @Patch('experience/:expId')
  updateExperience(@Param('expId') expId: string, @Body() experienceData: any) {
    return this.usersService.updateExperience(expId, experienceData);
  }

  @Delete('experience/:expId')
  deleteExperience(@Param('expId') expId: string) {
    return this.usersService.deleteExperience(expId);
  }

  @Post(':id/portfolio')
  addPortfolio(@Param('id') id: string, @Body() portfolioData: any) {
    return this.usersService.addPortfolio(id, portfolioData);
  }

  @Patch('portfolio/:itemId')
  updatePortfolio(@Param('itemId') itemId: string, @Body() portfolioData: any) {
    return this.usersService.updatePortfolio(itemId, portfolioData);
  }

  @Delete('portfolio/:itemId')
  deletePortfolio(@Param('itemId') itemId: string) {
    return this.usersService.deletePortfolio(itemId);
  }

  @Post(':id/toggle-availability')
  toggleAvailability(@Param('id') id: string) {
    return this.usersService.toggleAvailability(id);
  }

  @Post(':id/kyc')
  submitKyc(@Param('id') id: string, @Body() kycData: { idDocument: string }) {
    return this.usersService.submitKyc(id, kycData.idDocument);
  }

  @Patch(':id/client-info')
  updateClientInfo(@Param('id') id: string, @Body() data: { companyName?: string, companyLogo?: string }) {
    return this.usersService.updateClientInfo(id, data);
  }

  @Post(':id/toggle-2fa')
  toggleTwoFactor(@Param('id') id: string) {
    return this.usersService.toggleTwoFactor(id);
  }

  @Post(':id/verify-payment')
  verifyPayment(@Param('id') id: string) {
    return this.usersService.verifyPayment(id);
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

  @Get('me')
  getMe(@Query('userId') id: string) {
    // In a real app, this would come from a JWT decorator
    // For now, we'll use a placeholder or expect the frontend to pass the ID
    return this.usersService.findOne(id);
  }

  @Patch(':id/onboarding')
  completeOnboarding(@Param('id') id: string, @Body() data: any) {
    return this.usersService.completeOnboarding(id, data);
  }

  @Post(':id/activate')
  activateUser(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }
}
