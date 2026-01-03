
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimesheetsService {
    constructor(private prisma: PrismaService) { }

    async getTimesheets(contractId: string, userId: string) {
        const contract = await this.prisma.proposal.findUnique({
            where: { id: contractId },
            include: { job: true }
        });

        if (!contract) throw new NotFoundException('Contract not found');
        if (contract.freelancerId !== userId && contract.job.client_id !== userId) {
            throw new ForbiddenException('Not authorized');
        }

        return this.prisma.timesheet.findMany({
            where: { proposalId: contractId },
            include: { entries: true },
            orderBy: { startDate: 'desc' }
        });
    }

    async getTimesheetById(id: string, userId: string) {
        const timesheet = await this.prisma.timesheet.findUnique({
            where: { id },
            include: {
                entries: { orderBy: { date: 'asc' } },
                proposal: { include: { job: true } }
            }
        });

        if (!timesheet) throw new NotFoundException('Timesheet not found');
        if (timesheet.proposal.freelancerId !== userId && timesheet.proposal.job.client_id !== userId) {
            throw new ForbiddenException('Not authorized');
        }

        return timesheet;
    }

    async addTimeEntry(contractId: string, userId: string, dto: { date: string, hours: number, description: string }) {
        const contract = await this.prisma.proposal.findUnique({
            where: { id: contractId },
            include: { job: true }
        });

        if (!contract) throw new NotFoundException('Contract not found');
        if (contract.freelancerId !== userId) throw new ForbiddenException('Only freelancer can log time');
        if (contract.status !== 'HIRED') throw new BadRequestException('Contract is not active');

        const date = new Date(dto.date);
        // Calculate start of week (Monday)
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const startDate = new Date(date);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);

        // Find or create timesheet
        let timesheet = await this.prisma.timesheet.findFirst({
            where: {
                proposalId: contractId,
                startDate: startDate
            }
        });

        if (!timesheet) {
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            timesheet = await this.prisma.timesheet.create({
                data: {
                    proposalId: contractId,
                    startDate: startDate,
                    endDate: endDate,
                    status: 'DRAFT'
                }
            });
        }

        if (timesheet.status !== 'DRAFT') {
            throw new BadRequestException('Cannot add time to a submitted or approved timesheet');
        }

        const entry = await this.prisma.timeEntry.create({
            data: {
                timesheetId: timesheet.id,
                date: date,
                hours: dto.hours,
                description: dto.description
            }
        });

        // Update total hours
        const entries = await this.prisma.timeEntry.findMany({ where: { timesheetId: timesheet.id } });
        const total = entries.reduce((acc, curr) => acc + Number(curr.hours), 0);

        await this.prisma.timesheet.update({
            where: { id: timesheet.id },
            data: { totalHours: total }
        });

        return entry;
    }

    async submitTimesheet(id: string, userId: string) {
        const timesheet = await this.getTimesheetById(id, userId);

        if (timesheet.proposal.freelancerId !== userId) throw new ForbiddenException('Only freelancer can submit');
        if (timesheet.status !== 'DRAFT') throw new BadRequestException('Timesheet already submitted');

        return this.prisma.timesheet.update({
            where: { id },
            data: { status: 'SUBMITTED' }
        });
    }

    async approveTimesheet(id: string, userId: string) {
        const timesheet = await this.getTimesheetById(id, userId);

        if (timesheet.proposal.job.client_id !== userId) throw new ForbiddenException('Only client can approve');
        if (timesheet.status !== 'SUBMITTED') throw new BadRequestException('Timesheet not submitted');

        return this.prisma.timesheet.update({
            where: { id },
            data: { status: 'APPROVED' }
        });
    }

    async getTimeSummary(userId: string) {
        // Fetch all time entries for the freelancer
        const entries = await this.prisma.timeEntry.findMany({
            where: {
                timesheet: {
                    proposal: { freelancerId: userId }
                }
            },
            include: {
                timesheet: {
                    include: {
                        proposal: {
                            include: { job: true }
                        }
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        // aggregations
        let totalHours = 0;
        let totalEarnings = 0;
        const weeklyBreakdown: Record<string, number> = {};

        for (const entry of entries) {
            const hours = Number(entry.hours);
            const rate = Number(entry.timesheet.proposal.bidAmount || 0);

            totalHours += hours;
            // Only count earnings for approved timesheets (or submitted if we want to show potential)
            // For reports, we usually show everything but maybe separate cleared vs pending.
            // Let's assume projected earnings for now.
            totalEarnings += hours * rate;

            // Week grouping (ISO string update)
            const weekStart = new Date(entry.timesheet.startDate).toISOString().split('T')[0];
            weeklyBreakdown[weekStart] = (weeklyBreakdown[weekStart] || 0) + hours;
        }

        return {
            totalHours,
            totalEarnings,
            weeklyBreakdown: Object.entries(weeklyBreakdown).map(([week, hours]) => ({ week, hours })),
            recentEntries: entries.slice(0, 5)
        };
    }
}
