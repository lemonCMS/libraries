import axios, {Axios, AxiosRequestConfig, AxiosResponse} from 'axios';
import {from, map, Observable} from 'rxjs';

export class ApiService {

  private http: Axios;

  public constructor() {
    this.http = axios.create();
  }

  public get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Observable<T> {
    return from(this.http.get<T, AxiosResponse<T>, D>(url, config)).pipe(
      map((result) => (result.data))
    );
  }

  public post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Observable<R> {
    return from(this.http.post<T, R, D>(url, data, config));
  }

  public request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Observable<R> {
    return from(this.http.request<T, R, D>(config));
  }

  public delete<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Observable<R> {
    return from(this.http.delete<T, R, D>(url, config));
  }

  public head<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Observable<R> {
    return from(this.http.head<T, R, D>(url, config));
  }

  public options<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Observable<R> {
    return from(this.http.options<T, R, D>(url, config));
  }

  public put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
    return from(this.http.put<T, R, D>(url, data, config));
  }

  public patch<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
    return from(this.http.patch<T, R, D>(url, data, config));
  }

  public addRequestInterceptor(callback: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<any>) {
    this.http.interceptors.request.use(callback)
  }

  public addResponseInterceptor(callback: (config: AxiosResponse) => AxiosResponse | Promise<any>) {
    this.http.interceptors.response.use(callback)
  }
}

