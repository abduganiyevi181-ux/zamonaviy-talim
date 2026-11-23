import { Controller, Get, Dependencies } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
@Dependencies(HealthService)
export class HealthController {
  constructor(healthService) {
    this.healthService = healthService;
  }

  @Get()
  @ApiOperation({ summary: 'Tizim, ma’lumotlar bazasi va Redis salomatlik holati' })
  @ApiResponse({ status: 200, description: 'Salomatlik holati' })
  async check() {
    return this.healthService.checkHealth();
  }
}
