import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public, Roles } from 'nest-keycloak-connect';
import { AiService } from './ai.service';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly aiService: AiService,
  ) { }

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Public()
  @Get('sync')
  sync(@Query('since') since: string, @Query('entities') entities: string) {
    const entityList = entities
      ? entities.split(',')
      : ['User', 'Education', 'Experience', 'PortfolioItem'];
    return this.usersService.sync(
      since || new Date(0).toISOString(),
      entityList,
    );
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll(page, limit, role);
  }

  @Get('me')
  getMe(@Request() req) {
    if (req.user && req.user.sub) {
      return this.usersService.findOne(req.user.sub);
    }
    // Fallback if no user in request (should not happen with auth guard)
    throw new UnauthorizedException('User not authenticated');
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/export')
  exportData(@Param('id') id: string) {
    return this.usersService.exportData(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post(':id/change-password')
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, changePasswordDto);
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

  @Patch(':id/tax')
  updateTaxInfo(
    @Param('id') id: string,
    @Body() data: { taxId: string; taxIdType: string; billingAddress: string },
  ) {
    return this.usersService.updateTaxInfo(id, data);
  }

  @Post(':id/kyc')
  submitKyc(@Param('id') id: string, @Body() kycData: { idDocument: string }) {
    return this.usersService.submitKyc(id, kycData.idDocument);
  }

  @Post(':id/kyc/document')
  submitDocumentKyc(
    @Param('id') id: string,
    @Body() kycData: { idDocument: string },
  ) {
    return this.usersService.submitDocumentKyc(id, kycData.idDocument);
  }

  @Post(':id/kyc/video')
  scheduleVideoKyc(
    @Param('id') id: string,
    @Body() body: { scheduledDate: string },
  ) {
    return this.usersService.scheduleVideoKyc(id, body.scheduledDate);
  }

  @Public() // Usually internal-only or admin-auth
  @Post(':id/kyc/verify')
  verifyKyc(
    @Param('id') id: string,
    @Body() data: { status: 'APPROVED' | 'REJECTED'; reason?: string },
  ) {
    // In a real app, this would update taxVerifiedStatus too if needed
    return this.usersService.update(id, {
      kycStatus: data.status as any,
      isIdentityVerified: data.status === 'APPROVED',
    });
  }

  @Patch(':id/client-info')
  updateClientInfo(
    @Param('id') id: string,
    @Body() data: { companyName?: string; companyLogo?: string },
  ) {
    return this.usersService.updateClientInfo(id, data);
  }

  @Post(':id/toggle-2fa')
  toggleTwoFactor(@Param('id') id: string) {
    return this.usersService.toggleTwoFactor(id);
  }

  @Post(':id/2fa/setup')
  setupTwoFactor(@Param('id') id: string) {
    return this.usersService.setupTwoFactor(id);
  }

  @Post(':id/2fa/verify')
  verifyTwoFactor(@Param('id') id: string, @Body() body: { token: string }) {
    return this.usersService.verifyTwoFactor(id, body.token);
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

  @Public()
  @Patch(':id/cloud-membership')
  updateCloudMembership(@Param('id') id: string, @Body() payload: any) {
    return this.usersService.updateCloudMembership(id, payload);
  }

  @Post(':id/activate')
  activateUser(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }

  @Post(':id/deduct-connects')
  deductConnects(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.usersService.deductConnects(id, body.amount);
  }

  @Get(':id/availability')
  getAvailability(@Param('id') id: string) {
    return this.usersService.getAvailability(id);
  }

  @Post(':id/availability')
  updateAvailability(@Param('id') id: string, @Body() body: { items: any[] }) {
    return this.usersService.updateAvailability(id, body.items);
  }

  @Get(':id/referrals')
  getReferrals(@Param('id') id: string) {
    return this.usersService.getReferrals(id);
  }

  // Certifications
  @Post(':id/certifications')
  addCertification(@Param('id') id: string, @Body() data: any) {
    return this.usersService.addCertification(id, data);
  }

  @Get(':id/certifications')
  getCertifications(@Param('id') id: string) {
    return this.usersService.getCertifications(id);
  }

  @Post('certifications/:certId/verify')
  verifyCertification(@Param('certId') certId: string) {
    return this.usersService.verifyCertification(certId);
  }

  // Background Checks
  @Post(':id/background-check/initiate')
  initiateBackgroundCheck(@Param('id') id: string) {
    return this.usersService.initiateBackgroundCheck(id);
  }

  @Post(':id/background-check/verify')
  verifyBackgroundCheck(
    @Param('id') id: string,
    @Body() body: { status: 'COMPLETED' | 'REJECTED' },
  ) {
    return this.usersService.verifyBackgroundCheck(id, body.status);
  }

  // Tax Compliance
  @Post(':id/tax-form')
  submitTaxForm(
    @Param('id') id: string,
    @Body()
    body: {
      taxId: string;
      taxIdType: string;
      taxFormType: string;
      taxSignatureName: string;
      taxSignatureIp: string;
      billingAddress: string;
    },
  ) {
    return this.usersService.submitTaxForm(id, body);
  }

  // Talent Pool
  @Post('saved-freelancers')
  saveFreelancer(
    @Request() req,
    @Body() body: { freelancerId: string; note?: string; tags?: string[] },
  ) {
    return this.usersService.saveFreelancer(req.user.sub, body);
  }

  @Get('saved-freelancers')
  getSavedFreelancers(@Request() req) {
    return this.usersService.getSavedFreelancers(req.user.sub);
  }

  @Delete('saved-freelancers/:freelancerId')
  removeSavedFreelancer(
    @Request() req,
    @Param('freelancerId') freelancerId: string,
  ) {
    return this.usersService.removeSavedFreelancer(req.user.sub, freelancerId);
  }

  @Post('me/subscription')
  @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
  upgradeSubscription(@Request() req, @Body('planId') planId: string) {
    return this.usersService.upgradeSubscription(req.user.sub, planId);
  }

  @Post('me/employee-profile')
  @Roles({ roles: ['realm:FREELANCER'] })
  updateEmployeeProfile(@Request() req, @Body() body: any) {
    return this.usersService.createEmployeeProfile(req.user.sub, body);
  }

  @Get('me/employee-profile')
  @Roles({ roles: ['realm:FREELANCER'] })
  getEmployeeProfile(@Request() req) {
    return this.usersService.getEmployeeProfile(req.user.sub);
  }

  @Public()
  @Patch(':id/subscription-status')
  updateSubscriptionStatus(
    @Param('id') id: string,
    @Body() data: { tier: string; status: string; endsAt: string },
  ) {
    return this.usersService.updateSubscriptionStatus(id, data);
  }

  @Post(':id/portfolio/ai-generate')
  @Roles({ roles: ['realm:FREELANCER'] })
  generateAiPortfolio(@Param('id') id: string, @Body('contractId') contractId: string) {
    return this.aiService.generatePortfolioItem(id, contractId);
  }

  @Get('contracts/:contractId/risk-analysis')
  @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
  getContractRiskAnalysis(@Param('contractId') contractId: string) {
    return this.aiService.analyzeContractRisk(contractId);
  }
}
