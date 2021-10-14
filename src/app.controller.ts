import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GoogleDependenciesManager } from "./task/GoogleDependenciesManager";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/deps")
  getAllDependencies(): string {
    new GoogleDependenciesManager().getAllPackages();
    return 'Check Logs of The Project ...';
  }
}
