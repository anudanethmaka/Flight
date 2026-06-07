import axios, { AxiosInstance } from 'axios';

export class ServiceClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params });
      return response.data;
    } catch (error: any) {
      this.handleError(url, 'GET', error);
      throw error;
    }
  }

  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error: any) {
      this.handleError(url, 'POST', error);
      throw error;
    }
  }

  async put<T>(url: string, data?: any, params?: any): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, { params });
      return response.data;
    } catch (error: any) {
      this.handleError(url, 'PUT', error);
      throw error;
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.client.delete<T>(url);
      return response.data;
    } catch (error: any) {
      this.handleError(url, 'DELETE', error);
      throw error;
    }
  }

  private handleError(url: string, method: string, error: any) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.error(`[ServiceClient Error] ${method} ${url} failed with status ${status}: ${message}`);
  }
}
