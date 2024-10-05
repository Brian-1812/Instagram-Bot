import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class FetchService {
  private readonly logger = new Logger(FetchService.name);

  constructor(private readonly httpService: HttpService) {}

  async get<T>(url: string, config?: AxiosRequestConfig) {
    return firstValueFrom(
      this.httpService.get<T>(url, config).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error?.response?.data);
          throw 'Unexpected error: ' + error.message;
        }),
      ),
    );
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return firstValueFrom(
      this.httpService.post<T>(url, data, config).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error?.response?.data);
          throw 'Unexpected error: ' + error.message;
        }),
      ),
    );
  }
}
