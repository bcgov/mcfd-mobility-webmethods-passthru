import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SafetyAssessmentsService } from './safety-assessments.service';
import { AuthGuard } from '../../common/guards/auth/auth.guard';

@Controller('')
@UseGuards(AuthGuard)
export class SafetyAssessmentsController {
  constructor(
    private readonly safetyAssessmentService: SafetyAssessmentsService,
  ) {}
  @Post('622')
  @HttpCode(200)
  async submitSafetyAssessment(@Body() body, @Headers() headers) {
    return await this.safetyAssessmentService.submitSafetyAssessment(
      body,
      headers,
    );
  }
}
