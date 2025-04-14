import { Body, Controller, Headers, Post } from '@nestjs/common';
import { SafetyAssessmentsService } from './safety-assessments.service';

@Controller('')
export class SafetyAssessmentsController {
  constructor(
    private readonly safetyAssessmentService: SafetyAssessmentsService,
  ) {}
  @Post('622')
  async submitSafetyAssessment(@Body() body, @Headers() headers) {
    return await this.safetyAssessmentService.submitSafetyAssessment(
      body,
      headers,
    );
  }
}
